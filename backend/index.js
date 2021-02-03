const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const BlockChain = require("./blockchain/blockChain.js");
const PubSub = require('./app/pubsub.js');
const { response } = require("express");
const TransactionPool = require('./wallet/transaction-pool.js');
const Wallet = require('./wallet/wallet.js');

const app = express();
const blockchain = new BlockChain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS =`http://localhost:${DEFAULT_PORT}`;
const pubsub = new PubSub({blockchain,transactionPool});
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

app.post("/api/transact",(req,res)=>{
    const {amount,recipient} = req.body;
    let transaction = transactionPool.existingTransaction({inputAddress : wallet.publicKey});
    try{
        if(transaction){
            transaction.update({senderWallet:wallet,recipient,amount});
        }else{
            transaction = wallet.createTransaction({recipient,amount});
        }
        
    }catch(error){
        return res.status(400).json({type:"error",message:error.message});
    }
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
        
    res.json({type:"success",transaction});
});

app.get('/api/transaction-pool-map',(req,res)=>{
    res.json(transactionPool.transactionMap);
});

if(process.argv.slice(2)[0] === 'GENERATE_PEER_PORT'){
    PEER_PORT = DEFAULT_PORT+Math.ceil(Math.random()*1000);
}

const syncWithRootState = () =>{
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,reponse,body)=>{
        if(!error && response.statusCode === 200){  
            const rootChain = JSON.parse(body);
            console.log('replace chain on sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({url:`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`},(error,reponse,body)=>{
        if(!error && response.statusCode === 200){  
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT,()=>{
    console.log(`App starting at localhost:${PORT}`);

    if(PORT != DEFAULT_PORT)
    syncWithRootState();
});