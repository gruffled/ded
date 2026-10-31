import React, { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LevelUpPanel from "./LevelUpPanel";
import { CLASSES, DOMAIN_CARDS, LEVEL_ONE_DOMAIN_CARDS } from "../characterData";
import { createInitialCharacter } from "../characterUtils";
import { getLevel, getProgress } from "../levelUp";

const bard = CLASSES.find((item) => item.id === "bard");

const startingCharacter = () => ({
  ...createInitialCharacter(),
  name: "Ari",
  classId: "bard",
  subclassId: "troubadour",
  experiences: [{ name: "Busker", modifier: 2 }, { name: "Thief", modifier: 2 }],
  domainCardIds: LEVEL_ONE_DOMAIN_CARDS.filter((card) => bard.domains.includes(card.domain)).slice(0, 2).map((card) => card.id),
});

let latest;
function Harness({ initial = startingCharacter() }) {
  const [character, setCharacter] = useState(initial);
  latest = character;
  return (
    <LevelUpPanel
      character={character}
      onChange={(changes) => setCharacter((current) => ({ ...current, ...changes }))}
      selectedClass={bard}
      selectedSubclass={bard.subclasses[0]}
    />
  );
}

const cardOption = (level) => DOMAIN_CARDS.find((card) => bard.domains.includes(card.domain) && card.level === level);

describe("LevelUpPanel", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("won't start until a class and subclass are chosen", () => {
    render(<LevelUpPanel character={createInitialCharacter()} onChange={() => {}} selectedClass={undefined} selectedSubclass={undefined} />);
    expect(screen.getByRole("button", { name: /Level up to 2/ })).toBeDisabled();
    expect(screen.getByText(/Choose a class and subclass/)).toBeInTheDocument();
  });

  it("levels a character from 1 to 2 with two advancements and a new card", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Level up to 2/ }));
    expect(screen.getByRole("button", { name: /Confirm level 2/ })).toBeDisabled();

    // Tier 2 only offers the basic options.
    expect(screen.queryByRole("button", { name: /Multiclass/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
    await user.click(screen.getByRole("button", { name: /Gain \+1 to Evasion|\+1 to Evasion/ }));
    await user.type(screen.getByLabelText("New Experience"), "Fixer");
    await user.selectOptions(screen.getByLabelText("New domain card"), cardOption(2).id);
    await user.click(screen.getByRole("button", { name: /Confirm level 2/ }));

    expect(getLevel(latest)).toBe(2);
    const progress = getProgress(latest);
    expect(progress).toMatchObject({ proficiency: 2, hitPoints: 1, evasion: 1 });
    expect(progress.experiences.map((experience) => experience.name)).toEqual(["Busker", "Thief", "Fixer"]);
    expect(progress.cardIds).toContain(cardOption(2).id);
    expect(screen.getByText(/Level 2/, { selector: "strong" })).toBeInTheDocument();
  });

  it("stops offering an advancement once its slots are used", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Level up to 2/ }));
    await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
    await user.click(screen.getByRole("button", { name: /Stress slot/ }));
    await user.type(screen.getByLabelText("New Experience"), "Fixer");
    await user.selectOptions(screen.getByLabelText("New domain card"), cardOption(2).id);
    await user.click(screen.getByRole("button", { name: /Confirm level 2/ }));

    await user.click(screen.getByRole("button", { name: /Level up to 3/ }));
    await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
    await user.click(screen.getByRole("button", { name: /Stress slot/ }));
    // Both advancements chosen: the rest of the list is locked for this level.
    expect(screen.getByRole("button", { name: /Gain \+1 to Evasion|\+1 to Evasion/ })).toBeDisabled();
    const second = within(document.body).getAllByRole("button", { name: /Remove/ });
    expect(second).toHaveLength(2);
  });

  it("marks traits and blocks choosing them again within the tier", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Level up to 2/ }));
    await user.click(screen.getByRole("button", { name: /unmarked traits/ }));
    await user.selectOptions(screen.getByLabelText("Trait to increase 1"), "agility");
    await user.selectOptions(screen.getByLabelText("Trait to increase 2"), "strength");
    await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
    await user.type(screen.getByLabelText("New Experience"), "Fixer");
    await user.selectOptions(screen.getByLabelText("New domain card"), cardOption(2).id);
    await user.click(screen.getByRole("button", { name: /Confirm level 2/ }));

    await user.click(screen.getByRole("button", { name: /Level up to 3/ }));
    await user.click(screen.getByRole("button", { name: /unmarked traits/ }));
    const first = screen.getByLabelText("Trait to increase 1");
    expect(within(first).getByRole("option", { name: /Agility \(marked\)/ })).toBeDisabled();
    expect(within(first).getByRole("option", { name: "Finesse" })).toBeEnabled();
  });

  it("undoes the last level-up after confirmation", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Level up to 2/ }));
    await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
    await user.click(screen.getByRole("button", { name: /Stress slot/ }));
    await user.type(screen.getByLabelText("New Experience"), "Fixer");
    await user.selectOptions(screen.getByLabelText("New domain card"), cardOption(2).id);
    await user.click(screen.getByRole("button", { name: /Confirm level 2/ }));
    expect(getLevel(latest)).toBe(2);
    await user.click(screen.getByRole("button", { name: /Undo level 2/ }));
    expect(getLevel(latest)).toBe(1);
  });
});
