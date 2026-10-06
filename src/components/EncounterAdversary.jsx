import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function EncounterAdversary({ adversary, quantity = 1, onRemove }) {
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center bg-dark text-light border-secondary">
      <div>
        <span className="fw-bold">{adversary.name}</span>
        <div className="text-secondary small opacity-75">
          <Badge pill bg="primary" className="me-2">
            T{adversary.tier}
          </Badge>
          {adversary.type}
          {quantity > 1 && (
            <Badge pill bg="info" text="dark" className="ms-2">
              ×{quantity}
            </Badge>
          )}
        </div>
      </div>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => onRemove(adversary.id)}
      >
        {quantity > 1 ? "Remove One" : "Remove"}
      </Button>
    </ListGroup.Item>
  );
}

export default EncounterAdversary;
