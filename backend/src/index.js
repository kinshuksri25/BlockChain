const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const BlockChain = require("./blockChain.js");
const PubSub = require('./pubsub.js');
const { response } = require("express");

const app = express();
const blockchain = new BlockChain();
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS =`http://localhost:${DEFAULT_PORT}`;
const pubsub = new PubSub({blockchain});
let PEER_PORT;

app.use(bodyParser.json());

app.get('/api/blocks',(req,res)=>{
    res.json(blockchain.chain);
});

app.post("/api/mine",(req,res)=>{
    const {data} = req.body;
    blockchain.addBlock({data});
    pubsub.broadcastChain();
    //in a front end we need to handle this redirect, postman generally handles this redirect on our behalf during development
    res.redirect('/api/blocks');
});

if(process.argv.slice(2)[0] === 'GENERATE_PEER_PORT'){
    PEER_PORT = DEFAULT_PORT+Math.ceil(Math.random()*1000);
}

const syncChain = () =>{
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,reponse,body)=>{
        if(!error && response.statusCode === 200){  
            const rootChain = JSON.parse(body);
            console.log('replace chain on sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT,()=>{
    console.log(`App starting at localhost:${PORT}`);

    if(PORT != DEFAULT_PORT)
    syncChain();
});