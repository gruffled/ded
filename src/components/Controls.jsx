import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

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
              onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
              min="1"
            />
          </Form.Group>
          <Form.Group as={Col} controlId="party-level">
            <Form.Label>Party Level</Form.Label>
            <Form.Control
              type="number"
              value={partyLevel}
              onChange={(e) => setPartyLevel(parseInt(e.target.value) || 1)}
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
            value="none"
            checked={adjustments === "none"}
            onChange={handleAdjustmentChange}
          />
          <Form.Check
            type="radio"
            id="adjustment-easy"
            name="adjustment"
            label="Easier Fight (-1 BP)"
            value="easy"
            checked={adjustments === "easy"}
            onChange={handleAdjustmentChange}
          />
          <Form.Check
            type="radio"
            id="adjustment-hard"
            name="adjustment"
            label="Harder Fight (+2 BP)"
            value="hard"
            checked={adjustments === "hard"}
            onChange={handleAdjustmentChange}
          />
          <Form.Check
            type="radio"
            id="adjustment-damage"
            name="adjustment"
            label="Boost Adversary Damage (-2 BP)"
            value="damage"
            checked={adjustments === "damage"}
            onChange={handleAdjustmentChange}
          />
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Controls;
