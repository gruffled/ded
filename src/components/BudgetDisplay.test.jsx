import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BudgetDisplay from "./BudgetDisplay";

describe("BudgetDisplay", () => {
  it("should render budget information", () => {
    const budget = {
      total: 20,
      spent: 8,
      remaining: 12,
    };

    render(<BudgetDisplay budget={budget} partyTier={2} />);

    expect(screen.getByText("Total Budget")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Tier 2")).toBeInTheDocument();
  });

  it("should show remaining budget in danger color when negative", () => {
    const budget = {
      total: 20,
      spent: 25,
      remaining: -5,
    };

    render(<BudgetDisplay budget={budget} partyTier={1} />);

    const remainingElement = screen.getByText("-5");
    expect(remainingElement).toHaveClass("text-danger");
  });

  it("should show remaining budget in success color when positive", () => {
    const budget = {
      total: 20,
      spent: 8,
      remaining: 12,
    };

    render(<BudgetDisplay budget={budget} partyTier={1} />);

    const remainingElement = screen.getByText("12");
    expect(remainingElement).toHaveClass("text-success");
  });

  it("should display the correct party tier", () => {
    const budget = {
      total: 20,
      spent: 7,
      remaining: 13,
    };

    render(<BudgetDisplay budget={budget} partyTier={3} />);

    expect(screen.getByText("Tier 3")).toBeInTheDocument();
  });
});
