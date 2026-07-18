const messageService = require("../services/message.service");

async function sendText(req, res) {

    try {

        const { phone, text } = req.body;

        if (!phone || !text) {
            return res.status(400).json({
                success: false,
                message: "phone dan text wajib diisi"
            });
        }

        const result = await messageService.sendText(phone, text);

        return res.json({
            success: true,
            data: result
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.response?.data || err.message
        });

    }

}

module.exports = {
    sendText
};