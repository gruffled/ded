import React, { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Pagination from "react-bootstrap/Pagination";
import AdversaryCard from "./AdversaryCard";
import { SORT_OPTIONS } from "../constants";

const RESULTS_PER_PAGE = 20;

function AdversaryLibrary({
  adversaries,
  partyTier,
  onAdd,
  onShowDetails,
  searchTerm,
  setSearchTerm,
  filterByTier,
  setFilterByTier,
  adversaryType,
  setAdversaryType,
  adversaryTypes,
  sortBy,
  setSortBy,
  isLoading,
  error,
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(adversaries.length / RESULTS_PER_PAGE));
  const visibleAdversaries = useMemo(() => {
    const start = (page - 1) * RESULTS_PER_PAGE;
    return adversaries.slice(start, start + RESULTS_PER_PAGE);
  }, [adversaries, page]);

  useEffect(() => {
    setPage(1);
  }, [adversaries, searchTerm, filterByTier, sortBy]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const firstResult = adversaries.length === 0 ? 0 : (page - 1) * RESULTS_PER_PAGE + 1;
  const lastResult = Math.min(page * RESULTS_PER_PAGE, adversaries.length);

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
            <Form.Label className="small text-secondary">Adversary type</Form.Label>
            <Form.Select
              value={adversaryType}
              onChange={(e) => setAdversaryType(e.target.value)}
              size="sm"
              aria-label="Adversary type"
              className="mb-3"
            >
              <option value="all">All types</option>
              {adversaryTypes.map((type) => (
                <option value={type.toLowerCase()} key={type}>{type}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small text-secondary">Sort by</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="sm"
            >
              <option value={SORT_OPTIONS.NAME}>Name (A-Z)</option>
              <option value={SORT_OPTIONS.TIER}>Tier</option>
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
        <div className="flex-grow-1">
          {isLoading && <p className="text-center">Loading adversaries...</p>}
          {error && <p className="text-center text-danger">{error}</p>}
          {!isLoading && !error && (
            <>
              <div className="small text-secondary mb-2" aria-live="polite">
                {adversaries.length === 0
                  ? "No adversaries match your filters."
                  : `Showing ${firstResult}–${lastResult} of ${adversaries.length}`}
              </div>
              <ListGroup variant="flush">
                {visibleAdversaries.map((adv) => (
                  <AdversaryCard
                    key={`${adv.name}-${adv.tier}`}
                    adversary={adv}
                    partyTier={partyTier}
                    onAdd={onAdd}
                    onShowDetails={onShowDetails}
                  />
                ))}
              </ListGroup>
              {adversaries.length > RESULTS_PER_PAGE && (
                <Pagination className="justify-content-center mt-3 mb-0" aria-label="Adversary pages">
                  <Pagination.Prev
                    disabled={page === 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  />
                  <Pagination.Item active aria-label={`Page ${page} of ${pageCount}`}>
                    Page {page} of {pageCount}
                  </Pagination.Item>
                  <Pagination.Next
                    disabled={page === pageCount}
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  />
                </Pagination>
              )}
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default AdversaryLibrary;
