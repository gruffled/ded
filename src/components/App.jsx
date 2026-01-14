import React, { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

// Import custom components
import Controls from "./Controls";
import BudgetDisplay from "./BudgetDisplay";
import AdversaryLibrary from "./AdversaryLibrary";
import EncounterList from "./EncounterList";
import AdversaryModal from "./AdversaryModal";
import Footer from "./Footer";

// Import custom hooks and utilities
import { useAdversaryData, useEncounter } from "../hooks";
import { getTier, calculateBudget, filterAndSortAdversaries } from "../utils";

function App() {
  // --- Data Loading ---
  const { allAdversaries, isLoading, error } = useAdversaryData();

  // --- Encounter Management ---
  const { encounter, addAdversary, removeAdversary, clearEncounter } =
    useEncounter();

  // --- Party Configuration State ---
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(1);
  const [adjustments, setAdjustments] = useState("none");

  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByTier, setFilterByTier] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [selectedAdversary, setSelectedAdversary] = useState(null);

  // --- Computed Values ---
  const partyTier = useMemo(() => getTier(partyLevel), [partyLevel]);

  const budget = useMemo(
    () => calculateBudget(encounter, partySize, partyTier, adjustments),
    [encounter, partySize, partyTier, adjustments]
  );

  const filteredAdversaries = useMemo(
    () =>
      filterAndSortAdversaries(
        allAdversaries,
        searchTerm,
        filterByTier,
        partyTier,
        sortBy
      ),
    [allAdversaries, searchTerm, filterByTier, partyTier, sortBy]
  );
  // --- Render ---
  return (
    <Container fluid className="text-light min-vh-100 p-4">
      <header className="mb-5 text-center">
        <h1 className="display-2 fw-bold mb-2 app-title">
          ⚔️ Daggerheart Encounter Designer
        </h1>
        <p className="lead text-light opacity-75">
          Build balanced encounters for your Daggerheart adventures
        </p>
      </header>
      <Row>
        <Col lg={4}>
          <div className="d-flex flex-column gap-4">
            <Controls
              partySize={partySize}
              setPartySize={setPartySize}
              partyLevel={partyLevel}
              setPartyLevel={setPartyLevel}
              adjustments={adjustments}
              setAdjustments={setAdjustments}
            />
            <BudgetDisplay budget={budget} partyTier={partyTier} />
            <EncounterList
              encounter={encounter}
              onRemove={removeAdversary}
              onClear={clearEncounter}
            />
          </div>
        </Col>
        <Col lg={8}>
          <AdversaryLibrary
            adversaries={filteredAdversaries}
            partyTier={partyTier}
            onAdd={addAdversary}
            onShowDetails={setSelectedAdversary}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterByTier={filterByTier}
            setFilterByTier={setFilterByTier}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isLoading={isLoading}
            error={error}
          />
        </Col>
      </Row>
      <AdversaryModal
        adversary={selectedAdversary}
        onClose={() => setSelectedAdversary(null)}
      />
      <Footer />
    </Container>
  );
}

export default App;
