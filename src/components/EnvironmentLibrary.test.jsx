import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EnvironmentLibrary from "./EnvironmentLibrary";

const environments = [
  {
    name: "ABANDONED GROVE",
    tier: 1,
    type: "Exploration",
    difficulty: 11,
    description: "A reclaimed grove.",
    impulses: "Draw in the curious",
    potential_adversaries: "Beasts",
  },
  {
    name: "TIME COURT",
    tier: 4,
    type: "Social",
    difficulty: 20,
    description: "A trial beyond time.",
    impulses: "Mete out justice",
    potential_adversaries: "Temporal Enforcers",
  },
];

describe("EnvironmentLibrary", () => {
  it("filters environments by search and opens details", async () => {
    const onShowDetails = vi.fn();
    render(
      <EnvironmentLibrary
        environments={environments}
        onShowDetails={onShowDetails}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText("ABANDONED GROVE")).toBeInTheDocument();
    expect(screen.getByText("TIME COURT")).toBeInTheDocument();

    await userEvent.type(screen.getByRole("searchbox"), "time");
    expect(screen.queryByText("ABANDONED GROVE")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(onShowDetails).toHaveBeenCalledWith(environments[1]);
  });
});
