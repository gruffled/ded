import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import EncounterAdversary from './EncounterAdversary';

function EncounterList({ encounter, onRemove, onClear }) {
  return (
    <Card bg="secondary" text="light" className="flex-grow-1 d-flex flex-column">
      <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
        Current Encounter
        {encounter.length > 0 && (
          <Button variant="danger" size="sm" onClick={onClear}>Clear All</Button>
        )}
      </Card.Header>
      <Card.Body className="overflow-auto p-2">
        {encounter.length === 0 ? (
          <p className="text-center text-muted p-4">Add adversaries to build your encounter.</p>
        ) : (
          <ListGroup variant="flush">
            {encounter.map((adv, index) => (
              <EncounterAdversary 
                key={index}
                adversary={adv}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

export default EncounterList;
