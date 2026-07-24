const mediaHandler = require("../handlers/media.handler");

const batches = new Map();

const WAIT_TIME = 3000;

function getKey(message) {

    // Jika bagian album gunakan albumId
    // Jika single image gunakan message.id
    const albumId = message.albumId || message.id;

    return `${message.to}_${message.from}_${albumId}`;

}

function parseCommand(text) {

    if (!text) return null;

    text = text.trim();

    if (!text.startsWith("#")) {
        return null;
    }

    const command = text
        .substring(1)
        .trim()
        .split(/\s+/)[0]
        .toLowerCase();

    return command || null;

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

    await mediaHandler.handle(batch);

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

module.exports = {

    push

};