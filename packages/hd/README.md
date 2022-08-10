# `yadomi29/hd`

HD & Mnemonic implementation for lumos.

## Usage

Create a new HD wallet.

```javascript
const { mnemonic, ExtendedPrivateKey, Keystore } = require("yadomi29/hd")
const m = mnemonic.generateMnemonic()
const seed = mnemonic.mnemonicToSeedSync(m)
const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed)
const keystore = Keystore.create(extendedPrivateKey, "Your password")
// save keystore file
keystore.save("you path, only dir")

// load keystore file
const keystore = Keystore.load("you file path, with file name")
```

XPub support.
```javascript
const { XPubStore } = require("yadomi29/hd")

// load from xpub file.
const xpub = XPubStore.load("you path")

// to AccountExtendedPublicKey
const accountExtendedPublicKey = xpub.toAccountExtendedPublicKey()

// save xpub file.
xpub.save("your path")
```
