import React, { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

// Import custom components
import Controls from "./Controls";
import BudgetDisplay from "./BudgetDisplay";
import AdversaryLibrary from "./AdversaryLibrary";
import EnvironmentLibrary from "./EnvironmentLibrary";
import ActiveEnvironment from "./ActiveEnvironment";
import EncounterList from "./EncounterList";
import AdversaryModal from "./AdversaryModal";
import EnvironmentModal from "./EnvironmentModal";
import Footer from "./Footer";
import CharacterBuilder from "./CharacterBuilder";

// Import custom hooks and utilities
import { useAdversaryData, useEnvironmentData, useEncounter } from "../hooks";
import { getTier, calculateBudget, filterAndSortAdversaries } from "../utils";
import { ADJUSTMENT_VALUES, SORT_OPTIONS } from "../constants";

function App() {
  // --- Data Loading ---
  const { allAdversaries, isLoading, error } = useAdversaryData();
  const {
    allEnvironments,
    isLoading: environmentsLoading,
    error: environmentsError,
  } = useEnvironmentData();

  // --- Encounter Management ---
  const { encounter, addAdversary, removeAdversary, clearEncounter } =
    useEncounter();

  // --- Party Configuration State ---
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(1);
  const [adjustments, setAdjustments] = useState(ADJUSTMENT_VALUES.NONE);

  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByTier, setFilterByTier] = useState(false);
  const [adversaryType, setAdversaryType] = useState("all");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NAME);
  const [selectedAdversary, setSelectedAdversary] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [activeEnvironment, setActiveEnvironment] = useState(null);
  const [libraryMode, setLibraryMode] = useState("adversaries");
  const [appMode, setAppMode] = useState("character");

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
        sortBy,
        adversaryType
      ),
    [allAdversaries, searchTerm, filterByTier, partyTier, sortBy, adversaryType]
  );
  const adversaryTypes = useMemo(
    () => [...new Set(allAdversaries.map((adversary) => adversary.type))].sort((a, b) => a.localeCompare(b)),
    [allAdversaries]
  );
  // --- Render ---
  return (
    <Container fluid className="text-light min-vh-100 p-4">
      <header className="mb-5 text-center">
        <h1 className="display-2 fw-bold mb-2 app-title">
          ⚔️ Daggerheart Designer
        </h1>
        <p className="lead text-light opacity-75">
          {appMode === "encounter"
            ? "Build balanced encounters for your Daggerheart adventures"
            : "Create and manage Daggerheart player characters"}
        </p>
      </header>
      <ButtonGroup className="mb-4 w-100" aria-label="Application mode">
        <Button
          variant={appMode === "character" ? "warning" : "outline-warning"}
          onClick={() => setAppMode("character")}
        >
          Character Builder
        </Button>
        <Button
          variant={appMode === "encounter" ? "primary" : "outline-primary"}
          onClick={() => setAppMode("encounter")}
        >
          Encounter Builder
        </Button>
      </ButtonGroup>
      {appMode === "character" ? <CharacterBuilder /> : <Row>
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
            <ActiveEnvironment
              environment={activeEnvironment}
              partyTier={partyTier}
              onShowDetails={setSelectedEnvironment}
              onReplace={() => setLibraryMode("environments")}
              onClear={() => setActiveEnvironment(null)}
            />
            <EncounterList
              encounter={encounter}
              onRemove={removeAdversary}
              onClear={clearEncounter}
            />
          </div>
        </Col>
        <Col lg={8}>
          <ButtonGroup className="mb-3 w-100" aria-label="Library type">
            <Button
              variant={libraryMode === "adversaries" ? "primary" : "outline-primary"}
              onClick={() => setLibraryMode("adversaries")}
            >
              Adversaries
            </Button>
            <Button
              variant={libraryMode === "environments" ? "success" : "outline-success"}
              onClick={() => setLibraryMode("environments")}
            >
              Environments
            </Button>
          </ButtonGroup>
          {libraryMode === "adversaries" ? (
            <AdversaryLibrary
              adversaries={filteredAdversaries}
              partyTier={partyTier}
              onAdd={addAdversary}
              onShowDetails={setSelectedAdversary}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterByTier={filterByTier}
              setFilterByTier={setFilterByTier}
              adversaryType={adversaryType}
              setAdversaryType={setAdversaryType}
              adversaryTypes={adversaryTypes}
              sortBy={sortBy}
              setSortBy={setSortBy}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <EnvironmentLibrary
              environments={allEnvironments}
              activeEnvironment={activeEnvironment}
              onUse={(environment) => setActiveEnvironment(environment)}
              onShowDetails={setSelectedEnvironment}
              isLoading={environmentsLoading}
              error={environmentsError}
            />
          )}
        </Col>
      </Row>}
      <AdversaryModal
        adversary={selectedAdversary}
        onClose={() => setSelectedAdversary(null)}
      />
      <EnvironmentModal
        environment={selectedEnvironment}
        onClose={() => setSelectedEnvironment(null)}
      />
      <Footer />
    </Container>
  );
}

export default App;
