import { ScriptConfig } from "@ckb-lumos/config-manager";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import {
  CellDep,
  Hash,
  HashType,
  Header,
  HexNumber,
  HexString,
  Input,
  OutPoint,
  Output,
  Transaction,
} from "@ckb-lumos/base";
import { CKBDebugger } from "./executor";
import { LocaleCode } from "./context";

export interface ExecuteResult {
  code: number;
  cycles: number;
  message: string;
  debugMessage: string;
}

export interface DataLoader {
  getCellData(outPoint: OutPoint): HexString;

  getHeader(blockHash: Hash): Header;
}

export interface DebuggerScript {
  code_hash: Hash;
  hash_type: HashType;
  args: HexString;
}
export interface DebuggerOutput {
  capacity: HexString;
  lock: DebuggerScript;
  type?: DebuggerScript;
}
export interface DebuggerTransaction {
  cell_deps: CellDep[];
  hash?: Hash;
  header_deps: Hash[];
  inputs: Input[];
  outputs: DebuggerOutput[];
  outputs_data: HexString[];
  version: HexNumber;
  witnesses: HexString[];
}
export interface DebuggerData {
  mock_info: {
    inputs: {
      input: Input;
      output: DebuggerOutput;
      data: HexString;
      header?: Hash;
    }[];
    cell_deps: {
      cell_dep: CellDep;
      output: DebuggerOutput;
      data: HexString;
      header?: Hash;
    }[];
    header_deps: Header[];
  };
  tx: DebuggerTransaction;
}

export interface Executor {
  execute(
    tx: TransactionSkeletonType,
    options: {
      scriptHash: Hash;
      scriptGroupType: "lock" | "type";
    }
  ): Promise<ExecuteResult>;
}

export type TestContext<T extends LocaleCode> = {
  readonly scriptConfigs: Record<keyof T, ScriptConfig>;
  readonly executor: CKBDebugger;
};
