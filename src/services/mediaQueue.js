const mediaDownloader = require("./mediaDownloader");

const queue = new Map();

const QUEUE_TIMEOUT = 2000;

function createJob(message) {

    return {

        jobId: Date.now().toString(),

        groupId: message.from,

        author: message.author,

        caption: message.body || "",

        createdAt: Date.now(),

        lastMessageAt: Date.now(),

        processing: false,

        messages: [],

        timer: null

    };

}

function resetTimer(key) {

    const job = queue.get(key);

    if (!job) return;

    if (job.timer) {
        clearTimeout(job.timer);
    }

    job.timer = setTimeout(async () => {

        await processJob(key);

    }, QUEUE_TIMEOUT);

}

async function processJob(key) {

    const job = queue.get(key);

    if (!job) return;

    if (job.processing) return;

    job.processing = true;

    const duration = Date.now() - job.createdAt;

    console.log("");
    console.log("=================================================");
    console.log("QUEUE FINISHED");
    console.log("=================================================");

    console.log("Job ID      :", job.jobId);
    console.log("Group       :", job.groupId);
    console.log("Author      :", job.author);
    console.log("Caption     :", job.caption || "(No Caption)");
    console.log("Files       :", job.messages.length);
    console.log("Duration    :", duration + " ms");

    try {

        const result = await mediaDownloader.download(job);

        console.log("");

        console.log("READY FOR GOOGLE DRIVE");

        console.log(result.files);

    } catch (err) {

        console.error(err);

    }

    queue.delete(key);

}

function add(message) {

    const key = `${message.from}_${message.author}`;

    if (!queue.has(key)) {

        queue.set(key, createJob(message));

    }

    const job = queue.get(key);

    job.lastMessageAt = Date.now();

    if (!job.caption && message.body) {

        job.caption = message.body;

    }

    job.messages.push(message);

    console.log("");

    console.log("QUEUE UPDATE");

    console.log("Job :", job.jobId);

    console.log("Files :", job.messages.length);

    resetTimer(key);

}

module.exports = {

    add

};