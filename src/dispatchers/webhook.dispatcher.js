const messageDispatcher = require("./message.dispatcher");

async function dispatch(payload) {

    switch (payload.event) {

        case "message":
            return messageDispatcher.dispatch(payload);

        default:
            console.log(`[WebhookDispatcher] Unsupported event: ${payload.event}`);
            return;
    }

}

module.exports = {
    dispatch
};