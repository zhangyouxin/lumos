import { ScriptConfig } from "@yadomi29/config-manager";
import { TransactionSkeletonType } from "@yadomi29/helpers";
import {
  CellDep,
  Hash,
  Header,
  HexString,
  Input,
  OutPoint,
  Output,
  Transaction,
} from "@yadomi29/base";
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

export interface DebuggerData {
  mock_info: {
    inputs: { input: Input; output: Output; data: HexString; header?: Hash }[];
    cell_deps: {
      cell_dep: CellDep;
      output: Output;
      data: HexString;
      header?: Hash;
    }[];
    header_deps: Header[];
  };
  tx: Transaction;
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
