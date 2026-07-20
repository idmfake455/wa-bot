const Message = require("../models/message.model");

const textHandler = require("../handlers/text.handler");
const imageHandler = require("../handlers/image.handler");
const documentHandler = require("../handlers/document.handler");

async function dispatch(event){

    const message = new Message(event);

    switch(message.type){

        case "chat":
            return textHandler.handle(message);

        case "image":
            return imageHandler.handle(message);

        case "document":
            return documentHandler.handle(message);

        default:
            console.log(`Unsupported message : ${message.type}`);
    }

}

module.exports = {
    dispatch
};