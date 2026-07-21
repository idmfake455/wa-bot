const Message = require("../models/message.model");
const dispatcher = require("../dispatchers/message.dispatcher");
const logger = require("../utils/logger");

async function process(event) {

    const message = new Message(event);

    logger.message(message);

    await dispatcher.dispatch(message);

}

module.exports = {
    process
};