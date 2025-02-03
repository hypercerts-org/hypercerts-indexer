import { faker } from "@faker-js/faker";
import { Block } from "@hypercerts-org/chainsauce";
import { getHypercertTokenId } from "@hypercerts-org/sdk";
import { getAddress, zeroAddress } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseTakerBidEvent } from "../../src/parsing/parseTakerBidEvent.js";

const mocks = vi.hoisted(() => ({
  getTransactionReceipt: vi.fn(),
  getTransaction: vi.fn(),
}));

vi.mock("../../src/clients/evmClient", () => ({
  getEvmClient: () => ({
    getTransactionReceipt: mocks.getTransactionReceipt,
    getTransaction: mocks.getTransaction,
  }),
}));

describe("parseTakerBidEvent", () => {
  const chainId = 11155111;
  const collection = getAddress("0xa16dfb32eb140a6f3f2ac68f41dad8c7e83c4941");
  // Sepolia exchange
  const exchange = getAddress("0xB1991E985197d14669852Be8e53ee95A1f4621c0");
  const minterAddress = getAddress(faker.finance.ethereumAddress());
  const value = 20n;

  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    event_name: "TakerBid",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  let event: any;

  beforeEach(() => {
    event = {
      address: getAddress(faker.finance.ethereumAddress()),
      params: {
        nonceInvalidationParameters: {
          orderHash: faker.string.hexadecimal({ length: 64 }),
          orderNonce: faker.number.bigInt(),
          isNonceInvalidated: true,
        },
        bidUser: getAddress(faker.finance.ethereumAddress()),
        bidRecipient: getAddress(faker.finance.ethereumAddress()),
        strategyId: faker.number.bigInt(),
        currency: getAddress(faker.finance.ethereumAddress()),
        collection: collection,
        itemIds: [faker.number.bigInt()],
        amounts: [faker.number.bigInt()],
        feeRecipients: [
          getAddress("0xB522133dBd9C8B424429D89d821aeb2a115dB678"),
          getAddress("0x0000000000000000000000000000000000000000"),
        ],
        feeAmounts: [495000000000n, 0n, 5000000000n],
      },
      blockNumber: faker.number.bigInt(),
      transactionHash: faker.string.hexadecimal({
        length: 64,
      }) as `0x${string}`,
    };
  });

  const createBatchValueTransferLog = () => ({
    eventName: "BatchValueTransfer",
    address: collection,
    topics: [
      "0x088515a3c7b4e71520602d818f4dec002fadefde30c55e13f390c8d96046990a",
    ],
    data: "0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000002be000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000002be000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000002be0000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000989680",
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    transactionHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    transactionIndex: faker.number.int(),
    logIndex: faker.number.int(),
    removed: false,
  });

  const createExchangeLog = () => ({
    eventName: "TakerBid",
    address: exchange,
    topics: [
      "0x3ee3de4684413690dee6fff1a0a4f92916a1b97d1c5a83cdf24671844306b2e3",
    ],
    data: "0x6a5602672d2849055abe12d68382f4f2799f5a6668846088e0c8a7d2b95b26f5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008dc78d23f722b648a36a162ad126b4fd6a24e3e20000000000000000000000008dc78d23f722b648a36a162ad126b4fd6a24e3e200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c2d179166bc9dbb00a03686a5b17ece2224c270400000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000b522133dbd9c8b424429d89d821aeb2a115db678000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000073404c96000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012a05f2000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000160000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000002faf080",
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    transactionHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    transactionIndex: faker.number.int(),
    logIndex: faker.number.int(),
    removed: false,
  });

  const createTransferSingleLog = (tokenId: bigint) => ({
    eventName: "TransferSingle",
    address: collection,
    topics: [
      "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62",
      "0x000000000000000000000000658c1695dcb298e57e6144f6da3e83ddcf5e2bab",
      "0x00000000000000000000000059266d85d94666d037c1e32daa8fac9e95cdafef",
      "0x00000000000000000000000059266d85d94666d037c1e32daa8fac9e95cdafef",
    ],
    data:
      "0x" +
      tokenId.toString(16).padStart(64, "0") +
      "0000000000000000000000000000000000000000000000000000000000000001",
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    transactionHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    transactionIndex: faker.number.int(),
    logIndex: faker.number.int(),
    removed: false,
  });

  const createCurrencyLog = () => ({
    eventName: "Transfer",
    address: event.params.currency,
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x000000000000000000000000c3593524e2744e547f013e17e6b0776bc27fc614",
      "0x000000000000000000000000c3593524e2744e547f013e17e6b0776bc27fc614",
    ],
    data: "0x0000000000000000000000000000000000000000000000000000000000000014",
  });

  describe("hypercert ID construction", () => {
    it("correctly constructs hypercert ID from BatchValueTransfer event", async () => {
      const claimId = 238878221578498801351288974417101284442112n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createBatchValueTransferLog(), createExchangeLog()],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid.hypercert_id).toEqual(`${chainId}-${collection}-${claimId}`);
    });

    it("correctly constructs hypercert ID from TransferSingle event with fraction token ID", async () => {
      const claimId =
        getHypercertTokenId(34368519059014784809800835350608589357056n);
      const fractionId = 34368519059014784809800835350608589357056n;

      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createTransferSingleLog(fractionId), createExchangeLog()],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid.hypercert_id).toBe(`${chainId}-${collection}-${claimId}`);
      expect(getHypercertTokenId(fractionId)).toBe(claimId);
    });

    it("uses the first claim ID when BatchValueTransfer contains multiple IDs", async () => {
      const firstClaimId = 238878221578498801351288974417101284442112n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createBatchValueTransferLog(), createExchangeLog()],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid.hypercert_id).toBe(`${chainId}-${collection}-${firstClaimId}`);
    });

    it("throws when BatchValueTransfer has empty claimIDs array", async () => {
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [
          {
            ...createBatchValueTransferLog(),
            args: { claimIDs: [] },
          },
        ],
      });

      await expect(parseTakerBidEvent({ event, context })).rejects.toThrowError(
        "Failed to find claim ID in BatchValueTransfer or TransferSingle events",
      );
    });

    it("throws when TransferSingle has invalid fraction token ID", async () => {
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createTransferSingleLog(0n)],
      });

      await expect(
        parseTakerBidEvent({ event, context }),
      ).rejects.toThrowError();
    });
  });

  describe("event parsing", () => {
    it("successfully parses event with BatchValueTransfer log for ERC20 currency", async () => {
      const claimId = 238878221578498801351288974417101284442112n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [
          createBatchValueTransferLog(),
          createExchangeLog(),
          createCurrencyLog(),
        ],
      });

      mocks.getTransaction.mockResolvedValue({
        value,
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid).toBeDefined();
      expect(bid.buyer).toBe(getAddress(event.params.bidRecipient));
      expect(bid.seller).toBe(getAddress(event.params.feeRecipients[0]));
      expect(bid.fee_amounts).toEqual(event.params.feeAmounts);
      expect(bid.fee_recipients).toEqual(event.params.feeRecipients);
      expect(bid.currency_amount).toEqual(value);
    });

    it("successfully parses event with BatchValueTransfer log for native currency", async () => {
      const claimId = 238878221578498801351288974417101284442112n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createBatchValueTransferLog(), createExchangeLog()],
      });

      const value = faker.number.bigInt();
      mocks.getTransaction.mockResolvedValue({
        value,
      });

      const [bid] = await parseTakerBidEvent({
        event: {
          ...event,
          params: { ...event.params, currency: zeroAddress },
        },
        context,
      });

      expect(bid).toBeDefined();
      expect(bid.buyer).toBe(getAddress(event.params.bidRecipient));
      expect(bid.seller).toBe(getAddress(event.params.feeRecipients[0]));
      expect(bid.fee_amounts).toEqual(event.params.feeAmounts);
      expect(bid.fee_recipients).toEqual(event.params.feeRecipients);
      expect(bid.currency_amount).toEqual(value);
    });

    it("successfully parses event with TransferSingle log for ERC20 currency", async () => {
      const fractionId = 34368519059014784809800835350608589357056n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [
          createTransferSingleLog(fractionId),
          createExchangeLog(),
          createCurrencyLog(),
        ],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid).toBeDefined();
      expect(bid.transaction_hash).toBe(event.transactionHash);
      expect(bid.strategy_id).toBe(event.params.strategyId);
      expect(bid.currency_amount).toBe(value);
    });

    it("successfully parses event with TransferSingle log for native currency", async () => {
      const fractionId = 34368519059014784809800835350608589357056n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createTransferSingleLog(fractionId), createExchangeLog()],
      });

      mocks.getTransaction.mockResolvedValue({
        value,
      });

      const [bid] = await parseTakerBidEvent({
        event: {
          ...event,
          params: { ...event.params, currency: zeroAddress },
        },
        context,
      });

      expect(bid).toBeDefined();
      expect(bid.buyer).toBe(getAddress(event.params.bidRecipient));
      expect(bid.seller).toBe(getAddress(event.params.feeRecipients[0]));
      expect(bid.fee_amounts).toEqual(event.params.feeAmounts);
      expect(bid.fee_recipients).toEqual(event.params.feeRecipients);
      expect(bid.currency_amount).toEqual(value);
    });

    it("throws when no transfer logs are found", async () => {
      mocks.getTransactionReceipt.mockResolvedValue({ logs: [] });
      await expect(
        parseTakerBidEvent({ event, context }),
      ).rejects.toThrowError();
    });

    it("throws when event has invalid addresses", async () => {
      event.params.collection = "invalid-address";
      await expect(
        parseTakerBidEvent({ event, context }),
      ).rejects.toThrowError();
    });

    it("throws when required parameters are missing", async () => {
      delete event.params.bidRecipient;
      await expect(
        parseTakerBidEvent({ event, context }),
      ).rejects.toThrowError();
    });

    it("throws when arrays are empty", async () => {
      event.params.itemIds = [];
      event.params.amounts = [];
      await expect(
        parseTakerBidEvent({ event, context }),
      ).rejects.toThrowError();
    });

    it("throws when transaction hash is invalid", async () => {
      event.transactionHash = "invalid-hash";
      await expect(
        parseTakerBidEvent({ event, context }),
      ).rejects.toThrowError();
    });
  });
});
