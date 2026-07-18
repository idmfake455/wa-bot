async function handleMessage(message) {

    if (!message.hasMedia) {
        return;
    }

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