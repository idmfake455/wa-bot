require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.BOT_PORT || 3000;

app.listen(PORT, () => {
    console.log(`WA Bot running on port ${PORT}`);
});