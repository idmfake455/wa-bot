const api = require("../config/axios");

// =====================================================
// Get server info
// =====================================================

async function getServerInfo() {


const response =
    await api.get("/api/server?all=false");

return response.data;

}

// =====================================================
// Get sessions
// =====================================================

async function getSessions() {

const response =
    await api.get("/api/sessions?all=false");

return response.data;


}

// =====================================================
// Get groups
// =====================================================

async function getGroups(session) {


try {

    const response =
        await api.get(
            `/api/${session}/groups`
        );

    return response.data;

}
catch (err) {

    console.error(
        "[WAHA] Failed to get groups:",
        err.response?.data ||
        err.message
    );

    throw err;

}


}

// =====================================================
// Get messages
// =====================================================

async function getMessages(


session,
chatId,
timestamp,
offset = 0,
limit = 100


) {


try {

    const response =
        await api.get(

            `/api/${session}/chats/${encodeURIComponent(chatId)}/messages`,

            {
                params: {

                    sortBy: "timestamp",

                    sortOrder: "asc",

                    downloadMedia: true,

                    merge: true,

                    limit,

                    offset,

                    "filter.timestamp.gte":
                        timestamp

                }
            }

        );

    return response.data;

}
catch (err) {

    console.error(

        `[WAHA] Failed to get messages for ${chatId}:`,

        err.response?.data ||
        err.message

    );

    throw err;

}


}

// =====================================================
// Get single message by ID
// =====================================================

async function getMessage(


session,
chatId,
messageId


) {


try {

    const response =
        await api.get(

            `/api/${session}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,

            {
                params: {

                    downloadMedia: true,

                    merge: true

                }
            }

        );

    return response.data;

}
catch (err) {

    console.error(

        `[WAHA] Failed to get message ${messageId}:`,

        err.response?.data ||
        err.message

    );

    throw err;

}


}

// =====================================================
// Find all messages belonging to an album
// =====================================================

async function getAlbumMessages(


session,
chatId,
albumId


) {


try {

    // ============================================================
    // WAKTU PENCARIAN
    // ============================================================

    const now =
        Math.floor(
            Date.now() / 1000
        );

    /*
     * Cari history 30 hari terakhir.
     *
     * Ini hanya untuk menemukan child album.
     */

    const timestamp =
        now - (30 * 24 * 60 * 60);


    console.log(
        "\n[WAHA ALBUM SEARCH]"
    );

    console.log(
        "Session  :",
        session
    );

    console.log(
        "Chat ID  :",
        chatId
    );

    console.log(
        "Album ID :",
        albumId
    );

    console.log(
        "Since    :",
        timestamp
    );


    // ============================================================
    // AMBIL HISTORY MESSAGE
    // ============================================================

    const messages =
        await getMessages(

            session,
            chatId,
            timestamp,
            0,
            100

        );


    console.log(
        "[WAHA ALBUM SEARCH] Messages received:",
        Array.isArray(messages)
            ? messages.length
            : "NOT ARRAY"
    );


    if (
        !Array.isArray(messages)
    ) {

        return [];

    }


    // ============================================================
    // CARI CHILD ALBUM
    // ============================================================

    const albumMessages =
        messages.filter(

            msg => {

                const associationType =
                    msg?._data?.associationType;

                const parentId =
                    msg?._data?.parentMsgKey?.id;

                return (

                    associationType ===
                        "MEDIA_ALBUM"

                    &&

                    parentId ===
                        albumId

                );

            }

        );


    console.log(
        "[WAHA ALBUM SEARCH] Child album found:",
        albumMessages.length
    );


    // ============================================================
    // REFRESH MEDIA MASING-MASING CHILD
    // ============================================================

    const refreshedMessages = [];


    for (
        let index = 0;
        index < albumMessages.length;
        index++
    ) {

        const child =
            albumMessages[index];


        console.log(
            `\n[WAHA ALBUM MEDIA] Refresh ${index + 1}/${albumMessages.length}`
        );

        console.log(
            "Message ID:",
            child.id
        );


        try {

            /*
             * PENTING:
             *
             * child.id adalah serialized message ID.
             *
             * Contoh:
             *
             * false_1203634...@g.us_ABC123..._162...@lid
             *
             * Ini valid untuk endpoint getMessage().
             */

            const refreshed =
                await getMessage(

                    session,

                    chatId,

                    child.id

                );


            console.log(
                "[WAHA ALBUM MEDIA] Refreshed:"
            );

            console.log(
                "ID:",
                refreshed?.id
            );

            console.log(
                "HasMedia:",
                refreshed?.hasMedia
            );

            console.log(
                "Media:",
                refreshed?.media
            );


            /*
             * Gunakan data message hasil refresh.
             */

            if (
                refreshed &&
                refreshed.hasMedia &&
                refreshed.media
            ) {

                /*
                 * Pertahankan metadata album dari
                 * hasil history.
                 *
                 * Karena response getMessage()
                 * bisa tidak membawa seluruh metadata
                 * association album.
                 */

                refreshed._data =
                    {
                        ...(child._data || {}),
                        ...(refreshed._data || {}),
                        associationType:
                            child?._data?.associationType,
                        parentMsgKey:
                            child?._data?.parentMsgKey
                    };


                refreshedMessages.push(
                    refreshed
                );

            } else {

                console.log(
                    "[WAHA ALBUM MEDIA] Media tidak tersedia:",
                    child.id
                );

            }


        } catch (err) {

            console.error(
                "[WAHA ALBUM MEDIA] Failed refresh:",
                child.id
            );

            console.error(
                err?.response?.data ||
                err?.message ||
                err
            );

        }

    }


    // ============================================================
    // HASIL AKHIR
    // ============================================================

    console.log(
        "\n[WAHA ALBUM SEARCH] Refreshed media:",
        refreshedMessages.length
    );


    refreshedMessages.forEach(
        (msg, index) => {

            console.log(
                `--- REFRESHED IMAGE ${index + 1} ---`
            );

            console.log(
                "ID:",
                msg.id
            );

            console.log(
                "Type:",
                msg?._data?.type
            );

            console.log(
                "Association:",
                msg?._data?.associationType
            );

            console.log(
                "Parent:",
                msg?._data?.parentMsgKey?.id
            );

            console.log(
                "HasMedia:",
                msg?.hasMedia
            );

            console.log(
                "Media:",
                msg?.media
            );

        }
    );


    return refreshedMessages;


} catch (err) {

    console.error(
        "\n[WAHA ALBUM SEARCH] ERROR:"
    );

    console.error(
        err?.response?.data ||
        err?.message ||
        err
    );

    throw err;

}


}


// =====================================================
// EXPORT
// =====================================================

module.exports = {


getSessions,

getGroups,

getMessages,

getMessage,

getAlbumMessages,

getServerInfo


};
