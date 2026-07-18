const wahaService = require("../services/waha.service");

exports.serverInfo = async (req, res) => {
    try {
        const data = await wahaService.getServerInfo();

        res.json({
            success: true,
            data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};