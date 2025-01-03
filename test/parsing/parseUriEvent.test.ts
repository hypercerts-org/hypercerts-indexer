import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseUriEvent } from "../../src/parsing/parseUriEvent";
import { supabase } from "../../src/clients/supabaseClient";
import { mockMerkleTree } from "../test-utils/mockMerkleTree";
import { mockGeoJson } from "../test-utils/mockGeoJson";

// Mock dependencies
vi.mock("@/clients/supabaseClient", () => ({
  supabase: {
    rpc: vi.fn(() => ({
      throwOnError: () => ({ data: "mock-claim-id" }),
    })),
  },
}));

describe("parseUriEvent", () => {
  const mockBlock = {
    timestamp: "1234567890",
    blockNumber: 123456,
  };

  const mockContext = {
    getData: vi.fn(),
    block: mockBlock,
    chain_id: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unparsed result for invalid URIs", async () => {
    const mockEvent = {
      address: "0x1234567890123456789012345678901234567890",
      params: {
        value: "ipfs://null",
        id: BigInt(1),
      },
    };

    const result = await parseUriEvent({
      event: mockEvent,
      context: mockContext,
    });

    expect(result).toEqual([
      {
        metadata: {
          uri: "ipfs://null",
          parsed: false,
        },
      },
    ]);
  });

  it("should return unparsed result when getData fails", async () => {
    const mockEvent = {
      address: "0x1234567890123456789012345678901234567890",
      params: {
        value: "ipfs://valid",
        id: BigInt(1),
      },
    };

    mockContext.getData.mockResolvedValueOnce(null);

    const result = await parseUriEvent({
      event: mockEvent,
      context: mockContext,
    });

    expect(result).toEqual([
      {
        metadata: {
          uri: "ipfs://valid",
          parsed: false,
        },
      },
    ]);
  });

  it("should successfully parse valid metadata without allowlist", async () => {
    const mockEvent = {
      address: "0x1234567890123456789012345678901234567890",
      params: {
        value: "ipfs://valid",
        id: BigInt(1),
      },
    };

    const mockMetadata = {
      name: "Test Hypercert",
      description: "Test Description",
      image: "ipfs://image",
      hypercert: {
        contributors: { value: ["contributor1"] },
        impact_scope: { value: ["scope1"] },
        work_scope: { value: ["work1"] },
        impact_timeframe: { value: [1000, 2000] },
        work_timeframe: { value: [1000, 2000] },
        rights: { value: ["right1"] },
      },
    };

    mockContext.getData.mockResolvedValueOnce(mockMetadata);

    const result = await parseUriEvent({
      event: mockEvent,
      context: mockContext,
    });

    expect(result[0].metadata).toMatchObject({
      name: "Test Hypercert",
      description: "Test Description",
      image: "ipfs://image",
      contributors: ["contributor1"],
      parsed: true,
      uri: "ipfs://valid",
    });
  });

  it("should handle metadata with allowlist", async () => {
    const mockEvent = {
      address: "0x1234567890123456789012345678901234567890",
      params: {
        value: "ipfs://valid",
        id: BigInt(1),
      },
    };

    const mockMetadata = {
      name: "Test Hypercert",
      description: "Test Description",
      image: "ipfs://image",
      allowList: "ipfs://allowlist",
      hypercert: {
        contributors: { value: ["contributor1"] },
        impact_scope: { value: ["scope1"] },
        work_scope: { value: ["work1"] },
        impact_timeframe: { value: [1000, 2000] },
        work_timeframe: { value: [1000, 2000] },
        rights: { value: ["right1"] },
      },
    };

    // Mock allowlist data
    const mockAllowlistData = mockMerkleTree;

    console.log("mockAllowlistData", mockAllowlistData);

    mockContext.getData
      .mockResolvedValueOnce(mockMetadata)
      .mockResolvedValueOnce(mockAllowlistData);

    const result = await parseUriEvent({
      event: mockEvent,
      context: mockContext,
    });

    expect(result[0].metadata.allow_list_uri).toBe("ipfs://allowlist");
    expect(result[0].allow_list).toBeDefined();
    expect(result[0].allow_list?.parsed).toBe(true);
    expect(result[0].hypercert_allow_list).toBeDefined();
    expect(supabase.rpc).toHaveBeenCalled();
  });

  it("should throw error for invalid event data", async () => {
    const mockEvent = {
      address: "invalid-address",
      params: {
        value: "ipfs://valid",
        id: BigInt(1),
      },
    };

    await expect(
      parseUriEvent({
        event: mockEvent,
        context: mockContext,
      }),
    ).rejects.toThrow();
  });

  describe("should support different trait_types in metadata.properties", () => {
    it("should successfully parse valid metadata with GeoJSON", async () => {
      const mockEvent = {
        address: "0x1234567890123456789012345678901234567890",
        params: {
          value: "ipfs://valid",
          id: BigInt(1),
        },
      };

      const mockMetadata = {
        name: "Test Hypercert",
        description: "Test Description",
        image: "ipfs://image",
        hypercert: {
          contributors: { value: ["contributor1"] },
          impact_scope: { value: ["scope1"] },
          work_scope: { value: ["work1"] },
          impact_timeframe: { value: [1000, 2000] },
          work_timeframe: { value: [1000, 2000] },
          rights: { value: ["right1"] },
        },
        properties: [mockGeoJson],
      };

      mockContext.getData.mockResolvedValueOnce(mockMetadata);

      const result = await parseUriEvent({
        event: mockEvent,
        context: mockContext,
      });

      expect(result[0].metadata).toMatchObject({
        name: "Test Hypercert",
        description: "Test Description",
        image: "ipfs://image",
        contributors: ["contributor1"],
        parsed: true,
        uri: "ipfs://valid",
      });
    });
  });
});
