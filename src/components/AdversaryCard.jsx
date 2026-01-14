import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function AdversaryCard({ adversary, partyTier, onAdd, onShowDetails }) {
  const tierDiff = adversary.tier - partyTier;
  let variant;
  if (tierDiff > 0) {
    variant = "danger"; // Above party tier
  } else if (tierDiff < 0) {
    variant = "warning"; // Below party tier
  } else {
    variant = "primary"; // At party tier
  }

  const adjustedBP =
    adversary.tier < partyTier
      ? Math.max(0, adversary.battle_points - 1)
      : adversary.battle_points;

  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center bg-dark text-light border-secondary">
      <div
        onClick={() => onShowDetails(adversary)}
        style={{ cursor: "pointer", width: "100%" }}
      >
        <span className="fw-bold">{adversary.name}</span>
        <div className="text-secondary small opacity-75">
          <Badge pill bg={variant} className="me-2">
            T{adversary.tier}
          </Badge>
          {adversary.type}
          <span className="mx-2">|</span>
          HP: {adversary.hp}
          <span className="mx-2">|</span>
          BP: {adjustedBP}{" "}
          {adjustedBP !== adversary.battle_points &&
            `(${adversary.battle_points})`}
        </div>
      </div>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => onAdd(adversary)}
      >
        Add
      </Button>
    </ListGroup.Item>
  );
}

export default AdversaryCard;
