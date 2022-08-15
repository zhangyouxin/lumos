import test from "ava";
import { BaseProvider } from "../src/index";
import { loadDevConfig } from "./testUtils";
const indexerUri = "http://127.0.0.1:8120";
const rpcUrl = "http://127.0.0.1:8118";

const config = await loadDevConfig()
const provider = new BaseProvider(rpcUrl, indexerUri, { config })

test("should getBlockNumber", async (t) => {
  t.deepEqual(await provider.getBlockNumber() > 0 , true);
});
test("should getFeeRate", async (t) => {
  t.deepEqual(await provider.getFeeRate(), 1000);
});
test("should getBlockByNumber", async (t) => {
  t.deepEqual((await provider.getBlockByNumber(0)).header.number, '0x0');
});
