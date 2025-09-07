import React from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Controls({ partySize, setPartySize, partyLevel, setPartyLevel, adjustments, setAdjustments }) {
  
  const handleAdjustmentChange = (e) => {
    const { id, checked } = e.target;
    setAdjustments(current => ({ ...current, [id]: checked }));
  };

  return (
    <Card bg="secondary" text="light">
      <Card.Header as="h5">Encounter Setup</Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="party-size">
            <Form.Label>Party Size</Form.Label>
            <Form.Control 
              type="number" 
              value={partySize} 
              onChange={e => setPartySize(parseInt(e.target.value) || 1)}
              min="1"
            />
          </Form.Group>
          <Form.Group as={Col} controlId="party-level">
            <Form.Label>Party Level</Form.Label>
            <Form.Control 
              type="number" 
              value={partyLevel} 
              onChange={e => setPartyLevel(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
            />
          </Form.Group>
        </Row>
        
        <h6 className="mt-4">Difficulty Adjustments</h6>
        <Form>
            <Form.Check 
                type="switch"
                id="easy"
                label="Easier Fight (-1 BP)"
                checked={adjustments.easy}
                onChange={handleAdjustmentChange}
            />
            <Form.Check 
                type="switch"
                id="hard"
                label="Harder Fight (+2 BP)"
                checked={adjustments.hard}
                onChange={handleAdjustmentChange}
            />
            <Form.Check 
                type="switch"
                id="damage"
                label="Boost Adversary Damage (-2 BP)"
                checked={adjustments.damage}
                onChange={handleAdjustmentChange}
            />
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Controls;
