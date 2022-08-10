import {
  Cell,
  CellCollector,
  CellProvider,
  QueryOptions,
  Script,
  Header,
} from "@ckb-yadomis/base";
import { Options } from "@ckb-yadomis/helpers";
import { RPC } from "@ckb-yadomis/rpc";
import { FromInfo } from "./from_info";

export interface CellCollectorConstructor {
  new (
    fromInfo: FromInfo,
    cellProvider: CellProvider,
    {
      config,
      queryOptions,
      tipHeader,
      NodeRPC,
    }: Options & {
      queryOptions?: QueryOptions;
      tipHeader?: Header;
      NodeRPC?: typeof RPC;
    }
  ): CellCollectorType;
}

export interface CellCollectorType extends CellCollector {
  readonly fromScript: Script;
  collect(): AsyncGenerator<Cell>;
}
