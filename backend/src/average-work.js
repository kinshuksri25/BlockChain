const BlockChain = require('./blockChain.js');

const blockchain = new BlockChain();

blockchain.addBlock({data:'inital'});

let prevTimeStamp,nextTimeStamp,nextBlock,timeDiff,average;

const times = [];

for(let i=0;i<10000;i++){
    prevTimeStamp = blockchain.chain[blockchain.chain.length-1].timeStamp;
    blockchain.addBlock({data: 'block ${i}'});
    nextBlock = blockchain.chain[blockchain.chain.length-1];
    nextTimeStamp = nextBlock.timeStamp;
    timeDiff = nextTimeStamp - prevTimeStamp;
    times.push(timeDiff);

    average = times.reduce((total,num) => (total+num))/times.length;

    console.log(`Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms`);
}


