const TransactionPool = require('../transaction-pool.js');
const Transaction = require('../transaction.js');
const Wallet = require('../wallet.js');
const Blockchain = require("../../blockchain/blockChain.js");


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

    describe("validTransaction()",()=>{
        let validTransaction,errorMock;

        beforeEach(()=>{
            validTransaction = [];
            errorMock = jest.fn();
            global.console.error = errorMock;
            for(let i=0;i<10;i++){
                transaction = new Transaction({senderWallet:new Wallet(),recipient:'any-recipient',amount:30});
                if(i%3===0){
                    transaction.input.amount = 999999;
                }else if(i%3===1){
                    transaction.input.signature = new Wallet().sign('foo');
                }else{
                    validTransaction.push(transaction);
                }
                transactionPool.setTransaction(transaction);
            }
        });


        it("it returns valid transactions",()=>{
            expect(transactionPool.validTransaction()).toEqual(validTransaction);
        })

        it("logs error for the invalid transactions",()=>{
            transactionPool.validTransaction();
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe("clear()",()=>{
        it("clears the transactions",()=>{
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        });
    });


    describe("clearBlockchainTransactions",()=>{
        it("clears the pool of any existing blockchain transaction",()=>{
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for(let i=0;i<6;i++){
                const transaction = new Wallet().createTransaction({
                    recipient : 'foo',
                    amount : 20
                });

                transactionPool.setTransaction(transaction);

                if(i%2==0){
                    blockchain.addBlock({data:[transaction]});
                }else{
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }
            transactionPool.clearBlockchainTransactions({chain:blockchain.chain});
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
});