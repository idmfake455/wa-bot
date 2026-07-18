const api = require("../config/axios");

async function getServerInfo() {
    const response = await api.get("/api/server?all=false");
    return response.data;
}

async function getSessions() {
    const response = await api.get("/api/sessions?all=false");
    return response.data;
}

module.exports = {
    getServerInfo,
    getSessions
};