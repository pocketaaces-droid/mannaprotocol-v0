import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompts";
import type { DayInput } from "./schema";

const input: DayInput = {
  breakfast: "Oatmeal 7:30",
  lunch: "Sandwich noon",
  dinner: "Pasta 7pm",
  snacks: "apple",
  walk_windows: "after lunch",
};

describe("SYSTEM_PROMPT", () => {
  it("names the three offices", () => {
    expect(SYSTEM_PROMPT).toMatch(/morning/i);
    expect(SYSTEM_PROMPT).toMatch(/midday/i);
    expect(SYSTEM_PROMPT).toMatch(/evening/i);
  });
  it("keeps the banned second-person medical rule", () => {
    expect(SYSTEM_PROMPT).toMatch(/your (spike|blood sugar|glucose)/i);
  });
  it("keeps the verbatim disclaimer", () => {
    expect(SYSTEM_PROMPT).toContain("Educational only. Not medical advice.");
  });
  it("forbids the mg/dL unit", () => {
    expect(SYSTEM_PROMPT).toMatch(/mg\/dL/);
  });
  it("mandates BSB scripture", () => {
    expect(SYSTEM_PROMPT).toMatch(/BSB/);
  });
  it("embeds the citation whitelist", () => {
    expect(SYSTEM_PROMPT).toContain("walking_reynolds_t2d");
  });
});

describe("buildUserMessage", () => {
  it("includes all day fields as JSON", () => {
    const msg = buildUserMessage(input);
    expect(msg).toContain("Oatmeal 7:30");
    expect(msg).toContain("Pasta 7pm");
    expect(msg).toContain("after lunch");
  });
});
