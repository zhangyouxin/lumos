# `yadomi29/rpc`

RPC module for lumos. Provide type definitions for CKB RPC interface.

## Usage

```javascript
import { RPC } from "yadomi29/rpc"
const rpc = new RPC("http://localhost:8114");
await rpc.get_tip_header();

// Or provide an optional indexer param, if provided, will wait for sync after every RPC call.
const rpc = new RPC("http://localhost:8114", indexer)
await rpc.get_tip_header(); // before it return, will sync indexer to tip.
```
