import {
  Block,
  Hash,
  Script,
  Transaction,
  TransactionWithStatus,
} from "@ckb-lumos/base";
import { FromInfo } from '@ckb-lumos/common-scripts';
import { BI } from "@ckb-lumos/bi";

export interface Provider {
  /**
   * get tip block number
   */
  getBlockNumber(): Promise<number>;
   /**
   * get tx pool fee rate
   */
  getFeeRate(): Promise<number>;
   /**
   * get CKB balance of given fromInfo
   */
  getBalance(fromInfo: FromInfo): Promise<BI>;
   /**
   * send a signed tx to chain
   */
  sendTransaction(signedTransaction: Transaction): Promise<Hash>;
   /**
   * get block by block number
   */
  getBlockByNumber(blockNumber: number): Promise<Block>;
   /**
   * get tx by tx hash
   */
  getTransaction(transactionHash: string): Promise<TransactionWithStatus>;
   /**
   * wait until a tx is committed on chain
   */
  waitForTransaction(transactionHash: string, timeout?: number): Promise<void>;
  // TODO: removed due to security reason
  // privKeyToLock(privKey: string): Script;
  
  // TODO: need more types such as OmniLock, PwLock ...
  pubKeyToLock(pubKey: string, type: 'secp256_k1' | 'acp'): Script;
   /**
   * transform address to a lock
   */
  addressToLock(address: string): Script;
   /**
   * transform a lock to an address
   */
  lockToAddress(lock: Script): string;
   /**
   * get UDT balance of given fromInfo and UDT info
   */
  getSUDTBalance(SUDTInfo: string | Script, fromInfo: FromInfo): Promise<BI>;
}
