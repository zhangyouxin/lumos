import { struct, vector } from "@yadomi29/codec/lib/molecule";
import { Byte32 } from "@yadomi29/codec/lib/blockchain";
import { createFixedBytesCodec } from "@yadomi29/codec";
import { Uint32 } from "@yadomi29/codec/lib/number";
import { BI } from "@yadomi29/bi";

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
