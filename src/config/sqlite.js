const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(process.cwd(), "recovery.db")
);

db.pragma("journal_mode = WAL");

// db.exec(`
// CREATE TABLE IF NOT EXISTS processed_message (

//     id INTEGER PRIMARY KEY AUTOINCREMENT,

//     message_id TEXT NOT NULL UNIQUE,

//     chat_id TEXT NOT NULL,

//     timestamp INTEGER NOT NULL,

//     processed_at DATETIME DEFAULT CURRENT_TIMESTAMP

// );
// `);

db.exec(`
CREATE TABLE IF NOT EXISTS group_checkpoint (

    chat_id TEXT PRIMARY KEY,

    last_timestamp INTEGER NOT NULL,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);
`);

module.exports = db;