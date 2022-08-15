import {
  Block,
  Hash,
  Script,
  Transaction,
  TransactionWithStatus,
} from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";

export interface Provider {
  getBlockNumber(): Promise<number>;
  getFeeRate(): Promise<number>;
  getBalance(address: string): Promise<BI>;
  sendTransaction(signedTransaction: Transaction): Promise<Hash>;
  getBlockByNumber(blockNumber: number): Promise<Block>;
  getTransaction(transactionHash: string): Promise<TransactionWithStatus>;
  waitForTransaction(transactionHash: string, timeout?: number): Promise<void>;
  privKeyToLock(privKey: string): Script;
  pubKeyToLock(pubKey: string): Script;
  addressToLock(address: string): Script;
  lockToAddress(lock: Script): string;
  getSUDTBalance(SUDTInfo: string | Script, address: string): Promise<BI>;
}
