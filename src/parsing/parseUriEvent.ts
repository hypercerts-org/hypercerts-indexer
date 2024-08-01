import { z } from "zod";
import { ParserMethod } from "@/indexer/LogParser.js";
import { HypercertMetadataValidator, Metadata } from "@/utils/metadata.zod.js";
import { parseToOzMerkleTree } from "@/utils/parseToOzMerkleTree.js";
import { StandardMerkleTreeData } from "@openzeppelin/merkle-tree/dist/standard.js";
import { Tables } from "@/types/database.types.js";
import { supabase } from "@/clients/supabaseClient.js";
import { getAddress, isAddress } from "viem";
import { messages } from "@/utils/validation.js";

const DO_NOT_PARSE = [
  "ipfs://null",
  "ipfs://",
  "ipfs://example",
  "undefined",
  "null",
];

const UriEventSchema = z.object({
  address: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  params: z.object({
    value: z.string(),
    id: z.coerce.bigint(),
  }),
});

export type AllowListData = {
  data: StandardMerkleTreeData<[string, bigint]>;
  root: string;
  uri: string;
  parsed: boolean;
};

export type MetadataResult = {
  metadata: Partial<Metadata & { uri: string; parsed: boolean }>;
  allow_list?: AllowListData;
  hypercert_allow_list?: Tables<"hypercert_allow_lists">;
};

export const parseUriEvent: ParserMethod<MetadataResult> = async ({
  event,
  context: { getData, block, chain_id },
}) => {
  const {
    address,
    params: { value: uri, id: tokenId },
  } = UriEventSchema.parse(event);

  let allow_list;
  let hypercert_allow_list;

  if (!uri || DO_NOT_PARSE.includes(uri)) {
    console.warn(`[parseUriEvent] URI is missing or not accepted: ${uri}`);
    return [{ metadata: { uri, parsed: false } }];
  }

  // Get and validate metadata
  const data = await getData({ uri });
  if (!data) {
    console.warn(`[parseUriEvent] Metadata fetching failed. [uri: ${uri}]`);
    return [{ metadata: { uri, parsed: false } }];
  }
  const res = HypercertMetadataValidator.safeParse(data);

  if (!res.success) {
    console.warn(
      `[parseUriEvent] Metadata validation failed`,
      res.error.message,
    );
    console.debug(data);
    return [{ metadata: { uri, parsed: false } }];
  }

  const metadata = {
    name: res.data.name,
    description: res.data.description,
    external_url: res.data.external_url,
    image: res.data.image,
    properties: res.data.properties,
    contributors: res.data.hypercert?.contributors.value,
    impact_scope: res.data.hypercert?.impact_scope.value,
    impact_timeframe_from: res.data.hypercert?.impact_timeframe?.value?.[0],
    impact_timeframe_to: res.data.hypercert?.impact_timeframe?.value?.[1],
    work_scope: res.data.hypercert?.work_scope.value,
    work_timeframe_from: res.data.hypercert?.work_timeframe?.value?.[0],
    work_timeframe_to: res.data.hypercert?.work_timeframe?.value?.[1],
    rights: res.data.hypercert?.rights?.value,
    allow_list_uri: res.data.allowList,
    parsed: true,
    uri,
  };

  // If allowlist is present, fetch and parse it
  if (metadata.allow_list_uri) {
    const res = await getData({
      uri: metadata.allow_list_uri,
    });

    if (res) {
      const tree = parseToOzMerkleTree(res, metadata.allow_list_uri);

      if (tree) {
        allow_list = {
          data: tree.dump(),
          root: tree.root,
          uri: metadata.allow_list_uri,
          parsed: true,
        };

        const { data: claim_id } = await supabase
          .rpc("get_or_create_claim", {
            p_chain_id: chain_id,
            p_contract_address: getAddress(address),
            p_token_id: tokenId.toString(),
            p_last_update_block_timestamp: block.timestamp.toString(),
            p_last_update_block_number: block.blockNumber,
            p_creation_block_timestamp: block.timestamp.toString(),
            p_creation_block_number: block.blockNumber,
          })
          .throwOnError();

        hypercert_allow_list = {
          id: crypto.randomUUID(),
          claims_id: claim_id,
          allow_list_data_uri: metadata.allow_list_uri,
          parsed: true,
        };
      }
    }
  }

  // Return metadata and allowlist data
  return [
    {
      metadata,
      allow_list,
      hypercert_allow_list,
    },
  ];
};
