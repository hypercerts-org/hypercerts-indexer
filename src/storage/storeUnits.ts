import { supabase } from "@/clients/supabaseClient.js";
import { Tables } from "@/types/database.types";
import { ParsedValueTransfer } from "@/parsing/valueTransferEvent.js";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";

/* 
    This function stores the hypercert token and the ownership of the token in the database.

    @param token The token to store. 
    @returns The stored data.

    @example
    ```js
    
    const token = {

      token_id: 1n,
      
    const storedData = await ("0x1234...5678", 1n, metadata, cid);
    ```
 */

interface StoreUnitTransfer {
  transfers?: ParsedValueTransfer[];
}

export const storeUnitTransfer = async ({ transfers }: StoreUnitTransfer) => {
  if (!transfers || transfers.length === 0) {
    console.debug(
      "[StoreUnitTransfer] No transfer to store or contract ID provided",
    );
    return;
  }

  console.debug(
    `[StoreUnitTransfer] Storing ${transfers.length} unit transfers`,
  );

  const tokens: Tables<"fractions">[] = [];
  const claimIds: { [key: string]: string } = {};

  for (const transfer of transfers) {
    let fromToken = tokens.find(
      (token) => token.token_id === transfer.from_token_id.toString(),
    );
    let toToken = tokens.find(
      (token) => token.token_id === transfer.to_token_id.toString(),
    );

    const claimTokenId = transfer.claim_id.toString();
    let claimId = claimIds[claimTokenId];

    if (!claimId) {
      const { data: claim_id } = await supabase
        .rpc("get_or_create_claim", {
          p_chain_id: chainId,
          p_contract_address: getAddress(transfer.contract_address),
          p_token_id: claimTokenId,
          p_last_update_block_timestamp:
            transfer.last_update_block_timestamp.toString(),
          p_last_update_block_number:
            transfer.last_update_block_number.toString(),
          p_creation_block_timestamp:
            transfer.last_update_block_timestamp.toString(),
          p_creation_block_number: transfer.last_update_block_number.toString(),
        })
        .throwOnError();
      claimId = claim_id;
      claimIds[claimTokenId] = claim_id;
    }

    if (!claimId) {
      console.error(`[StoreUnitTransfer] Could net create or get claim_id.`);
      return;
    }

    if (!fromToken) {
      const { data: fromTokenData } = await supabase
        .from("fractions")
        .select("*, token_id::text, units::text")
        .eq("token_id", transfer.from_token_id.toString())
        .maybeSingle()
        .throwOnError();

      if (fromTokenData) {
        fromToken = { ...fromTokenData, units: BigInt(fromTokenData.units) };
      } else {
        fromToken = {
          claims_id: claimId,
          token_id: transfer.from_token_id.toString(),
          units: 0n,
          last_update_block_timestamp:
            transfer.last_update_block_timestamp.toString(),
          last_update_block_number:
            transfer.last_update_block_number.toString(),
          creation_block_timestamp:
            transfer.last_update_block_timestamp.toString(),
          creation_block_number: transfer.last_update_block_number.toString(),
          value: 1n,
        };
      }
    }

    if (!toToken) {
      const { data: toTokenData } = await supabase
        .from("fractions")
        .select("*, token_id::text, units::text")
        .eq("token_id", transfer.to_token_id.toString())
        .maybeSingle()
        .throwOnError();

      if (toTokenData) {
        toToken = { toTokenData, units: BigInt(toTokenData.units) };
      } else {
        toToken = {
          claims_id: claimId,
          token_id: transfer.to_token_id.toString(),
          units: 0n,
          last_update_block_timestamp:
            transfer.last_update_block_timestamp.toString(),
          last_update_block_number:
            transfer.last_update_block_number.toString(),
          creation_block_timestamp:
            transfer.last_update_block_timestamp.toString(),
          creation_block_number: transfer.last_update_block_number.toString(),
          value: 1n,
        };
      }
    }

    // Update to token with updated units and timestamps
    if (!fromToken || !toToken) {
      throw Error(
        `[StoreUnitTransfer] Something went wrong fetching or building token.`,
      );
    }

    if (transfer.from_token_id !== 0n) {
      const fromUnits = fromToken?.units || 0n;
      fromToken.units = BigInt(fromUnits) - transfer.units;
      fromToken.last_update_block_timestamp =
        transfer.last_update_block_timestamp.toString();
      fromToken.last_update_block_number =
        transfer.last_update_block_number.toString();
    }

    if (transfer.to_token_id !== 0n) {
      const toUnits = toToken?.units || 0n;
      toToken.units = BigInt(toUnits) + transfer.units;

      toToken.last_update_block_timestamp =
        transfer.last_update_block_timestamp.toString();
      toToken.last_update_block_number =
        transfer.last_update_block_number.toString();
    }

    const replaceToken = (array, token) => {
      const index = array.findIndex((t) => t.token_id === token.token_id);
      if (index !== -1) {
        array[index] = token;
      } else {
        array.push(token);
      }
    };

    replaceToken(tokens, fromToken);
    replaceToken(tokens, toToken);
  }

  const filteredTokens = tokens.filter((token) => token.token_id !== "0");

  const parsedTokens = filteredTokens.map((token) => {
    return {
      ...token,
      token_id: token.token_id.toString(),
      units: token?.units?.toString() ?? "0",
      creation_block_number: token.creation_block_number.toString(),
      creation_block_timestamp: token.creation_block_timestamp.toString(),
      last_update_block_number: token.last_update_block_number.toString(),
      last_update_block_timestamp: token.last_update_block_timestamp.toString(),
    };
  });

  if (parsedTokens.some((token) => BigInt(token.units) < 0n)) {
    console.error(
      `[StoreUnitTransfer] Negative units found in tokens: ${JSON.stringify(
        parsedTokens,
      )}`,
    );
    return;
  }

  await supabase
    .from("fractions")
    .upsert(parsedTokens, {
      ignoreDuplicates: false,
      defaultToNull: false,
    })
    .throwOnError();
};
