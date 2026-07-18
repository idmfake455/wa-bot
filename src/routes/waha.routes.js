const express = require("express");
const router = express.Router();

router.get("/server", (req, res) => {
    res.json({
        success: true,
        message: "WAHA Route OK"
    });
});

module.exports = router;