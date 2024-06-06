import {
  fetchAllowListFromUri,
  FetchAllowListFromUriInput,
} from "@/fetching/fetchAllowlistFromUri";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { vi, describe, beforeEach, afterAll, it, expect } from "vitest";
import { generateAllowList } from "../helpers/factories.js";

const mocks = vi.hoisted(() => {
  return {
    fetchUri: vi.fn(),
  };
});

vi.mock("../../src/utils/fetchFromHttpsOrIpfs", () => ({
  fetchFromHttpsOrIpfs: mocks.fetchUri,
}));

describe("fetchAllowListFromUri", () => {
  const uri = "https://example.com/allowlist.json";
  const allowList = generateAllowList();

  beforeEach(() => {
    mocks.fetchUri.mockReturnValue(allowList.dump());
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("returns undefined when uri is not provided", async () => {
    // fetchFromHttpsOrIpfs will return undefined
    mocks.fetchUri.mockResolvedValue(undefined);
    const result = await fetchAllowListFromUri(
      {} as FetchAllowListFromUriInput,
    );
    expect(result).toBeUndefined();
  });

  it("returns a StandardMerkleTree when uri is provided for a merkle tree dump", async () => {
    const result = await fetchAllowListFromUri({ uri });
    expect(result).toBeInstanceOf(StandardMerkleTree);
  });

  it("returns a StandardMerkleTree when uri is provided for a merkle tree dump stringified", async () => {
    mocks.fetchUri.mockReturnValue(JSON.stringify(allowList.dump()));
    const result = await fetchAllowListFromUri({ uri });
    expect(result).toBeInstanceOf(StandardMerkleTree);
  });

  it("throws returns undefined when uri is provided for a non-merkle tree dump", async () => {
    mocks.fetchUri.mockReturnValue("invalid");
    const result = await fetchAllowListFromUri({ uri });
    expect(result).toBeUndefined();
  });
});
