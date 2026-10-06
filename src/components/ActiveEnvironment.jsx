import React from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

function ActiveEnvironment({
  environment,
  partyTier,
  onShowDetails,
  onReplace,
  onClear,
}) {
  if (!environment) {
    return (
      <Card
        bg="secondary"
        text="light"
        className="shadow-lg border-start border-4 border-success"
      >
        <Card.Body className="d-flex align-items-center justify-content-between gap-3">
          <div>
            <div className="fw-bold">🌍 Active Environment</div>
            <div className="small text-secondary">
              Add an environment to give this scene context. It does not spend Battle Points.
            </div>
          </div>
          <Button variant="outline-success" size="sm" onClick={onReplace}>
            Choose
          </Button>
        </Card.Body>
      </Card>
    );
  }

  const tierDifference = environment.tier - partyTier;
  const tierMessage =
    tierDifference === 0
      ? "Party tier"
      : tierDifference > 0
      ? "Above party tier"
      : "Below party tier";

  return (
    <Card
      bg="secondary"
      text="light"
      className="shadow-lg border-start border-4 border-success"
    >
      <Card.Header className="d-flex align-items-center justify-content-between">
        <span className="fw-bold">🌍 Active Environment</span>
        <Badge pill bg="success">No Battle Point cost</Badge>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <h5 className="mb-1">{environment.name}</h5>
            <div className="small text-secondary">
              <Badge pill bg="success" className="me-2">T{environment.tier}</Badge>
              {environment.type} · Difficulty {environment.difficulty} · {tierMessage}
            </div>
          </div>
          <div className="d-flex gap-2 flex-shrink-0">
            <Button variant="outline-light" size="sm" onClick={() => onShowDetails(environment)}>
              Details
            </Button>
            <Button variant="outline-success" size="sm" onClick={onReplace}>
              Replace
            </Button>
            <Button variant="outline-danger" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
        <p className="fst-italic small mt-3 mb-2">{environment.description}</p>
        <div className="small mb-1"><strong>Impulses:</strong> {environment.impulses}</div>
        <div className="small"><strong>Potential adversaries:</strong> {environment.potential_adversaries}</div>
      </Card.Body>
    </Card>
  );
}

export default ActiveEnvironment;
