import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export const parseToOzMerkleTree = (fetchResult: unknown, uri?: string) => {
  try {
    return StandardMerkleTree.load<[string, bigint]>(
      JSON.parse(fetchResult as string),
    );
  } catch (error) {
    console.debug(
      `[parseToOzMerkleTree] Allow list at ${uri} is not a valid OZ Merkle tree`,
    );
  }

  try {
    return StandardMerkleTree.load<[string, bigint]>(fetchResult as never);
  } catch (error) {
    console.debug(
      `[parseToOzMerkleTree] Allow list at ${uri} is not a valid OZ Merkle tree`,
    );
  }
};
