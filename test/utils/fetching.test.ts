import { describe, expect, it } from "vitest";
import { fetchFromHTTPS, fetchFromIPFS } from "@/utils";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";

describe("Fetching utils", () => {
  const _data = { foo: "bar" };

  it("fetches from HTTPS", async () => {
    const path = faker.internet.url();
    server.use(
      http.get(path, (req) => {
        return HttpResponse.json(_data);
      }),
    );

    const claim = {
      contractAddress: faker.finance.ethereumAddress() as `0x${string}`,
      claimID: 1n,
      uri: path,
    };

    const response = await fetchFromHTTPS(claim);
    expect(response).toBeDefined();
    expect(response).toEqual(_data);
  });

  it("fetches from IPFS", async () => {
    server.use(
      http.get(`https://*.ipfs.*.link/*`, (req) => {
        return HttpResponse.json(_data);
      }),
    );

    const claim = {
      contractAddress: faker.finance.ethereumAddress() as `0x${string}`,
      claimID: 1n,
      uri: "ipfs://bafybeigwvkiqvptt4qn6uggbpjbyf33lt7nydw4qxc3o7gi23rvhljrma4",
    };
    const metadata = await fetchFromIPFS(claim);
    expect(metadata).toEqual(_data);
  });
});
