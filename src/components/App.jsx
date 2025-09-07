import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Import our custom components
import Controls from './Controls';
import BudgetDisplay from './BudgetDisplay';
import AdversaryLibrary from './AdversaryLibrary';
import EncounterList from './EncounterList';
import AdversaryModal from './AdversaryModal';

// Helper function to calculate Daggerheart Tier from level
const getTier = (level) => {
    if (level <= 1) return 1;
    if (level <= 4) return 2;
    if (level <= 7) return 3;
    return 4;
};

function App() {
    // --- State Management ---
    const [allAdversaries, setAllAdversaries] = useState([]);
    const [encounter, setEncounter] = useState([]);
    const [partySize, setPartySize] = useState(4);
    const [partyLevel, setPartyLevel] = useState(1);
    const [adjustments, setAdjustments] = useState({ easy: false, hard: false, damage: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterByTier, setFilterByTier] = useState(false);
    const [selectedAdversary, setSelectedAdversary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchAdversaries = async () => {
            try {
                // Fetches adversaries.json from the public folder
                const response = await fetch('./adversaries.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAllAdversaries(data);
            } catch (e) {
                console.error("Failed to fetch adversary data:", e);
                setError("Could not load adversary data. Please make sure 'adversaries.json' is in the public directory.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdversaries();
    }, []);

    // --- Derived State & Calculations ---
    const partyTier = useMemo(() => getTier(partyLevel), [partyLevel]);

    const budget = useMemo(() => {
        let currentCost = 0;
        let soloCount = 0;
        let hasMajorType = false;
        const majorTypes = ['bruiser', 'horde', 'leader', 'solo'];

        encounter.forEach(adv => {
            const basePoints = adv.battle_points;
            let adjustedCost = basePoints;
            if (adv.tier < partyTier) {
                adjustedCost = Math.max(0, basePoints - 1);
            }
            currentCost += adjustedCost;
            if (adv.type.toLowerCase() === 'solo') soloCount++;
            if (majorTypes.includes(adv.type.toLowerCase())) hasMajorType = true;
        });

        const baseBudget = (3 * partySize) + 2;
        let manualAdjustment = 0;
        if (adjustments.easy) manualAdjustment -= 1;
        if (adjustments.hard) manualAdjustment += 2;
        if (adjustments.damage) manualAdjustment -= 2;

        let dynamicAdjustment = 0;
        if (soloCount >= 2) dynamicAdjustment -= 2;
        if (encounter.length > 0 && !hasMajorType) dynamicAdjustment += 1;
        
        const total = baseBudget + manualAdjustment + dynamicAdjustment;
        const remaining = total - currentCost;

        return { total, spent: currentCost, remaining };
    }, [encounter, partySize, partyTier, adjustments]);

    const filteredAdversaries = useMemo(() => {
        return allAdversaries.filter(adv => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = adv.name.toLowerCase().includes(searchTermLower) ||
                                  adv.type.toLowerCase().includes(searchTermLower) ||
                                  `tier ${adv.tier}`.includes(searchTermLower);

            const matchesTier = !filterByTier || Math.abs(adv.tier - partyTier) <= 1;
            
            return matchesSearch && matchesTier;
        });
    }, [allAdversaries, searchTerm, filterByTier, partyTier]);

    // --- Event Handlers ---
    const handleAddAdversary = useCallback((adversary) => {
        setEncounter(current => [...current, adversary]);
    }, []);

    const handleRemoveAdversary = useCallback((indexToRemove) => {
        setEncounter(current => current.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleClearEncounter = () => setEncounter([]);
    
    // --- Render ---
    return (
        <Container fluid className="bg-dark text-light min-vh-100 p-4">
            <header className="mb-4">
                <h1 className="display-4">Daggerheart Encounter Designer</h1>
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
                            onRemove={handleRemoveAdversary}
                            onClear={handleClearEncounter}
                        />
                    </div>
                </Col>
                <Col lg={8}>
                    <AdversaryLibrary
                        adversaries={filteredAdversaries}
                        partyTier={partyTier}
                        onAdd={handleAddAdversary}
                        onShowDetails={setSelectedAdversary}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterByTier={filterByTier}
                        setFilterByTier={setFilterByTier}
                        isLoading={isLoading}
                        error={error}
                    />
                </Col>
            </Row>
            <AdversaryModal
                adversary={selectedAdversary}
                onClose={() => setSelectedAdversary(null)}
            />
        </Container>
    );
}

export default App;
