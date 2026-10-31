import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdversaryModal from "./AdversaryModal";

const base = {
  name: "TEST HORDE", tier: 2, type: "Horde", description: "A swarm.", motives: "Overwhelm",
  difficulty: 13, thresholds: { major: 7, severe: 15 }, hp: 8, stress: 4, attack_modifier: 3,
  standard_attack: { name: "Swarm", range: "Close", damage: "2d6 phy" },
};

describe("AdversaryModal", () => {
  it("renders nothing without an adversary", () => {
    const { container } = render(<AdversaryModal adversary={null} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the stat block, experiences, horde size and features with their costs", () => {
    render(
      <AdversaryModal
        adversary={{
          ...base,
          experience: [{ name: "Tracking", modifier: 2 }, { name: "Ambush", modifier: 3 }],
          creatures_per_hp: 4,
          features: [
            { name: "Swarm Tactics", type: "Passive", description: "Always on." },
            { name: "Lunge", type: "Action", description: "Jump.", costs: { fear: 1, stress: 2 } },
            { name: "Snap", type: "Reaction", description: "Bite back.", costs: { stress: 1 } },
            { name: "Aura", type: "Evolution", description: "Something else." },
          ],
        }}
        onClose={() => {}}
      />
    );
    expect(screen.getByText("TEST HORDE")).toBeInTheDocument();
    expect(screen.getByText("Tier 2")).toBeInTheDocument();
    expect(screen.getByText("7 / 15")).toBeInTheDocument();
    expect(screen.getByText(/Tracking \(\+2\), Ambush \(\+3\)/)).toBeInTheDocument();
    expect(screen.getByText(/4 creature\(s\) per HP/)).toBeInTheDocument();
    expect(screen.getByText(/Name: Swarm/)).toBeInTheDocument();
    expect(screen.getByText(/Cost: 1 Fear \+ 2 Stress/)).toBeInTheDocument();
    expect(screen.getByText(/Cost: 1 Stress/)).toBeInTheDocument();
    for (const type of ["Passive", "Action", "Reaction", "Evolution"]) expect(screen.getByText(type)).toBeInTheDocument();
  });

  it("copes with missing or oddly shaped data", () => {
    render(
      <AdversaryModal
        adversary={{
          ...base, name: "ODD ONE", thresholds: { major: 5, severe: null }, hp: { base: 6, extra: 2 },
          stress: null, difficulty: ["12", "14"], experience: { name: "Lone", modifier: 1 }, features: undefined,
        }}
        onClose={() => {}}
      />
    );
    expect(screen.getByText("5 / —")).toBeInTheDocument();
    expect(screen.getByText("base 6, extra 2")).toBeInTheDocument();
    expect(screen.getByText("12, 14")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText(/Lone \(\+1\)/)).toBeInTheDocument();
    expect(screen.queryByText("Features")).not.toBeInTheDocument();
  });

  it("calls onClose from the close button", async () => {
    const onClose = vi.fn();
    render(<AdversaryModal adversary={{ ...base, features: [] }} onClose={onClose} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("handles a missing thresholds object", () => {
    render(<AdversaryModal adversary={{ ...base, thresholds: undefined, features: [] }} onClose={() => {}} />);
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
  });
});
