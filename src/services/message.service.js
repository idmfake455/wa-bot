const wahaClient = require("../clients/waha.client");

async function sendText(phone, text) {

    return wahaClient.sendText(
        `${phone}@c.us`,
        text
    );

}

module.exports = {
    sendText
};