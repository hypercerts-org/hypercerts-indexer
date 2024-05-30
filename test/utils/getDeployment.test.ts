import { afterAll, describe, expect, test, vi } from "vitest";
import { getDeployment } from "../../src/utils";
import { chainId } from "../../src/utils/constants";

describe("getDeployment", () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  test("returns deployment for supported chain ID", () => {
    const deployment = getDeployment();

    expect(deployment.chainId).toEqual(chainId);
  });

  test("throws error for unsupported chain ID", () => {
    vi.mock("../../src/utils/constants", () => ({ chainId: 1337 }));

    expect(() => getDeployment()).toThrowError("Unsupported chain ID");
  });
});
