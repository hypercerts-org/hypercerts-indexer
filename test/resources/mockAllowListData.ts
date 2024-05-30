import { Tables } from "../../src/types/database.types";

export const mockAllowListData: Partial<Tables<"allow_list_data">> = {
  data: JSON.stringify({}),
  uri: "https://example.com",
  root: "0x1234",
};
