import { Address, Hash } from "viem";

export const mockFilter = {
  abi: [{ name: "Attested", type: "event", inputs: [Array] }],
  args: {
    schema:
      "0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f",
  },
  eventName: "Attested",
  fromBlock: 5966591n,
  id: "0xfef8bca29ad5ba2e7064459dc25c35e2" as Hash,
  request: [],
  strict: false,
  toBlock: 5976591n,
  type: "event",
};

export const mockLogs = [
  {
    eventName: "Attested",
    args: {
      recipient: "0x0000000000000000000000000000000000000000",
      attester: "0x774e0Fc0DED22cA78D8f55d1307a2FD38a420CBe",
      schema:
        "0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f",
      uid: "0x040cce94967277fb797e9c96448b2b6741dd6898858e31a0d5d705be0aa93131",
    },
    address: "0xc2679fbd37d54388ce493f1db75320d236e1815e" as Address,
    blockHash:
      "0xc9ee0d61cbcc3edafcadf4687efaa112005c6e742aa5e4a785cff60cfc6509cb" as Hash,
    blockNumber: 5957292n,
    data: "0x040cce94967277fb797e9c96448b2b6741dd6898858e31a0d5d705be0aa93131",
    logIndex: 108,
    removed: false,
    topics: [
      "0x8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b35",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x000000000000000000000000774e0fc0ded22ca78d8f55d1307a2fd38a420cbe",
      "0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f",
    ],
    transactionHash:
      "0xd017f5696c5a1a2aa960b792d6afacd3e9b653ae58488f86067d2dbd92b7bd9a",
    transactionIndex: 38,
  },
];
