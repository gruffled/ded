import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function BudgetDisplay({ budget, partyTier }) {
    const remainingColor = budget.remaining < 0 ? 'text-danger' : 'text-success';
    
    return (
        <Card bg="secondary" text="light">
            <Card.Header as="h5">Budget</Card.Header>
            <Card.Body className="text-center">
                <Row>
                    <Col>
                        <div className="display-6">{budget.total}</div>
                        <div className="text-muted">Total Budget</div>
                    </Col>
                    <Col>
                        <div className="display-6 text-primary">{budget.spent}</div>
                        <div className="text-muted">Spent</div>
                    </Col>
                    <Col>
                        <div className={`display-6 ${remainingColor}`}>{budget.remaining}</div>
                        <div className="text-muted">Remaining</div>
                    </Col>
                </Row>
                 <div className="text-center mt-3">
                    <span className="text-muted">Party Tier: <span className="fw-bold text-light">{partyTier}</span></span>
                </div>
            </Card.Body>
        </Card>
    );
}

export default BudgetDisplay;
