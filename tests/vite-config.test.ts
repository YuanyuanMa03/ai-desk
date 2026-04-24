// @vitest-environment node

import { describe, expect, it } from "vitest";
import config from "../vite.config";

describe("vite production config", () => {
  it("uses relative asset paths for packaged file:// apps", () => {
    expect(config).toMatchObject({
      base: "./"
    });
  });
});
