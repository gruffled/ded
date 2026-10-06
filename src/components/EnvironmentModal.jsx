import React from "react";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

function EnvironmentModal({ environment, onClose }) {
  if (!environment) return null;

  return (
    <Modal show={!!environment} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-light border-secondary">
        <Modal.Title>{environment.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-light" style={{ background: "linear-gradient(135deg, #28613d 0%, #000218 100%)" }}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <Badge pill bg="success">Tier {environment.tier}</Badge>
          <span className="fw-bold">{environment.type}</span>
          <span className="ms-auto">Difficulty: {environment.difficulty}</span>
        </div>
        <p className="fst-italic">{environment.description}</p>
        <div className="mb-3">
          <strong>Impulses:</strong> {environment.impulses}
        </div>
        <div className="mb-3">
          <strong>Potential Adversaries:</strong> {environment.potential_adversaries}
        </div>
        {environment.features?.length > 0 && (
          <>
            <h5 className="mt-4">Features</h5>
            <ListGroup variant="flush">
              {environment.features.map((feature, index) => (
                <ListGroup.Item
                  key={`${feature.name}-${index}`}
                  className="bg-dark text-light border-secondary"
                >
                  <div className="fw-bold">
                    {feature.name} <Badge bg="secondary">{feature.type}</Badge>
                  </div>
                  <small>{feature.description}</small>
                  {feature.costs && (
                    <div className="small text-warning mt-1">
                      Cost: {feature.costs.fear ? `${feature.costs.fear} Fear` : ""}
                      {feature.costs.fear && feature.costs.stress ? " + " : ""}
                      {feature.costs.stress ? `${feature.costs.stress} Stress` : ""}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default EnvironmentModal;
