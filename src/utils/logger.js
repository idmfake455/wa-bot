function message(message) {

    console.log("================================");
    console.log("SESSION     :", message.session);
    console.log("TYPE        :", message.type);
    console.log("FROM        :", message.from);
    console.log("NAME        :", message.name);
    console.log("HAS MEDIA   :", message.hasMedia);

    if (message.hasMedia) {
        console.log("FILE        :", message.media.filename);
        console.log("MIMETYPE    :", message.media.mimetype);
        console.log("SIZE        :", message.media.size);
    }

    console.log("BODY        :", message.body);
    console.log("================================");

}

module.exports = {
    message
};