import React from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import AdversaryCard from './AdversaryCard';

function AdversaryLibrary({ 
    adversaries, 
    partyTier, 
    onAdd, 
    onShowDetails,
    searchTerm,
    setSearchTerm,
    filterByTier,
    setFilterByTier,
    isLoading,
    error 
}) {
    return (
        <Card bg="secondary" text="light" className="h-100 d-flex flex-column">
            <Card.Header as="h5">Adversary Library</Card.Header>
            <Card.Body className="d-flex flex-column">
                <Form>
                    <Form.Control
                        type="search"
                        placeholder="Search by name, type, or tier..."
                        className="mb-3"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Form.Check 
                        type="switch"
                        id="tier-filter"
                        label="Show Relevant Tiers Only (Party Tier ±1)"
                        checked={filterByTier}
                        onChange={e => setFilterByTier(e.target.checked)}
                        className="mb-3"
                    />
                </Form>
                <div className="overflow-auto flex-grow-1">
                    {isLoading && <p className="text-center">Loading adversaries...</p>}
                    {error && <p className="text-center text-danger">{error}</p>}
                    {!isLoading && !error && (
                         <ListGroup variant="flush">
                            {adversaries.map(adv => (
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
