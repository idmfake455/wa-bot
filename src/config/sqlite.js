const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(process.cwd(), "recovery.db")
);

db.pragma("journal_mode = WAL");

// ============================================================
// Message processing checkpoint
// ============================================================

/*
 * Tabel ini digunakan oleh checkpoint.service.js untuk mencegah
 * message yang sama diproses ulang.
 */
db.exec(`
CREATE TABLE IF NOT EXISTS processed_message (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    message_id TEXT NOT NULL UNIQUE,

    chat_id TEXT NOT NULL,

    timestamp INTEGER NOT NULL,

    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP

);
`);

// ============================================================
// Group checkpoint
// ============================================================

db.exec(`
CREATE TABLE IF NOT EXISTS group_checkpoint (

    chat_id TEXT PRIMARY KEY,

    last_timestamp INTEGER NOT NULL,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);
`);

// ============================================================
// Album command mapping
// ============================================================

/*
 * WhatsApp album dapat dikirim oleh WAHA secara bertahap.
 *
 * Contoh:
 *
 *   album AC123...
 *   file 1  -> caption #WHMETSO IN L 8287 UN
 *   file 2  -> caption kosong
 *   ...
 *   file 26 -> caption kosong
 *
 * Jika webhook datang terpisah, batch berikutnya bisa tidak memiliki
 * caption. Tabel ini menyimpan hubungan:
 *
 *   album_key -> keyword + folder_name
 *
 * sehingga command tidak hilang walaupun attachment berikutnya datang
 * jauh lebih lambat, atau bahkan setelah bot restart.
 */
db.exec(`
CREATE TABLE IF NOT EXISTS album_command (

    album_key TEXT PRIMARY KEY,

    album_id TEXT NOT NULL,

    chat_from TEXT,

    chat_to TEXT,

    keyword TEXT NOT NULL,

    folder_name TEXT NOT NULL,

    created_at INTEGER NOT NULL,

    updated_at INTEGER NOT NULL

);
`);

module.exports = db;