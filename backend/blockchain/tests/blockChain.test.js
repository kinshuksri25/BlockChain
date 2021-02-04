const BlockChain = require("../blockChain.js");
const Block = require("../block.js");
const Wallet = require("../../wallet/wallet.js");
const Transaction = require("../../wallet/transaction.js");
const cryptoHash = require('../../util/crypto-hash.js');

describe("BlockChain",()=>{

    let blockChain,newChain,originalChain,errorMock;

    beforeEach(() =>{
        errorMock = jest.fn();
        global.console.error = errorMock;
        blockChain = new BlockChain();
        newChain = new BlockChain();

        originalChain = blockChain.chain;
    });

    it("contains a chain Array instance",()=>{
        expect(blockChain.chain instanceof Array).toBe(true);
    });

    it("starts with the genesis block",()=>{
        expect(blockChain.chain[0]).toEqual(Block.genesis());
    });

    it("adds a new block to the chain",()=>{
        const newData = "foo-bar";
        blockChain.addBlock({data:newData});

        expect(blockChain.chain[blockChain.chain.length-1].data).toEqual(newData);
    });


    describe("isValidChain()",()=>{
        beforeEach(()=>{
            blockChain.addBlock({data:"Bears"});
            blockChain.addBlock({data:"Beets"});
            blockChain.addBlock({data:"BattleStar"});
        });

        describe("when the chain does not start with the genesis block",()=>{
            it("returns false",()=>{
               blockChain.chain[0] = {data:"fake-genesis"};
               expect(BlockChain.isValidChain(blockChain.chain)).toBe(false);
            });
        });

        describe("when the chain does start with the genesis block and has multiple blocks",()=>{
            describe("and a lasthash reference has changed",()=>{
                it("returns false",()=>{
                    blockChain.chain[2].lastHash = "broken-hash";
                    expect(BlockChain.isValidChain(blockChain.chain)).toBe(false);
                });                
            });

            describe("and the chain contains a block with an invalid field",()=>{
                it("returns false",()=>{
                    blockChain.chain[2].data = "bad-data";
                    expect(BlockChain.isValidChain(blockChain.chain)).toBe(false);
                });
            });

            describe("and the chain doesnot contain any invalid blocks",()=>{
                it("returns true",()=>{
                    expect(BlockChain.isValidChain(blockChain.chain)).toBe(true);
                });
            });

            describe("and the chain contains a block with a jumped difficulty",()=>{
                it("returns false",()=>{
                    const lastBlock = blockChain.chain[blockChain.chain.length-1];

                    const lastHash = lastBlock.hash;
                    const timeStamp = Date.now();
                    const nonce = 0;
                    const data = [];

                    const difficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(timeStamp,data,lastHash,difficulty,nonce);
                    const badBlock = new Block({timeStamp,lastHash,difficulty,nonce,data,hash});

                    blockChain.chain.push(badBlock);

                    expect(BlockChain.isValidChain(blockChain.chain)).toBe(false);
                });
            });

        });
    });

    describe("replaceChain()",()=>{
        let logMock;

        beforeEach(()=>{
            logMock = jest.fn();
            global.console.log = logMock;
        });

        describe("when the new chain is not longer",()=>{
            beforeEach(()=>{
                newChain.chain[0] = {new : "chain"};
                blockChain.replaceChain(newChain.chain);
            });

            it("doesnot replace the chain",()=>{
                expect(blockChain.chain).toEqual(originalChain);
            })

            it("it logs an error",()=>{
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("when the new chain is longer",()=>{
            beforeEach(()=>{
                newChain.addBlock({data:"Bears"});
                newChain.addBlock({data:"Beets"});
                newChain.addBlock({data:"BattleStar"});
            });
            describe("and the chain is invalid",()=>{
                beforeEach(()=>{
                    newChain.chain[2].hash = "some-fake-hash";
                    blockChain.replaceChain(newChain.chain);
                });
                it("doesnot replace the chain",()=>{
                    expect(blockChain.chain).toEqual(originalChain);
                })

                it("it logs an error",()=>{
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe("and the chain is valid",()=>{
                beforeEach(()=>{
                    blockChain.replaceChain(newChain.chain);
                });
                it("replaces the chain",()=>{
                    expect(blockChain.chain).toEqual(newChain.chain);
                })

                it("it logs a chain replacement",()=>{
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

        describe("and the validateTransactions flag is true",()=>{
            it("calls validTransactionData()",()=>{
                const validTransactionDataMock = jest.fn();
                blockChain.validTransactionData = validTransactionDataMock;
                newChain.addBlock({data:'foo'});
                blockChain.replaceChain(newChain.chain,true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
    });

    describe("valid transaction data",()=>{
        let transaction,rewardTransaction,wallet;

        beforeEach(()=>{
            wallet = new Wallet();
            transaction = wallet.createTransaction({recipient : 'foo', amount : 65});
            rewardTransaction = Transaction.rewardTransaction({minerWallet : wallet});
        });

        describe("the transaction data is valid",()=>{
            it("returns true",()=>{
                newChain.addBlock({data : [transaction,rewardTransaction]});

                expect(blockChain.validTransactionData({chain:newChain.chain})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe("the transaction data has multiple rewards",()=>{
            it("return false and logs an error",()=>{
                newChain.addBlock({data:[transaction,rewardTransaction,rewardTransaction]});
                expect(blockChain.validTransactionData({chain:newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            }); 
        });
        
        describe("the transaction data has atleast one malformed outputMap",()=>{
            describe("transaction is not a reward transaction",()=>{
                it("return false and logs an error",()=>{
                    transaction.outputMap[wallet.publicKey] = 999999; 
                    newChain.addBlock({data:[transaction,rewardTransaction]});
                    expect(blockChain.validTransactionData({chain:newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe("transaction is a reward transaction",()=>{
                it("return false and logs an error",()=>{
                    rewardTransaction.outputMap[wallet.publicKey] = 999999; 
                    newChain.addBlock({data:[transaction,rewardTransaction]});
                    expect(blockChain.validTransactionData({chain:newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe("the transaction data has atleast one malformed input",()=>{
            it("return false and logs an error",()=>{
                wallet.balance = 9000;
                const evilOutputMap = {
                    [wallet.publicKey] : 8900,
                    fooRecipient : 100
                }

                const evilTransaction = {
                    input : {
                                timestamp : Date.now(),
                                amount : wallet.balance,
                                address : wallet.publicKey,
                                signature : wallet.sign(evilOutputMap)
                            },
                    outputMap : evilOutputMap
                }

                newChain.addBlock({data:[evilTransaction,rewardTransaction]});
                expect(blockChain.validTransactionData({chain:newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("and a block contains multiple identical transaction",()=>{
            it("return false and logs an error",()=>{
                    newChain.addBlock({data:[transaction,transaction,transaction,rewardTransaction]});
                    expect(blockChain.validTransactionData({chain:newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
            });
        });
    });

});