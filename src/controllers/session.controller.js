const wahaService = require("../services/waha.service");

exports.getSessions = async (req, res) => {
    try {
        const sessions = await wahaService.getSessions();

        res.json({
            success: true,
            data: sessions
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};