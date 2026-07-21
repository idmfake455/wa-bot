async function handle(message) {

    console.log("========== CHAT ==========");
    console.log(message.body);

}

module.exports = {
    handle
};