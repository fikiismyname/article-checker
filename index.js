const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { sequelize, History, ForbiddenWord } = require('./models'); // Import sequelize models

// Initialize Express app
const app = express();
const port = 3000;

// Middleware
app.use(express.text()); // Gantikan bodyParser.text()
app.use(express.static('public')); // Serve static files dari "public" directory

// Path untuk file daftar kata terlarang
const listFilePath = path.join(__dirname, 'list.txt');
let forbiddenWords = new Set(); // Gunakan Set untuk pencarian lebih cepat

// Fungsi untuk memuat daftar kata secara async
async function loadForbiddenWords() {
    try {
        const data = await fs.readFile(listFilePath, 'utf-8');
        forbiddenWords = new Set(
            data.split('\n').map(word => word.trim().toLowerCase())
        );
        console.log('✅ Daftar kata terlarang berhasil dimuat.');
    } catch (error) {
        console.error('❌ Error membaca list.txt:', error);
    }
}

// Load daftar kata saat server dimulai
loadForbiddenWords();

// 📌 Route: Lihat halaman daftar kata terlarang
app.get('/forbidden-words', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forbidden-words.html'));
});

// 📌 Route: Lihat halaman history list
app.get('/history-list', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'history-list.html'));
});

// 📌 Route: API untuk melihat semua history
app.get('/api/history', async (req, res) => {
    try {
        const histories = await History.findAll({
            include: {
                model: ForbiddenWord,
                attributes: ['word', 'occurrences']
            },
            order: [['createdAt', 'DESC']]
        });

        res.json(histories.map(history => ({
            id: history.id,
            articleText: history.articleText.substring(0, 100) + '...', // Preview artikel
            totalForbiddenWords: history.totalForbiddenWords,
            createdAt: history.createdAt,
            forbiddenWordsDetected: history.ForbiddenWords
        })));
    } catch (error) {
        console.error('❌ Error fetching history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 📌 Route: API untuk melihat detail history berdasarkan ID
app.get('/api/history/:id', async (req, res) => {
    const historyId = req.params.id;

    try {
        const history = await History.findOne({
            where: { id: historyId },
            include: {
                model: ForbiddenWord,
                attributes: ['word', 'occurrences']
            }
        });

        if (!history) {
            return res.status(404).json({ error: 'History not found' });
        }

        res.json({
            articleText: history.articleText,
            totalForbiddenWords: history.totalForbiddenWords,
            forbiddenWordsDetected: history.ForbiddenWords
        });
    } catch (error) {
        console.error('❌ Error fetching history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 📌 Route: API untuk melihat daftar kata terlarang
app.get('/api/forbidden-words', (req, res) => {
    res.json(Array.from(forbiddenWords)); // Ubah Set kembali ke array untuk dikirim ke frontend
});

// 📌 Route: untuk mengecek artikel
app.post('/check-article', async (req, res) => {
    const articleText = req.body.trim();

    if (!articleText) {
        return res.status(400).json({ error: 'No article text provided.' });
    }

    // Convert artikel ke lowercase untuk matching case-insensitive
    const lowerCaseArticleText = articleText.toLowerCase();
    const words = lowerCaseArticleText.split(/\s+/);
    const wordCounts = new Map(); // Gunakan Map untuk menyimpan jumlah kata

    // Percepat pencarian dengan Set
    words.forEach(word => {
        if (forbiddenWords.has(word)) {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
    });

    const forbiddenWordsDetected = Array.from(wordCounts, ([word, occurrences]) => ({
        word,
        occurrences
    }));

    const totalForbiddenWords = forbiddenWordsDetected.reduce((sum, item) => sum + item.occurrences, 0);

    // Simpan ke database
    const history = await History.create({ articleText, totalForbiddenWords });
    await Promise.all(forbiddenWordsDetected.map(({ word, occurrences }) => 
        ForbiddenWord.create({ word, occurrences, historyId: history.id })
    ));

    const shareLink = `http://localhost:${port}/history/${history.id}`;

    res.json({
        message: "Forbidden words detected!",
        forbiddenWordsDetected,
        totalForbiddenWords,
        shareLink
    });
});

// 📌 Route: UI untuk melihat history berdasarkan ID
app.get('/history/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'history.html')); // Serve history.html file
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
