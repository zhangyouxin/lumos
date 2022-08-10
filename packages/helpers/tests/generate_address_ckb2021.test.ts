import test from "ava";
import { encodeToAddress } from "../src";
import { Config, predefined } from "@ckb-yadomis/config-manager";
import { HashType, Script } from "@ckb-yadomis/base";

const LINA = predefined.LINA;
const AGGRON4 = predefined.AGGRON4;

type NetworkType = keyof typeof predefined;

function ScriptFrom(
  scriptName: keyof typeof predefined.LINA.SCRIPTS,
  args: string,
  hash_type?: HashType
): { LINA: Script; AGGRON4: Script } {
  return {
    LINA: {
      code_hash: LINA.SCRIPTS[scriptName]!.CODE_HASH,
      hash_type: hash_type || LINA.SCRIPTS[scriptName]!.HASH_TYPE,
      args,
    },
    AGGRON4: {
      code_hash: AGGRON4.SCRIPTS[scriptName]!.CODE_HASH,
      hash_type: hash_type || AGGRON4.SCRIPTS[scriptName]!.HASH_TYPE,
      args,
    },
  };
}

function ConfigFrom(
  networkType: NetworkType,
  options: { excludeShortId?: boolean } = {}
): Config {
  const { excludeShortId = false } = options;
  const config = predefined[networkType];
  return {
    ...config,
    SCRIPTS: excludeShortId ? {} : config.SCRIPTS,
  };
}

test("[encodeToAddress] full address test (hash_type = 0x02)", (t) => {
  const script: Script = {
    code_hash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hash_type: "data1",
    args: "0xb39bbc0b3673c7d36450bc14cfcdad2d559c6c64",
  };

  t.is(
    encodeToAddress(script, {
      config: ConfigFrom("LINA"),
    }),
    "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq4nnw7qkdnnclfkg59uzn8umtfd2kwxceqcydzyt"
  );

  t.is(
    encodeToAddress(script, {
      config: ConfigFrom("AGGRON4"),
    }),
    "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq4nnw7qkdnnclfkg59uzn8umtfd2kwxceqkkxdwn"
  );
});

test("[encodeToAddress] default short address (code_hash_index = 0x00)", (t) => {
  const script = ScriptFrom(
    "SECP256K1_BLAKE160",
    "0xb39bbc0b3673c7d36450bc14cfcdad2d559c6c64"
  );

  t.is(
    encodeToAddress(script.LINA, { config: ConfigFrom("LINA") }),
    "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdnnw7qkdnnclfkg59uzn8umtfd2kwxceqxwquc4"
  );

  t.is(
    encodeToAddress(script.AGGRON4, { config: ConfigFrom("AGGRON4") }),
    "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdnnw7qkdnnclfkg59uzn8umtfd2kwxceqgutnjd"
  );
});
