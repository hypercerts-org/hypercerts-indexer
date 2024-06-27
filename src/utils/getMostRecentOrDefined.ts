export const getLowestValue = (
  a?: bigint | number | string,
  b?: bigint | number | string,
) => {
  if (!a && b) {
    return b;
  }

  if (!b && a) {
    return a;
  }

  if (!a && !b) {
    return 0n;
  }

  return a < b ? a : b;
};

export const getHighestValue = (
  a?: bigint | number | string,
  b?: bigint | number | string,
) => {
  if (!a && b) {
    return b;
  }

  if (!b && a) {
    return a;
  }

  if (!a && !b) {
    return 0n;
  }

  return a > b ? a : b;
};
