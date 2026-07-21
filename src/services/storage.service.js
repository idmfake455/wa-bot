const fs = require("fs");
const path = require("path");

function ensureDirectory(directory) {

    if (!fs.existsSync(directory)) {

        fs.mkdirSync(directory, {
            recursive: true
        });

    }

}

function tempDirectory() {

    const directory = path.join(
        process.cwd(),
        "storage",
        "temp"
    );

    ensureDirectory(directory);

    return directory;

}

function normalizeFolder(caption) {

    return caption
        .replace(/^#/, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

}

function mediaDirectory(caption) {

    const folder = normalizeFolder(caption);

    const directory = path.join(

        process.cwd(),
        "storage",
        folder

    );

    ensureDirectory(directory);

    return directory;

}

async function saveStream(
    stream,
    filename,
    caption
) {

    const filepath = path.join(

        mediaDirectory(caption),

        filename

    );

    return new Promise((resolve, reject) => {

        const writer = fs.createWriteStream(filepath);

        stream.pipe(writer);

        writer.on("finish", () => resolve(filepath));

        writer.on("error", reject);

    });

}

module.exports = {

    tempDirectory,

    saveStream,

    mediaDirectory

};