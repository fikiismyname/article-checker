const { Sequelize, DataTypes } = require('sequelize');

// Setup SQLite database using Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite', // Path to SQLite file
});

// Define the History model
const History = sequelize.define('History', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articleText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    totalForbiddenWords: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

// Define the ForbiddenWord model
const ForbiddenWord = sequelize.define('ForbiddenWord', {
    word: {
        type: DataTypes.STRING,
        allowNull: false
    },
    occurrences: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// Establish one-to-many relationship
History.hasMany(ForbiddenWord, { foreignKey: 'historyId' });
ForbiddenWord.belongsTo(History, { foreignKey: 'historyId' });

// Sync the database
sequelize.sync().then(() => {
    console.log('Database synchronized');
});

module.exports = { sequelize, History, ForbiddenWord };
