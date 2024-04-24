const MASK_128_BITS = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000000000000000000000000000",
);

export const isClaimToken = (tokenId: bigint) => {
  return (tokenId & MASK_128_BITS) === tokenId;
};

export const getClaimTokenId = (tokenId: bigint) => {
  return tokenId & MASK_128_BITS;
};
