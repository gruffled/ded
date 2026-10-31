import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ADJUSTMENT_VALUES } from "../constants";

const MAX_PARTY_SIZE = 8;
const MAX_PARTY_LEVEL = 10;

/**
 * Number input that lets the field be cleared while typing and only clamps
 * the value (and snaps the text back) once it loses focus.
 */
function NumberField({ controlId, label, value, min, max, onChange }) {
  const [draft, setDraft] = useState(null);

  const handleChange = (e) => {
    const text = e.target.value;
    setDraft(text);
    const parsed = parseInt(text, 10);
    if (!Number.isNaN(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <Form.Group as={Col} controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="number"
        value={draft ?? value}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
        min={min}
        max={max}
      />
    </Form.Group>
  );
}

function Controls({
  partySize,
  setPartySize,
  partyLevel,
  setPartyLevel,
  adjustments,
  setAdjustments,
}) {
  const handleAdjustmentChange = (e) => {
    const { value } = e.target;
    setAdjustments(value);
  };

  return (
    <Card
      bg="secondary"
      text="light"
      className="shadow-lg border-start border-4 border-primary"
    >
      <Card.Header as="h5">⚙️ Encounter Setup</Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <NumberField
            controlId="party-size"
            label="Party Size"
            value={partySize}
            min={1}
            max={MAX_PARTY_SIZE}
            onChange={setPartySize}
          />
          <NumberField
            controlId="party-level"
            label="Party Level"
            value={partyLevel}
            min={1}
            max={MAX_PARTY_LEVEL}
            onChange={setPartyLevel}
          />
        </Row>

        <h6 className="mt-4 mb-3">Difficulty Adjustments</h6>
        <Form>
          <Form.Check
            type="radio"
            id="adjustment-none"
            name="adjustment"
            label="Standard Difficulty"
            value={ADJUSTMENT_VALUES.NONE}
            checked={adjustments === ADJUSTMENT_VALUES.NONE}
            onChange={handleAdjustmentChange}
          />
          <Form.Check
            type="radio"
            id="adjustment-easy"
            name="adjustment"
            label="Easier Fight (-1 BP)"
            value={ADJUSTMENT_VALUES.EASY}
            checked={adjustments === ADJUSTMENT_VALUES.EASY}
            onChange={handleAdjustmentChange}
          />
          <Form.Check
            type="radio"
            id="adjustment-hard"
            name="adjustment"
            label="Harder Fight (+2 BP)"
            value={ADJUSTMENT_VALUES.HARD}
            checked={adjustments === ADJUSTMENT_VALUES.HARD}
            onChange={handleAdjustmentChange}
          />
          <Form.Check
            type="radio"
            id="adjustment-damage"
            name="adjustment"
            label="Boost Adversary Damage (-2 BP)"
            value={ADJUSTMENT_VALUES.DAMAGE}
            checked={adjustments === ADJUSTMENT_VALUES.DAMAGE}
            onChange={handleAdjustmentChange}
          />
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Controls;
