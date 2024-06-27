export const getLowestValue = (
  a?: bigint | number | string,
  b: bigint | number | string,
) => {
  if (!a) {
    return b;
  }

  return a < b ? a : b;
};

export const getHighestValue = (
  a?: bigint | number | string,
  b: bigint | number | string,
) => {
  if (!a) {
    return b;
  }

  return a > b ? a : b;
};
