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

最花费时间的是修复测试：

- packages/base
- packages/ckb-indexer
- packages/common-scripts
- packages/debugger
- packages/experiment-tx-assembler
- packages/hd-cache
- packages/helpers
- packages/toolkit
- packages/transaction-manager

![fix-test](/assets/manual-fix-test.png)

一些重构过程的感觉：

- 第一步利用 vscode 的 refactor 工具自动修改字段名 `code_hash` 为 `codeHash` 感到轻松自在
- 第二步修复 build 失败的原因觉得还行
- 第三步修复测试很痛苦，发现一些问题：
  -  目前的代码里用到的 SerializeScript 这样的函数是以前的 codegen 生成的，需要改为 codec 实现，而且在 base 包里面也有在使用： https://github.com/nervosnetwork/lumos/blob/develop/packages/base/lib/values.js#L35 需要考虑把这个 value.ts 移动到其他包，因为 base 里引用 codec 包会循环依赖
  -  目前代码里用的 toolkit 功能会比较麻烦，toolkit 似乎设计的初衷就是为了对齐 rpc，所以用了 snake_case, 而我们在 NormailizeScript, ValidateScript, TransformScript 的时候直接调用了 toolkit，这里需要改 toolkit 代码, toolkit 的测试还需要改 codegen 生成的 SerializeScript 代码
  -  debugger 要生成的 Debugger Data 是需要用 snake_case 的，所以需要一个翻译器把 camelCase 的 Object 转化成 snake_case 的
- 第四部修复各种 examples [未完成]