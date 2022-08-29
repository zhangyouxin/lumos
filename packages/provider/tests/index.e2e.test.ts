import test from "ava";
import { BaseProvider } from "../src/index";
import { Provider } from "../src/types";
import { loadDevConfig } from "./testUtils";
const indexerUri = "http://127.0.0.1:8120";
const rpcUrl = "http://127.0.0.1:8118/rpc";

let provider: Provider;
test.before(async () => {
  const config = await loadDevConfig();
  provider = new BaseProvider(rpcUrl, indexerUri, { config });
});

test("should getBlockNumber", async (t) => {
  t.deepEqual(await provider.getBlockNumber(), 6478927);
});
test("should getFeeRate", async (t) => {
  t.deepEqual(await provider.getFeeRate(), 1000);
});
test("should getBlockByNumber", async (t) => {
  t.deepEqual((await provider.getBlockByNumber(0)).header.number, "0x0");
});
