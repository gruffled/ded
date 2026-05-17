import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ADJUSTMENT_VALUES } from "../constants";

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
          <Form.Group as={Col} controlId="party-size">
            <Form.Label>Party Size</Form.Label>
            <Form.Control
              type="number"
              value={partySize}
              onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </Form.Group>
          <Form.Group as={Col} controlId="party-level">
            <Form.Label>Party Level</Form.Label>
            <Form.Control
              type="number"
              value={partyLevel}
              onChange={(e) => setPartyLevel(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              min="1"
              max="10"
            />
          </Form.Group>
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
