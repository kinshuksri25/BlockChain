const TransactionPool = require('../transaction-pool.js');
const Transaction = require('../transaction.js');
const Wallet = require('../wallet.js');


describe('TransactionPool',()=>{
    let transactionPool,transaction;

    beforeEach(() =>{
        transactionPool = new TransactionPool();
        transaction = new Transaction({senderWallet:new Wallet(),recipient:'fake-recipient',amount:50});
    });

    describe('setTransaction()',()=>{
        it('adds a transaction',()=>{
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });
});