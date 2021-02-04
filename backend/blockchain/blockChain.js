const Block = require("./block.js");
const Transaction = require("../wallet/transaction.js");
const cryptoHash = require("../util/crypto-hash.js");
const { REWARD_INPUT, MINING_REWARD } = require("../config.js");
const Wallet = require("../wallet/wallet");

class BlockChain{
    constructor(){
        this.chain = [Block.genesis()];
    }

    addBlock({data}){
        const newBlock = Block.mineBlock({lastBlock:this.chain[this.chain.length-1],data});
        this.chain.push(newBlock);
    }

    replaceChain(chain,validateTransactions,onSuccess){
        if(validateTransactions && !this.validTransactionData({chain})){
            console.error("The incoming chain has invalid transaction data");
            return;
        }
        if(chain.length<=this.chain.length){
            console.error("The incoming chain must be longer");
            return;
        }
        if(!BlockChain.isValidChain(chain)){
            console.error("The incoming chain must be valid");
            return;
        }
        if(onSuccess) onSuccess();
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

    validTransactionData({chain}){
        for(let i = 1;i<chain.length;i++){
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;
            for(let transaction of block.data){
                if(transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount +=1;

                    if(rewardTransactionCount > 1){
                        console.error("Miner rewards exceed limit");
                        return false;
                    }

                    if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
                        console.error("Miner rewards amount is invalid");
                        return false;
                    }

                }else{
                    if(!Transaction.validTransaction(transaction)){
                        console.error("Invalid transaction");
                        return false;
                    }
                    const trueBalance = Wallet.calculateBalance({chain:this.chain,address:transaction.input.address});

                    if(transaction.input.amount !== trueBalance){
                        console.error("Invalid input amount");
                        return false;
                    }

                    if(transactionSet.has(transaction)){
                        console.error("An identical transaction appears more than once");
                        return false;
                    }else{
                        transactionSet.add(transaction);
                    }
                }
            }
        }
        return true;
    }
}

module.exports = BlockChain;