const db = require("../config/sqlite");

function isProcessed(messageId) {

    const row = db
        .prepare(
            `
            SELECT message_id
            FROM processed_message
            WHERE message_id = ?
            `
        )
        .get(messageId);

    return !!row;

}

// function markProcessed(message) {

//     const insertMessage = db.prepare(`
//         INSERT OR IGNORE INTO processed_message
//         (
//             message_id,
//             chat_id,
//             timestamp
//         )
//         VALUES
//         (
//             ?,
//             ?,
//             ?
//         )
//     `);

//     insertMessage.run(
//         message.id,
//         message.chatId,
//         message.timestamp
//     );

//     const updateCheckpoint = db.prepare(`
//         INSERT INTO group_checkpoint
//         (
//             chat_id,
//             last_timestamp
//         )
//         VALUES
//         (
//             ?,
//             ?
//         )

//         ON CONFLICT(chat_id)

//         DO UPDATE SET

//             last_timestamp = MAX(
//                 group_checkpoint.last_timestamp,
//                 excluded.last_timestamp
//             ),

//             updated_at = CURRENT_TIMESTAMP
//     `);

//     updateCheckpoint.run(
//         message.chatId,
//         message.timestamp
//     );

// }

function markProcessed(message) {

    const insertMessage = db.prepare(`
        INSERT OR IGNORE INTO processed_message
        (
            message_id,
            chat_id,
            timestamp
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
    `);

    insertMessage.run(
        message.id,
        message.chatId,
        message.timestamp
    );

}



function getCheckpoint(chatId){

    const row = db
        .prepare(
            `
            SELECT last_timestamp

            FROM group_checkpoint

            WHERE chat_id=?
            `
        )
        .get(chatId);

    if(!row)
        return 0;

    return row.last_timestamp;

}

module.exports = {

    isProcessed,

    markProcessed,

    // getCheckpoint

};