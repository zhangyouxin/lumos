import test from "ava";
import { BI } from "@yadomi29/bi";
import {
  Uint128,
  Uint128BE,
  Uint16BE,
  Uint16LE,
  Uint256,
  Uint256BE,
  Uint32BE,
  Uint32LE,
  Uint512,
  Uint512BE,
  Uint64,
  Uint64BE,
  Uint8,
} from "../src/number";
import { bytify } from "../src/bytes";

test("test Uint8", (t) => {
  const num = 18; // 0x12
  // const numStr = "0x12"; // 0x12
  const packed = Uint8.pack(num);
  // const strPacked = HexUint8.pack(numStr);
  t.deepEqual(packed, bytify([0x12]));
  t.truthy(num === Uint8.unpack(packed));
  // t.truthy(numStr === HexUint8.unpack(strPacked));
  t.throws(() => Uint8.pack(256));
  t.throws(() => Uint8.unpack(new ArrayBuffer(2)));
});

test("test Uint16", (t) => {
  const num = 4660; // 0x1234
  const packed = Uint16LE.pack(num);
  const packedBE = Uint16BE.pack(num);
  t.deepEqual(packed, bytify([0x34, 0x12]));
  t.deepEqual(packedBE, bytify([0x12, 0x34]));
  t.is(Uint16LE.unpack(packed), num);
  t.is(Uint16BE.unpack(packedBE), num);
  t.throws(() => Uint16LE.pack(-1));
  t.throws(() => Uint16LE.unpack(new ArrayBuffer(3)));
  t.throws(() => Uint16BE.pack(-1));
  t.throws(() => Uint16BE.unpack(new ArrayBuffer(3)));
});

test("test Uint32", (t) => {
  const num = 305419896; // 0x12345678
  const packed = Uint32LE.pack(num);
  const packedBE = Uint32BE.pack(num);
  t.deepEqual(packed, bytify([0x78, 0x56, 0x34, 0x12]));
  t.deepEqual(packedBE, bytify([0x12, 0x34, 0x56, 0x78]));
  t.is(num, Uint32LE.unpack(packed));
  t.is(num, Uint32BE.unpack(packedBE));
  t.throws(() => Uint32LE.pack(-1));
  t.throws(() => Uint32LE.unpack(new ArrayBuffer(3)));
  t.throws(() => Uint32BE.pack(-1));
  t.throws(() => Uint32BE.unpack(new ArrayBuffer(3)));
});

test("test Uint64", (t) => {
  const num = BI.from("0xf1f2f3f4f5f6f7f8");
  const packedBE = Uint64BE.pack(num);
  const packedLE = Uint64.pack(num);
  t.deepEqual(
    packedBE,
    // prettier-ignore
    bytify([0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8])
  );
  t.deepEqual(
    packedLE,
    // prettier-ignore
    bytify([0xf8, 0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1])
  );
  t.truthy(Uint64.unpack(packedLE).eq(num));
  t.truthy(Uint64BE.unpack(packedBE).eq(num));
  t.throws(() => Uint64.pack(BI.from("0x12345678901234567890")));
  t.throws(() => Uint64.unpack(new ArrayBuffer(3)));
  t.throws(() => Uint64BE.pack(BI.from("0x12345678901234567890")));
  t.throws(() => Uint64BE.unpack(new ArrayBuffer(3)));
});

test("test Uint128", (t) => {
  const num = BI.from("0xf1f2f3f4f5f6f7f8");
  const packedBE = Uint128BE.pack(num);
  const packedLE = Uint128.pack(num);
  t.deepEqual(
    packedBE,
    // prettier-ignore
    bytify([0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8])
  );
  t.deepEqual(
    packedLE,
    // prettier-ignore
    bytify([0xf8, 0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00])
  );
  t.truthy(Uint128.unpack(packedLE).eq(num));
  t.truthy(Uint128BE.unpack(packedBE).eq(num));
});

test("test Uint256", (t) => {
  const num = BI.from("0xf1f2f3f4f5f6f7f8");
  const packedBE = Uint256BE.pack(num);
  const packedLE = Uint256.pack(num);
  t.deepEqual(
    packedBE,
    // prettier-ignore
    bytify([0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00,
            0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8])
  );
  t.deepEqual(
    packedLE,
    // prettier-ignore
    bytify([0xf8, 0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00,
            0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00])
  );
  t.truthy(Uint256.unpack(packedLE).eq(num));
  t.truthy(Uint256BE.unpack(packedBE).eq(num));
});

test("test Uint512", (t) => {
  const num = BI.from("0xf1f2f3f4f5f6f7f8");
  const packedBE = Uint512BE.pack(num);
  const packedLE = Uint512.pack(num);
  t.deepEqual(
    packedBE,
    // prettier-ignore
    bytify([0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00,
            0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00,
            0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00,
            0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8])
  );
  t.deepEqual(
    packedLE,
    // prettier-ignore
    bytify([0xf8, 0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00,
            0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0,
            0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00,
            0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00, 0x00, 0x0, 0x0, 0x00])
  );
  t.truthy(Uint512.unpack(packedLE).eq(num));
  t.truthy(Uint512BE.unpack(packedBE).eq(num));
});

test("pack unsafe integer should throw error", (t) => {
  t.throws(() => Uint64.pack(Number.MAX_SAFE_INTEGER + 1), {
    message: /safe integer/i,
  });
});
