const axios = require("../config/axios");

async function downloadMedia(url){

    return axios.get(url,{
        responseType:"stream"
    });

}

module.exports = {
    downloadMedia
};