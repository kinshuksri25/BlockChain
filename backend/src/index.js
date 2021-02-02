const express = require("express");
const bodyParser = require("body-parser");
const BlockChain = require("./blockChain.js");

const app = express();
const blockChain = new BlockChain();
const PORT = 3000;

app.use(bodyParser.json());

app.get('/api/blocks',(req,res)=>{
    res.json(blockChain.chain);
});

app.post("/api/mine",(req,res)=>{
    const {data} = req.body;
    blockChain.addBlock({data});
    //in a front end we need to handle this redirect, postman generally handles this redirect on our behalf during development
    res.redirect('/api/blocks');
});

app.listen(PORT,()=>{
    console.log(`App starting at localhost:${PORT}`);
});