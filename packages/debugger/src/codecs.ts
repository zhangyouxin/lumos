import { struct, vector } from "@ckb-yadomis/codec/lib/molecule";
import { Byte32 } from "@ckb-yadomis/codec/lib/blockchain";
import { createFixedBytesCodec } from "@ckb-yadomis/codec";
import { Uint32 } from "@ckb-yadomis/codec/lib/number";
import { BI } from "@ckb-yadomis/bi";

export const OutPoint = struct(
  {
    tx_hash: Byte32,
    index: createFixedBytesCodec({
      byteLength: 4,
      pack: (hex) => Uint32.pack(hex),
      unpack: (buf) => BI.from(Uint32.unpack(buf)).toHexString(),
    }),
  },
  ["tx_hash", "index"]
);

export const OutPointVec = vector(OutPoint);
