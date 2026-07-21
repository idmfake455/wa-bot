const mediaService = require("../services/media.service");

async function handle(batch) {

    console.log("========== BATCH ==========");

    console.log(batch.caption);

    console.log(batch.messages.length);

    for (const message of batch.messages) {

        await mediaService.download(

            message,

            batch.caption

        );

    }

}

module.exports = {

    handle

};