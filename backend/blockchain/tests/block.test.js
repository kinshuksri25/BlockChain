const hexToBinary = require('hex-to-binary');
const Block = require('../block.js');
const {GENESIS_DATA,MINE_RATE} = require('../../config.js');
const cryptoHash = require('../../util/crypto-hash.js');

describe('Block',()=>{
    const timeStamp = 2000;
    const lastHash = 'foo-hash';
    const data = ['blockchain','foobar'];
    const hash = 'bar-hash';
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({timeStamp,lastHash,hash,data,nonce,difficulty});

    it('has a timeStamp,hash,data,lasthash property',()=>{
        expect(block.timeStamp).toEqual(timeStamp);
        expect(block.data).toEqual(data);
        expect(block.hash).toEqual(hash);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });


    describe("genesis()",()=>{
        const genesisBlock = Block.genesis();

        it('returns a Block instance',()=>{
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns genesis data',()=>{
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()',()=>{
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({lastBlock,data});

         it('returns a Block instance',()=>{
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('it sets the `lasthash` to the `hash` of the lastblock',()=>{
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('it sets the `data`',()=>{
            expect(minedBlock.data).toEqual(data);           
        });

        it('it sets a `timeStamp`',()=>{
            expect(minedBlock.timeStamp).not.toEqual(undefined);
        });

        it('it creates a SHA256 hash based on proper inputs',()=>{
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.data,minedBlock.timeStamp,minedBlock.nonce,minedBlock.difficulty,lastBlock.hash));
        });

        it("sets a `hash` that matches the difficulty criteria",()=>{
            expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it("adjusts the difficulty",()=>{
            const possibleResults = [lastBlock.difficulty+1,lastBlock.difficulty-1];
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe("adjustDifficulty",()=>{
        it("it raises the difficulty for quickly mined block",()=>{
            expect(Block.adjustDifficulty({ originalBlock:block,timeStamp: block.timeStamp+MINE_RATE-100 })).toEqual(block.difficulty+1);
        });

        it("it lowers the difficulty for slowly mined block",()=>{
            expect(Block.adjustDifficulty({ originalBlock:block,timeStamp: block.timeStamp+MINE_RATE+100 })).toEqual(block.difficulty-1);
        });

        it("has a lower limit of 1",()=>{
            block.difficulty = -1;

            expect(Block.adjustDifficulty({originalBlock:block})).toEqual(1);
        });
    });
});