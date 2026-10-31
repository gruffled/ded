import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterBuilder from "./CharacterBuilder";
import { CHARACTER_DRAFT_KEY, CHARACTER_STORAGE_KEY } from "../characterHooks";
import { createInitialCharacter, serializeCharacter } from "../characterUtils";

const goToStep = (user, label) => user.click(screen.getByRole("button", { name: new RegExp(label) }));

const assignTrait = async (user, trait, score) => {
  await user.click(screen.getByRole("button", { name: new RegExp(`^${trait}`) }));
  const chips = screen.getAllByRole("button", { name: score });
  await user.click(chips[0]);
};

const buildValidCharacter = async (user) => {
  await user.type(screen.getByLabelText("Name"), "Test Hero");
  await user.selectOptions(screen.getByLabelText("Class"), "bard");

  await goToStep(user, "Heritage");
  await user.selectOptions(screen.getByLabelText("Primary ancestry"), "human");
  await user.selectOptions(screen.getByLabelText("Community"), "wanderborne");
  await assignTrait(user, "Agility", "+2");
  await assignTrait(user, "Strength", "+1");
  await assignTrait(user, "Finesse", "+1");
  await assignTrait(user, "Instinct", "0");
  await assignTrait(user, "Presence", "0");
  await assignTrait(user, "Knowledge", "-1");

  await goToStep(user, "Equipment");
  await user.selectOptions(screen.getByLabelText(/Primary weapon/), "rapier");
  await user.selectOptions(screen.getByLabelText(/Secondary weapon/), "secondary-small-dagger");
  await user.selectOptions(screen.getByLabelText("Armor"), "gambeson-armor");
  await user.selectOptions(screen.getByLabelText("Class item"), "A romance novel");
  await user.click(screen.getByRole("button", { name: /Deft Deceiver/ }));
  await user.click(screen.getByRole("button", { name: /Enrapture/ }));

  await goToStep(user, "Story");
  await user.type(screen.getByPlaceholderText("Experience 1"), "Street Busker");
  await user.type(screen.getByPlaceholderText("Experience 2"), "Former Thief");
};

describe("CharacterBuilder flows", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("walks through every step to a ready character", async () => {
    const user = userEvent.setup();
    render(<CharacterBuilder />);
    await buildValidCharacter(user);
    expect(screen.getByText("Ready to play.")).toBeInTheDocument();
    // The summary sheet reflects the choices.
    const sheet = screen.getByText(/Character Sheet/).closest(".card");
    expect(within(sheet).getByText("Test Hero")).toBeInTheDocument();
    expect(within(sheet).getByText(/Bard/)).toBeInTheDocument();
    expect(within(sheet).getByText(/Agility \+2/)).toBeInTheDocument();
  });

  it("lists what is still missing for a fresh character", async () => {
    const user = userEvent.setup();
    render(<CharacterBuilder />);
    await goToStep(user, "Story");
    expect(screen.getByText(/still needs a few choices/)).toBeInTheDocument();
    expect(screen.getByText("Give your character a name.")).toBeInTheDocument();
    expect(screen.getByText("Choose a class and subclass.")).toBeInTheDocument();
  });

  it("only offers each trait score as many times as the SRD array allows", async () => {
    const user = userEvent.setup();
    render(<CharacterBuilder />);
    await goToStep(user, "Heritage");
    // The array has two +1 scores and two 0 scores.
    expect(screen.getAllByRole("button", { name: "+1" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "0" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "+2" })).toHaveLength(1);

    await assignTrait(user, "Agility", "+1");
    await assignTrait(user, "Strength", "+1");
    // Both +1 scores are used: an unassigned trait is offered none...
    await user.click(screen.getByRole("button", { name: /^Finesse/ }));
    expect(screen.queryByRole("button", { name: "+1" })).not.toBeInTheDocument();
    // ...but a trait that already holds one can swap it.
    await user.click(screen.getByRole("button", { name: /^Agility/ }));
    expect(screen.getAllByRole("button", { name: "+1" })).toHaveLength(1);
  });

  it("supports Mixed Ancestry and flags an invalid combination", async () => {
    const user = userEvent.setup();
    render(<CharacterBuilder />);
    await goToStep(user, "Heritage");
    await user.selectOptions(screen.getByLabelText("Primary ancestry"), "elf");
    await user.selectOptions(screen.getByLabelText(/Second ancestry/), "orc");
    expect(screen.getByLabelText("First feature")).toBeInTheDocument();
    expect(screen.getByLabelText("Second feature")).toBeInTheDocument();
    expect(screen.getByText(/Mixed Ancestry uses the first feature/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Second ancestry/), "elf");
    await goToStep(user, "Story");
    expect(screen.getByText("Mixed Ancestry requires two different ancestries.")).toBeInTheDocument();
  });

  it("saves, reloads and deletes a character", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { unmount } = render(<CharacterBuilder />);
    await user.type(screen.getByLabelText("Name"), "Saved Sam");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Character saved in this browser.")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CHARACTER_STORAGE_KEY))).toHaveLength(1);
    unmount();

    // A fresh mount restores the draft and offers the saved list.
    render(<CharacterBuilder />);
    expect(screen.getByLabelText("Name")).toHaveValue("Saved Sam");
    const saved = screen.getByLabelText("Saved characters");
    expect(within(saved).getByRole("option", { name: "Saved Sam" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete saved" }));
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.queryByLabelText("Saved characters")).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CHARACTER_STORAGE_KEY))).toEqual([]);
  });

  it("keeps a saved character when the delete confirmation is declined", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<CharacterBuilder />);
    await user.type(screen.getByLabelText("Name"), "Keeper");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "Delete saved" }));
    expect(screen.getByLabelText("Saved characters")).toBeInTheDocument();
  });

  it("loads a different saved character from the list", async () => {
    const user = userEvent.setup();
    const records = ["First One", "Second Two"].map((name, index) => ({ ...createInitialCharacter(), name, id: `id-${index}` }));
    window.localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(records));
    render(<CharacterBuilder />);
    await user.selectOptions(screen.getByLabelText("Saved characters"), "id-1");
    expect(screen.getByLabelText("Name")).toHaveValue("Second Two");
  });

  it("clears the character back to a blank sheet", async () => {
    const user = userEvent.setup();
    render(<CharacterBuilder />);
    await user.type(screen.getByLabelText("Name"), "Temporary");
    await user.click(screen.getByRole("button", { name: "Clear character" }));
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(JSON.parse(window.localStorage.getItem(CHARACTER_DRAFT_KEY)).name).toBe("");
  });

  it("exports the character as a JSON file", async () => {
    const user = userEvent.setup();
    let exported;
    URL.createObjectURL = vi.fn((blob) => { exported = blob; return "blob:test"; });
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<CharacterBuilder />);
    await user.type(screen.getByLabelText("Name"), "Export Eve");
    await user.click(screen.getByRole("button", { name: "Export JSON" }));

    expect(click).toHaveBeenCalled();
    expect(screen.getByText("Character exported as JSON.")).toBeInTheDocument();
    const text = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(exported);
    });
    const parsed = JSON.parse(text);
    expect(parsed).toMatchObject({ format: "daggerheart-character", version: 1 });
    expect(parsed.character.name).toBe("Export Eve");
  });

  it("imports a valid character file", async () => {
    const user = userEvent.setup();
    const { container } = render(<CharacterBuilder />);
    const file = new File([serializeCharacter({ ...createInitialCharacter(), name: "Imported Ivy" })], "ivy.json", { type: "application/json" });
    await user.upload(container.querySelector('input[type="file"]'), file);
    await waitFor(() => expect(screen.getByText("Character imported.")).toBeInTheDocument());
    expect(screen.getByLabelText("Name")).toHaveValue("Imported Ivy");
  });

  it("prints the sheet", async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<CharacterBuilder />);
    await user.click(screen.getByRole("button", { name: "Print sheet" }));
    expect(print).toHaveBeenCalled();
  });

  it("asks before changing class on a levelled character and keeps it if declined", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const draft = {
      ...createInitialCharacter(), name: "Vet", classId: "bard", subclassId: "troubadour", level: 2,
      levelUps: [{ experience: "x", picks: [], domainCardId: "", exchange: null }],
    };
    window.localStorage.setItem(CHARACTER_DRAFT_KEY, JSON.stringify(draft));
    render(<CharacterBuilder />);
    await user.selectOptions(screen.getByLabelText("Class"), "wizard");
    expect(confirm).toHaveBeenCalled();
    expect(screen.getByLabelText("Class")).toHaveValue("bard");

    confirm.mockReturnValue(true);
    await user.selectOptions(screen.getByLabelText("Class"), "wizard");
    expect(screen.getByLabelText("Class")).toHaveValue("wizard");
    await goToStep(user, "Level Up");
    expect(screen.getByText(/Level 1 · Tier 1/)).toBeInTheDocument();
  });

  it("limits gear to the character's tier and unlocks more as they level", async () => {
    const user = userEvent.setup();
    const first = render(<CharacterBuilder />);
    await goToStep(user, "Equipment");
    const armor = () => screen.getByLabelText("Armor");
    expect(within(armor()).getByRole("group", { name: "Tier 1" })).toBeInTheDocument();
    expect(within(armor()).queryByRole("group", { name: "Tier 2" })).not.toBeInTheDocument();
    first.unmount();

    const leveled = {
      ...createInitialCharacter(), classId: "bard", subclassId: "troubadour", level: 2,
      levelUps: [{ experience: "x", picks: [], domainCardId: "", exchange: null }],
    };
    window.localStorage.setItem(CHARACTER_DRAFT_KEY, JSON.stringify(leveled));
    render(<CharacterBuilder />);
    await goToStep(user, "Equipment");
    expect(within(armor()).getByRole("group", { name: "Tier 2" })).toBeInTheDocument();
    expect(within(armor()).queryByRole("group", { name: "Tier 3" })).not.toBeInTheDocument();
    expect(within(screen.getByLabelText(/Primary weapon/)).getByRole("group", { name: "Tier 2" })).toBeInTheDocument();
  });
});
