const { getSessions } = require("./waha.service");
const { sendEmail } = require("./email.service");

const notifiedSessions = new Map();

async function checkSessions() {
    try {
        const sessions = await getSessions();

        for (const session of sessions) {

            const sessionName = session.name;
            const status = session.status;

            // Session normal
            if (status === "WORKING") {

                // reset agar jika down lagi akan kirim email lagi
                notifiedSessions.delete(sessionName);

                continue;
            }

            // Sudah pernah dikirim email
            if (notifiedSessions.has(sessionName)) {
                continue;
            }

            await sendEmail(
                `⚠️ WA Session ${sessionName} Down`,
                `
                <h2>WhatsApp Session Alert</h2>

                <table border="1" cellpadding="8">
                    <tr>
                        <td><b>Session</b></td>
                        <td>${sessionName}</td>
                    </tr>

                    <tr>
                        <td><b>Status</b></td>
                        <td>${status}</td>
                    </tr>

                    <tr>
                        <td><b>Time</b></td>
                        <td>${new Date().toLocaleString("id-ID")}</td>
                    </tr>
                </table>
                `
            );

            console.log(
                `[SESSION MONITOR] Email sent for ${sessionName} (${status})`
            );

            notifiedSessions.set(sessionName, true);
        }

    } catch (err) {
        console.error("[SESSION MONITOR]", err.message);
    }
}

// cek saat startup
checkSessions();

// cek setiap 5 menit
setInterval(checkSessions, 5 * 60 * 1000);

module.exports = {};