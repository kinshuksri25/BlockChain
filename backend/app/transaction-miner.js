const Transaction = require("../wallet/transaction.js");

class TransactionMiner{

    constructor({blockchain,transactionPool,wallet,pubsub}){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransaction(){
        const validTransaction = this.transactionPool.validTransaction();

        validTransaction.push(Transaction.rewardTransaction({minerWallet : this.wallet}));

        this.blockchain.addBlock({data : validTransaction});

        this.pubsub.broadcastChain();

        this.transactionPool.clear();

    }
}

module.exports = TransactionMiner;