const fs = require("fs");
const dotenv = require("dotenv");

const envPath = fs.existsSync(".env.production")
    ? ".env.production"
    : ".env.dev";

dotenv.config({
    path: envPath
});

const app = require("./src/app");

const PORT = process.env.BOT_PORT || 3000;

app.listen(PORT, () => {
    console.log(`WA Bot running on port ${PORT}`);
});