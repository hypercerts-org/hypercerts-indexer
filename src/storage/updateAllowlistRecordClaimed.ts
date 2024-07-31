import { LeafClaimed } from "@/parsing/parseLeafClaimedEvent.js";
import { StorageMethod } from "@/indexer/LogParser.js";
import { dbClient } from "@/clients/dbClient.js";

export const updateAllowlistRecordClaimed: StorageMethod<LeafClaimed> = async ({
  data,
}) => {
  const requests = [];
  for (const record of data) {
    const { leaf, token_id, creator_address } = record;

    const fractionWithProof = await dbClient
      .selectFrom("claimable_fractions_with_proofs")
      .selectAll()
      .where((eb) =>
        eb.and([
          eb("leaf", "=", leaf),
          eb("user_address", "~*", creator_address),
          eb("claimed", "=", false),
          eb("token_id", "=", token_id),
        ]),
      )
      .limit(1)
      .execute();

    if (fractionWithProof.length === 0) {
      throw new Error("Allowlist record not found");
    }

    if (fractionWithProof[0].claimed === true) {
      throw new Error("Allowlist record already claimed");
    }

    requests.push(
      dbClient
        .updateTable("hypercert_allow_list_records")
        .set({ claimed: true })
        .where("id", "=", fractionWithProof[0].id)
        .compile(),
    );
  }

  return requests;
};
