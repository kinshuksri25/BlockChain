const {GENESIS_DATA,MINE_RATE} = require('./config.js');
const cryptoHash = require('./crypto-hash.js');
const hexToBinary = require('hex-to-binary');

class Block{
    constructor({timeStamp,lastHash,data,hash,nonce,difficulty}){
        this.timeStamp = timeStamp;
        this.lastHash = lastHash;
        this.data = data;
        this.hash = hash;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    //this is a factory method
    static genesis(){
        return new this({...GENESIS_DATA});
    }

    static mineBlock({lastBlock,data}){
        let hash,timeStamp;
        const lastHash = lastBlock.hash;
        let difficulty = lastBlock.difficulty;
        let nonce = 0;

        do{
            nonce++;
            timeStamp = Date.now();
            difficulty = Block.adjustDifficulty({originalBlock : lastBlock,timeStamp});
            hash = cryptoHash(timeStamp,lastHash,data,nonce,difficulty);
        }while(hexToBinary(hash).substring(0,difficulty) !== '0'.repeat(difficulty));

        return new this({
            timeStamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
        });
    }

    static adjustDifficulty({originalBlock,timeStamp}){
        const{difficulty} = originalBlock;
        if(difficulty<1) return 1;
        const difference  = timeStamp-originalBlock.timeStamp;
        if(difference > MINE_RATE){
            return difficulty-1;
        }else if(difficulty == MINE_RATE){
            return difficulty;
        }
        return difficulty+1;
    }
}

module.exports = Block;

