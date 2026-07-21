const webhookService = require("../services/webhook.service");

async function receive(req, res) {

    try {

        await webhookService.process(req.body);

    } catch (err) {

        console.error(err);

    }

    // Selalu balas 200 agar WAHA tidak retry
    res.sendStatus(200);

}

module.exports = {
    receive
};