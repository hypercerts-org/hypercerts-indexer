import { Merge } from "type-fest";
import { Database as DatabaseGenerated } from "./database-generated.types";

export type { Json } from "./database-generated.types";

// Override the type for a specific column in a view:
export type Database = Merge<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        lastblockindexed: {
          Row: {
            block_number: number | string | null | undefined;
          };
          Insert: {
            block_number: number | string | null | undefined;
          };
          Update: {
            block_number: number | string | null | undefined;
          };
        };
      };
    };
  }
>;
