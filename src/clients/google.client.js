const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_DRIVE_KEY,
    scopes: [
        "https://www.googleapis.com/auth/drive"
    ]
});

const drive = google.drive({
    version: "v3",
    auth
});

module.exports = drive;