#重构记录

## 修改 api.d.ts

### 修改 Scipt

使用 vscode 的 refactor 工具：

```ts
export interface Script {
-  code_has: Hash;
+  codeHash: Hash;
  hash_type: HashType;
  args: HexString;
}
```

自动修改的包有：

- docusaurus/website/src/components/address-version
- docusaurus/website/src/helpers
- examples/cardano-lock-namiwallet
- examples/omni-lock-metamask
- examples/omni-lock-secp256k1-blake160
- examples/pw-lock-metamask
- packages/ckb-indexer/src
- packages/common-scripts/src
  - lock.ts
  - dao.ts
  - common.ts
  - helper.ts
  - locktime_pool.ts
  - sudt.ts
  - anyone_can_pay.ts
- packages/config-manager/src
  - helpers.ts
- packages/experiment-tx-assembler/src
- packages/hd-cache/src
- packages/helpers/src
  - address-to-script.ts

![auto-change](/assets/auto-change.jpg)

需要手动修改才能 yarn build 成功的包有：

- packages/hd-cache/src
- packages/commnon-scripts
- packages/debugger/src/parse.ts

![auto-change](/assets/manual-change-build.png)

