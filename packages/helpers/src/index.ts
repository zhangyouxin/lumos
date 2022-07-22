import { blockchain, bytes } from "@ckb-lumos/codec";
import {
  Address,
  Cell,
  CellDep,
  CellProvider,
  Hash,
  HexString,
  PackedSince,
  Script,
  Transaction,
  WitnessArgs,
  apiUtils,
} from "@ckb-lumos/base";
import { bech32, bech32m } from "bech32";
import { List, Map as ImmutableMap, Record } from "immutable";
import { Config, getConfig } from "@ckb-lumos/config-manager";
import { BI } from "@ckb-lumos/bi";
import {
  parseDeprecatedCkb2019Address,
  parseFullFormatAddress,
} from "./address-to-script";
import { hexToByteArray } from "./utils";

const { bytify, hexify } = bytes;
export interface Options {
  config?: Config;
}

const BECH32_LIMIT = 1023;

export function minimalCellCapacity(
  fullCell: Cell,
  { validate = true }: { validate?: boolean } = {}
): bigint {
  const result = minimalCellCapacityCompatible(fullCell, { validate });
  return BigInt(result.toString());
}

export function minimalCellCapacityCompatible(
  fullCell: Cell,
  { validate = true }: { validate?: boolean } = {}
): BI {
  if (validate) {
    blockchain.CellOutput.pack(
      apiUtils.transformCellOutputCodecType(fullCell.cellOutput)
    );
  }
  // Capacity field itself
  let bytes = 8;
  bytes += bytify(fullCell.cellOutput.lock.codeHash).length;
  bytes += bytify(fullCell.cellOutput.lock.args).length;
  // hashType field
  bytes += 1;
  if (fullCell.cellOutput.type) {
    bytes += bytify(fullCell.cellOutput.type.codeHash).length;
    bytes += bytify(fullCell.cellOutput.type.args).length;
    bytes += 1;
  }
  if (fullCell.data) {
    bytes += bytify(fullCell.data).length;
  }
  return BI.from(bytes).mul(100000000);
}

export function locateCellDep(
  script: Script,
  { config = undefined }: Options = {}
): CellDep | null {
  config = config || getConfig();
  const scriptTemplate = Object.values(config.SCRIPTS).find(
    (s) =>
      s && s.CODE_HASH === script.codeHash && s.HASH_TYPE === script.hashType
  );

  if (scriptTemplate) {
    return {
      depType: scriptTemplate.DEP_TYPE,
      outPoint: {
        txHash: scriptTemplate.TX_HASH,
        index: scriptTemplate.INDEX,
      },
    };
  }
  return null;
}

let HAS_WARNED_FOR_DEPRECATED_ADDRESS = false;

/**
 * @deprecated please migrate to {@link encodeToAddress}, the short format address will be removed in the future
 * @param script
 * @param param1
 * @returns
 */
export function generateAddress(
  script: Script,
  { config = undefined }: Options = {}
): Address {
  config = config || getConfig();
  if (!HAS_WARNED_FOR_DEPRECATED_ADDRESS) {
    console.warn(
      "The address format generated by generateAddress or scriptToAddress will be deprecated, please migrate to encodeToAddress to generate the new ckb2021 full format address as soon as possible"
    );
    HAS_WARNED_FOR_DEPRECATED_ADDRESS = true;
  }

  const scriptTemplate = Object.values(config.SCRIPTS).find(
    (s) =>
      s && s.CODE_HASH === script.codeHash && s.HASH_TYPE === script.hashType
  );
  const data = [];
  if (scriptTemplate && scriptTemplate.SHORT_ID !== undefined) {
    data.push(1, scriptTemplate.SHORT_ID);
    data.push(...hexToByteArray(script.args));
  } else {
    if (script.hashType === "type") data.push(0x04);
    else if (script.hashType === "data") data.push(0x02);
    else throw new Error(`Invalid hashType ${script.hashType}`);

    data.push(...hexToByteArray(script.codeHash));
    data.push(...hexToByteArray(script.args));
  }
  const words = bech32.toWords(data);
  return bech32.encode(config.PREFIX, words, BECH32_LIMIT);
}

/**
 * @deprecated please migrate to {@link encodeToAddress}, the short format address will be removed in the future */
export const scriptToAddress = generateAddress;

function generatePredefinedAddress(
  args: HexString,
  scriptType: string,
  { config = undefined }: Options = {}
): Address {
  config = config || getConfig();
  const template = config.SCRIPTS[scriptType];
  if (!template) {
    const availableKeys = Object.keys(config.SCRIPTS);
    throw new Error(
      `Invalid script type: ${scriptType}, only support: ${availableKeys}`
    );
  }
  const script: Script = {
    codeHash: template.CODE_HASH,
    hashType: template.HASH_TYPE,
    args,
  };

  return generateAddress(script, { config });
}

export function generateSecp256k1Blake160Address(
  args: HexString,
  { config = undefined }: Options = {}
): Address {
  return generatePredefinedAddress(args, "SECP256K1_BLAKE160", { config });
}

export function generateSecp256k1Blake160MultisigAddress(
  args: HexString,
  { config = undefined }: Options = {}
): Address {
  return generatePredefinedAddress(args, "SECP256K1_BLAKE160_MULTISIG", {
    config,
  });
}

export function parseAddress(
  address: Address,
  { config = undefined }: Options = {}
): Script {
  config = config || getConfig();

  try {
    return parseFullFormatAddress(address, { config });
  } catch {
    return parseDeprecatedCkb2019Address(address, { config });
  }
}

export const addressToScript = parseAddress;

export function encodeToAddress(
  script: Script,
  { config = undefined }: Options = {}
): Address {
  config = config || getConfig();

  const data: number[] = [];

  const hashType = (() => {
    if (script.hashType === "data") return 0;
    if (script.hashType === "type") return 1;
    if (script.hashType === "data1") return 2;

    /* c8 ignore next */
    throw new Error(`Invalid hashType ${script.hashType}`);
  })();

  data.push(0x00);
  data.push(...hexToByteArray(script.codeHash));
  data.push(hashType);
  data.push(...hexToByteArray(script.args));

  return bech32m.encode(config.PREFIX, bech32m.toWords(data), BECH32_LIMIT);
}

export interface TransactionSkeletonInterface {
  cellProvider: CellProvider | null;
  cellDeps: List<CellDep>;
  headerDeps: List<Hash>;
  inputs: List<Cell>;
  outputs: List<Cell>;
  witnesses: List<HexString>;
  fixedEntries: List<{ field: string; index: number }>;
  signingEntries: List<{ type: string; index: number; message: string }>;
  inputSinces: ImmutableMap<number, PackedSince>;
}

export type TransactionSkeletonType = Record<TransactionSkeletonInterface> &
  Readonly<TransactionSkeletonInterface>;

export const TransactionSkeleton = Record<TransactionSkeletonInterface>({
  cellProvider: null,
  cellDeps: List(),
  headerDeps: List(),
  inputs: List(),
  outputs: List(),
  witnesses: List(),
  fixedEntries: List(),
  signingEntries: List(),
  inputSinces: ImmutableMap(),
});

export function createTransactionFromSkeleton(
  txSkeleton: TransactionSkeletonType,
  { validate = true }: { validate?: boolean } = {}
): Transaction {
  const tx: Transaction = {
    version: "0x0",
    cellDeps: txSkeleton.get("cellDeps").toArray(),
    headerDeps: txSkeleton.get("headerDeps").toArray(),
    inputs: txSkeleton
      .get("inputs")
      .map((input, i) => {
        if (!input.outPoint) {
          throw new Error(
            `cannot find OutPoint in Inputs[${i}] when createTransactionFromSkeleton`
          );
        }
        return {
          since: txSkeleton.get("inputSinces").get(i, "0x0"),
          previousOutput: input.outPoint,
        };
      })
      .toArray(),
    outputs: txSkeleton
      .get("outputs")
      .map((output) => output.cellOutput)
      .toArray(),
    outputsData: txSkeleton
      .get("outputs")
      .map((output) => output.data || "0x0")
      .toArray(),
    witnesses: txSkeleton.get("witnesses").toArray(),
  };
  if (validate) {
    blockchain.Transaction.pack(apiUtils.transformTransactionCodecType(tx));
  }
  return tx;
}

export function sealTransaction(
  txSkeleton: TransactionSkeletonType,
  sealingContents: HexString[]
): Transaction {
  const tx = createTransactionFromSkeleton(txSkeleton);
  if (sealingContents.length !== txSkeleton.get("signingEntries").size) {
    throw new Error(
      `Requiring ${
        txSkeleton.get("signingEntries").size
      } sealing contents but provided ${sealingContents.length}!`
    );
  }
  txSkeleton.get("signingEntries").forEach((e, i) => {
    switch (e.type) {
      case "witness_args_lock": {
        const witness = tx.witnesses[e.index];
        const witnessArgs = blockchain.WitnessArgs.unpack(bytify(witness));
        const newWitnessArgs: WitnessArgs = {
          lock: sealingContents[i],
        };
        const inputType = witnessArgs.inputType;
        if (!!inputType) {
          newWitnessArgs.inputType = inputType;
        }
        const outputType = witnessArgs.outputType;
        if (!!outputType) {
          newWitnessArgs.outputType = outputType;
        }

        tx.witnesses[e.index] = hexify(
          blockchain.WitnessArgs.pack(newWitnessArgs)
        );
        break;
      }
      default:
        throw new Error(`Invalid signing entry type: ${e.type}`);
    }
  });
  return tx;
}

export interface TransactionSkeletonObject {
  cellProvider: CellProvider | null;
  cellDeps: CellDep[];
  headerDeps: Hash[];
  inputs: Cell[];
  outputs: Cell[];
  witnesses: HexString[];
  fixedEntries: Array<{ field: string; index: number }>;
  signingEntries: Array<{ type: string; index: number; message: string }>;
  inputSinces: Map<number, PackedSince>;
}

/**
 * Convert TransactionSkeleton to js object
 *
 * @param txSkelton
 */
export function transactionSkeletonToObject(
  txSkelton: TransactionSkeletonType
): TransactionSkeletonObject {
  return txSkelton.toJS();
}

/**
 * Convert js object to TransactionSkeleton
 *
 * @param obj
 */
export function objectToTransactionSkeleton(
  obj: TransactionSkeletonObject
): TransactionSkeletonType {
  let inputSinces = ImmutableMap<number, PackedSince>();
  for (const [key, value] of Object.entries(obj.inputSinces)) {
    inputSinces = inputSinces.set(+key, value);
  }
  const txSkeleton = TransactionSkeleton({
    cellProvider: obj.cellProvider,
    cellDeps: List(obj.cellDeps),
    headerDeps: List(obj.headerDeps),
    inputs: List(obj.inputs),
    outputs: List(obj.outputs),
    witnesses: List(obj.witnesses),
    fixedEntries: List(obj.fixedEntries),
    signingEntries: List(obj.signingEntries),
    inputSinces,
  });
  return txSkeleton;
}
