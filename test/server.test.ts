import { describe, it } from "vitest";
import { app as server } from "../src/server";
import request from "supertest";

describe("server", () => {
  it("GET /heartbeat", async () => {
    await request(server).get("/heartbeat").expect(200).expect("OK");
  });
});
