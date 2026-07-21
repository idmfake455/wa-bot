const mediaQueue = require("../queues/media.queue");
const chatHandler = require("../handlers/chat.handler");

async function dispatch(message) {

    if (message.isAlbum) {
        return;
    }
    
    if (message.hasMedia) {

        mediaQueue.push(message);

        return;

    }

    return chatHandler.handle(message);

}

module.exports = {

    dispatch

};