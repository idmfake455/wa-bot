const path = require("path");
const mime = require("mime-types");

const Media = require("../models/media.model");

const wahaClient = require("../clients/waha.client");
const storageService = require("./storage.service");

async function download(message, caption) {

    if (!message.media || !message.media.url) {
        throw new Error("Media URL not found");
    }

    console.log("Downloading :", message.media.url);

    const response = await wahaClient.downloadMedia(message.media.url);

    const extension =
        mime.extension(message.media.mimetype) || "bin";

    const filename =
        message.media.filename ||
        `${Date.now()}.${extension}`;

    const filepath =
        await storageService.saveStream(

            response.data,

            filename,

            caption

        );

    return new Media({
        id: message.id,
        filename,
        path: filepath,
        mimetype: message.media.mimetype,
        extension: path.extname(filename),
        size: message.media.size,
        source: "whatsapp"
    });

}

module.exports = {
    download
};