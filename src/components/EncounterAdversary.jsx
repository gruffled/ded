import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

function EncounterAdversary({ adversary, index, onRemove }) {
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center bg-dark text-light border-secondary">
      <div>
        <span className="fw-bold">{adversary.name}</span>
        <div className="text-muted small">
            <Badge pill bg="primary" className="me-2">T{adversary.tier}</Badge>
            {adversary.type}
        </div>
      </div>
      <Button variant="outline-danger" size="sm" onClick={() => onRemove(index)}>Remove</Button>
    </ListGroup.Item>
  );
}

export default EncounterAdversary;
