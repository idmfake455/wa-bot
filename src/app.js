const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "WA Bot API Running"
    });
});

app.use("/health", require("./routes/health.routes"));
app.use("/waha", require("./routes/waha.routes"));
app.use("/session", require("./routes/session.routes"));
app.use("/message", require("./routes/message.routes"));
app.use("/webhook", require("./routes/webhook.routes"));

module.exports = app;