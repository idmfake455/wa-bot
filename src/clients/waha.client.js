const api = require("./api.client");
const axios = require("axios");

async function sendText(to, text) {

    return api.post("/api/sendText", {
        chatId: to,
        text
    });

}

async function downloadMedia(url) {

    // Jika URL dari WAHA menggunakan localhost,
    // ganti menjadi hostname docker
    if (url.startsWith("http://localhost:3000")) {

        url = url.replace(
            "http://localhost:3000",
            process.env.WAHA_URL
        );

        console.log("[MEDIA] Rewrite URL :", url);

    }

    // Absolute URL
    if (url.startsWith("http://") || url.startsWith("https://")) {

        return axios.get(url, {
            responseType: "stream",
            headers: {
                "X-Api-Key": process.env.WAHA_API_KEY
            }
        });

    }

    // Relative URL
    return api.get(url, {
        responseType: "stream"
    });

}


module.exports = {
    sendText,
    downloadMedia
};