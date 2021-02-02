const Block = require("./block.js");
const cryptoHash = require("../util/crypto-hash.js");

class BlockChain{
    constructor(){
        this.chain = [Block.genesis()];
    }

    addBlock({data}){
        const newBlock = Block.mineBlock({lastBlock:this.chain[this.chain.length-1],data});
        this.chain.push(newBlock);
    }

    replaceChain(chain){
        if(chain.length<=this.chain.length){
            console.error("The incoming chain must be longer");
            return;
        }
        if(!BlockChain.isValidChain(chain)){
            console.error("The incoming chain must be valid");
            return;
        }
        console.log("replacing chain with",chain);
        this.chain = chain;
    }

    static isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false;
        }

        for(let i = 1;i<chain.length;i++){
            const block = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;
            const {timeStamp,lastHash,hash,data,difficulty,nonce} = block;

            if(lastHash !== actualLastHash){
                return false;
            }

            const validHash = cryptoHash(timeStamp,lastHash,data,nonce,difficulty);

            if(hash !== validHash){
                return false;
            }

            if((lastDifficulty - difficulty) > 1){
                return false;
            }
        }

        return true;
    }
}

module.exports = BlockChain;