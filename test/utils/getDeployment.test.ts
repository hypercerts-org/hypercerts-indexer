import { afterAll, describe, expect, test, vi } from "vitest";
import { getDeployment } from "../../src/utils";
import * as constants from "../../src/utils/constants";

describe("getDeployment", () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  test("returns deployment for supported chain ID", () => {
    const chainId = 11155111;
    vi.spyOn(constants, "chainId", "get").mockReturnValue(chainId);
    const deployment = getDeployment();

    expect(deployment.chainId).toEqual(chainId);
  });

  test("throws error for unsupported chain ID", () => {
    const chainId = 999_999_999;
    vi.spyOn(constants, "chainId", "get").mockReturnValue(chainId);

    expect(() => getDeployment()).toThrowError("Unsupported chain ID");
  });
});
