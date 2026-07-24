const fs = require("fs");
const path = require("path");

const drive = require("../clients/google.client");

const ROOT_FOLDER = process.env.GOOGLE_DRIVE_ROOT_FOLDER;

const folderCache = new Map();

/**
 * Cari folder berdasarkan nama
 */
async function getFolder(name) {

    const response = await drive.files.list({

        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        
        q: [
            `'${ROOT_FOLDER}' in parents`,
            `name='${name}'`,
            "mimeType='application/vnd.google-apps.folder'",
            "trashed=false"
        ].join(" and "),

        fields: "files(id,name)",

        pageSize: 1

    });

    return response.data.files[0] || null;

}

/**
 * Buat folder baru
 */
async function createFolder(name) {

    console.log(`[DRIVE] Create folder : ${name}`);

    const response = await drive.files.create({
        supportsAllDrives: true,

        requestBody: {

            name,

            mimeType: "application/vnd.google-apps.folder",

            parents: [ROOT_FOLDER]

        },

        fields: "id,name"

    });

    return response.data;

}

/**
 * Pastikan folder tersedia
 */
async function ensureFolder(command) {
    console.log(`[DRIVE] Ensure folder : ${command}`);

    if (!command) {
        throw new Error("Command is required");
    }

    command = command.toLowerCase();

    if (folderCache.has(command)) {

        return folderCache.get(command);

    }

    let folder = await getFolder(command);

    if (!folder) {

        folder = await createFolder(command);
        console.log(`[DRIVE] Creating folder : ${command}`);

    }
    console.log(`[DRIVE] Folder found : ${command}`);

    folderCache.set(command, folder.id);

    return folder.id;

}

/**
 * Upload stream langsung
 */
async function uploadStream(stream, filename, folderId) {
    console.log(
        `[DRIVE] Upload ${filename} -> Folder ${folderId}`
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