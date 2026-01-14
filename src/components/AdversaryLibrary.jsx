import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import AdversaryCard from "./AdversaryCard";

function AdversaryLibrary({
  adversaries,
  partyTier,
  onAdd,
  onShowDetails,
  searchTerm,
  setSearchTerm,
  filterByTier,
  setFilterByTier,
  sortBy,
  setSortBy,
  isLoading,
  error,
}) {
  return (
    <Card
      bg="secondary"
      text="light"
      className="h-100 d-flex flex-column shadow-lg border-start border-4 border-info"
    >
      <Card.Header as="h5" className="d-flex align-items-center">
        <span className="me-2">📚</span>
        Adversary Library
        <span className="ms-auto badge bg-info text-dark">
          {adversaries.length}
        </span>
      </Card.Header>
      <Card.Body className="d-flex flex-column">
        <Form>
          <Form.Control
            type="search"
            placeholder="Search by name, type, or tier..."
            className="mb-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Form.Group className="mb-3">
            <Form.Label className="small text-secondary">Sort by</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="sm"
            >
              <option value="name">Name (A-Z)</option>
              <option value="tier">Tier</option>
            </Form.Select>
          </Form.Group>
          <Form.Check
            type="switch"
            id="tier-filter"
            label="Show Relevant Tiers Only (Party Tier ±1)"
            checked={filterByTier}
            onChange={(e) => setFilterByTier(e.target.checked)}
            className="mb-3"
          />
        </Form>
        <div className="overflow-auto flex-grow-1">
          {isLoading && <p className="text-center">Loading adversaries...</p>}
          {error && <p className="text-center text-danger">{error}</p>}
          {!isLoading && !error && (
            <ListGroup variant="flush">
              {adversaries.map((adv) => (
                <AdversaryCard
                  key={adv.name}
                  adversary={adv}
                  partyTier={partyTier}
                  onAdd={onAdd}
                  onShowDetails={onShowDetails}
                />
              ))}
            </ListGroup>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default AdversaryLibrary;
