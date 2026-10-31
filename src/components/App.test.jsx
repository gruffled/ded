import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const adversaries = [
  {
    name: "GOBLIN SCOUT", tier: 1, type: "Minion", description: "A sneaky goblin.", motives: "Steal",
    difficulty: 10, thresholds: { major: 4, severe: 8 }, hp: 1, stress: 1, attack_modifier: 0,
    standard_attack: { name: "Dagger", range: "Melee", damage: "1d4 phy" }, experience: [], features: [],
  },
  {
    name: "OGRE BRUTE", tier: 1, type: "Bruiser", description: "A big ogre.", motives: "Smash",
    difficulty: 12, thresholds: { major: 9, severe: 17 }, hp: 8, stress: 3, attack_modifier: 2,
    standard_attack: { name: "Club", range: "Melee", damage: "1d10+2 phy" }, experience: [],
    features: [{ name: "Heavy Swing", type: "Action", description: "Smash everything nearby." }],
  },
  {
    name: "ANCIENT WYRM", tier: 3, type: "Solo", description: "A dragon.", motives: "Hoard",
    difficulty: 18, thresholds: { major: 20, severe: 40 }, hp: 12, stress: 6, attack_modifier: 6,
    standard_attack: { name: "Bite", range: "Close", damage: "3d12 phy" }, experience: [], features: [],
  },
];

const environments = [
  {
    name: "Mossy Grove", tier: 1, type: "Exploration", difficulty: 11, description: "A quiet grove.",
    impulses: "Hide, Entangle", potential_adversaries: "Beasts", features: [],
  },
  {
    name: "Sunken Vault", tier: 2, type: "Traversal", difficulty: 14, description: "A flooded vault.",
    impulses: "Drown", potential_adversaries: "Constructs", features: [],
  },
];

const respond = (data) => Promise.resolve({ ok: true, json: async () => data });

const mockFetch = ({ failAdversaries = false } = {}) => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url) => {
      if (String(url).endsWith("adversaries.json")) {
        return failAdversaries ? Promise.resolve({ ok: false, status: 500, json: async () => ({}) }) : respond(adversaries);
      }
      return respond(environments);
    })
  );
};

const openEncounterBuilder = async (user) => {
  await user.click(await screen.findByRole("button", { name: "Encounter Builder" }));
  await screen.findByText("GOBLIN SCOUT");
};

const budgetValue = (label) =>
  screen.getByText(label).previousElementSibling.textContent;

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockFetch();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("opens on the character builder and switches to the encounter builder", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole("heading", { name: /Character Builder/ })).toBeInTheDocument();
    expect(screen.getByText(/Create and manage Daggerheart player characters/)).toBeInTheDocument();

    await openEncounterBuilder(user);
    expect(screen.getByText(/Build balanced encounters/)).toBeInTheDocument();
    expect(screen.getByText("Adversary Library")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Character Builder" }));
    expect(await screen.findByRole("heading", { name: /Character Builder/ })).toBeInTheDocument();
  });

  it("includes the SRD licence attribution", async () => {
    render(<App />);
    expect(await screen.findByText(/Darrington Press Community Gaming License/)).toBeInTheDocument();
  });

  it("spends Battle Points as adversaries are added and refunds them on clear", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openEncounterBuilder(user);

    expect(budgetValue("Spent")).toBe("0");
    const ogre = screen.getByText("OGRE BRUTE").closest(".list-group-item");
    await user.click(within(ogre).getByRole("button", { name: "Add" }));
    expect(budgetValue("Spent")).toBe("4");
    expect(screen.getByText("Current Encounter").closest(".card")).toHaveTextContent("OGRE BRUTE");

    await user.click(screen.getByRole("button", { name: "Clear All" }));
    expect(budgetValue("Spent")).toBe("0");
  });

  it("groups minions into party-sized sets", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openEncounterBuilder(user);
    const goblin = screen.getByText("GOBLIN SCOUT").closest(".list-group-item");
    for (let i = 0; i < 5; i += 1) await user.click(within(goblin).getByRole("button", { name: "Add" }));
    // Party of 4: five minions are two groups, so 2 BP.
    expect(budgetValue("Spent")).toBe("2");
    expect(screen.getByText("×5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove One" }));
    expect(screen.getByText("×4")).toBeInTheDocument();
    expect(budgetValue("Spent")).toBe("1");
  });

  it("recalculates the budget from the party controls", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openEncounterBuilder(user);
    expect(budgetValue("Total Budget")).toBe("14");
    const size = screen.getByLabelText("Party Size");
    await user.clear(size);
    await user.type(size, "5");
    expect(budgetValue("Total Budget")).toBe("17");
    await user.click(screen.getByLabelText("Harder Fight (+2 BP)"));
    expect(budgetValue("Total Budget")).toBe("19");
  });

  it("filters the library by search text, type and party tier", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openEncounterBuilder(user);
    expect(screen.getByText("ANCIENT WYRM")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/Search by name/), "ogre");
    expect(screen.queryByText("GOBLIN SCOUT")).not.toBeInTheDocument();
    expect(screen.getByText("OGRE BRUTE")).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText(/Search by name/));

    await user.selectOptions(screen.getByLabelText("Adversary type"), "solo");
    expect(screen.getByText("ANCIENT WYRM")).toBeInTheDocument();
    expect(screen.queryByText("OGRE BRUTE")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Adversary type"), "all");

    await user.click(screen.getByLabelText(/Show Relevant Tiers Only/));
    expect(screen.queryByText("ANCIENT WYRM")).not.toBeInTheDocument();
    expect(screen.getByText("OGRE BRUTE")).toBeInTheDocument();
  });

  it("opens and closes the adversary details modal", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openEncounterBuilder(user);
    const ogre = screen.getByText("OGRE BRUTE").closest(".list-group-item");
    await user.click(within(ogre).getByRole("button", { name: "Details for OGRE BRUTE" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Heavy Swing")).toBeInTheDocument();
    expect(within(dialog).getByText("A big ogre.")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("opens adversary details from the keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openEncounterBuilder(user);
    screen.getByRole("button", { name: "Details for GOBLIN SCOUT" }).focus();
    await user.keyboard("{Enter}");
    expect(within(await screen.findByRole("dialog")).getByText("A sneaky goblin.")).toBeInTheDocument();
  });

  it("chooses an environment without spending Battle Points", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openEncounterBuilder(user);
    await user.click(screen.getByRole("button", { name: "Environments" }));
    expect(await screen.findByText("Mossy Grove")).toBeInTheDocument();

    const grove = screen.getByText("Mossy Grove").closest(".list-group-item");
    await user.click(within(grove).getByRole("button", { name: "Use" }));
    expect(within(grove).getByRole("button", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByText("No Battle Point cost")).toBeInTheDocument();
    expect(budgetValue("Spent")).toBe("0");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByText("No Battle Point cost")).not.toBeInTheDocument();
  });

  it("shows an error when the adversary data cannot be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch({ failAdversaries: true });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Encounter Builder" }));
    expect(await screen.findByText(/Could not load adversary data/)).toBeInTheDocument();
  });
});
