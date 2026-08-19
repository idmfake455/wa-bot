const mediaService = require("../services/media.service");

async function handle(batch) {

    // console.log("========== BATCH ==========");

    // console.log(batch.caption);

    // console.log(batch.messages.length);

    for (const message of batch.messages) {

        try {

            await mediaService.download(
                message,
                batch.command
            );

        } catch (err) {

            console.error("[MEDIA] Failed processing message, command incorrect");
            // console.error("[MEDIA] Message ID :", message.id);
            // console.error("[MEDIA] Command    :", batch.command);
            console.error("[MEDIA] Error      :", err);

        }

    }

}

module.exports = {

    handle

};