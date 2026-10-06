import React from "react";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

function AdversaryModal({ adversary, onClose }) {
  if (!adversary) return null;

  const formatContent = (content) => {
    if (content === null || content === undefined) return "N/A";
    if (Array.isArray(content)) return content.join(", ");
    if (typeof content === "object") {
      return Object.entries(content)
        .map(([key, value]) => `${key} ${value}`)
        .join(", ");
    }
    return content;
  };

  const allFeatures = adversary.features ?? [];
  const experiences = Array.isArray(adversary.experience)
    ? adversary.experience
    : adversary.experience
    ? [adversary.experience]
    : [];
  const formatThreshold = (value) =>
    value === null || value === undefined ? "—" : value;

  return (
    <Modal show={!!adversary} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-light border-secondary">
        <Modal.Title>{adversary.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="modal-gradient text-light"
        style={{
          background: "linear-gradient(135deg, #2a3886ff 0%, #000218ff 100%)",
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-3">
          <Badge pill bg="primary">
            Tier {adversary.tier}
          </Badge>
          <span className="fw-bold">{adversary.type}</span>
        </div>
        <div className="mb-2">
          <strong>Description:</strong>
          <p className="fst-italic mb-0">{adversary.description}</p>
        </div>
        <div className="mb-2">
          <strong>Motives & Tactics:</strong>
          <div className="ms-3">
            {adversary.motives && <div>{adversary.motives}</div>}
          </div>
        </div>
        <ListGroup horizontal className="text-center my-3">
          <ListGroup.Item className="bg-secondary text-light">
            <strong>Difficulty</strong>
            <br />
            {formatContent(adversary.difficulty)}
          </ListGroup.Item>
          <ListGroup.Item className="bg-secondary text-light">
            <strong>Thresholds</strong>
            <br />
            {adversary.thresholds
              ? `${formatThreshold(adversary.thresholds.major)} / ${formatThreshold(
                  adversary.thresholds.severe
                )}`
              : "N/A"}
          </ListGroup.Item>
          <ListGroup.Item className="bg-secondary text-light">
            <strong>HP</strong>
            <br />
            {formatContent(adversary.hp)}
          </ListGroup.Item>
          <ListGroup.Item className="bg-secondary text-light">
            <strong>Stress</strong>
            <br />
            {formatContent(adversary.stress)}
          </ListGroup.Item>
          <ListGroup.Item className="bg-secondary text-light">
            <strong>ATK Modifier</strong>
            <br />
            {formatContent(adversary.attack_modifier)}
          </ListGroup.Item>
        </ListGroup>
        <div className="mb-2">
          <strong>Standard Attack</strong>
          <div className="ms-3">
            {adversary.standard_attack?.name && (
              <div>Name: {adversary.standard_attack.name}</div>
            )}
            {adversary.standard_attack?.range && (
              <div>Range: {adversary.standard_attack.range}</div>
            )}
            {adversary.standard_attack?.damage && (
              <div>Damage: {adversary.standard_attack.damage}</div>
            )}
          </div>
        </div>
        {experiences.length > 0 && (
          <div>
            <strong>Experience: </strong>
            <span className="mb-2">
              {experiences.map((experience, index) => (
                <React.Fragment key={`${experience.name}-${index}`}>
                  {index > 0 && ", "}
                  {experience.name}
                  {experience.modifier !== undefined &&
                    ` (+${experience.modifier})`}
                </React.Fragment>
              ))}
            </span>
          </div>
        )}
        {adversary.creatures_per_hp && (
          <div className="mb-2">
            <strong>Horde Size: </strong>
            {adversary.creatures_per_hp} creature(s) per HP
          </div>
        )}
        {allFeatures.length > 0 && (
          <>
            <h5 className="mt-4">Features</h5>
            <ListGroup variant="flush">
              {allFeatures.map((feature) => (
                <ListGroup.Item
                  key={`${feature.name}-${feature.type}`}
                  className="bg-dark text-light border-secondary"
                  style={{
                    background: "linear-gradient(135deg, #0d1857ff 0%, #000218ff 100%)",
                  }}
                >
                  <div className="fw-bold">
                    {feature.name}{" "}
                    <Badge
                      bg={
                        feature.type === "Action"
                          ? "primary"
                          : feature.type === "Reaction"
                          ? "danger"
                          : feature.type === "Passive"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {feature.type}
                    </Badge>
                  </div>
                    <small>{feature.description}</small>
                    {feature.costs && (
                      <div className="small text-warning mt-1">
                        Cost: {feature.costs.fear ? `${feature.costs.fear} Fear` : ""}
                        {feature.costs.fear && feature.costs.stress ? " + " : ""}
                        {feature.costs.stress
                          ? `${feature.costs.stress} Stress`
                          : ""}
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

export default AdversaryModal;
