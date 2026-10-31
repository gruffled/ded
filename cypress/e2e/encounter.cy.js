const openEncounterBuilder = () => {
  cy.visit("/");
  cy.get('[aria-label="Application mode"] button').contains("Encounter Builder").click();
  cy.contains(".card-header", "Adversary Library").should("be.visible");
};

const spent = () => cy.contains("Spent").prev();

describe("Encounter builder", () => {
  beforeEach(openEncounterBuilder);

  it("spends Battle Points as adversaries are added and clears them", () => {
    spent().should("have.text", "0");
    cy.get('input[type="search"]').first().type("HEAD GUARD");
    cy.contains(".list-group-item", "HEAD GUARD").contains("button", "Add").click();
    spent().should("not.have.text", "0");
    cy.contains(".card", "Current Encounter").should("contain", "HEAD GUARD");

    cy.contains("button", "Clear All").click();
    spent().should("have.text", "0");
  });

  it("shows an adversary's details and closes them", () => {
    cy.get('input[type="search"]').first().type("HEAD GUARD");
    cy.get('[aria-label="Details for HEAD GUARD"]').click();
    cy.get('[role="dialog"]').should("be.visible").and("contain", "HEAD GUARD");
    cy.get('[role="dialog"] .btn-close').click();
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("recalculates the budget from the party size", () => {
    cy.contains("Total Budget").prev().invoke("text").then((before) => {
      cy.get("#party-size").clear().type("6");
      cy.contains("Total Budget").prev().invoke("text").should((after) => {
        expect(Number(after)).to.be.greaterThan(Number(before));
      });
    });
  });

  it("chooses an environment as scene context", () => {
    cy.contains("button", "Environments").click();
    cy.contains(".card-header", "Environment Library").should("be.visible");
    cy.get(".list-group-item").first().contains("button", "Use").click();
    cy.contains("No Battle Point cost").should("be.visible");
    cy.contains("button", "Clear").click();
    cy.contains("No Battle Point cost").should("not.exist");
  });
});
