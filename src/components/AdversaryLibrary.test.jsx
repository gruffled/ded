import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdversaryLibrary from "./AdversaryLibrary";

const adversaries = Array.from({ length: 21 }, (_, index) => ({
  name: `ADVERSARY ${index + 1}`,
  tier: 1,
  type: "Standard",
  hp: 5,
  battle_points: 2,
}));

describe("AdversaryLibrary", () => {
  it("paginates long result lists", async () => {
    render(
      <AdversaryLibrary
        adversaries={adversaries}
        partyTier={1}
        onAdd={vi.fn()}
        onShowDetails={vi.fn()}
        searchTerm=""
        setSearchTerm={vi.fn()}
        filterByTier={false}
        setFilterByTier={vi.fn()}
        adversaryType="all"
        setAdversaryType={vi.fn()}
        adversaryTypes={["Standard"]}
        sortBy="name"
        setSortBy={vi.fn()}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText("Showing 1–20 of 21")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("ADVERSARY 1")).toBeInTheDocument();
    expect(screen.queryByText("ADVERSARY 21")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Showing 21–21 of 21")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("ADVERSARY 21")).toBeInTheDocument();
    expect(screen.queryByText("ADVERSARY 1")).not.toBeInTheDocument();
  });
});
