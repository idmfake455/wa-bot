const webhookService = require("../services/webhook.service");

async function receive(req, res) {


    console.log("\n================ WAHA PAYLOAD ================");

    console.log(JSON.stringify(req.body, null, 2));

    console.log("=============================================\n");

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