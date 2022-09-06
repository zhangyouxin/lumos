import { bytes } from '@ckb-lumos/codec';
import { blockchain } from '@ckb-lumos/base'
import { BI, Cell, config, helpers, Indexer, RPC, utils, commons, hd, Hash } from "@ckb-lumos/lumos";

export const CONFIG = config.predefined.AGGRON4;

config.initializeConfig(CONFIG);

const CKB_RPC_URL = "https://testnet.ckb.dev/rpc";
const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
const rpc = new RPC(CKB_RPC_URL);
const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);

export function asyncSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TransferOptions {
  from: string;
  to: string;
  amount: string;
}

const SECP_SIGNATURE_PLACEHOLDER = (
  "0x" +
    "00".repeat(
      commons.omnilock.OmnilockWitnessLock.pack({
        signature: new Uint8Array(65),
      }).byteLength
    )
);

export async function buildTransfer(options: TransferOptions) {
  let tx = helpers.TransactionSkeleton({});
  const fromScript = helpers.parseAddress(options.from);
  const toScript = helpers.parseAddress(options.to);

  // additional 1 ckb for tx fee
  // the tx fee could calculated by tx size
  // this is just a simple example
  const neededCapacity = BI.from(options.amount).add(100000000);
  let collectedSum = BI.from(0);
  const collectedCells: Cell[] = [];
  const collector = indexer.collector({ lock: fromScript, type: "empty" });
  for await (const cell of collector.collect()) {
    collectedSum = collectedSum.add(cell.cellOutput.capacity);
    collectedCells.push(cell);
    if (BI.from(collectedSum).gte(neededCapacity)) break;
  }

  if (collectedSum.lt(neededCapacity)) {
    throw new Error(`Not enough CKB, expected: ${neededCapacity}, actual: ${collectedSum} `);
  }

  const transferOutput: Cell = {
    cellOutput: {
      capacity: BI.from(options.amount).toHexString(),
      lock: toScript,
    },
    data: "0x",
  };

  const changeOutput: Cell = {
    cellOutput: {
      capacity: collectedSum.sub(neededCapacity).toHexString(),
      lock: fromScript,
    },
    data: "0x",
  };

  tx = tx.update("inputs", (inputs) => inputs.push(...collectedCells));
  tx = tx.update("outputs", (outputs) => outputs.push(transferOutput, changeOutput));
  tx = tx.update("cellDeps", (cellDeps) =>
    cellDeps.push(
      // omni lock dep
      {
        outPoint: {
          txHash: CONFIG.SCRIPTS.OMNILOCK.TX_HASH,
          index: CONFIG.SCRIPTS.OMNILOCK.INDEX,
        },
        depType: CONFIG.SCRIPTS.OMNILOCK.DEP_TYPE,
      },
      // SECP256K1 lock is depended by omni lock
      {
        outPoint: {
          txHash: CONFIG.SCRIPTS.SECP256K1_BLAKE160.TX_HASH,
          index: CONFIG.SCRIPTS.SECP256K1_BLAKE160.INDEX,
        },
        depType: CONFIG.SCRIPTS.SECP256K1_BLAKE160.DEP_TYPE,
      }
    )
  );

  const newWitnessArgs = { lock: SECP_SIGNATURE_PLACEHOLDER };
  const witness = bytes.hexify(blockchain.WitnessArgs.pack(newWitnessArgs))

  // fill txSkeleton's witness with 0
  for (let i = 0; i < tx.inputs.toArray().length; i++) {
    tx = tx.update("witnesses", (witnesses) => witnesses.push(witness));
  }

  return tx;
}

export function toMessages(tx: helpers.TransactionSkeletonType) {
  const hasher = new utils.CKBHasher();

  // locks you want to sign
  const signLock = tx.inputs.get(0)?.cellOutput.lock!;

  const messageGroup = commons.createP2PKHMessageGroup(tx, [signLock], {
    hasher: {
      update: (message) => hasher.update(message.buffer),
      digest: () => new Uint8Array(bytes.bytify(hasher.digestHex())),
    },
  });

  return messageGroup[0];
}


export async function signByPrivateKey(txSkeleton: helpers.TransactionSkeletonType, privateKey: string) {
  const messages = toMessages(txSkeleton)

  const signature = hd.key.signRecoverable(messages.message, privateKey);

  const signedWitness = bytes.hexify(blockchain.WitnessArgs.pack({
    lock: commons.omnilock.OmnilockWitnessLock.pack({
      signature: signature,
    }),
  }))

  txSkeleton = txSkeleton.update("witnesses", (witnesses) => witnesses.set(0, signedWitness));

  return txSkeleton;
}

export async function sendTransaction(tx: helpers.TransactionSkeletonType): Promise<Hash> {
  const signedTx = helpers.createTransactionFromSkeleton(tx);
  return rpc.sendTransaction(signedTx, 'passthrough');
}

export async function capacityOf(address: string): Promise<BI> {
  const collector = indexer.collector({
    lock: helpers.parseAddress(address),
  });

  let balance = BI.from(0);
  for await (const cell of collector.collect()) {
    balance = balance.add(cell.cellOutput.capacity);
  }

  return balance;
}
