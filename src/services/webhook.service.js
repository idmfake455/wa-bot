const webhookDispatcher = require("../dispatchers/webhook.dispatcher");

async function process(payload) {

    console.log(
        `[Webhook] Event: ${payload.event} | Session: ${payload.session}`
    );

    return webhookDispatcher.dispatch(payload);

}

module.exports = {
    process
};