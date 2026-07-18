const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

function saveMedia(media, folder) {

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    const extension = mime.extension(media.mimetype) || "bin";

    const filename = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}.${extension}`;

    const filepath = path.join(folder, filename);

    fs.writeFileSync(filepath, media.data, "base64");

    return filepath;
}

module.exports = {
    saveMedia
};