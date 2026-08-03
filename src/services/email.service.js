const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendEmail(subject, html) {
    await transporter.sendMail({
        from: `"WA Bot" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
        subject,
        html,
    });
}

module.exports = { sendEmail };