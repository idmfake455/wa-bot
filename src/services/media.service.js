const path = require("path");
const mime = require("mime-types");

const checkpointService = require("./checkpoint.service");

const Media = require("../models/media.model");

const wahaClient = require("../clients/waha.client");
const storageProvider = require("../providers/storage.provider");

async function download(message, command) {
    // console.log("===== DOWNLOAD INPUT =====");
    // console.log("message.media      :", message.media);
    // console.log("message.reply      :", message.reply);
    // console.log("==========================");

    // ========================================
    // Tentukan media yang akan didownload
    // ========================================

    let media = null;
    let mediaId = null;

    // Flow lama
    if (message.hasMedia && message.media?.url) {

        media = message.media;
        mediaId = message.id;

    }

    // Flow baru (Reply Attachment)
    else if (
        message.reply &&
        message.reply.hasMedia &&
        message.reply.media?.url
    ) {

        media = message.reply.media;
        mediaId = message.reply.id;

        console.log(
            `[MEDIA] Reply attachment detected : ${media.filename}`
        );

    }

    if (!media) {
        throw new Error("Media URL not found");
    }

    // ========================================
    // Download dari WAHA
    // ========================================

    const response =
        await wahaClient.downloadMedia(media.url);

    const extension =
        mime.extension(media.mimetype) || "bin";

    const filename =
        media.filename ||
        `${Date.now()}.${extension}`;

    console.log(
        `[MEDIA] Save ${filename}`
    );

    const filepath =
        await storageProvider.saveStream(

            response.data,

            filename,

            command

        );

    const chatId =
        message.from.endsWith("@g.us")
            ? message.from
            : message.to;

    checkpointService.markProcessed({

        id: mediaId,

        chatId,

        timestamp: message.timestamp

    });

    return new Media({

        id: mediaId,

        filename,

        path: filepath,

        mimetype: media.mimetype,

        extension: path.extname(filename),

        size: media.size,

        source: "whatsapp"

    });

}

module.exports = {
    download
};