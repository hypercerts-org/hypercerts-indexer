import { describe, it, expect } from "vitest";
import { supabase } from "../../src/storage/supabaseClient";
import { getLastBlockIndexed } from "../../src/storage/getLastBlockIndexed";
import sinon from "sinon";

const lastblock = [
  {
    block_number: 123456,
    chain_id: 420,
    contract_address: "0x1234...5678",
  },
];

describe("getLastBlockIndexed", {}, () => {
  const rpcStub = sinon.stub(supabase, "rest");
  it("returns the last block indexed", {}, async () => {
    // TODO intercept call and return mocked lastBlock https://nygaard.dev/blog/testing-supabase-rtl-msw
    rpcStub.returns(lastblock);
    const lastBlockIndexed = await getLastBlockIndexed();

    expect(lastBlockIndexed).toEqual(lastblock[0]);
  });
});
