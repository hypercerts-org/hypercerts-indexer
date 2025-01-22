import { describe, expect, it, vi, beforeEach } from "vitest";
import { parseTakerBidEvent } from "../../src/parsing/parseTakerBidEvent.js";
import { faker } from "@faker-js/faker";
import { Block } from "@hypercerts-org/chainsauce";
import { getAddress } from "viem";
import { getEvmClient } from "../../src/clients/evmClient.js";
import { getHypercertTokenId } from "../../src/utils/tokenIds.js";

const mocks = vi.hoisted(() => ({
  getTransactionReceipt: vi.fn(),
}));

vi.mock("../../src/clients/evmClient", () => ({
  getEvmClient: () => ({
    getTransactionReceipt: mocks.getTransactionReceipt,
  }),
}));

describe("parseTakerBidEvent", () => {
  const chainId = 11155111;
  const collection = getAddress("0xa16dfb32eb140a6f3f2ac68f41dad8c7e83c4941");
  const minterAddress = getAddress(faker.finance.ethereumAddress());

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
          getAddress(faker.finance.ethereumAddress()),
          getAddress(faker.finance.ethereumAddress()),
        ],
        feeAmounts: [faker.number.bigInt(), faker.number.bigInt()],
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

  describe("hypercert ID construction", () => {
    it("correctly constructs hypercert ID from BatchValueTransfer event", async () => {
      const claimId = 238878221578498801351288974417101284442112n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createBatchValueTransferLog()],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid.hypercert_id).toEqual(
        `${chainId}-${collection}-${claimId}`,
      );
    });

    it("correctly constructs hypercert ID from TransferSingle event with fraction token ID", async () => {
      const claimId =
        getHypercertTokenId(34368519059014784809800835350608589357056n);
      const fractionId = 34368519059014784809800835350608589357056n;

      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createTransferSingleLog(fractionId)],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid.hypercert_id).toBe(
        `${chainId}-${collection}-${claimId}`,
      );
      expect(getHypercertTokenId(fractionId)).toBe(claimId);
    });

    it("uses the first claim ID when BatchValueTransfer contains multiple IDs", async () => {
      const firstClaimId = 238878221578498801351288974417101284442112n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createBatchValueTransferLog()],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid.hypercert_id).toBe(
        `${chainId}-${collection}-${firstClaimId}`,
      );
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
    it("successfully parses event with BatchValueTransfer log", async () => {
      const claimId = 238878221578498801351288974417101284442112n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createBatchValueTransferLog()],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid).toBeDefined();
      expect(bid.buyer).toBe(getAddress(event.params.bidRecipient));
      expect(bid.seller).toBe(getAddress(event.params.feeRecipients[0]));
    });

    it("successfully parses event with TransferSingle log", async () => {
      const fractionId = 34368519059014784809800835350608589357056n;
      mocks.getTransactionReceipt.mockResolvedValue({
        logs: [createTransferSingleLog(fractionId)],
      });

      const [bid] = await parseTakerBidEvent({ event, context });

      expect(bid).toBeDefined();
      expect(bid.transaction_hash).toBe(event.transactionHash);
      expect(bid.strategy_id).toBe(event.params.strategyId);
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
