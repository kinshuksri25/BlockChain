const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const path = require("path");
const BlockChain = require("./blockchain/blockChain.js");
const PubSub = require('./app/pubsub.js');
const { response } = require("express");
const TransactionPool = require('./wallet/transaction-pool.js');
const Wallet = require('./wallet/wallet.js');
const TransactionMiner = require("./app/transaction-miner.js");

const app = express();
const blockchain = new BlockChain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS =`http://localhost:${DEFAULT_PORT}`;
const pubsub = new PubSub({blockchain,transactionPool});
const transactionMiner = new TransactionMiner({blockchain,transactionPool,wallet,pubsub});
let PEER_PORT;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"../frontend/dist")));

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
            transaction = wallet.createTransaction({recipient,amount,chain:blockchain.chain});
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

app.get('/api/mine-transactions',(req,res)=>{
    transactionMiner.mineTransaction();
    res.redirect('api/blocks');
});

app.get('/api/wallet-info',(req,res)=>{
    const address = wallet.publicKey;
    res.json({address,balance:Wallet.calculateBalance({chain:blockchain.chain,address})});
});

app.get("*",(req,res) =>{
    res.sendFile(path.join(__dirname,'../frontend/dist/index.html'));
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
//Seeding Blockchain to enable frontend development
const walletFoo = new Wallet();
const walletBar = new Wallet();

const generateWalletTransaction = ({wallet,recipient,amount}) => {
    const transaction = wallet.createTransaction({recipient,amount,chain:blockchain.chain});
    transactionPool.setTransaction(transaction);
}

const walletAction = () =>{
    generateWalletTransaction({wallet,recipient : walletFoo.publicKey,amount:5});
}

const walletFooAction = () =>{
    generateWalletTransaction({wallet:walletFoo,recipient : walletBar.publicKey,amount:10});
}

const walletBarAction = () =>{
    generateWalletTransaction({wallet:walletBar,address : wallet.publicKey,amount:15});
}

for(let i=0;i<10;i++){
    if(i%3 === 0){
        walletAction();
        walletFooAction();
    }else if(i%3===1){
        walletAction();
        walletBarAction();
    }else{
        walletFooAction();
        walletBarAction();
    }

    transactionMiner.mineTransaction();
}

//End

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT,()=>{
    console.log(`App starting at localhost:${PORT}`);

    if(PORT != DEFAULT_PORT)
    syncWithRootState();
});