const mediaService = require("../services/media.service");

async function handle(message) {

    const media = await mediaService.download(message);

    console.log(media);

}

module.exports = {
    handle
};