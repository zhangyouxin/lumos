// TODO
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Config, initializeConfig } from "@ckb-lumos/config-manager";
import {
  Transaction,
  Block,
  TransactionWithStatus,
  Script,
} from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";
import { Provider } from "./types";

export class BaseProvider implements Provider {
  constructor(private ckbRpcUrl: string, config?: Config) {
    if (config) {
      initializeConfig(config);
    }
  }
  getFeeRate(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getBalance(address: string): Promise<BI> {
    throw new Error("Method not implemented.");
  }
  sendTransaction(signedTransaction: Transaction): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getBlockByNumber(blockNumber: number): Promise<Block> {
    throw new Error("Method not implemented.");
  }
  getTransaction(transactionHash: string): Promise<TransactionWithStatus> {
    throw new Error("Method not implemented.");
  }
  waitForTransaction(
    transactionHash: string,
    timeout?: number | undefined
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  privKeyToLock(privKey: string): Script {
    throw new Error("Method not implemented.");
  }
  pubKeyToLock(pubKey: string): Script {
    throw new Error("Method not implemented.");
  }
  addressToLock(address: string): Script {
    throw new Error("Method not implemented.");
  }
  lockToAddress(lock: Script): string {
    throw new Error("Method not implemented.");
  }
  getSUDTBalance(SUDTInfo: string | Script, address: string): Promise<BI> {
    throw new Error("Method not implemented.");
  }
  async getBlockNumber(): Promise<number> {
    // TODO
    return Promise.resolve(0);
  }
}
