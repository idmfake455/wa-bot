const localStorage = require("../services/storage-local.service");
const driveStorage = require("../services/storage-drive.service");

// const driver = (process.env.STORAGE_DRIVER || "local").toLowerCase();
const driver = ("local").toLowerCase();


async function saveStream(stream, filename, command) {
    
    console.log(`[STORAGE] Driver : ${driver}`);

    switch (driver) {

        case "local":
            return await localStorage.saveStream(
                stream,
                filename,
                command
            );

        case "drive":
            return await driveStorage.saveStream(
                stream,
                filename,
                command
            );

        case "both": {

            // Simpan ke local terlebih dahulu
            const filepath = await localStorage.saveStream(
                stream,
                filename,
                command
            );

            // Upload file local ke Google Drive
            await driveStorage.uploadFile(
                filepath,
                filename,
                command
            );

            return filepath;
        }

        default:
            throw new Error(
                `Unknown STORAGE_DRIVER: ${driver}`
            );
    }

}

module.exports = {
    saveStream
};