import {
  Cell,
  CellCollector,
  CellProvider,
  QueryOptions,
  Script,
  Header,
} from "yadomi29/base";
import { Options } from "yadomi29/helpers";
import { RPC } from "yadomi29/rpc";
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
