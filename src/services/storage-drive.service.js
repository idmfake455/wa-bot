const fs = require("fs");
const path = require("path");

const drive = require("../clients/google.client");

const ROOT_FOLDERS = {
    WH: "13xOl_yQCtUAJCB0xs3WQS6wEC1TBhywc",
    EXIM: "1wA6XTJu9K23yzKO73BRh58Nfl-o2Gyf6",

    BUDURAN: "1mCmhsYX42Xf9A738mqEyS8r-1FeYV6MA",
    ILUFAK: "1pgvRC_aNP-zlQsESDNQV6Rjy4OsBpVoV",
    GESSO: "1FZ_MCR3X2w9tx3v9rGvJtDOQOLhwNm6Y",
    FLOORING: "1nZ_BpPUUucLqIPMjQM5jeiHmPcjo6MWz",
    PLYWOOD: "1lG2Se5wq5VOa_PDYAW53sRRyqB8GFTju",
    CABINET: "1eO618BzLfWUD_95JlmnitC-oyDusejtB",
    MINDO: "1CvbL3_oxV20EsoUMRX_7eqCX4BL6qIlX",
    RPSL: "1oTVUKqf26eY2LBC0EMfeuOP8dO2xBKvf",
    ROHLIG: "17lpYnPZokvf5-b1D3ER4-skWztxqBjRP",
    PPT: "1Rx2AW85Xz4NYHq8z3-QVlwWju1PnnIas",
    MRA: "18rxFdhvMfbPkkkBWGIYZQkfoBuc1S9Io",
    LOGWIN: "1zGpJdYnxeaQ5RxmO1DUyx7899IFfZNff",
    LIMO: "1EuRw-K4iLS77HqQRz5N2zCpA44Nu5HXS",
    TETRA: "1e6OgtkxzYrTGsCKjl7pjh3MYfQL6Kjh9",
    METSO: "1bO5reYsrY2JftjGSZWbtN0TiEP6Do-OH",
    HANOMAN: "1SJpytia0uxcdAA_O6om3qN4CrGJ3wYzc",
    CATALITE: "1xEPaqceorPvORah2-WfqFAUOdEif5gdB",
    BDP: "1zQTbZXi9NsILPRkYRyLsXpG7JGf_ZvYH",
    APL: "1oHCN92CpkX0rx4_NhQZuFDO7ZBU0Stw0"
};

const folderCache = new Map();

/**
 * Cari folder berdasarkan nama
 */
async function getFolder(parentId, folderName) {

    const normalizedName = folderName
        .trim()
        .toLowerCase();

    const response = await drive.files.list({
        q: [
            `'${parentId}' in parents`,
            `mimeType = 'application/vnd.google-apps.folder'`,
            `trashed = false`
        ].join(" and "),

        fields: "files(id,name)",

        spaces: "drive",

        supportsAllDrives: true,

        includeItemsFromAllDrives: true
    });

    const folders = response.data.files || [];

    const folder = folders.find(file => {

        return file.name
            .trim()
            .toLowerCase() === normalizedName;

    });

    return folder || null;
}

/**
 * Buat folder baru
 */
async function createFolder(parentId, name) {

    const folderName = name.trim().toUpperCase();

    console.log(`[DRIVE] Create folder : ${folderName}`);

    const response = await drive.files.create({
        supportsAllDrives: true,

        requestBody: {

            name: folderName,

            mimeType: "application/vnd.google-apps.folder",

            parents: [parentId]

        },

        fields: "id,name"

    });

    return response.data;

}

/**
 * Pastikan folder tersedia
 */
async function ensureFolder(command) {

    if (!command) {
        throw new Error("Command is required");
    }

    const keyword = command.keyword;

    const parentId = ROOT_FOLDERS[keyword];

    if (!parentId) {

        console.error(
            `[DRIVE] Unknown keyword : ${keyword}`
        );

        throw new Error(
            `Unknown keyword : ${keyword}`
        );

    }

    const folderName = command.folderName
        .trim();

    if (!folderName) {
        throw new Error("Folder name is empty");
    }

    /*
     * Nama untuk pencarian.
     * Tidak mengubah nama asli folder.
     */
    const searchName = folderName
        .toLowerCase();

    /*
     * Nama jika folder baru dibuat.
     */
    const createName = folderName
        .toUpperCase();

    console.log(
        `[DRIVE] Keyword       : ${keyword}`
    );

    console.log(
        `[DRIVE] Root Folder   : ${keyword}`
    );

    console.log(
        `[DRIVE] Search Folder : ${searchName}`
    );

    console.log(
        `[DRIVE] New Folder    : ${createName}`
    );

    /*
     * Cache menggunakan nama lowercase
     * supaya case tidak membedakan folder.
     */
    const cacheKey =
        `${parentId}_${searchName}`;

    if (folderCache.has(cacheKey)) {

        const cachedFolderId =
            folderCache.get(cacheKey);

        console.log(
            `[DRIVE] Folder cache found`
        );

        console.log(
            `[DRIVE] Upload destination : ${keyword}/${searchName}`
        );

        return cachedFolderId;

    }

    /*
     * Cari folder existing secara
     * CASE-INSENSITIVE.
     */
    console.log(
        `[DRIVE] Searching folder : ${keyword}/${searchName}`
    );

    let folder = await getFolder(
        parentId,
        searchName
    );

    /*
     * Folder sudah ada
     */
    if (folder) {

        console.log(
            `[DRIVE] Folder found : ${keyword}/${folder.name}`
        );

        console.log(
            `[DRIVE] Folder ID : ${folder.id}`
        );

    }

    /*
     * Folder belum ada
     */
    else {

        console.log(
            `[DRIVE] Folder not found : ${keyword}/${searchName}`
        );

        console.log(
            `[DRIVE] Creating folder : ${keyword}/${createName}`
        );

        folder = await createFolder(
            parentId,
            createName
        );

        console.log(
            `[DRIVE] Folder created : ${keyword}/${createName}`
        );

        console.log(
            `[DRIVE] Folder ID : ${folder.id}`
        );

    }

    /*
     * Simpan ke cache
     */
    folderCache.set(
        cacheKey,
        folder.id
    );

    console.log(
        `[DRIVE] Upload destination : ${keyword}/${folder.name}`
    );

    return folder.id;

}

/**
 * Upload stream langsung
 */
async function uploadStream(stream, filename, folderId) {

    const MAX_RETRIES = 5;
    const BASE_DELAY = 2000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {

        try {

            console.log(
                `[DRIVE] Upload ${filename} -> Folder ${folderId}` +
                ` (attempt ${attempt + 1}/${MAX_RETRIES + 1})`
            );

            const response = await drive.files.create({

                supportsAllDrives: true,

                requestBody: {
                    name: filename,
                    parents: [folderId]
                },

                media: {
                    body: stream
                },

                fields: "id,name,webViewLink"

            });

            console.log(
                `[DRIVE] Uploaded : ${response.data.id}`
            );

            return response.data;

        } catch (err) {

            const status = err?.response?.status || err?.code;

            const reason =
                err?.response?.data?.error?.errors?.[0]?.reason;

            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                "";

            const isRateLimit =
                status === 403 &&
                (
                    reason === "userRateLimitExceeded" ||
                    message.toLowerCase().includes("rate limit")
                );

            if (!isRateLimit || attempt >= MAX_RETRIES) {

                console.error(
                    `[DRIVE] Upload failed : ${filename}`
                );

                throw err;

            }

            const delay =
                BASE_DELAY * Math.pow(2, attempt);

            console.warn(
                `[DRIVE] Rate limit exceeded.` +
                ` Retry ${attempt + 1}/${MAX_RETRIES}` +
                ` after ${delay} ms`
            );

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );

        }

    }

}

/**
 * Upload file lokal
 */
async function uploadFile(filepath, filename, command) {

    const folderId = await ensureFolder(command);

    const stream = fs.createReadStream(filepath);

    return uploadStream(

        stream,

        filename,

        folderId

    );

}

/**
 * Simpan stream langsung ke Google Drive
 */
async function saveStream(stream, filename, command) {

    const folderId = await ensureFolder(command);

    return uploadStream(

        stream,

        filename,

        folderId

    );

}


module.exports = {

    getFolder,

    createFolder,

    ensureFolder,

    uploadStream,

    uploadFile,

    saveStream

};