const stringContent =
  '{"format":"standard-v1","tree":["0xe582f894ed4599f64aed0c4f6ea1ed2d2f7bca47a11c984e63d823a38d4f43b6"],"values":[{"value":["0x59266D85D94666D037C1e32dAa8FaC9E95CdaFEf",100],"treeIndex":0}],"leafEncoding":["address","uint256"]}';

export const mockMerkleTree = stringContent;
export const incorrectMerkleTree = stringContent.replace(
  '"leafEncoding":["address","uint256"]',
  '"leafEncoding":[null,null]',
);
