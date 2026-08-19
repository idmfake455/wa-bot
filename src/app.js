const express = require("express");

const app = express();

// Naikkan limit request body
app.use(express.json({
    limit: "100mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "100mb"
}));

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