import { HexString, OutPoint } from "@yadomi29/base";
import * as fs from "fs";
import { ckbHash } from "@yadomi29/base/lib/utils";
import { hexify } from "@yadomi29/codec/lib/bytes";
import { OutPoint as OutPointCodec, OutPointVec } from "./codecs";

export type LoadedCode = { codeHash: HexString; binary: HexString };

export function loadCode(binaryPath: string): LoadedCode {
  const buf = fs.readFileSync(binaryPath);
  return {
    codeHash: ckbHash(Uint8Array.from(buf).buffer).serializeJson(),
    binary: hexify(buf),
  };
}

export class OutputDataLoader {
  private readonly cache: Map<HexString /* PackedOutPoint */, HexString>;

  constructor() {
    this.cache = new Map();
  }

  setCode(outPoint: OutPoint, path: string): LoadedCode {
    const loadedCode = loadCode(path);
    this.cache.set(hexify(OutPointCodec.pack(outPoint)), loadedCode.binary);
    return loadedCode;
  }

  setOutpointVec(outPoint: OutPoint, outPoints: OutPoint[]): void {
    this.cache.set(
      hexify(OutPointCodec.pack(outPoint)),
      hexify(OutPointVec.pack(outPoints))
    );
  }

  getOutputData(outPoint: OutPoint): HexString | undefined {
    return this.cache.get(hexify(OutPointCodec.pack(outPoint)));
  }
}
