import test from "ava";
import { Script } from "@ckb-lumos/base";
import { predefined } from "@ckb-lumos/config-manager";
import { BaseProvider } from "../src/index";
const indexerUri = "dummy";
const rpcUrl = "dummy";

const provider = new BaseProvider(rpcUrl, indexerUri, {
  config: predefined.AGGRON4,
});
const dummyPrivateKey =
  "0x0123456789012345678901234567890123456789012345678901234567890123";
const dummypubKey =
  "0x026655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515";
const dummyAddress =
  "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqw9ewakfvrp7cs2eqe9gx8e2fd0txhxetqn380ka";
const dummyLock: Script = {
  codeHash:
    "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  hashType: "type",
  args: "0xc5cbbb64b061f620ac8325418f9525af59ae6cac",
};
test("should privKeyToLock", async (t) => {
  t.deepEqual(provider.privKeyToLock(dummyPrivateKey), dummyLock);
});
test("should pubKeyToLock", async (t) => {
  t.deepEqual(provider.pubKeyToLock(dummypubKey), dummyLock);
});
test("should addressToLock", async (t) => {
  t.deepEqual(provider.addressToLock(dummyAddress), dummyLock);
});
test("should lockToAddress", async (t) => {
  t.deepEqual(provider.lockToAddress(dummyLock), dummyAddress);
});
