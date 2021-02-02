const BlockChain = require("../blockChain.js");
const Block = require("../block.js");
const cryptoHash = require('../../util/crypto-hash.js');

describe("BlockChain",()=>{

    let blockChain,newChain,originalChain;

    beforeEach(() =>{
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
        let errorMock,logMock;

        beforeEach(()=>{
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
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
    });

});