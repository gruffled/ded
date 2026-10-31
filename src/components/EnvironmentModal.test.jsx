import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EnvironmentModal from "./EnvironmentModal";

const environment = {
  name: "Mossy Grove", tier: 2, type: "Exploration", difficulty: 12, description: "A quiet grove.",
  impulses: "Hide, Entangle", potential_adversaries: "Beasts, Fey",
  features: [{ name: "Overgrowth", type: "Passive", description: "Vines creep." }],
};

describe("EnvironmentModal", () => {
  it("renders nothing without an environment", () => {
    const { container } = render(<EnvironmentModal environment={null} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the environment and its features", () => {
    render(<EnvironmentModal environment={environment} onClose={() => {}} />);
    expect(screen.getByText("Mossy Grove")).toBeInTheDocument();
    expect(screen.getByText("Tier 2")).toBeInTheDocument();
    expect(screen.getByText(/Difficulty: 12/)).toBeInTheDocument();
    expect(screen.getByText(/Hide, Entangle/)).toBeInTheDocument();
    expect(screen.getByText(/Beasts, Fey/)).toBeInTheDocument();
    expect(screen.getByText("Overgrowth")).toBeInTheDocument();
  });

  it("omits the features section when there are none and closes on request", async () => {
    const onClose = vi.fn();
    render(<EnvironmentModal environment={{ ...environment, features: [] }} onClose={onClose} />);
    expect(screen.queryByText("Features")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
