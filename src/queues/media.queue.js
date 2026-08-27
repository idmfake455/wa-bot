const mediaHandler = require("../handlers/media.handler");
const db = require("../config/sqlite");

const batches = new Map();

// ============================================================
// Queue timing
// ============================================================

/*
 * Single attachment:
 * Tunggu 3 detik sebelum diproses.
 */
const SINGLE_WAIT_TIME = 3000;

/*
 * Album WhatsApp:
 * WAHA dapat mengirim attachment album secara bertahap.
 *
 * Timer selalu di-reset setiap ada attachment baru dengan albumId
 * yang sama.
 */
const ALBUM_WAIT_TIME = 15000;

let processingCount = 0;
let processing = Promise.resolve();

// ============================================================
// Batch key
// ============================================================

function getKey(message) {

    // Jika bagian dari album gunakan albumId.
    // Jika single media gunakan message.id.
    const albumId = message.albumId || message.id;

    return `${message.to}_${message.from}_${albumId}`;

}

function isAlbumMessage(message) {

    return !!message.albumId;

}

function getWaitTime(message) {

    return isAlbumMessage(message)
        ? ALBUM_WAIT_TIME
        : SINGLE_WAIT_TIME;

}

// ============================================================
// Command parser
// ============================================================

function parseCommand(text) {

    if (!text) {
        return null;
    }

    const originalText = text.trim();

    if (!originalText.startsWith("#")) {
        return null;
    }

    const command = originalText.toUpperCase();

    /*
     * Keyword:
     *
     * WH       : #WHNama Folder
     * EXIM     : #Nama Folder
     * BUDURAN  : #MW2Nama Folder
     * ILUFAK   : #MW4Nama Folder
     * GESSO    : #MW1Nama Folder
     * FLOORING : #IKFNama Folder
     * PLYWOOD  : #PLYNama Folder
     * CABINET  : #IICNama Folder
     * MINDO    : #MNDNama Folder
     *
     * Keyword tidak case-sensitive.
     */

    const KEYWORDS = [
        {
            prefix: "#MW2",
            keyword: "BUDURAN"
        },
        {
            prefix: "#MW4",
            keyword: "ILUFAK"
        },
        {
            prefix: "#MW1",
            keyword: "GESSO"
        },
        {
            prefix: "#IKF",
            keyword: "FLOORING"
        },
        {
            prefix: "#PLY",
            keyword: "PLYWOOD"
        },
        {
            prefix: "#IIC",
            keyword: "CABINET"
        },
        {
            prefix: "#MND",
            keyword: "MINDO"
        },
        {
            prefix: "#WHRPSL",
            keyword: "RPSL"
        },
        {
            prefix: "#WHROHLIG",
            keyword: "ROHLIG"
        },
        {
            prefix: "#WHPPT",
            keyword: "PPT"
        },
        {
            prefix: "#WHMRA",
            keyword: "MRA"
        },
        {
            prefix: "#WHLOGWIN",
            keyword: "LOGWIN"
        },
        {
            prefix: "#WHLIMO",
            keyword: "LIMO"
        },
        {
            prefix: "#WHTETRA",
            keyword: "TETRA"
        },
        {
            prefix: "#WHMETSO",
            keyword: "METSO"
        },
        {
            prefix: "#WHHANOMAN",
            keyword: "HANOMAN"
        },
        {
            prefix: "#WHCATALITE",
            keyword: "CATALITE"
        },
        {
            prefix: "#WHBDP",
            keyword: "BDP"
        },
        {
            prefix: "#WHAPL",
            keyword: "APL"
        },
        {
            prefix: "#WH",
            keyword: "WH"
        }
    ];

    /*
     * Cek keyword khusus terlebih dahulu.
     */
    for (const item of KEYWORDS) {

        if (command.startsWith(item.prefix)) {

            const folderName = originalText
                .substring(item.prefix.length)
                .trim();

            if (!folderName) {
                return null;
            }

            return {
                keyword: item.keyword,
                folderName
            };

        }

    }

    /*
     * EXIM
     *
     * Format:
     * #Nama Folder
     *
     * # sendiri merupakan keyword EXIM.
     */

    const folderName = originalText
        .substring(1)
        .trim();

    if (!folderName) {
        return null;
    }

    return {
        keyword: "EXIM",
        folderName
    };

}

// ============================================================
// Persistent album command
// ============================================================

function saveAlbumCommand(key, message, command) {

    if (!message.albumId || !command) {
        return;
    }

    const now = Date.now();

    db.prepare(`
        INSERT INTO album_command
        (
            album_key,
            album_id,
            chat_from,
            chat_to,
            keyword,
            folder_name,
            created_at,
            updated_at
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
        ON CONFLICT(album_key)
        DO UPDATE SET
            album_id = excluded.album_id,
            chat_from = excluded.chat_from,
            chat_to = excluded.chat_to,
            keyword = excluded.keyword,
            folder_name = excluded.folder_name,
            updated_at = excluded.updated_at
    `).run(
        key,
        message.albumId,
        message.from || null,
        message.to || null,
        command.keyword,
        command.folderName,
        now,
        now
    );

    console.log(
        `[QUEUE] Album command saved : ${message.albumId} -> ${command.keyword} / ${command.folderName}`
    );

}

function getAlbumCommand(key) {

    const row = db.prepare(`
        SELECT
            keyword,
            folder_name
        FROM album_command
        WHERE album_key = ?
    `).get(key);

    if (!row) {
        return null;
    }

    return {
        keyword: row.keyword,
        folderName: row.folder_name
    };

}

// ============================================================
// Flush batch
// ============================================================

async function flush(key) {

    const batch = batches.get(key);

    if (!batch) {
        return;
    }

    batches.delete(key);

    /*
     * Jika batch tidak memiliki command, cari command dari database.
     *
     * Ini menangani kasus:
     *
     * Batch 1 : 5 file + caption command
     * Batch 2 : 21 file + caption kosong
     *
     * Kedua batch memiliki albumId yang sama.
     */
    if (!batch.command && batch.albumId) {

        batch.command = getAlbumCommand(key);

        if (batch.command) {

            console.log(
                `[QUEUE] Command recovered from DB : ${batch.command.keyword} / ${batch.command.folderName}`
            );

        }

    }

    console.log("\n========== BATCH ==========");
    console.log("Key      :", key);
    console.log("Command  :", batch.command);
    console.log("Files    :", batch.messages.length);

    batch.messages.forEach((msg, index) => {

        console.log(
            `${index + 1}. album=${msg.albumId} id=${msg.id} caption="${msg.body || ""}"`
        );

    });

    console.log("===========================\n");

    if (!batch.command) {

        console.log("Skip batch (tidak ada command)");

        return;

    }

    processing = processing.then(async () => {

        processingCount++;

        try {

            await mediaHandler.handle(batch);

        } finally {

            processingCount--;

        }

    });

    await processing;

}

// ============================================================
// Push message into queue
// ============================================================

function push(message) {

    const batchKey = getKey(message);

    const waitTime = getWaitTime(message);

    let batch = batches.get(batchKey);

    if (!batch) {

        batch = {

            albumId: message.albumId || null,

            command:
                message.albumId
                    ? getAlbumCommand(batchKey)
                    : null,

            messages: [],

            timer: null

        };

        batches.set(
            batchKey,
            batch
        );

    }

    /*
     * Jangan masukkan message yang sama dua kali ke batch.
     */
    const alreadyExists = batch.messages.some(
        item => item.id === message.id
    );

    if (!alreadyExists) {

        batch.messages.push(message);

    }

    const command = parseCommand(message.body);

    if (command) {

        batch.command = command;

        /*
         * Hanya album yang disimpan secara persistent.
         * Single message tidak perlu command mapping permanen.
         */
        if (message.albumId) {

            saveAlbumCommand(
                batchKey,
                message,
                command
            );

        }

    }

    /*
     * Setiap attachment baru mereset timer.
     *
     * Contoh:
     *
     * 10:14:00 -> file 1-5
     * 10:14:03 -> file berikutnya
     * 10:14:08 -> file berikutnya
     *
     * Timer terus mundur dari attachment TERAKHIR.
     */
    clearTimeout(batch.timer);

    batch.timer = setTimeout(() => {

        flush(batchKey)
            .catch(err => {

                console.error(
                    "[QUEUE] Flush failed:",
                    err
                );

            });

    }, waitTime);

}

// ============================================================
// Queue status
// ============================================================

function isIdle() {

    return (
        batches.size === 0 &&
        processingCount === 0
    );

}

async function waitUntilIdle(interval = 500) {

    while (!isIdle()) {

        await new Promise(resolve =>
            setTimeout(resolve, interval)
        );

    }

}

module.exports = {

    push,
    isIdle,
    waitUntilIdle

};