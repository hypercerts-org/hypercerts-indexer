import { Kysely, PostgresDialect } from "kysely";

import pkg from "pg";
const { Pool } = pkg;
import type { Database } from "../types/database.types.js";
import { dbUrl } from "@/utils/constants.js";

export const dbClient = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: dbUrl,
    }),
  }),
});
