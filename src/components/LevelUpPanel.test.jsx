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

  describe("higher tiers", () => {
    // A valid level-4 character: tier 2 slots partly used, ready for the level 5 tier achievement.
    const levelFour = () => {
      const plan = [
        [{ option: "hp", tier: 2 }, { option: "stress", tier: 2 }],
        [{ option: "hp", tier: 2 }, { option: "stress", tier: 2 }],
        [{ option: "evasion", tier: 2 }, { option: "traits", tier: 2, traits: ["strength", "instinct"] }],
      ];
      let character = startingCharacter();
      plan.forEach((picks, index) => {
        const level = index + 2;
        const owned = getProgress(character).cardIds;
        const card = DOMAIN_CARDS.find((c) => bard.domains.includes(c.domain) && c.level <= level && !owned.includes(c.id));
        character = {
          ...character,
          levelUps: [...(character.levelUps ?? []), { experience: level === 2 ? "Second Wind" : "", picks, domainCardId: card.id, exchange: null }],
        };
      });
      return { ...character, level: 4 };
    };

    const startLevelFive = async (user, initial = levelFour()) => {
      render(<Harness initial={initial} />);
      await user.click(screen.getByRole("button", { name: /Level up to 5/ }));
      await user.type(screen.getByLabelText("New Experience"), "Veteran");
    };
    // Pick a new card that isn't owned and isn't one already chosen in this draft (`skip`).
    const chooseNewCard = (user, skip = [], level = 5) => {
      const owned = [...getProgress(latest).cardIds, ...skip];
      const card = DOMAIN_CARDS.find((c) => bard.domains.includes(c.domain) && c.level <= level && !owned.includes(c.id));
      return user.selectOptions(screen.getByLabelText("New domain card"), card.id);
    };

    it("multiclasses into another class and lists it in the progress summary", async () => {
      const user = userEvent.setup();
      await startLevelFive(user);
      await user.click(screen.getByRole("button", { name: /^Multiclass/ }));
      // Multiclass uses both advancements, so the other options lock.
      expect(screen.getByRole("button", { name: /Hit Point slot/ })).toBeDisabled();

      const warrior = CLASSES.find((item) => item.id === "warrior");
      await user.selectOptions(screen.getByLabelText("Multiclass class"), "warrior");
      expect(screen.getByRole("option", { name: "Blade" })).toBeInTheDocument();
      await user.selectOptions(screen.getByLabelText("Multiclass domain"), warrior.domains.find((d) => !bard.domains.includes(d)));
      await user.selectOptions(screen.getByLabelText("Multiclass class feature"), warrior.features[0].name);
      await user.selectOptions(screen.getByLabelText("Multiclass subclass foundation"), warrior.subclasses[0].id);
      await chooseNewCard(user);
      await user.click(screen.getByRole("button", { name: /Confirm level 5/ }));

      expect(getProgress(latest).multiclass).toMatchObject({ classId: "warrior" });
      expect(screen.getByText(/multiclassed into Warrior/)).toBeInTheDocument();
      expect(getProgress(latest).proficiency).toBe(3);
    });

    it("won't offer a domain you already have when multiclassing", async () => {
      const user = userEvent.setup();
      await startLevelFive(user);
      await user.click(screen.getByRole("button", { name: /^Multiclass/ }));
      await user.selectOptions(screen.getByLabelText("Multiclass class"), "warrior");
      const shared = CLASSES.find((item) => item.id === "warrior").domains.find((d) => bard.domains.includes(d));
      if (shared) expect(screen.getByRole("option", { name: shared })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Confirm level 5/ })).toBeDisabled();
    });

    it("takes the specialization card for an upgraded subclass", async () => {
      const user = userEvent.setup();
      await startLevelFive(user);
      await user.click(screen.getByRole("button", { name: /upgraded subclass card/ }));
      expect(bard.subclasses[0].specialization.length).toBeGreaterThan(0);
      expect(screen.getByText(/specialization card: Maestro/)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
      await chooseNewCard(user);
      await user.click(screen.getByRole("button", { name: /Confirm level 5/ }));
      expect(getProgress(latest).subclassUpgrades).toEqual(["specialization"]);
      expect(screen.getByText(/specialization unlocked/)).toBeInTheDocument();
    });

    it("labels a second subclass upgrade as the mastery card", async () => {
      const user = userEvent.setup();
      const plan = [
        [{ option: "hp", tier: 3 }, { option: "stress", tier: 3 }],
        [{ option: "hp", tier: 3 }, { option: "stress", tier: 3 }],
        [{ option: "evasion", tier: 3 }, { option: "traits", tier: 3, traits: ["strength", "instinct"] }],
      ];
      let character = levelFour();
      plan.forEach((picks, index) => {
        const level = index + 5;
        const owned = getProgress(character).cardIds;
        const card = DOMAIN_CARDS.find((c) => bard.domains.includes(c.domain) && c.level <= level && !owned.includes(c.id));
        character = { ...character, levelUps: [...character.levelUps, { experience: level === 5 ? "Veteran" : "", picks, domainCardId: card.id, exchange: null }] };
      });
      render(<Harness initial={character} />);
      await user.click(screen.getByRole("button", { name: /Level up to 8/ }));
      await user.click(screen.getByRole("button", { name: /upgraded subclass card/ }));
      await user.click(screen.getByRole("button", { name: /upgraded subclass card/ }));
      expect(screen.getByText(/specialization card: Maestro/)).toBeInTheDocument();
      expect(screen.getByText(/mastery card: Virtuoso/)).toBeInTheDocument();
    });

    it("raises two Experiences, including the one just gained", async () => {
      const user = userEvent.setup();
      await startLevelFive(user);
      await user.click(screen.getByRole("button", { name: /to two Experiences/ }));
      await user.selectOptions(screen.getByLabelText("Experience to increase 1"), "0");
      await user.selectOptions(screen.getByLabelText("Experience to increase 2"), "3");
      expect(within(screen.getByLabelText("Experience to increase 1")).getByRole("option", { name: "Veteran" })).toBeDisabled === undefined;
      await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
      await chooseNewCard(user);
      await user.click(screen.getByRole("button", { name: /Confirm level 5/ }));
      const modifiers = getProgress(latest).experiences.map((experience) => experience.modifier);
      expect(modifiers).toEqual([3, 2, 2, 3]);
    });

    it("takes an extra domain card and can exchange an existing one", async () => {
      const user = userEvent.setup();
      await startLevelFive(user);
      await user.click(screen.getByRole("button", { name: /additional domain card/ }));
      const extra = DOMAIN_CARDS.find((c) => bard.domains.includes(c.domain) && c.level === 5);
      await user.selectOptions(screen.getByLabelText("Additional domain card"), extra.id);
      await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));

      const owned = getProgress(latest).cardIds;
      const first = owned[0];
      const replacement = DOMAIN_CARDS.find((c) => bard.domains.includes(c.domain) && c.level === 1 && !owned.includes(c.id));
      await user.selectOptions(screen.getByLabelText("Card to exchange away"), first);
      await user.selectOptions(screen.getByLabelText("Card to exchange for"), replacement.id);
      const fresh = DOMAIN_CARDS.find((c) => bard.domains.includes(c.domain) && c.level === 4 && !owned.includes(c.id));
      await user.selectOptions(screen.getByLabelText("New domain card"), fresh.id);
      await user.click(screen.getByRole("button", { name: /Confirm level 5/ }));

      const cards = getProgress(latest).cardIds;
      expect(cards).toContain(extra.id);
      // A level-5 card needs the tier 3 slot (tier 2 slots stop at level 4), leaving tier 2 free.
      expect(latest.levelUps[3].picks.find((pick) => pick.option === "domainCard").tier).toBe(3);
      expect(cards).toContain(replacement.id);
      expect(cards).not.toContain(first);
      expect(screen.getByText(/exchanged/)).toBeInTheDocument();
    });

    it("keeps the higher-tier slot free when a lower-level extra card will do", async () => {
      const user = userEvent.setup();
      await startLevelFive(user);
      await user.click(screen.getByRole("button", { name: /additional domain card/ }));
      const owned = getProgress(latest).cardIds;
      const modest = DOMAIN_CARDS.find((c) => bard.domains.includes(c.domain) && c.level === 3 && !owned.includes(c.id));
      await user.selectOptions(screen.getByLabelText("Additional domain card"), modest.id);
      await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
      await chooseNewCard(user, [modest.id]);
      await user.click(screen.getByRole("button", { name: /Confirm level 5/ }));
      expect(latest.levelUps[3].picks.find((pick) => pick.option === "domainCard").tier).toBe(2);
    });

    it("lets a pick be removed and the draft be cancelled", async () => {
      const user = userEvent.setup();
      await startLevelFive(user);
      await user.click(screen.getByRole("button", { name: /Hit Point slot/ }));
      expect(screen.getByText(/1\/2 chosen/)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Remove" }));
      expect(screen.getByText(/0\/2 chosen/)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(getLevel(latest)).toBe(4);
      expect(screen.getByRole("button", { name: /Level up to 5/ })).toBeInTheDocument();
    });

    it("stops at level 10", () => {
      let character = startingCharacter();
      character = { ...character, levelUps: Array.from({ length: 9 }, () => ({ experience: "", picks: [], domainCardId: "", exchange: null })) };
      render(<Harness initial={character} />);
      expect(screen.getByRole("button", { name: /Maximum level reached/ })).toBeDisabled();
      expect(screen.getByText(/Level 10 · Tier 4/)).toBeInTheDocument();
    });

    it("lists past level-ups with their choices", () => {
      render(<Harness initial={levelFour()} />);
      expect(screen.getByText(/new Experience “Second Wind”/)).toBeInTheDocument();
      expect(screen.getByText(/\+1 Strength & Instinct/)).toBeInTheDocument();
      expect(screen.getAllByText(/\+1 Hit Point slot/).length).toBe(2);
    });
  });
});
