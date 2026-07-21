const axios = require("axios");

const api = axios.create({

    baseURL: process.env.WAHA_URL,

    timeout: 30000,

    headers: {
        "X-Api-Key": process.env.WAHA_API_KEY
    }

});

module.exports = api;