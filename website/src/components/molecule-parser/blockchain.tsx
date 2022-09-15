// https://github.com/nervosnetwork/ckb/blob/5a7efe7a0b720de79ff3761dc6e8424b8d5b22ea/util/types/schemas/blockchain.mol
export const defaultBlockchainMol = `array Uint32 [byte; 4];
array Uint64 [byte; 8];
array Uint128 [byte; 16];
array Byte32 [byte; 32];
array Uint256 [byte; 32];
vector Bytes <byte>;
option BytesOpt (Bytes);
vector BytesVec <Bytes>;
vector Byte32Vec <Byte32>;
option ScriptOpt (Script);
array ProposalShortId [byte; 10];
vector UncleBlockVec <UncleBlock>;
vector TransactionVec <Transaction>;
vector ProposalShortIdVec <ProposalShortId>;
vector CellDepVec <CellDep>;
vector CellInputVec <CellInput>;
vector CellOutputVec <CellOutput>;
table Script {
    code_hash:      Byte32,
    hash_type:      byte,
    args:           Bytes,
}
struct OutPoint {
    tx_hash:        Byte32,
    index:          Uint32,
}
struct CellInput {
    since:           Uint64,
    previous_output: OutPoint,
}
table CellOutput {
    capacity:       Uint64,
    lock:           Script,
    type_:          ScriptOpt,
}
struct CellDep {
    out_point:      OutPoint,
    dep_type:       byte,
}
table RawTransaction {
    version:        Uint32,
    cell_deps:      CellDepVec,
    header_deps:    Byte32Vec,
    inputs:         CellInputVec,
    outputs:        CellOutputVec,
    outputs_data:   BytesVec,
}
table Transaction {
    raw:            RawTransaction,
    witnesses:      BytesVec,
}
struct RawHeader {
    version:                Uint32,
    compact_target:         Uint32,
    timestamp:              Uint64,
    number:                 Uint64,
    epoch:                  Uint64,
    parent_hash:            Byte32,
    transactions_root:      Byte32,
    proposals_hash:         Byte32,
    extra_hash:             Byte32,
    dao:                    Byte32,
}
struct Header {
    raw:                    RawHeader,
    nonce:                  Uint128,
}
table UncleBlock {
    header:                 Header,
    proposals:              ProposalShortIdVec,
}
table Block {
    header:                 Header,
    uncles:                 UncleBlockVec,
    transactions:           TransactionVec,
    proposals:              ProposalShortIdVec,
}
table BlockV1 {
    header:                 Header,
    uncles:                 UncleBlockVec,
    transactions:           TransactionVec,
    proposals:              ProposalShortIdVec,
    extension:              Bytes,
}
table CellbaseWitness {
    lock:    Script,
    message: Bytes,
}
table WitnessArgs {
    lock:                   BytesOpt,          // Lock args
    input_type:             BytesOpt,          // Type args for input
    output_type:            BytesOpt,          // Type args for output
}
`