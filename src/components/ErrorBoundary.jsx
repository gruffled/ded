import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="text-light min-vh-100 d-flex flex-column align-items-center justify-content-center text-center">
          <h2 className="mb-3">Something went wrong</h2>
          <p className="text-secondary mb-4">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <Button
            variant="primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
