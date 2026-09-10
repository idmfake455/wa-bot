const mediaQueue = require("../queues/media.queue");
const chatHandler = require("../handlers/chat.handler");

async function dispatch(message) {


// ============================================================
// REPLY KE ALBUM
// ============================================================

const isReplyToAlbum =
    message.reply &&
    message.reply.isAlbum === true;


// ============================================================
// REPLY KE MEDIA BIASA
// ============================================================

const hasReplyMedia =
    message.reply &&
    message.reply.hasMedia === true &&
    message.command;


// ============================================================
// MESSAGE MEDIA BIASA
// ============================================================

const hasOwnMedia =
    message.hasMedia === true;


// ============================================================
// MEDIA QUEUE
// ============================================================

if (
    hasOwnMedia ||
    hasReplyMedia ||
    isReplyToAlbum
) {

    mediaQueue.push(message);

    return;

}


// ============================================================
// CHAT MESSAGE
// ============================================================

return chatHandler.handle(message);


}

module.exports = {
dispatch
};
