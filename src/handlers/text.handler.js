async function handle(message) {

    console.log("================================");
    console.log("TEXT MESSAGE");
    console.log("================================");

    console.log("Body :", message.body);
    console.log("From :", message.from);
    console.log("Name :", message.name);

}

module.exports = {
    handle
};