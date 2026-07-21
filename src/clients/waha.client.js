const api = require("./api.client");

async function sendText(to, text) {

    return api.post("/api/sendText", {
        chatId: to,
        text
    });

}

async function downloadMedia(url) {

    return api.get(url, {
        responseType: "stream"
    });

}

module.exports = {
    sendText,
    downloadMedia
};