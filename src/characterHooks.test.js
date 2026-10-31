import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCharacterBuilder, useSavedCharacters, CHARACTER_DRAFT_KEY, CHARACTER_STORAGE_KEY } from "./characterHooks";
import { createInitialCharacter } from "./characterUtils";

describe("useSavedCharacters", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves, reloads and deletes a character", () => {
    const { result, unmount } = renderHook(() => useSavedCharacters());
    let record;
    act(() => { record = result.current.saveCharacter({ ...createInitialCharacter(), name: "Ari" }); });
    expect(result.current.savedCharacters).toHaveLength(1);
    expect(JSON.parse(window.localStorage.getItem(CHARACTER_STORAGE_KEY))).toHaveLength(1);
    unmount();

    const reopened = renderHook(() => useSavedCharacters());
    expect(reopened.result.current.savedCharacters[0].id).toBe(record.id);
    act(() => { reopened.result.current.deleteCharacter(record.id); });
    expect(JSON.parse(window.localStorage.getItem(CHARACTER_STORAGE_KEY))).toEqual([]);
  });

  it("does not overwrite storage just by opening the app", () => {
    window.localStorage.setItem(CHARACTER_STORAGE_KEY, "not json");
    renderHook(() => useSavedCharacters());
    expect(window.localStorage.getItem(CHARACTER_STORAGE_KEY)).toBe("not json");
  });
});

describe("useCharacterBuilder", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("starts from a blank character and persists every change as a draft", () => {
    const { result } = renderHook(() => useCharacterBuilder());
    expect(result.current.character.name).toBe("");
    act(() => result.current.updateCharacter({ name: "Drafty" }));
    expect(JSON.parse(window.localStorage.getItem(CHARACTER_DRAFT_KEY)).name).toBe("Drafty");
  });

  it("restores a stored draft and repairs malformed ones", () => {
    window.localStorage.setItem(CHARACTER_DRAFT_KEY, JSON.stringify({ name: "Back Again", levelUps: "nope" }));
    expect(renderHook(() => useCharacterBuilder()).result.current.character).toMatchObject({ name: "Back Again", levelUps: [], level: 1 });
  });

  it("falls back to a blank character when the draft is unreadable", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem(CHARACTER_DRAFT_KEY, "{broken");
    expect(renderHook(() => useCharacterBuilder()).result.current.character.name).toBe("");
  });

  it("keeps working when storage rejects writes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    const { result } = renderHook(() => useCharacterBuilder());
    act(() => result.current.updateCharacter({ name: "Still Here" }));
    expect(result.current.character.name).toBe("Still Here");
    expect(warn).toHaveBeenCalled();
  });

  it("assigns and clears trait scores as numbers", () => {
    const { result } = renderHook(() => useCharacterBuilder());
    act(() => result.current.updateTrait("agility", "2"));
    expect(result.current.character.traits.agility).toBe(2);
    act(() => result.current.updateTrait("agility", null));
    expect(result.current.character.traits.agility).toBeNull();
  });

  it("toggles domain cards and never allows more than two", () => {
    const { result } = renderHook(() => useCharacterBuilder());
    act(() => result.current.toggleDomainCard("a"));
    act(() => result.current.toggleDomainCard("b"));
    act(() => result.current.toggleDomainCard("c"));
    expect(result.current.character.domainCardIds).toEqual(["a", "b"]);
    act(() => result.current.toggleDomainCard("a"));
    expect(result.current.character.domainCardIds).toEqual(["b"]);
  });

  it("renames an experience and resets the whole character", () => {
    const { result } = renderHook(() => useCharacterBuilder());
    act(() => result.current.updateExperience(1, "Acrobat"));
    expect(result.current.character.experiences.map((experience) => experience.name)).toEqual(["", "Acrobat"]);
    act(() => result.current.resetCharacter());
    expect(result.current.character.experiences.every((experience) => experience.name === "")).toBe(true);
  });
});

describe("useSavedCharacters edge cases", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("updates an existing record instead of duplicating it", () => {
    const { result } = renderHook(() => useSavedCharacters());
    let record;
    act(() => { record = result.current.saveCharacter({ ...createInitialCharacter(), name: "One" }); });
    act(() => { result.current.saveCharacter({ ...record, name: "One (edited)" }); });
    expect(result.current.savedCharacters).toHaveLength(1);
    expect(result.current.savedCharacters[0].name).toBe("One (edited)");
  });

  it("loads a character from a record or from raw JSON, and rejects junk", () => {
    const { result } = renderHook(() => useSavedCharacters());
    expect(result.current.loadCharacter({ ...createInitialCharacter(), name: "From record" }).name).toBe("From record");
    const raw = JSON.stringify({ format: "daggerheart-character", version: 1, character: { name: "From file" } });
    expect(result.current.loadCharacter(raw).name).toBe("From file");
    expect(() => result.current.loadCharacter("{}")).toThrow(/not a supported/);
  });

  it("warns instead of throwing when saving to storage fails", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useSavedCharacters());
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    act(() => { result.current.saveCharacter({ ...createInitialCharacter(), name: "Unsaved" }); });
    expect(result.current.savedCharacters).toHaveLength(1);
    expect(warn).toHaveBeenCalled();
  });
});
