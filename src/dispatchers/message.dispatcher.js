const mediaQueue = require("../queues/media.queue");
const chatHandler = require("../handlers/chat.handler");

async function dispatch(message) {

    if (message.isAlbum) {
        return;
    }

    const hasReplyMedia =
        message.reply &&
        message.reply.hasMedia &&
        message.command;

    if (message.hasMedia || hasReplyMedia) {

        mediaQueue.push(message);

        return;

    }

    return chatHandler.handle(message);

}

module.exports = {
    dispatch
};