const api = require("../config/axios");

async function getServerInfo() {

    const response =
        await api.get("/api/server?all=false");

    return response.data;

}

async function getSessions() {

    const response =
        await api.get("/api/sessions?all=false");

    return response.data;

}

async function getGroups(session) {

    try {

        const response =
            await api.get(`/api/${session}/groups`);

        return response.data;

    }
    catch (err) {

        console.error(
            "[WAHA] Failed to get groups:",
            err.message
        );

        throw err;

    }

}

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

                        downloadMedia: false,
                        merge: true,

                        limit,
                        offset,

                        "filter.timestamp.gte": timestamp

                    }
                }

            );

        return response.data;

    }
    catch (err) {

        console.error(

            `[WAHA] Failed to get messages for ${chatId}:`,

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

            err.response?.data || err.message

        );

        throw err;

    }

}

module.exports = {

    getSessions,

    // getGroups,

    // getMessages,

    // getMessage,

    getServerInfo

};