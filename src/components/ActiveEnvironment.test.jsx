import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActiveEnvironment from "./ActiveEnvironment";

const environment = {
  name: "ABANDONED GROVE",
  tier: 1,
  type: "Exploration",
  difficulty: 11,
  description: "A reclaimed grove.",
  impulses: "Draw in the curious",
  potential_adversaries: "Beasts",
};

describe("ActiveEnvironment", () => {
  it("clears the active environment without affecting encounter controls", async () => {
    const onClear = vi.fn();
    render(
      <ActiveEnvironment
        environment={environment}
        partyTier={1}
        onShowDetails={vi.fn()}
        onReplace={vi.fn()}
        onClear={onClear}
      />
    );

    expect(screen.getByText("ABANDONED GROVE")).toBeInTheDocument();
    expect(screen.getByText("No Battle Point cost")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
