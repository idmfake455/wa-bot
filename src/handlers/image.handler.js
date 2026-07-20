async function handle(message){

    console.log("========== IMAGE ==========");

    console.dir(message.media,{
        depth:null
    });

}

module.exports={
    handle
};