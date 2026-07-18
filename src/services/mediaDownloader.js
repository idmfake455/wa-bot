const path = require("path");

const fileHelper = require("../utils/fileHelper");

async function download(job) {

    console.log("");
    console.log("===========================================");
    console.log("DOWNLOAD START");
    console.log("===========================================");

    const savedFiles = [];

    for (const message of job.messages) {

        try {

            const media = await message.downloadMedia();

            if (!media) {

                console.log("Media gagal didownload.");

                continue;

            }

            const filepath = fileHelper.saveMedia(

                media,

                path.join(process.cwd(), "temp")

            );

            savedFiles.push(filepath);

            console.log("Downloaded :", filepath);

        }

        catch (err) {

            console.error(err);

        }

    }

    console.log("");

    console.log("===========================================");

    console.log("DOWNLOAD FINISHED");

    console.log("===========================================");

    console.log("Total :", savedFiles.length);

    console.log("");

    return {

        ...job,

        files: savedFiles

    };

}

module.exports = {

    download

};