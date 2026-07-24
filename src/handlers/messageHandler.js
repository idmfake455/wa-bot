async function handleMessage(message) {

    const hasReplyMedia =
        message.reply &&
        message.reply.hasMedia;

    if (!message.hasMedia && !hasReplyMedia) {
        return;
    }

    console.log("================================");
    console.log("HAS MEDIA :", message.hasMedia);
    console.log("COMMAND :", message.command);

    console.log("REPLY :", message.reply);
    console.log("HAS REPLY :", !!message.reply);
    console.log("HAS REPLY MEDIA :", message.reply?.hasMedia);
    console.log("REPLY URL :", message.reply?.media?.url);
    console.log("================================");

    console.log("================================");
    console.log("FROM :", message.from);
    console.log("AUTHOR :", message.author);
    console.log("TYPE :", message.type);

    try {

        const media = await message.downloadMedia();

        if (!media) {

            console.log("downloadMedia() => undefined");
            return;

        }

        console.log("SUCCESS");
        console.log("Mime :", media.mimetype);
        console.log("Filename :", media.filename);
        console.log("Data Length :", media.data.length);

    } catch (err) {

        console.error("DOWNLOAD ERROR");
        console.error(err);

    }

}

module.exports = {
    handleMessage
};