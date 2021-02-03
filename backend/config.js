//this file will store all the hardcoded global values
const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
    timeStamp : 1,
    lastHash : '----',
    data: [],
    hash : 'hash-one',
    difficulty:INITIAL_DIFFICULTY,
    nonce:0, 
};

const STARTING_BALANCE = 1000;

module.exports = { GENESIS_DATA,MINE_RATE,STARTING_BALANCE };