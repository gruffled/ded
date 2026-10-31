import React, { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Controls from "./Controls";

function Harness() {
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(1);
  const [adjustments, setAdjustments] = useState("none");
  return (
    <Controls
      partySize={partySize}
      setPartySize={setPartySize}
      partyLevel={partyLevel}
      setPartyLevel={setPartyLevel}
      adjustments={adjustments}
      setAdjustments={setAdjustments}
    />
  );
}

describe("Controls number inputs", () => {
  it("lets the field be cleared and retyped", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText("Party Size");
    await user.clear(input);
    expect(input).toHaveValue(null);
    await user.type(input, "5");
    expect(input).toHaveValue(5);
  });

  it("clamps to the allowed range and restores a value on blur", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText("Party Size");
    await user.clear(input);
    await user.type(input, "99");
    await user.tab();
    expect(input).toHaveValue(8);
    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue(8);
  });
});
