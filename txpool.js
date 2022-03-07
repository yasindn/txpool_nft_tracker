var ws = 'ws://127.0.0.1:8546';
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(ws));
var numBlock = null;
(async() => { numBlock = await web3.eth.getBlockNumber()})();

const ZeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';
const NFTTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const Logssubscription = web3.eth.subscribe('logs', { fromBlock: numBlock, topics: [NFTTopic, ZeroAddress, null, null] }, (error, result) => { if (error) console.log(error);});
const Pendingsubscription = web3.eth.subscribe('pendingTransactions', (err, res) => { if (err) console.error(err);});
var minttxn = new Map();
var mintcnt = new Map();

Pendingsubscription.on('data', (txHash) => {
        setTimeout(async () => {
                let tx = await web3.eth.getTransaction(txHash);

                if (tx && mintcnt.has(tx.to) && mintcnt.get(tx.to).includes(tx.input.substring(0, 10))) {
                        console.log(txHash + "  --  " + new Date(new Date().toUTCString()).toUTCString());
                }
        })
});

Logssubscription.on("data", (logs) => {
        setTimeout(async () => {
                let tx = await web3.eth.getTransaction(logs.transactionHash);

                if (!minttxn.has(logs.transactionHash)) {
                        minttxn.set(logs.transactionHash, tx.to);

                        if (!mintcnt.has(tx.to)) {
                                let input = [];
                                input.push(tx.input.substring(0, 10));
                                mintcnt.set(tx.to, input);
                        } else {
                                let input = mintcnt.get(tx.to);
                                if (!input.includes(tx.input.substring(0, 10))) {
                                        input.push(tx.input.substring(0, 10));
                                        mintcnt.set(tx.to, input);
                                }
                        }
                }
        })
});