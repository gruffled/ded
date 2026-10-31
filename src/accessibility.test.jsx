import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import App from "./components/App";
import CharacterBuilder from "./components/CharacterBuilder";
import { CHARACTER_DRAFT_KEY } from "./characterHooks";
import { createInitialCharacter } from "./characterUtils";

const adversaries = [
  {
    name: "OGRE BRUTE", tier: 1, type: "Bruiser", description: "A big ogre.", motives: "Smash",
    difficulty: 12, thresholds: { major: 9, severe: 17 }, hp: 8, stress: 3, attack_modifier: 2,
    standard_attack: { name: "Club", range: "Melee", damage: "1d10+2 phy" }, experience: [],
    features: [{ name: "Heavy Swing", type: "Action", description: "Smash." }],
  },
];
const environments = [
  { name: "Mossy Grove", tier: 1, type: "Exploration", difficulty: 11, description: "A grove.", impulses: "Hide", potential_adversaries: "Beasts", features: [] },
];

const stubFetch = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn((url) =>
      Promise.resolve({ ok: true, json: async () => (String(url).endsWith("adversaries.json") ? adversaries : environments) })
    )
  );

// Colour contrast can't be computed without a layout engine, so it is skipped here.
const audit = (container) => axe(container, { rules: { "color-contrast": { enabled: false } } });

const goToStep = (user, label) => user.click(screen.getByRole("button", { name: new RegExp(label) }));

describe("accessibility", () => {
  beforeEach(() => {
    window.localStorage.clear();
    stubFetch();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("has no violations on the character builder's steps", async () => {
    const user = userEvent.setup();
    const { container } = render(<CharacterBuilder />);
    for (const label of ["Identity", "Heritage", "Equipment", "Story", "Level Up"]) {
      await goToStep(user, label);
      expect(await audit(container), `step: ${label}`).toHaveNoViolations();
    }
  });

  it("has no violations while drafting a level-up", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      CHARACTER_DRAFT_KEY,
      JSON.stringify({ ...createInitialCharacter(), name: "A11y", classId: "bard", subclassId: "troubadour" })
    );
    const { container } = render(<CharacterBuilder />);
    await goToStep(user, "Level Up");
    await user.click(screen.getByRole("button", { name: /Level up to 2/ }));
    await user.click(screen.getByRole("button", { name: /unmarked traits/ }));
    await user.click(screen.getByRole("button", { name: /additional domain card/ }));
    expect(await audit(container)).toHaveNoViolations();
  });

  it("has no violations on the app in either mode", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await screen.findByRole("heading", { name: /Character Builder/ });
    expect(await audit(container), "character mode").toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Encounter Builder" }));
    await screen.findByText("OGRE BRUTE");
    expect(await audit(container), "encounter mode").toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Environments" }));
    await screen.findByText("Mossy Grove");
    expect(await audit(container), "environments").toHaveNoViolations();
  });

  it("has no violations in the adversary details dialog", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Encounter Builder" }));
    await user.click(await screen.findByRole("button", { name: "Details for OGRE BRUTE" }));
    const dialog = await screen.findByRole("dialog");
    expect(await audit(dialog)).toHaveNoViolations();
  });
});
