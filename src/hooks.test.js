import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEncounter } from "./hooks";

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
