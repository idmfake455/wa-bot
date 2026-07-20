const webhookService = require("../services/webhook.service");

async function receive(req, res) {

    await webhookService.process(req.body);

    res.sendStatus(200);

}

module.exports = {
    receive
};