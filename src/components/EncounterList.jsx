import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import EncounterAdversary from "./EncounterAdversary";

function EncounterList({ encounter, onRemove, onClear }) {
  return (
    <Card
      bg="secondary"
      text="light"
      className="flex-grow-1 d-flex flex-column shadow-lg border-start border-4 border-success"
    >
      <Card.Header
        as="h5"
        className="d-flex justify-content-between align-items-center"
      >
        <span>
          <span className="me-2">🎲</span>
          Current Encounter
        </span>
        {encounter.length > 0 && (
          <Button variant="danger" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </Card.Header>
      <Card.Body className="overflow-auto p-2">
        {encounter.length === 0 ? (
          <p className="text-center text-secondary opacity-75 p-4">
            Add adversaries to build your encounter.
          </p>
        ) : (
          <ListGroup variant="flush">
            {encounter.map((adv, index) => (
              <EncounterAdversary
                key={adv.id}
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
