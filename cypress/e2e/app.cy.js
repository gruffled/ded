describe("Daggerheart Designer", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("opens on the character builder", () => {
    cy.contains("h2", "Character Builder").should("be.visible");
    cy.get('[aria-label="Application mode"] button')
      .first()
      .should("contain", "Character Builder");
    cy.get('[aria-label="Application mode"] button')
      .last()
      .should("contain", "Encounter Builder");
  });

  it("saves a character draft from the builder", () => {
    cy.get("input:visible").first().type("Cypress Hero");
    cy.get("select").eq(0).select("bard");
    cy.get("select").eq(1).select("troubadour");
    cy.contains("button", "Save").click();
    cy.contains("Character saved in this browser.").should("be.visible");
  });

  it("filters and pages adversaries by type", () => {
    cy.get('[aria-label="Application mode"] button')
      .contains("Encounter Builder")
      .click();
    cy.contains(".card-header", "Adversary Library").should("be.visible");

    cy.get('[aria-label="Adversary type"]').select("leader");
    cy.contains("Page 1 of 2").should("be.visible");
    cy.contains("HEAD GUARD").should("be.visible");
    cy.get("ul.pagination").contains("Next").click();
    cy.contains("Page 2 of 2").should("be.visible");

    cy.get('[aria-label="Adversary type"]').select("minion");
    cy.contains("Showing 1–20 of 28").should("be.visible");
    cy.contains("Page 1 of 2").should("be.visible");
  });
});
