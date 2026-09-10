const Message = require("../models/message.model");
const dispatcher = require("../dispatchers/message.dispatcher");
const logger = require("../utils/logger");
const wahaService = require("./waha.service");
const mediaQueue = require("../queues/media.queue");

async function process(event) {


const message = new Message(event);


// ============================================================
// DEBUG REPLY
// ============================================================

// console.log("\n================================");
// console.log("========== REPLY DEBUG ==========");
// console.log("Message ID :", message.id);
// console.log("From       :", message.from);
// console.log("Body       :", message.body);

// console.log("Reply      :", message.reply);

// console.log(
//     "Reply ID   :",
//     message.reply?.id
// );

// console.log(
//     "Reply Type :",
//     message.reply?.type
// );

// console.log(
//     "Reply Kind :",
//     message.reply?.kind
// );

// console.log(
//     "Reply Album:",
//     message.reply?.isAlbum
// );

// console.log(
//     "Album ID   :",
//     message.reply?.albumId
// );

// console.log(
//     "Parent ID  :",
//     message.reply?.parentMsgKey?.id
// );

// console.log("================================\n");


// ============================================================
// REPLY KE ALBUM
// ============================================================

if (
    message.reply?.isAlbum === true &&
    message.reply?.albumId
) {

    const albumId =
        message.reply.albumId;


    console.log("\n================================");
    console.log("========== ALBUM LOOKUP ==========");
    console.log("Session :", message.session);
    console.log("Chat    :", message.from);
    console.log("Album ID:", albumId);
    console.log("Command :", message.body);
    console.log("================================");


    try {

        // ----------------------------------------------------
        // AMBIL SEMUA CHILD IMAGE ALBUM
        // ----------------------------------------------------

        const albumMessages =
            await wahaService.getAlbumMessages(
                message.session,
                message.from,
                albumId
            );


        console.log(
            "\n========== ALBUM RESULT =========="
        );

        console.log(
            "Found:",
            albumMessages?.length || 0
        );


        if (
            !Array.isArray(albumMessages) ||
            albumMessages.length === 0
        ) {

            console.log(
                "Tidak ada child image ditemukan."
            );

            console.log(
                "=================================\n"
            );

            /*
             * Jangan lanjutkan message placeholder
             * ke dispatcher karena message reply album
             * sendiri tidak mempunyai media.
             */

            return;

        }


        // ----------------------------------------------------
        // COMMAND DARI REPLY
        // ----------------------------------------------------

        const commandText =
            message.body || "";


        /*
         * Hanya lanjutkan jika reply merupakan command.
         *
         * Contoh:
         *
         * #WHABC
         * #WHRPSLABC
         * #MW2ABC
         * #ABC
         */

        if (
            !commandText.trim().startsWith("#")
        ) {

            console.log(
                "[ALBUM] Reply bukan command. Skip."
            );

            return;

        }


        // ----------------------------------------------------
        // PUSH SETIAP IMAGE KE MEDIA QUEUE
        // ----------------------------------------------------

        console.log(
            "\n========== ALBUM QUEUE =========="
        );

        console.log(
            "Album ID:",
            albumId
        );

        console.log(
            "Command:",
            commandText
        );

        console.log(
            "Files  :",
            albumMessages.length
        );


        for (
            let index = 0;
            index < albumMessages.length;
            index++
        ) {

            const albumMessage =
                albumMessages[index];


            // ------------------------------------------------
            // BUAT EVENT MESSAGE DARI CHILD ALBUM
            // ------------------------------------------------

            const childEvent = {

                ...event,

                payload:
                    albumMessage

            };


            const childMessage =
                new Message(childEvent);


            /*
             * Paksa command menggunakan text dari
             * reply yang memicu album.
             *
             * Contoh:
             *
             * childMessage.body
             * = "#WHABC"
             */

            childMessage.body =
                commandText;


            childMessage.caption =
                commandText;


            childMessage.command =
                true;


            /*
             * Pastikan albumId tetap menggunakan
             * parent album.
             */

            childMessage.albumId =
                albumId;


            childMessage.isAlbum =
                true;


            // ------------------------------------------------
            // DEBUG CHILD
            // ------------------------------------------------

            console.log(
                `\n--- QUEUE IMAGE ${index + 1} ---`
            );

            console.log(
                "ID       :",
                childMessage.id
            );

            console.log(
                "Album ID :",
                childMessage.albumId
            );

            console.log(
                "Type     :",
                childMessage.type
            );

            console.log(
                "HasMedia :",
                childMessage.hasMedia
            );

            console.log(
                "Media    :",
                childMessage.media
            );


            // ------------------------------------------------
            // MASUKKAN KE MEDIA QUEUE
            // ------------------------------------------------

            mediaQueue.push(
                childMessage
            );

        }


        console.log(
            "\n=================================\n"
        );


        /*
         * PENTING:
         *
         * Jangan teruskan placeholder reply album
         * ke dispatcher.
         *
         * Kalau diteruskan, queue akan melihat
         * message reply tanpa media sebagai 1 file.
         */

        return;


    } catch (err) {

        console.error(
            "\n========== ALBUM LOOKUP ERROR =========="
        );

        console.error(
            err?.response?.data ||
            err?.message ||
            err
        );

        console.error(
            "========================================\n"
        );


        return;

    }

}


// ============================================================
// NORMAL MESSAGE / SINGLE IMAGE
// ============================================================

logger.message(message);

dispatcher.dispatch(message);


}

module.exports = {
process
};
