import * as helpers from "@ckb-lumos/helpers";
import hd from "@ckb-lumos/hd";
import { Config, getConfig, initializeConfig } from "@ckb-lumos/config-manager";
import {
  Transaction,
  Block,
  TransactionWithStatus,
  Script,
} from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";
import { Provider } from "./types";
import { RPC } from "@ckb-lumos/rpc";
import { CkbIndexer } from "@ckb-lumos/ckb-indexer";
import { number } from "@ckb-lumos/codec";
const SUDT_CELL_CAPACITY = 144;

export class BaseProvider implements Provider {
  private _rpc: RPC;
  private _indexer: CkbIndexer;
  // min CKB in a sudt cell
  constructor(
    ckbRpcUrl: string,
    indexerUrl: string,
    options?: { config?: Config }
  ) {
    if (options?.config) {
      initializeConfig(options?.config);
    }
    this._rpc = new RPC(ckbRpcUrl);
    this._indexer = new CkbIndexer(indexerUrl, ckbRpcUrl);
  }
  async getFeeRate(): Promise<number> {
    const txPoolInfo = await this._rpc.txPoolInfo();
    return BI.from(txPoolInfo.minFeeRate).toNumber();
  }
  async getBalance(address: string): Promise<BI> {
    let ckbBalance = BI.from(0);
    const pureCkbCollector = this._indexer.collector({
      lock: this.addressToLock(address),
      type: "empty",
      outputDataLenRange: ["0x0", "0x1"],
    });
    for await (const cell of pureCkbCollector.collect()) {
      ckbBalance = ckbBalance.add(cell.cellOutput.capacity);
    }
    const config = getConfig();
    const sudtConfig = config.SCRIPTS.SUDT;
    if (!sudtConfig) {
      throw new Error(
        "sudtConfig not found, please make sure you are using correct config."
      );
    }
    const freeCkbCollector = this._indexer.collector({
      lock: this.addressToLock(address),
      type: {
        codeHash: sudtConfig.CODE_HASH,
        hashType: sudtConfig.HASH_TYPE,
        args: "0x",
      },
    });
    for await (const cell of freeCkbCollector.collect()) {
      ckbBalance = ckbBalance
        .add(cell.cellOutput.capacity)
        .sub(SUDT_CELL_CAPACITY);
    }
    return ckbBalance;
  }
  async sendTransaction(signedTransaction: Transaction): Promise<string> {
    return await this._rpc.sendTransaction(signedTransaction, "passthrough");
  }
  async getBlockByNumber(blockNumber: number): Promise<Block> {
    const block = await this._rpc.getBlockByNumber(
      BI.from(blockNumber).toHexString()
    );
    return block;
  }
  async getTransaction(
    transactionHash: string
  ): Promise<TransactionWithStatus> {
    const tx = await this._rpc.getTransaction(transactionHash);
    return tx;
  }
  async waitForTransaction(
    transactionHash: string,
    timeout = 120
  ): Promise<void> {
    const startTime = Date.now();
    while (true) {
      const txOnChain = await this.getTransaction(transactionHash);
      if (txOnChain && txOnChain.txStatus.status === "committed") {
        break;
      }
      const now = Date.now();
      if (now - startTime > timeout * 1000) {
        throw new Error("wait for transaction timeout, please try again later");
      }
      asyncSleep(3000);
    }
  }
  privKeyToLock(privKey: string): Script {
    const pubKey = hd.key.privateToPublic(privKey);
    return this.pubKeyToLock(pubKey);
  }
  pubKeyToLock(pubKey: string): Script {
    const args = hd.key.publicKeyToBlake160(pubKey);
    const config = getConfig();
    const secp256config = config.SCRIPTS.SECP256K1_BLAKE160;
    if (!secp256config) {
      throw new Error(
        "secp256config not found, please make sure you are using correct config."
      );
    }
    return {
      codeHash: secp256config.CODE_HASH,
      hashType: "type",
      args,
    };
  }
  addressToLock(address: string): Script {
    return helpers.parseAddress(address);
  }
  lockToAddress(lock: Script): string {
    return helpers.encodeToAddress(lock);
  }
  async getSUDTBalance(
    sudtInfo: string | Script,
    address: string
  ): Promise<BI> {
    let sudtBalance = BI.from(0);
    let sudtArgs: string;
    if (typeof sudtInfo !== "string" && typeof sudtInfo.args === "string") {
      sudtArgs = sudtInfo.args;
    } else {
      sudtArgs = sudtInfo as string;
    }
    const config = getConfig();
    const sudtConfig = config.SCRIPTS.SUDT;
    if (!sudtConfig) {
      throw new Error(
        "sudtConfig not found, please make sure you are using correct config."
      );
    }
    const freeCkbCollector = this._indexer.collector({
      lock: this.addressToLock(address),
      type: {
        codeHash: sudtConfig.CODE_HASH,
        hashType: sudtConfig.HASH_TYPE,
        args: sudtArgs,
      },
    });
    for await (const cell of freeCkbCollector.collect()) {
      sudtBalance = sudtBalance.add(number.Uint128LE.unpack(cell.data));
    }
    return sudtBalance;
  }
  async getBlockNumber(): Promise<number> {
    const tipHeader = await this._rpc.getTipHeader();
    return BI.from(tipHeader.number).toNumber();
  }
}

function asyncSleep(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
