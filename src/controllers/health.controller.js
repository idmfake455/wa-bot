exports.health = (req, res) => {
    res.status(200).json({
        success: true,
        service: "wa-bot",
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
};