# 🚀 Article Words Checker

A simple API to check for forbidden words in articles, store history, and retrieve past checks.

## 📌 Features

* **Asynchronous file reading** for better performance.
* **Optimized forbidden word detection** using `Set` and `Map`.
* **Efficient database queries** using Sequelize.
* **Express-based API** with modern middleware.

## 🛠 Installation

```sh
# Clone the repository
git clone https://github.com/your-repo.git
cd your-repo

# Install dependencies
npm install
```

## 🚀 Usage

```sh
# Start the server
npm start
```

Server will run on `http://localhost:3000`

## 🔗 API Endpoints

* `GET /api/history` - Get all history records.
* `GET /api/history/:id` - Get details of a specific history.
* `GET /api/forbidden-words` - Get the list of forbidden words.
* `POST /check-article` - Check an article for forbidden words.

## 📂 Project Structure

```
├── models/            # Sequelize models
├── public/            # Static files (HTML, CSS, JS)
├── list.txt           # Forbidden words list
├── server.js          # Main API server
├── README.md          # Project documentation
```
