/**
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";

const main = async () => {
  const seed = await createSeedClient({});

  // Seed the database with default events
  console.log("🕊️ Seeding events...");
  const { events } = await seed.events([
    {
      name: "ClaimStored",
      abi: "event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)",
    },
    {
      name: "TransferSingle",
      abi: "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
    },
    {
      name: "ValueTransfer",
      abi: "event ValueTransfer(uint256 claimID, uint256 fromTokenID, uint256 toTokenID, uint256 value)",
    },
    {
      name: "AllowlistCreated",
      abi: "event AllowlistCreated(uint256 tokenID, bytes32 root)",
    },
    {
      name: "LeafClaimed",
      abi: "event LeafClaimed(uint256 tokenID, bytes32 leaf)",
    },
  ]);

  console.log("🕊️ Seeding contracts...");
  const { contracts } = await seed.contracts([
    {
      chain_id: 845322,
      contract_address: "0xC2d179166bc9dbB00A03686a5b17eCe2224c2704",
      start_block: 6771210,
    },
    {
      chain_id: 11155111,
      contract_address: "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941",
      start_block: 4421945,
    },
    {
      chain_id: 10,
      contract_address: "0x822f17a9a5eecfd66dbaff7946a8071c265d1d07",
      start_block: 76066993,
    },
  ]);

  console.log("🕊️ Seeding supported schemas...");
  await seed.supported_schemas([
    {
      chain_id: 11155111,
      uid: "0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f",
      last_block_indexed: 5484610,
      resolver: null,
      schema: null,
      revocable: null,
    },
  ]);

  // combine all contract_ids with the event_ids
  console.log("🕊️ Seeding contract_events...");
  const contractEvents = contracts.flatMap((contract) => {
    return events.map((event) => {
      return {
        contract_id: contract.id!,
        event_id: event.id!,
        last_block_indexed: 0,
      };
    });
  });

  const { contract_events } = await seed.contract_events(contractEvents, {
    connect: { contracts, events },
  });

  console.log(contract_events);

  console.log("🚀 Database seeded successfully!");

  process.exit();
};
main();
