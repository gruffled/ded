import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdversaryCard from "./AdversaryCard";

const baseAdversary = {
  name: "Goblin",
  tier: 1,
  type: "Minion",
  hp: 3,
  battle_points: 1,
};

describe("AdversaryCard", () => {
  it("renders adversary name and stats", () => {
    render(
      <AdversaryCard
        adversary={baseAdversary}
        partyTier={1}
        onAdd={vi.fn()}
        onShowDetails={vi.fn()}
      />
    );
    expect(screen.getByText("Goblin")).toBeInTheDocument();
    expect(screen.getByText(/Minion/)).toBeInTheDocument();
    expect(screen.getByText(/HP: 3/)).toBeInTheDocument();
  });

  it("shows primary badge when adversary tier matches party tier", () => {
    render(
      <AdversaryCard
        adversary={baseAdversary}
        partyTier={1}
        onAdd={vi.fn()}
        onShowDetails={vi.fn()}
      />
    );
    const badge = screen.getByText("T1");
    expect(badge).toHaveClass("bg-primary");
  });

  it("shows warning badge when adversary tier is below party tier", () => {
    render(
      <AdversaryCard
        adversary={baseAdversary}
        partyTier={2}
        onAdd={vi.fn()}
        onShowDetails={vi.fn()}
      />
    );
    expect(screen.getByText("T1")).toHaveClass("bg-warning");
  });

  it("shows danger badge when adversary tier is above party tier", () => {
    const highTierAdversary = { ...baseAdversary, tier: 3 };
    render(
      <AdversaryCard
        adversary={highTierAdversary}
        partyTier={1}
        onAdd={vi.fn()}
        onShowDetails={vi.fn()}
      />
    );
    expect(screen.getByText("T3")).toHaveClass("bg-danger");
  });

  it("shows reduced BP when adversary is below party tier", () => {
    render(
      <AdversaryCard
        adversary={baseAdversary}
        partyTier={2}
        onAdd={vi.fn()}
        onShowDetails={vi.fn()}
      />
    );
    expect(screen.getByText(/BP: 0/)).toBeInTheDocument();
    expect(screen.getByText(/\(1\)/)).toBeInTheDocument();
  });

  it("calls onAdd when Add button is clicked", async () => {
    const onAdd = vi.fn();
    render(
      <AdversaryCard
        adversary={baseAdversary}
        partyTier={1}
        onAdd={onAdd}
        onShowDetails={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith(baseAdversary);
  });

  it("calls onShowDetails when card body is clicked", async () => {
    const onShowDetails = vi.fn();
    render(
      <AdversaryCard
        adversary={baseAdversary}
        partyTier={1}
        onAdd={vi.fn()}
        onShowDetails={onShowDetails}
      />
    );
    await userEvent.click(screen.getByText("Goblin"));
    expect(onShowDetails).toHaveBeenCalledWith(baseAdversary);
  });
});
