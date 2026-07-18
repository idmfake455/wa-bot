console.log("message.routes loaded");

const express = require("express");
const router = express.Router();

const controller = require("../controllers/message.controller");

router.post("/send", controller.sendText);

module.exports = router;