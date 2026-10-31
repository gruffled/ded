const startCharacter = (name = "Cypress Hero") => {
  cy.get("#character-name").type(name);
  cy.get("#character-class").select("bard");
};

describe("Character builder", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains("h2", "Character Builder").should("be.visible");
  });

  it("keeps the draft across a page reload", () => {
    startCharacter("Persistent Pat");
    cy.reload();
    cy.get("#character-name").should("have.value", "Persistent Pat");
    cy.get("#character-class").should("have.value", "bard");
  });

  it("levels a character from 1 to 2 and shows it on the sheet", () => {
    startCharacter("Level Tester");
    cy.contains("button", "5. Level Up").click();
    cy.contains("button", "Level up to 2").click();

    cy.contains("button", "Permanently gain one Hit Point slot").click();
    cy.contains("button", "Permanently gain one Stress slot").click();
    cy.contains("button", "Confirm level 2").should("be.disabled");

    cy.get('[aria-label="New Experience"]').type("Fixer");
    cy.get('[aria-label="New domain card"]').select(1);
    cy.contains("button", "Confirm level 2").should("not.be.disabled").click();

    cy.contains(".badge", "Level 2").should("be.visible");
    cy.contains(".character-sheet", "Fixer +2").should("be.visible");
    cy.contains("button", "Level up to 3").should("be.visible");
  });

  it("undoes a level-up", () => {
    startCharacter("Undo Una");
    cy.contains("button", "5. Level Up").click();
    cy.contains("button", "Level up to 2").click();
    cy.contains("button", "Permanently gain one Hit Point slot").click();
    cy.contains("button", "Permanently gain one Stress slot").click();
    cy.get('[aria-label="New Experience"]').type("Fixer");
    cy.get('[aria-label="New domain card"]').select(1);
    cy.contains("button", "Confirm level 2").click();

    cy.on("window:confirm", () => true);
    cy.contains("button", "Undo level 2").click();
    cy.contains(".badge", "Level 1").should("be.visible");
  });

  it("limits the advancement list to the character's tier", () => {
    startCharacter("Tier Tess");
    cy.contains("button", "5. Level Up").click();
    cy.contains("button", "Level up to 2").click();
    cy.contains("button", "Multiclass").should("be.disabled");
    cy.contains("button", "Increase your Proficiency").should("be.disabled");
    cy.contains("button", "Take an upgraded subclass card").should("be.disabled");
    cy.contains("button", "Permanently gain +1 to Evasion").should("not.be.disabled");
  });

  it("imports a character file", () => {
    const character = {
      format: "daggerheart-character",
      version: 1,
      character: { name: "Imported Ivy", classId: "wizard", subclassId: "school-of-knowledge" },
    };
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from(JSON.stringify(character)), fileName: "ivy.json", mimeType: "application/json" },
      { force: true }
    );
    cy.contains("Character imported.").should("be.visible");
    cy.get("#character-name").should("have.value", "Imported Ivy");
    cy.get("#character-class").should("have.value", "wizard");
  });

  it("rejects a file that is not a character", () => {
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from("{\"hello\": true}"), fileName: "nope.json", mimeType: "application/json" },
      { force: true }
    );
    cy.contains(".alert-danger", "not a supported Daggerheart character file").should("be.visible");
  });

  it("exports the character as a download", () => {
    startCharacter("Export Eve");
    cy.contains("button", "Export JSON").click();
    cy.contains("Character exported as JSON.").should("be.visible");
    cy.readFile("cypress/downloads/export-eve.json").then((file) => {
      expect(file.format).to.equal("daggerheart-character");
      expect(file.character.name).to.equal("Export Eve");
    });
  });

  it("opens the print dialog from the sheet", () => {
    cy.window().then((win) => cy.stub(win, "print").as("print"));
    cy.contains("button", "Print sheet").click();
    cy.get("@print").should("have.been.calledOnce");
  });

  it("works on a phone-sized screen without sideways scrolling", () => {
    cy.viewport(375, 800);
    startCharacter("Small Screen");
    cy.contains("button", "5. Level Up").click();
    cy.document().then((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth + 1);
    });
  });
});
