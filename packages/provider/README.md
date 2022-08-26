# `@ckb-lumos/provider`

A Provider provides an easy way to access the blockchain data.

## Usage

```javascript
const { BaseProvider } = require("@ckb-lumos/provider")

const indexerUri = "http://127.0.0.1:8120";
const rpcUrl = "http://127.0.0.1:8118/rpc";

initializeConfig(predefined.AGGRON)
const provider = new BaseProvider(rpcUrl, indexerUri);

// get block number
await provider.getBlockNumber()
// get fee rate
await provider.getFeeRate()
// get ckb balance
await provider.getBalance(aliceAddress)
// send tx
await provider.sendTransaction(tx)
// get block
await provider.getBlockByNumber(0)
// get tx
await provider.getTransaction(txHash)
// wait for tx to be committed
await provider.waitForTransaction(txHash)
// transform privkey to lock
provider.privKeyToLock(privKey)
// transform pubkey to lock
provider.pubKeyToLock(pubKey)
// transform address to lock
provider.addressToLock(aliceAddress)
// transform lock to address
provider.lockToAddress(lock)
// get sudt balance
await provider.getSUDTBalance('0x...<sudtArg>', aliceAddress)
```
