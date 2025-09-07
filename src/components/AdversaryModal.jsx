import React from "react";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

function AdversaryModal({ adversary, onClose }) {
  // Debug logs to inspect problematic values
  if (adversary && adversary.thresholds) {
    console.log("adversary.thresholds:", adversary.thresholds);
    console.log("adversary.thresholds.major:", adversary.thresholds.major);
    console.log("adversary.thresholds.severe:", adversary.thresholds.severe);
  }
  // Helper to guarantee only strings/numbers are rendered
  const safeRender = (value) => {
    if (typeof value === "string" || typeof value === "number") return value;
    if (value === null || value === undefined) return "N/A";
    return JSON.stringify(value);
  };
  if (!adversary) return null;

  // Helper to format potentially complex data fields
  const formatContent = (content) => {
    if (Array.isArray(content)) return content.join(", ");
    if (typeof content === "object" && content !== null) {
      if (content.name && content.range && content.damage) {
        return `${content.name}: ${content.range} ${content.damage}`;
      }
      return Object.entries(content)
        .map(([key, value]) => `${key} ${value}`)
        .join(", ");
    }
    return content || "N/A";
  };

  let allFeatures = [];
  if (Array.isArray(adversary.features)) {
    allFeatures = adversary.features;
  } else {
    allFeatures = [
      ...(adversary.features?.actions || []).map((f) => ({
        ...f,
        type: "Action",
      })),
      ...(adversary.features?.reactions || []).map((f) => ({
        ...f,
        type: "Reaction",
      })),
      ...(adversary.features?.passives || []).map((f) => ({
        ...f,
        type: "Passive",
      })),
      ...(adversary.fear_features || []).map((f) => ({
        ...f,
        type: "Fear Feature",
      })),
    ];
  }

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
            {adversary.thresholds &&
            typeof adversary.thresholds === "object" &&
            adversary.thresholds !== null
              ? `${safeRender(
                  formatContent(adversary.thresholds.major)
                )} / ${safeRender(formatContent(adversary.thresholds.severe))}`
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
        {adversary.experience && (
          <div>
            <strong>Experiences:</strong>
            {Array.isArray(adversary.experience) ? (
              <ul className="mb-2">
                {adversary.experience.map((exp, idx) => (
                  <li key={idx}>
                    {typeof exp === "object" && exp !== null
                      ? `${exp.name}${
                          exp.modifier !== undefined
                            ? ` (+${exp.modifier})`
                            : ""
                        }`
                      : exp}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="mb-2 d-block">
                {typeof adversary.experience === "object" &&
                adversary.experience !== null
                  ? `${adversary.experience.name}${
                      adversary.experience.modifier !== undefined
                        ? ` (+${adversary.experience.modifier})`
                        : ""
                    }`
                  : adversary.experience}
              </span>
            )}
          </div>
        )}
        {allFeatures.length > 0 && (
          <>
            <h5 className="mt-4">Features</h5>
            <ListGroup variant="flush">
              {allFeatures.map((feature, index) => (
                <ListGroup.Item
                  key={index}
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
