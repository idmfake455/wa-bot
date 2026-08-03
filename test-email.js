require("dotenv").config();

const { sendEmail } = require("./src/services/email.service");

(async () => {
    try {
        await sendEmail(
            "WA Bot Test",
            "<h2>Email berhasil dikirim 🎉</h2>"
        );

        console.log("Success");
    } catch (err) {
        console.error(err);
    }
})();