import { LeafClaimed } from "@/parsing/parseLeafClaimedEvent.js";
import { StorageMethod } from "@/indexer/LogParser.js";
import { dbClient } from "@/clients/dbClient.js";

export const updateAllowlistRecordClaimed: StorageMethod<LeafClaimed> = async ({
  data,
  context: { block, chain_id, contracts_id, events_id },
}) => {
  const requests = [];
  for (const record of data) {
    const { leaf, token_id, creator_address } = record;

    requests.push(
      dbClient
        .updateTable("hypercert_allow_list_records")
        .set({ claimed: true })
        .where((eb) =>
          eb.exists(
            dbClient
              .selectFrom("claimable_fractions_with_proofs")
              .select("id")
              .whereRef(
                "claimable_fractions_with_proofs.id",
                "=",
                "hypercert_allow_list_records.id",
              )
              .where("token_id", "=", token_id)
              .where("leaf", "=", leaf)
              .where("user_address", "~*", creator_address)
              .where("claimed", "=", false)
              .where("chain_id", "=", Number(chain_id))
              .limit(1),
          ),
        )
        .compile(),
      dbClient
        .updateTable("contract_events")
        .set({ last_block_indexed: block.blockNumber })
        .where("contracts_id", "=", contracts_id)
        .where("events_id", "=", events_id)
        .compile(),
    );
  }

  return requests;
};
