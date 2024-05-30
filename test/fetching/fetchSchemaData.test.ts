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

  test("returns undefined when schema is not provided", async ({ expect }) => {
    const result = await fetchSchemaData({});
    expect(result).toBeUndefined();
  });

  test("returns undefined when schema.eas_schema_id is not provided", async ({
    expect,
  }) => {
    const result = await fetchSchemaData({} as unknown as FetchSchemaDataArgs);
    expect(result).toBeUndefined();
  });

  test("returns schema data when schema and eas_schema_id are provided", async ({
    expect,
  }) => {
    const resolver = getAddress(faker.finance.ethereumAddress());

    const schema = { eas_schema_id: "0x5678" };
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

  test("returns undefined when an error occurs during contract read", async ({
    expect,
  }) => {
    const schema = { eas_schema_id: "0x5678" };
    const readSpy = sinon.stub(client, "readContract");

    readSpy.throws();

    const result = await fetchSchemaData({
      schema,
    });

    expect(result).toBeUndefined();
  });
});
