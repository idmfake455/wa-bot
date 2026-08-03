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
                `🚨 WhatsApp Session Down - ${sessionName}`,
                `
                <div style="font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#333;">
                    <h2 style="color:#d32f2f;">🚨 WhatsApp Session Alert</h2>

                    <p>
                        Sistem mendeteksi bahwa salah satu WhatsApp session mengalami gangguan.
                        Mohon segera lakukan pengecekan.
                    </p>

                    <table style="border-collapse: collapse; width: 100%;">
                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;"><b>Application</b></td>
                            <td style="padding:8px;border:1px solid #ddd;">WA Bot</td>
                        </tr>

                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;"><b>Server</b></td>
                            <td style="padding:8px;border:1px solid #ddd;">Production Server</td>
                        </tr>

                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;"><b>Session Name</b></td>
                            <td style="padding:8px;border:1px solid #ddd;">${sessionName}</td>
                        </tr>

                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;"><b>Current Status</b></td>
                            <td style="padding:8px;border:1px solid #ddd;color:red;">
                                <b>${status}</b>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;"><b>Detected At</b></td>
                            <td style="padding:8px;border:1px solid #ddd;">
                                ${new Date().toLocaleString("id-ID")}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:8px;border:1px solid #ddd;"><b>Host</b></td>
                            <td style="padding:8px;border:1px solid #ddd;">
                                ${require("os").hostname()}
                            </td>
                        </tr>
                    </table>

                    <br>

                    <b>Recommended Action</b>

                    <ol>
                        <li>Login ke server.</li>
                        <li>Cek status WAHA.</li>
                        <li>Pastikan session <b>${sessionName}</b> masih aktif.</li>
                        <li>Restart session apabila diperlukan.</li>
                        <li>Pastikan QR Code tidak perlu di-scan ulang.</li>
                    </ol>

                    <hr>

                    <p style="color:#888;font-size:12px;">
                        Email ini dikirim otomatis oleh WA Bot Monitoring.
                        Mohon jangan membalas email ini.
                    </p>

                </div>
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