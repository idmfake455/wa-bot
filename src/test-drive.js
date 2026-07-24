require("dotenv").config({
    path: ".env.development"
});

const drive = require("./clients/google.client");

async function test() {

    try {

        const folder = await drive.files.get({

            fileId: process.env.GOOGLE_DRIVE_ROOT_FOLDER,

            fields: "id,name"

        });

        console.log("Connected!");
        console.log(folder.data);

    } catch (err) {

        console.error(err.response?.data || err);

    }

}

test();