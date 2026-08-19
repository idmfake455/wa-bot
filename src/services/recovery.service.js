const webhookService = require("./webhook.service");

const checkpointService = require("./checkpoint.service");

const mediaQueue = require("../queues/media.queue");

const {
    getGroups,
    getMessages,
    getMessage
} = require("./waha.service");

const PAGE_SIZE = 100;

async function recoverGroup(session, group) {

    const chatId = group.id._serialized;

    console.log(
        `[RECOVERY] Checking ${group.name} (${chatId})`
    );

    const checkpoint =
        checkpointService.getCheckpoint(chatId);

    console.log(
        `[RECOVERY] Last checkpoint : ${checkpoint}`
    );

    let offset = 0;

    while (true) {

        const messages =
            await getMessages(
                session,
                chatId,
                checkpoint,
                offset,
                PAGE_SIZE
            );

        if (!messages.length) {

            console.log(
                `[RECOVERY] ${group.name} completed`
            );

            break;

        }

        for (const msg of messages) {

            // ====================================================
            // DEBUG RAW MESSAGE
            // ====================================================

            // if (
            //     msg.body &&
            //     msg.body.startsWith("#")
            // ) {
            //
            //     console.log("");
            //     console.log("========== RAW RECOVERY MESSAGE ==========");
            //     console.log(JSON.stringify(msg, null, 2));
            //     console.log("==========================================");
            //     console.log("");
            //
            // }

            // ====================================================
            // Skip jika sudah pernah diproses
            // ====================================================

            if (
                checkpointService.isProcessed(msg.id)
            ) {

                continue;

            }

            // ====================================================
            // Load quoted media jika reply attachment
            // ====================================================

            if (
                msg.replyTo &&
                msg.replyTo.hasMedia &&
                !msg.replyTo.media
            ) {

                let quoted = null;

                try {

                    console.log("");
                    console.log("========== REPLY TO ==========");
                    console.log(JSON.stringify(msg.replyTo, null, 2));
                    console.log("==============================");
                    console.log(msg.replyTo._data.body.length);

                    // quoted = await getMessage(
                    //     session,
                    //     chatId,
                    //     msg.replyTo.id
                    // );

                    const fs = require("fs");

                    const base64 = msg.replyTo._data.body;

                    const buffer = Buffer.from(base64, "base64");

                    console.log("Base64 Length :", base64.length);
                    console.log("Buffer Length :", buffer.length);

                    fs.writeFileSync("./test.jpg", buffer);

                    console.log("test.jpg created");

                    console.log("");
                    console.log("===== QUOTED MESSAGE =====");
                    console.log(JSON.stringify(quoted, null, 2));
                    console.log("==========================");

                    if (quoted?.media) {

                        msg.replyTo.media = quoted.media;

                        console.log(
                            "[RECOVERY] Quoted media loaded"
                        );

                    }
                    else {

                        console.log(
                            "[RECOVERY] Quoted message has no media"
                        );

                    }

                }
                catch (err) {

                    console.error(
                        "[RECOVERY] Failed to load quoted message:",
                        err.message
                    );

                }

            }

            // ====================================================
            // Process message
            // ====================================================

            await webhookService.process({

                event: "message",

                session,

                payload: msg

            });

        }

        // Tunggu queue selesai

        await mediaQueue.waitUntilIdle();

        if (messages.length < PAGE_SIZE) {

            break;

        }

        offset += PAGE_SIZE;

    }

}

const recoveringSessions = new Set();

async function run(session) {

    if (recoveringSessions.has(session)) {

        console.log(
            `[RECOVERY] ${session} is already running`
        );

        return;

    }

    recoveringSessions.add(session);

    try {

        console.log("");

        console.log(
            "=============================================="
        );

        console.log(
            `[RECOVERY] Start recovery (${session})`
        );

        console.log(
            "=============================================="
        );

        const groups =
            await getGroups(session);

        console.log(
            `[RECOVERY] ${groups.length} groups found`
        );

        for (const group of groups) {

            try {

                await recoverGroup(
                    session,
                    group
                );

            }
            catch (err) {

                console.error(

                    `[RECOVERY] Failed group ${group.name}`,

                    err.message

                );

            }

        }

        console.log("");

        console.log(
            "=============================================="
        );

        console.log(
            `[RECOVERY] Finish (${session})`
        );

        console.log(
            "=============================================="
        );

    }
    catch (err) {

        console.error(
            "[RECOVERY]",
            err.message
        );

    }
    finally {

        recoveringSessions.delete(session);

    }

}

module.exports = {
    run
};