const mediaHandler = require("../handlers/media.handler");
const batches = new Map();
const WAIT_TIME = 3000;

let processingCount = 0;
let processing = Promise.resolve();

function getKey(message) {

    // Jika bagian album gunakan albumId
    // Jika single image gunakan message.id
    const albumId = message.albumId || message.id;

    return `${message.to}_${message.from}_${albumId}`;

}

function parseCommand(text) {

    if (!text) {
        return null;
    }

    const originalText = text.trim();

    if (!originalText.startsWith("#")) {
        return null;
    }

    const command = originalText.toUpperCase();

    /*
     * Keyword:
     *
     * WH       : #WHNama Folder
     * EXIM     : #Nama Folder
     * BUDURAN  : #MW2Nama Folder
     * ILUFAK   : #MW4Nama Folder
     * GESSO    : #MW1Nama Folder
     * FLOORING : #IKFNama Folder
     * PLYWOOD  : #PLYNama Folder
     * CABINET  : #IICNama Folder
     * MINDO    : #MNDNama Folder
     *
     * Keyword tidak case-sensitive.
     */

    const KEYWORDS = [
        {
            prefix: "#MW2",
            keyword: "BUDURAN"
        },
        {
            prefix: "#MW4",
            keyword: "ILUFAK"
        },
        {
            prefix: "#MW1",
            keyword: "GESSO"
        },
        {
            prefix: "#IKF",
            keyword: "FLOORING"
        },
        {
            prefix: "#PLY",
            keyword: "PLYWOOD"
        },
        {
            prefix: "#IIC",
            keyword: "CABINET"
        },
        {
            prefix: "#MND",
            keyword: "MINDO"
        },
        {
            prefix: "#WH",
            keyword: "WH"
        }
    ];

    /*
     * Cek keyword khusus terlebih dahulu.
     */
    for (const item of KEYWORDS) {

        if (command.startsWith(item.prefix)) {

            const folderName = originalText
                .substring(item.prefix.length)
                .trim();

            if (!folderName) {
                return null;
            }

            return {
                keyword: item.keyword,
                folderName
            };

        }

    }

    /*
     * EXIM
     *
     * Format:
     * #Nama Folder
     *
     * # sendiri merupakan keyword EXIM.
     */

    const folderName = originalText
        .substring(1)
        .trim();

    if (!folderName) {
        return null;
    }

    return {
        keyword: "EXIM",
        folderName
    };

}

async function flush(key) {

    const batch = batches.get(key);

    if (!batch) {
        return;
    }

    batches.delete(key);

    console.log("\n========== BATCH ==========");
    console.log("Key      :", key);
    console.log("Command  :", batch.command);
    console.log("Files    :", batch.messages.length);

    batch.messages.forEach((msg, index) => {

        console.log(
            `${index + 1}. album=${msg.albumId} id=${msg.id} caption="${msg.body}"`
        );

    });

    console.log("===========================\n");

    if (!batch.command) {

        console.log("Skip batch (tidak ada command)");
        return;

    }

    processing = processing.then(async () => {

        processingCount++;

        try {

            await mediaHandler.handle(batch);

        } finally {

            processingCount--;

        }

    });

    await processing;

}

function push(message) {

    const batchKey = getKey(message);

    let batch = batches.get(batchKey);

    if (!batch) {

        batch = {

            command: null,
            messages: [],
            timer: null

        };

        batches.set(batchKey, batch);

    }

    batch.messages.push(message);

    // console.log(
    //     `[QUEUE] album=${message.albumId} file=${message.id} caption="${message.body}"`
    // );

    const command = parseCommand(message.body);

    if (command) {
        batch.command = command;
    }

    clearTimeout(batch.timer);

    batch.timer = setTimeout(() => {

        flush(batchKey);

    }, WAIT_TIME);

}

function isIdle() {

    return (
        batches.size === 0 &&
        processingCount === 0
    );

}

async function waitUntilIdle(interval = 500) {

    while (!isIdle()) {

        await new Promise(resolve =>
            setTimeout(resolve, interval)
        );

    }

}

module.exports = {

    push,
    isIdle,
    waitUntilIdle

};