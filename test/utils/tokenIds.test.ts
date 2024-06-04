import { expect, it, describe } from "vitest";

import { isClaimToken, getClaimTokenId } from "../../src/utils/tokenIds.js";

const claimTokenId = 18664487825613474720966097217632486398361601n;
const fractionTokenId = 18664487825613474720966097217632486398361602n;

describe("isClaimTokenId", () => {
  it("should return true for a claim token id", () => {
    expect(isClaimToken(claimTokenId)).toBe(true);
  });

  it("should return false for a non-claim token id", () => {
    expect(isClaimToken(fractionTokenId)).toBe(false);
  });
});

describe("getClaimTokenId", () => {
  it("should return the claim token id", () => {
    expect(getClaimTokenId(claimTokenId)).toBe(claimTokenId);
  });

  it("should return the claim token id for a fraction token id", () => {
    expect(getClaimTokenId(fractionTokenId)).toBe(claimTokenId);
  });
});
