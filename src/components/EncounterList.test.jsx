import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EncounterList from "./EncounterList";

const adversary = {
  id: "minion-1",
  name: "Giant Rat",
  tier: 1,
  type: "Minion",
};

describe("EncounterList", () => {
  it("groups identical adversaries and removes one instance at a time", async () => {
    const onRemove = vi.fn();
    const secondInstance = { ...adversary, id: "minion-2" };

    render(
      <EncounterList
        encounter={[adversary, secondInstance]}
        onRemove={onRemove}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByText("×2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove One" }));
    expect(onRemove).toHaveBeenCalledWith("minion-1");
  });
});
