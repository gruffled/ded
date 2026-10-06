import React, { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

function EnvironmentLibrary({
  environments,
  activeEnvironment,
  onUse,
  onShowDetails,
  isLoading,
  error,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tier, setTier] = useState("all");

  const filteredEnvironments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return environments
      .filter((environment) => {
        const matchesTier = tier === "all" || environment.tier === Number(tier);
        const searchable = [
          environment.name,
          environment.type,
          environment.description,
          environment.impulses,
          environment.potential_adversaries,
        ]
          .join(" ")
          .toLowerCase();
        return matchesTier && (!query || searchable.includes(query));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [environments, searchTerm, tier]);

  return (
    <Card
      bg="secondary"
      text="light"
      className="h-100 d-flex flex-column shadow-lg border-start border-4 border-success"
    >
      <Card.Header as="h5" className="d-flex align-items-center">
        <span className="me-2">🌍</span>
        Environment Library
        <span className="ms-auto badge bg-success text-dark">
          {filteredEnvironments.length}/{environments.length}
        </span>
      </Card.Header>
      <Card.Body className="d-flex flex-column">
        <Form>
          <Form.Control
            type="search"
            placeholder="Search environments..."
            className="mb-3"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Form.Select
            aria-label="Filter environments by tier"
            value={tier}
            onChange={(event) => setTier(event.target.value)}
            size="sm"
            className="mb-3"
          >
            <option value="all">All tiers</option>
            {[1, 2, 3, 4].map((value) => (
              <option key={value} value={value}>
                Tier {value}
              </option>
            ))}
          </Form.Select>
        </Form>
        <div className="overflow-auto flex-grow-1">
          {isLoading && <p className="text-center">Loading environments...</p>}
          {error && <p className="text-center text-danger">{error}</p>}
          {!isLoading && !error && (
            <ListGroup variant="flush">
              {filteredEnvironments.map((environment) => (
                <ListGroup.Item
                  key={`${environment.name}-${environment.tier}`}
                  className="d-flex justify-content-between align-items-center bg-dark text-light border-secondary"
                >
                  <div>
                    <div className="fw-bold">{environment.name}</div>
                    <div className="text-secondary small opacity-75">
                      <Badge pill bg="success" className="me-2">
                        T{environment.tier}
                      </Badge>
                      {environment.type} · Difficulty {environment.difficulty}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant={
                        activeEnvironment?.name === environment.name &&
                        activeEnvironment?.tier === environment.tier
                          ? "success"
                          : "outline-success"
                      }
                      size="sm"
                      onClick={() => onUse(environment)}
                    >
                      {activeEnvironment?.name === environment.name &&
                      activeEnvironment?.tier === environment.tier
                        ? "Active"
                        : "Use"}
                    </Button>
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => onShowDetails(environment)}
                    >
                      Details
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default EnvironmentLibrary;
