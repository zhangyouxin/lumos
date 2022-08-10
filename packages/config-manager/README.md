# yadomi29/config-manager

## Example

```ts
import { initializeConfig, predefined } from 'yadomi29/config';
import { generateAddress } from 'yadomi29/helper'

initializeConfig(predefined.AGGRON);
generateAddress({...}) // ckt1...


initializeConfig(predefined.LINA);
generateAddress({...}) // ckb1...
```
