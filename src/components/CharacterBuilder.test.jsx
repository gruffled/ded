import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterBuilder from "./CharacterBuilder";

const goToStep = (user, label) =>
  user.click(screen.getByRole("button", { name: new RegExp(label) }));

describe("CharacterBuilder", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows SRD class and subclass details once chosen", async () => {
    const user = userEvent.setup();
    render(<CharacterBuilder />);
    await user.selectOptions(screen.getByLabelText("Class"), "bard");
    await user.selectOptions(screen.getByLabelText("Subclass"), "troubadour");
    expect(screen.getAllByText(/Make a Scene/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Gifted Performer/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Relaxing Song/).length).toBeGreaterThan(0);
  });

  it("offers only cards from the class domains and caps the choice at two", async () => {
    const user = userEvent.setup();
    render(<CharacterBuilder />);
    await user.selectOptions(screen.getByLabelText("Class"), "bard");
    await goToStep(user, "Equipment");
    expect(screen.getByRole("button", { name: /Deft Deceiver/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rune Ward/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Deft Deceiver/ }));
    await user.click(screen.getByRole("button", { name: /Enrapture/ }));
    await user.click(screen.getByRole("button", { name: /Inspirational Words/ }));
    const selected = screen
      .getAllByRole("button")
      .filter((button) => button.classList.contains("btn-primary") && /Recall/.test(button.textContent));
    expect(selected).toHaveLength(2);
  });

  it("clears and disables the secondary weapon for a two-handed primary", async () => {
    const user = userEvent.setup();
    render(<CharacterBuilder />);
    await goToStep(user, "Equipment");
    await user.selectOptions(screen.getByLabelText(/Primary weapon/), "broadsword");
    await user.selectOptions(screen.getByLabelText(/Secondary weapon/), "secondary-hatchet");
    expect(screen.getByLabelText(/Secondary weapon/)).toHaveValue("secondary-hatchet");
    await user.selectOptions(screen.getByLabelText(/Primary weapon/), "katana");
    expect(screen.getByLabelText(/Secondary weapon/)).toBeDisabled();
    expect(screen.getByLabelText(/Secondary weapon/)).toHaveValue("");
  });

  it("reports an unreadable import", async () => {
    const user = userEvent.setup();
    const { container } = render(<CharacterBuilder />);
    const input = container.querySelector('input[type="file"]');
    const file = new File(["not json"], "bad.json", { type: "application/json" });
    await user.upload(input, file);
    expect(await within(container).findByText(/Unexpected token|not a supported/i)).toBeInTheDocument();
  });
});
