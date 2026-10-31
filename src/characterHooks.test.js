import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSavedCharacters, CHARACTER_STORAGE_KEY } from "./characterHooks";
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
