const axios = require("axios");

const api = axios.create({
    baseURL: process.env.WAHA_URL,
    headers: {
        "X-Api-Key": process.env.WAHA_API_KEY,
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config) => {
    console.log("=== WAHA REQUEST ===");
    console.log("URL:", config.baseURL + config.url);
    console.log("Headers:", config.headers);
    return config;
});

module.exports = api;