const Message = require("../models/message.model");
const dispatcher = require("../dispatchers/message.dispatcher");
const logger = require("../utils/logger");

async function process(event) {

    const message = new Message(event);

    // console.log("========== MESSAGE ==========");
    // console.log("Reply URL      :", message.reply?.media?.url);
    // console.log("Direct Path    :", message.reply?.media?.directPath);
    // console.log("Deprecated URL :", message.reply?.media?.deprecatedMms3Url);
    // console.log("=============================");

    logger.message(message);

    dispatcher.dispatch(message);

}

module.exports = {
    process
};