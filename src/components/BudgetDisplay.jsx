import React from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProgressBar from "react-bootstrap/ProgressBar";

function BudgetDisplay({ budget, partyTier }) {
  const remainingColor = budget.remaining < 0 ? "text-danger" : "text-success";
  const percentage = Math.min((budget.spent / budget.total) * 100, 100);
  const progressVariant =
    percentage > 100 ? "danger" : percentage > 80 ? "warning" : "primary";

  return (
    <Card bg="secondary" text="light" className="shadow-lg">
      <Card.Header as="h5">
        <i className="bi bi-bar-chart-fill me-2"></i>
        Battle Budget
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <ProgressBar
            now={percentage}
            variant={progressVariant}
            style={{ height: "20px" }}
            label={`${Math.round(percentage)}%`}
          />
        </div>
        <Row className="text-center g-3">
          <Col xs={4}>
            <div className="display-6 fw-bold text-primary">{budget.total}</div>
            <div className="text-secondary small fw-semibold">Total Budget</div>
          </Col>
          <Col xs={4}>
            <div className="display-6 fw-bold text-warning">{budget.spent}</div>
            <div className="text-secondary small fw-semibold">Spent</div>
          </Col>
          <Col xs={4}>
            <div className={`display-6 fw-bold ${remainingColor}`}>
              {budget.remaining}
            </div>
            <div className="text-secondary small fw-semibold">Remaining</div>
          </Col>
        </Row>
        <div className="text-center mt-3 pt-3 border-top border-secondary">
          <span className="text-secondary">Party Tier: </span>
          <span className="badge bg-primary fs-6 ms-2">Tier {partyTier}</span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default BudgetDisplay;
