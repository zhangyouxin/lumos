import { JSONRPCResponse, JSONRPCServer } from "json-rpc-2.0";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { LocalNode, Block, utils, blockchain } from "@ckb-lumos/base";
import { bytes } from "@ckb-lumos/codec";
interface Options {
  blocks: Block[];
  localNode: LocalNode;
  // defaults to /rpc
  routePath?: string;
}

function assertsParams(param: unknown): asserts param {
  if (!param) throw new Error("Invalid params");
}

export function createCKBMockRPC(options: Options): Express {
  const { routePath = "/rpc", blocks, localNode } = options;

  const server = new JSONRPCServer();
  server.addMethod("local_node_info", () => ({
    version: localNode.version,
    active: localNode.active,
    addresses: localNode.addresses,
    connections: localNode.connections,
    node_id: localNode.nodeId,
    protocols: localNode.protocols.map((item) => ({
      id: item.id,
      name: item.name,
      support_versions: item.supportVersions,
    })),
  }));
  server.addMethod("get_block_by_number", (params) => {
    assertsParams(Array.isArray(params));

    const blockNumber = params[0];
    const verbosity = params[1] || "0x2";
    assertsParams(
      typeof blockNumber === "string" && !isNaN(Number(blockNumber))
    );

    const block = blocks.find(
      (block) => Number(block.header.number) === Number(blockNumber)
    );
    if (!block) return null;

    if (Number(verbosity) === 0) {
      const formattedBlock = utils.deepCamelizeTransaction(block);
      const packedBlock = blockchain.Block.pack(formattedBlock);
      return bytes.hexify(packedBlock);
    }

    return block;
  });

  server.addMethod("get_block_hash", (blockNumbers) => {
    assertsParams(Array.isArray(blockNumbers));
    const blockNumber = blockNumbers[0];
    assertsParams(
      typeof blockNumber === "string" && !isNaN(Number(blockNumber))
    );

    const block = blocks.find(
      (block) => Number(block.header.number) === Number(blockNumber)
    );
    if (!block) return null;

    return block.header.hash;
  });

  server.addMethod("get_tip_block_number", () => {
    if (blocks.length < 1) {
      return null;
    }
    return blocks[blocks.length - 1].header.number;
  });

  server.addMethod("get_transaction", (hashes) => {
    assertsParams(Array.isArray(hashes));
    const hash = hashes[0];
    let result;
    let blockHash;
    for (const block of blocks) {
      const tx = block.transactions.find((tx) => tx.hash === hash);
      if (tx) {
        result = tx;
        blockHash = block.header.hash;
        break;
      }
    }
    return {
      transaction: result,
      txStatus: { status: "padding", blockHash: blockHash },
    };
  });

  server.addMethod("get_blockchain_info", () => {
    return {
      alerts: [],
      chain: "ckb_testnet",
      difficulty: "0x1b6f506b",
      epoch: "0x708069a000cc5",
      isInitialBlockDownload: false,
      medianTime: "0x17d3723d27d",
    };
  });

  server.addMethod("tx_pool_info", () => {
    return {
      last_txs_updated_at: "0x0",
      min_fee_rate: "0x3e8",
      orphan: "0x0",
      pending: "0x2",
      proposed: "0x0",
      tip_hash:
        "0x391a43bf2120ebb9cc2c318c032b192ddd7c60b7ec3c443a2f4b32ccab1b0aa3",
      tip_number: "0x62dc4c",
      total_tx_cycles: "0x9029c3",
      total_tx_size: "0x10db",
    };
  });
  server.addMethod("get_tip_header", () => {
    return {
      compact_target: "0x1d07aed8",
      dao: "0x5408dfe836d50240e313607f055d2600c65a62c2e221a503006d7b0a3ed73f08",
      epoch: "0x7080414001353",
      extra_hash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      hash: "0x49feca2a8c50387aa08fab4de4632ade062668d77c3e344d57e2a65e5b3231f6",
      nonce: "0xa45bc1bf74fb0ff01b87b799e397092f",
      number: "0x62dc4f",
      parent_hash:
        "0x7c9fe8261d225a50db3114193856a52206a72f1548b1522435507270848c8866",
      proposals_hash:
        "0x80576ec713b6d76e0296e5f006d0306954dc44190a3632c71e934fa0227f490b",
      timestamp: "0x182d82e5be4",
      transactions_root:
        "0x28a2bfa59df889530bd54e209c5010967c3fe107450dc21f546b3a1bc69e409f",
      version: "0x0",
    };
  });

  const app = express();
  app.use(bodyParser.json());

  app.post(routePath, (req, res) => {
    const jsonRPCRequest = req.body;
    if (Array.isArray(jsonRPCRequest)) {
      const responseList: (JSONRPCResponse | null)[] = [];
      jsonRPCRequest.forEach((request) => {
        server.receive(request).then((response) => {
          responseList.push(response);
          if (responseList.length === jsonRPCRequest.length) {
            res.json(responseList);
          }
        });
      });
    } else {
      server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
          res.json(jsonRPCResponse);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });

  return app;
}
