const os = require("os");

const { getSessions } = require("./waha.service");
const { sendEmail } = require("./email.service");
// ********************** handle session down *************************
// const recoveryService = require("./recovery.service");

// Menandakan apakah ini pengecekan pertama saat aplikasi start
// let firstRun = true;
// ********************************************************************

// Menyimpan status terakhir setiap session
const sessionStates = new Map();

async function checkSessions() {

    try {

        const sessions = await getSessions();

        for (const session of sessions) {

            const sessionName = session.name;
            const currentStatus = session.status;

            const previousStatus =
                sessionStates.get(sessionName);

            // ====================================================
            // SESSION WORKING
            // ====================================================

            if (currentStatus === "WORKING") {

                // // ******************** Recovery saat aplikasi pertama kali start ******************** 
                // // Recovery saat aplikasi pertama kali start
                // if (firstRun) {

                //     console.log(
                //         `[SESSION MONITOR] Startup recovery for ${sessionName}`
                //     );

                //     await recoveryService.run(sessionName);

                // }

                // // Recovery saat session kembali WORKING
                // else if (
                //     previousStatus &&
                //     previousStatus !== "WORKING"
                // ) {

                //     console.log(
                //         `[SESSION MONITOR] ${sessionName} recovered`
                //     );

                //     await recoveryService.run(sessionName);

                // }
                // ***************************************************************************

                sessionStates.set(
                    sessionName,
                    "WORKING"
                );

                continue;

            }


            // ====================================================
            // SESSION DOWN
            // ====================================================

            // Jika status tidak berubah, jangan proses ulang
            if (previousStatus === currentStatus) {
                continue;
            }

            // Email alert hanya untuk environment production
            if (process.env.NODE_ENV === "production") {
                try {
                    await sendEmail(
                        `🚨 WhatsApp Session Down - ${sessionName}`,
                        `
                        <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;">
                            <h2 style="color:#d32f2f;">🚨 WhatsApp Session Alert</h2>
                            <p>Sistem mendeteksi bahwa salah satu WhatsApp session mengalami gangguan. Mohon segera lakukan pengecekan.</p>
                            <table style="border-collapse:collapse;width:100%;">
                                <tr><td style="padding:8px;border:1px solid #ddd;"><b>Application</b></td><td style="padding:8px;border:1px solid #ddd;">WA Bot Attachment Downloader</td></tr>
                                <tr><td style="padding:8px;border:1px solid #ddd;"><b>Server</b></td><td style="padding:8px;border:1px solid #ddd;">Production Server</td></tr>
                                <tr><td style="padding:8px;border:1px solid #ddd;"><b>Hostname</b></td><td style="padding:8px;border:1px solid #ddd;">${os.hostname()}</td></tr>
                                <tr><td style="padding:8px;border:1px solid #ddd;"><b>Session Name</b></td><td style="padding:8px;border:1px solid #ddd;">${sessionName}</td></tr>
                                <tr><td style="padding:8px;border:1px solid #ddd;"><b>Status</b></td><td style="padding:8px;border:1px solid #ddd;color:red;"><b>${currentStatus}</b></td></tr>
                                <tr><td style="padding:8px;border:1px solid #ddd;"><b>Detected At</b></td><td style="padding:8px;border:1px solid #ddd;">${new Date().toLocaleString("id-ID")}</td></tr>
                            </table>
                            <br>
                            <b>Recommended Action</b>
                            <ol>
                                <li>Login ke server.</li>
                                <li>Periksa status Docker WAHA.</li>
                                <li>Pastikan session <b>${sessionName}</b> masih tersedia.</li>
                                <li>Restart session apabila diperlukan.</li>
                                <li>Pastikan QR Code tidak perlu di-scan ulang.</li>
                            </ol>
                            <hr>
                            <p style="font-size:12px;color:#888;">Email ini dikirim otomatis oleh WA Bot Monitoring.</p>
                        </div>
                        `
                    );

                    console.log(
                        `[SESSION MONITOR] Email sent for ${sessionName} (${currentStatus})`
                    );
                } catch (err) {
                    console.error("[EMAIL]", err.message);
                }
            }

            sessionStates.set(sessionName, currentStatus);

        }

        // ***************************** Handel session down *******************************
        // Startup selesai
        firstRun = false;
        // ********************************************************************************

    }
    catch (err) {

        console.error(
            "[SESSION MONITOR]",
            err.message
        );

    }

}

// ====================================================
// Initial Check
// ====================================================

checkSessions();

// ====================================================
// Monitor setiap 5 menit
// ====================================================

setInterval(
    checkSessions,
    5 * 60 * 1000
);

module.exports = {};