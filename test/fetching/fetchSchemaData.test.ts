import { afterAll, afterEach, describe, test } from "vitest";
import {
  fetchSchemaData,
  FetchSchemaDataArgs,
  SchemaRecord,
} from "@/fetching/fetchSchemaData";
import { client } from "@/clients/evmClient";
import { faker } from "@faker-js/faker";
import sinon from "sinon";
import { getAddress } from "viem";

describe("fetchSchemaData", () => {
  afterEach(() => {
    sinon.restore();
  });

  afterAll(() => {
    sinon.restore();
  });

  test("throws when schema uid is not provided", async ({ expect }) => {
    await expect(
      async () => await fetchSchemaData({} as unknown as FetchSchemaDataArgs),
    ).rejects.toThrowError();
  });

  test("returns schema data when schema and uid are provided", async ({
    expect,
  }) => {
    const resolver = getAddress(faker.finance.ethereumAddress());

    const schema = { uid: "0x5678" };
    const readSpy = sinon.stub(client, "readContract");

    const mockSchemaData: SchemaRecord = {
      uid: "0x5678",
      revocable: true,
      resolver,
      schema: "schema",
    };

    readSpy.resolves(mockSchemaData);

    const result = await fetchSchemaData({
      schema,
    });

    expect(result).toEqual(mockSchemaData);
  });

  test("throws when an error occurs during contract read", async ({
    expect,
  }) => {
    const schema = { uid: "0x5678" };
    const readSpy = sinon.stub(client, "readContract");

    readSpy.throws();

    await expect(
      async () => await fetchSchemaData({ schema }),
    ).rejects.toThrowError();
  });
});
