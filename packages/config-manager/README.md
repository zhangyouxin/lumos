# @ckb-yadomis/config-manager

## Example

```ts
import { initializeConfig, predefined } from '@ckb-yadomis/config';
import { generateAddress } from '@ckb-yadomis/helper'

initializeConfig(predefined.AGGRON);
generateAddress({...}) // ckt1...


initializeConfig(predefined.LINA);
generateAddress({...}) // ckb1...
```
