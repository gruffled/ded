import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useEncounter,
  useAdversaryData,
  useSavedCharacters,
  CHARACTER_STORAGE_KEY,
} from "./hooks";
import { createInitialCharacter } from "./characterUtils";

describe("useEncounter", () => {
  const mockAdversary = { name: "Goblin", tier: 1, battle_points: 1, type: "Minion" };

  it("starts with an empty encounter", () => {
    const { result } = renderHook(() => useEncounter());
    expect(result.current.encounter).toHaveLength(0);
  });

  it("adds an adversary with a unique id", () => {
    const { result } = renderHook(() => useEncounter());
    act(() => { result.current.addAdversary(mockAdversary); });
    expect(result.current.encounter).toHaveLength(1);
    expect(result.current.encounter[0].name).toBe("Goblin");
    expect(result.current.encounter[0].id).toBeDefined();
  });

  it("assigns distinct ids when the same adversary is added twice", () => {
    const { result } = renderHook(() => useEncounter());
    act(() => {
      result.current.addAdversary(mockAdversary);
      result.current.addAdversary(mockAdversary);
    });
    const ids = result.current.encounter.map((a) => a.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("removes an adversary by id", () => {
    const { result } = renderHook(() => useEncounter());
    act(() => { result.current.addAdversary(mockAdversary); });
    const id = result.current.encounter[0].id;
    act(() => { result.current.removeAdversary(id); });
    expect(result.current.encounter).toHaveLength(0);
  });

  it("clears all adversaries", () => {
    const { result } = renderHook(() => useEncounter());
    act(() => {
      result.current.addAdversary(mockAdversary);
      result.current.addAdversary(mockAdversary);
    });
    act(() => { result.current.clearEncounter(); });
    expect(result.current.encounter).toHaveLength(0);
  });
});

describe("useAdversaryData", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads adversaries from the base URL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [{ name: "Goblin" }],
    });
    const { result } = renderHook(() => useAdversaryData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchMock.mock.calls[0][0]).toMatch(/adversaries\.json$/);
    expect(result.current.allAdversaries).toHaveLength(1);
  });

  it("reports an error when the response is not a list", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ not: "a list" }),
    });
    const { result } = renderHook(() => useAdversaryData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toMatch(/adversaries\.json/);
  });
});

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
