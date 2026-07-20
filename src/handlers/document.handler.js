async function handle(message){

    console.log("========== DOCUMENT ==========");

    console.dir(message.raw,{
        depth:null
    });

}

module.exports={
    handle
};