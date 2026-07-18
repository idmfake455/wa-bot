require('dotenv').config();

module.exports = {
    chromePath: process.env.CHROME_PATH,
    sessionPath: process.env.SESSION_PATH,
    driveFolder: process.env.GOOGLE_DRIVE_FOLDER,
    nodeEnv: process.env.NODE_ENV
};