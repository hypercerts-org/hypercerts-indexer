import { http, HttpResponse } from "msw";
import { supabaseUrl } from "@/utils/constants.js";

export const default_blockNumber = 123456;
export const default_chainID = 1337;
export const default_contractAddress =
  "0x000000000000000000000000000000000000mEm3";

// Supabase handlers for testing purposes. These handlers are used to mock the
// Supabase API responses. Regular fetch requests are declared in their respective
// test files.

export const handlers = [
  http.all(`${supabaseUrl}/rest/v1/hypercerts`, async ({ request }) => {
    switch (request.method) {
      case "GET":
        console.log("GET");

        return HttpResponse.json(await request.json());
      case "POST":
        console.log("POST");

        return HttpResponse.json(await request.json());
    }
  }),

  http.all(`${supabaseUrl}/rest/v1/lastblockindexed`, ({ request }) => {
    switch (request.method) {
      case "GET":
        console.log("GET");
        return HttpResponse.json([
          {
            block_number: default_blockNumber,
            chain_id: default_chainID,
            contract_address: default_contractAddress,
          },
        ]);
      case "POST":
        console.log("POST");
        return HttpResponse.json([
          {
            block_number: default_blockNumber,
            chain_id: default_chainID,
            contract_address: default_contractAddress,
          },
        ]);
    }
  }),
];
