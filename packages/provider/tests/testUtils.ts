import { Config } from '@ckb-lumos/config-manager';
import { RPC } from "@ckb-lumos/rpc";

export async function loadDevConfig(): Promise<Config> {
  const rpcUrl = "http://127.0.0.1:8118";
  const genesisBlock = await new RPC(rpcUrl).getBlockByNumber('0x0')
  if (!genesisBlock) {
    throw new Error('Fail to load the genesis block')
  }
  return {
    PREFIX: "ckt",
    SCRIPTS: {
      SECP256K1_BLAKE160: {
        CODE_HASH: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        HASH_TYPE: "type",
        TX_HASH: genesisBlock.transactions[1].hash!,
        INDEX: "0x0",
        DEP_TYPE: "depGroup",
        SHORT_ID: 0
      }
    }
  }
}