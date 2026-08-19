const localStorage = require("../services/storage-local.service");
const driveStorage = require("../services/storage-drive.service");

const driver = (
    process.env.STORAGE_DRIVER || "local"
).toLowerCase();

async function saveStream(stream, filename, command) {

    console.log(`[STORAGE] Driver : ${driver}`);

    switch (driver) {

        case "local":

            return await localStorage.saveStream(
                stream,
                filename,
                command
            );


        case "drive": {

            /*
             * Simpan stream ke temporary/local file terlebih dahulu.
             * File ini kemudian digunakan untuk upload ke Google Drive.
             */

            const filepath =
                await localStorage.saveStream(
                    stream,
                    filename,
                    command
                );

            console.log(
                `[STORAGE] Local temporary file : ${filepath}`
            );

            /*
             * Upload file ke Google Drive
             */

            await driveStorage.uploadFile(
                filepath,
                filename,
                command
            );

            console.log(
                `[STORAGE] Drive upload completed : ${filename}`
            );

            return filepath;

        }


        case "both": {

            /*
             * Simpan ke local
             */

            const filepath =
                await localStorage.saveStream(
                    stream,
                    filename,
                    command
                );

            console.log(
                `[STORAGE] Local saved : ${filepath}`
            );

            /*
             * Upload file local ke Google Drive
             */

            await driveStorage.uploadFile(
                filepath,
                filename,
                command
            );

            console.log(
                `[STORAGE] Drive upload completed : ${filename}`
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