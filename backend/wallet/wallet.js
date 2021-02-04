const {STARTING_BALANCE} = require("../config.js");
const {ec} = require("../util/elliptic.js");
const Transaction = require('./transaction.js');
const cryptoHash = require("../util/crypto-hash.js");

// This has 3 main purposes : 
// 1. It gives the user a public address in the system, and can be used to track how much balance a user has.
// 2. Track and calculate the balance of a user by examining the blockchain history
// 3. Conduct official and cryptographically secure transactions


class Wallet {
    constructor(){
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair(); 
        this.publicKey = this.keyPair.getPublic().encode('hex'); //getPublic returns a EC point (x,y) we are encoding it to hex 
    }

    sign(data){
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({amount,recipient,chain}){
        if(chain){
            this.balance = Wallet.calculateBalance({chain,address:this.publicKey});
        }

        if(amount > this.balance){
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({senderWallet:this,amount,recipient});
    }

    static calculateBalance({address,chain}){
        let hasConductedTransaction = false;
        let outputsTotal = 0;

        for(let i=chain.length-1;i>0;i--){
            const block = chain[i];
            for(let transaction of block.data){
                if(transaction.input.address === address){
                    hasConductedTransaction = true;
                }
                const addressOutput = transaction.outputMap[address];
                if(addressOutput){
                    outputsTotal += addressOutput;
                }
            }
            if(hasConductedTransaction){
                break;
            }
        }   

        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }
}


module.exports = Wallet;