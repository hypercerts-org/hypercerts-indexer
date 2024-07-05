import { supabase } from "@/clients/supabaseClient.js";
import { chainId } from "@/utils/constants.js";
import { getAddress } from "viem";
import { ParsedValueTransfer } from "@/parsing/valueTransferEvent.js";
import { StorageMethod } from "@/indexer/LogParser.js";

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

export const storeValueTransfer: StorageMethod<ParsedValueTransfer> = async ({
  data,
  context: { block },
}) => {
  for (const transfer of data) {
    const {
      from_token_id,
      to_token_id,
      units,
      contract_address,
      claim_id: hypercert_token_id,
    } = transfer;

    let claimId;
    let fromToken;
    let toToken;

    try {
      const { data: claim_id } = await supabase
        .rpc("get_or_create_claim", {
          p_chain_id: chainId,
          p_contract_address: getAddress(contract_address),
          p_token_id: hypercert_token_id.toString(),
          p_last_update_block_timestamp: block.timestamp.toString(),
          p_last_update_block_number: block.blockNumber,
          p_creation_block_timestamp: block.timestamp.toString(),
          p_creation_block_number: block.blockNumber,
        })
        .throwOnError();

      claimId = claim_id;
    } catch (e: unknown) {
      console.error(`[StoreUnitTransfer] Could net create or get claim_id.`, e);
      return;
    }

    const { data: fromTokenData } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .eq("token_id", from_token_id.toString())
      .eq("claims_id", claimId.toString())
      .maybeSingle()
      .throwOnError();

    if (fromTokenData) {
      fromToken = fromTokenData;
    } else {
      fromToken = {
        claims_id: claimId,
        token_id: from_token_id.toString(),
        units: 0n,
        value: 1n,
      };
    }

    const { data: toTokenData } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .eq("token_id", to_token_id.toString())
      .eq("claims_id", claimId.toString())
      .maybeSingle()
      .throwOnError();

    if (toTokenData) {
      toToken = {
        ...toTokenData,
        units: toTokenData?.units ? BigInt(toTokenData.units) : 0n,
      };
    } else {
      toToken = {
        claims_id: claimId,
        token_id: to_token_id.toString(),
        units: 0n,
        value: 1n,
      };
    }

    // Update to token with updated units and timestamps
    if (!fromToken || !toToken) {
      throw Error(
        `[StoreUnitTransfer] Something went wrong fetching or building token.`,
      );
    }

    if (from_token_id !== 0n) {
      const fromUnits = fromToken?.units ? BigInt(fromToken.units) : 0n;
      fromToken.units = fromUnits - units;
      fromToken.last_update_block_timestamp = block.timestamp.toString();
      fromToken.last_update_block_number = block.blockNumber;
      fromToken.creation_block_number = block.blockNumber;
      fromToken.creation_block_timestamp = block.timestamp.toString();
    }

    if (to_token_id !== 0n) {
      const toUnits = toToken?.units ? BigInt(toToken.units) : 0n;
      toToken.units = toUnits + units;
      toToken.last_update_block_timestamp = block.timestamp.toString();
      toToken.last_update_block_number = block.blockNumber;
      toToken.creation_block_number = block.blockNumber;
      toToken.creation_block_timestamp = block.timestamp.toString();
    }

    const filteredTokens = [fromToken, toToken].filter(
      (token) => token.token_id !== "0",
    );

    const parsedTokens = filteredTokens.map((token) => {
      return {
        ...token,
        claims_id: token.claims_id.toString() ?? claimId,
        token_id: token.token_id.toString(),
        units: token?.units?.toString() ?? "0",
        creation_block_number: token.creation_block_number.toString(),
        creation_block_timestamp: token.creation_block_timestamp.toString(),
        last_update_block_number: token.last_update_block_number.toString(),
        last_update_block_timestamp:
          token.last_update_block_timestamp.toString(),
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
        onConflict: "claims_id, token_id",
        ignoreDuplicates: false,
        defaultToNull: false,
      })
      .throwOnError();
  }
};
