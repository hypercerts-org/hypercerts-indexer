/**
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const main = async () => {
  dotenv.config();

  const isLocalDb =
    process.env.SUPABASE_CACHING_DB_URL?.includes("localhost") ||
    process.env.SUPABASE_CACHING_DB_URL?.includes("127.0.0.1");
  const overrideLocalDbProtectionFlag =
    process.env.OVERRIDE_LOCAL_DB_PROTECTION === "true";

  if (!isLocalDb && !overrideLocalDbProtectionFlag) {
    console.error(
      "This script is only intended to be run on a local development environment",
    );
    process.exit();
  }

  const supabase = createClient(
    process.env.SUPABASE_CACHING_DB_URL!,
    process.env.SUPABASE_CACHING_SERVICE_API_KEY!,
  );

  const easContractSlug = "eas-contract";
  const marketplaceContractSlug = "marketplace-contract";
  const minterContractSlug = "minter-contract";

  // Seed the database with default events
  console.log("🕊️ Seeding events...");
  await supabase.from("events").upsert(
    [
      {
        name: "Attested",
        abi: "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)",
        contract_slug: easContractSlug,
      },
      {
        name: "ClaimStored",
        abi: "event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)",
        contract_slug: minterContractSlug,
      },
      {
        name: "TransferSingle",
        abi: "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
        contract_slug: minterContractSlug,
      },
      {
        name: "TransferBatch",
        abi: "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
        contract_slug: minterContractSlug,
      },
      {
        name: "ValueTransfer",
        abi: "event ValueTransfer(uint256 claimID, uint256 fromTokenID, uint256 toTokenID, uint256 value)",
        contract_slug: minterContractSlug,
      },
      {
        name: "BatchValueTransfer",
        abi: "event BatchValueTransfer(uint256[] claimIDs, uint256[] fromTokenIDs, uint256[] toTokenIDs, uint256[] values)",
        contract_slug: minterContractSlug,
      },
      {
        name: "LeafClaimed",
        abi: "event LeafClaimed(uint256 tokenID, bytes32 leaf)",
        contract_slug: minterContractSlug,
      },
      {
        name: "URI",
        abi: "event URI(string value, uint256 id)",
        contract_slug: minterContractSlug,
      },
      {
        name: "TakerBid",
        abi: "event TakerBid((bytes32 orderHash, uint256 orderNonce, bool isNonceInvalidated) nonceInvalidationParameters, address bidUser, address bidRecipient, uint256 strategyId, address currency, address collection, uint256[] itemIds, uint256[] amounts, address[2] feeRecipients, uint256[3] feeAmounts)",
        contract_slug: marketplaceContractSlug,
      },
    ],
    {
      onConflict: "abi",
      ignoreDuplicates: true,
    },
  );

  console.log("🕊️ Seeding contracts...");
  await supabase.from("contracts").upsert(
    [
      {
        chain_id: 42161,
        contract_address: "0xcE8fa09562f07c23B9C21b5d0A29a293F8a8BC83",
        start_block: 258720235,
        contract_slug: marketplaceContractSlug,
      },
      {
        chain_id: 42161,
        contract_address: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
        start_block: 258705973,
        contract_slug: easContractSlug,
      },
      {
        chain_id: 10,
        contract_address: "0x4200000000000000000000000000000000000021",
        start_block: 126023023,
        contract_slug: easContractSlug,
      },
      {
        chain_id: 8453,
        contract_address: "0x4200000000000000000000000000000000000021",
        start_block: 20427818,
        contract_slug: easContractSlug,
      },
      {
        chain_id: 42220,
        contract_address: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
        start_block: 27994577,
        contract_slug: easContractSlug,
      },
      {
        chain_id: 42161,
        contract_address: "0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07",
        start_block: 251729365,
        contract_slug: minterContractSlug,
      },
      {
        chain_id: 421614,
        contract_address: "0x0A00a2f09cd37B24E7429c5238323bfebCfF3Ed9",
        start_block: 69066523,
        contract_slug: minterContractSlug,
      },
      {
        chain_id: 421614,
        contract_address: "0x1d905Bec93E48C64649300688B99D5F7d11ac412",
        start_block: 72624136,
        contract_slug: marketplaceContractSlug,
      },
      {
        chain_id: 42220,
        contract_address: "0x16bA53B74c234C870c61EFC04cD418B8f2865959",
        start_block: 22079540,
        contract_slug: minterContractSlug,
      },
      {
        chain_id: 8453,
        contract_address: "0xC2d179166bc9dbB00A03686a5b17eCe2224c2704",
        start_block: 6771210,
        contract_slug: minterContractSlug,
      },
      {
        chain_id: 84532,
        contract_address: "0xC2d179166bc9dbB00A03686a5b17eCe2224c2704",
        start_block: 6771210,
        contract_slug: minterContractSlug,
      },
      {
        chain_id: 84532,
        contract_address: "0x5DD43eff9FCC6F70564794e997A47722fE315847",
        start_block: 14121595,
        contract_slug: marketplaceContractSlug,
      },
      {
        chain_id: 11155111,
        contract_address: "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941",
        start_block: 4421945,
        contract_slug: minterContractSlug,
      },
      {
        chain_id: 10,
        contract_address: "0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07",
        start_block: 76066993,
        contract_slug: minterContractSlug,
      },
      {
        chain_id: 10,
        contract_address: "0x2F7Ab1844594112E00708e18835ba2e731880Db1",
        start_block: 124234816,
        contract_slug: marketplaceContractSlug,
      },
      {
        chain_id: 11155111,
        contract_address: "0xB1991E985197d14669852Be8e53ee95A1f4621c0",
        start_block: 6326571,
        contract_slug: marketplaceContractSlug,
      },
      {
        chain_id: 11155111,
        contract_address: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
        start_block: 6098991,
        contract_slug: easContractSlug,
      },
    ],
    {
      onConflict: "contract_address, chain_id",
      ignoreDuplicates: true,
    },
  );

  console.log("🕊️ Seeding supported schemas...");
  await supabase.from("supported_schemas").upsert(
    [
      {
        chain_id: 11155111,
        uid: "0x2f4f575d5df78ac52e8b124c4c900ec4c540f1d44f5b8825fac0af5308c91449",
        schema:
          "uint256 chain_id,address contract_address,uint256 token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags",
        resolver: ZERO_ADDRESS,
        revocable: true,
      },
      {
        chain_id: 84532,
        uid: "0x2f4f575d5df78ac52e8b124c4c900ec4c540f1d44f5b8825fac0af5308c91449",
        schema:
          "uint256 chain_id,address contract_address,uint256 token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags",
        resolver: ZERO_ADDRESS,
        revocable: true,
      },
      {
        chain_id: 10,
        uid: "0x2f4f575d5df78ac52e8b124c4c900ec4c540f1d44f5b8825fac0af5308c91449",
        schema:
          "uint256 chain_id,address contract_address,uint256 token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags",
        resolver: ZERO_ADDRESS,
        revocable: true,
      },
      {
        chain_id: 8453,
        uid: "0x2f4f575d5df78ac52e8b124c4c900ec4c540f1d44f5b8825fac0af5308c91449",
        schema:
          "uint256 chain_id,address contract_address,uint256 token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags",
        resolver: ZERO_ADDRESS,
        revocable: true,
      },
      {
        chain_id: 42220,
        uid: "0x2f4f575d5df78ac52e8b124c4c900ec4c540f1d44f5b8825fac0af5308c91449",
        schema:
          "uint256 chain_id,address contract_address,uint256 token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags",
        resolver: ZERO_ADDRESS,
        revocable: true,
      },
      {
        chain_id: 42161,
        uid: "0x2f4f575d5df78ac52e8b124c4c900ec4c540f1d44f5b8825fac0af5308c91449",
        schema:
          "uint256 chain_id,address contract_address,uint256 token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags",
        resolver: ZERO_ADDRESS,
        revocable: true,
      },
    ],
    {
      onConflict: "uid, chain_id",
      ignoreDuplicates: true,
    },
  );

  const { data: supportedSchemas } = await supabase
    .from("supported_schemas")
    .select("*");

  // combine all contract_ids with the event_ids
  console.log("🕊️ Seeding contract_events...");
  const { data: events } = await supabase.from("events").select("*");
  const { data: contracts } = await supabase.from("contracts").select("*");

  if (!supportedSchemas) {
    console.error("No supported schemas found in the database");
    process.exit();
  }

  console.log(`✅ Found ${supportedSchemas.length} supported schemas`);

  if (!events) {
    console.error("No events found in the database");
    process.exit();
  }

  console.log(`✅ Found ${events.length} events`);

  if (!contracts) {
    console.error("No contracts found in the database");
    process.exit();
  }

  console.log(`✅ Found ${contracts.length} contracts`);

  const contractEvents = events.map((event) => {
    const contractsWithMatchingSlug = contracts.filter(
      (contract) => contract.contract_slug === event.contract_slug,
    );

    return contractsWithMatchingSlug.map((contract) => {
      return {
        contracts_id: contract.id!,
        events_id: event.id!,
        last_block_indexed: 0,
      };
    });
  });

  const { error } = await supabase
    .from("contract_events")
    .upsert(contractEvents.flat(), {
      onConflict: "contracts_id, events_id",
      ignoreDuplicates: true,
    });
  if (error) {
    console.error("Error seeding contract events", error);
    process.exit();
  }

  const { data: _contractEvents } = await supabase
    .from("contract_events")
    .select("*");

  console.log(`✅ Found ${_contractEvents.length} contract events`);
  console.log("🚀 Database seeded successfully!");
  process.exit();
};

main();
