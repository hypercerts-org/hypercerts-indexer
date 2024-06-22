import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.fromJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export const server = setupServer(...handlers);

server.listen();

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => {
  server.close(), vi.restoreAllMocks();
});
