const api = require("../config/axios");

async function sendText(phone, text) {

    const payload = {
        chatId: `${phone}@c.us`,
        reply_to: null,
        text,
        linkPreview: true,
        linkPreviewHighQuality: false,
        session: "main"
    };

    const response = await api.post("/api/sendText", payload);

    return response.data;
}

module.exports = {
    sendText
};