import React, { useMemo, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";
import {
  ANCESTRIES,
  ARMOR,
  CHARACTER_TRAITS,
  CLASSES,
  COMMUNITIES,
  LEVEL_ONE_DOMAIN_CARDS,
  PRIMARY_WEAPONS,
  SECONDARY_WEAPONS,
  STANDARD_INVENTORY,
  TRAIT_ARRAY,
} from "../characterData";
import { useCharacterBuilder, useSavedCharacters } from "../hooks";
import {
  getDerivedStats,
  getSelectedDomainCards,
  serializeCharacter,
  validateCharacter,
} from "../characterUtils";

const STEPS = ["Identity & Class", "Heritage & Traits", "Equipment & Cards", "Story & Review"];
const formatTraitScore = (score) => score === null || score === undefined ? "—" : score > 0 ? `+${score}` : `${score}`;

function SheetSigil() {
  return (
    <svg className="official-sheet-sigil" viewBox="0 0 64 64" role="presentation" aria-hidden="true">
      <path d="M32 4 38 19 54 10 45 26 60 32 45 38 54 54 38 45 32 60 26 45 10 54 19 38 4 32 19 26 10 10 26 19Z" />
      <circle cx="32" cy="32" r="9" />
      <path d="M32 23v18M23 32h18" />
    </svg>
  );
}

function PrintableCharacterSheet({ character, selectedClass, selectedSubclass, stats }) {
  const primaryWeapon = PRIMARY_WEAPONS.find((weapon) => weapon.id === character.primaryWeaponId);
  const secondaryWeapon = SECONDARY_WEAPONS.find((weapon) => weapon.id === character.secondaryWeaponId);
  const armor = ARMOR.find((item) => item.id === character.armorId);
  const ancestryItems = character.ancestryIds.map((id) => ANCESTRIES.find((item) => item.id === id)).filter(Boolean);
  const community = COMMUNITIES.find((item) => item.id === character.communityId);
  const featureSources = character.ancestryFeatureSources ?? [0, 1];
  const ancestryFeatures = ancestryItems.length === 1
    ? ancestryItems[0]?.features ?? []
    : [0, 1].map((featureIndex) => ancestryItems[featureSources[featureIndex]]?.features[featureIndex]).filter(Boolean);
  const domainCards = getSelectedDomainCards(character);
  const field = (label, value) => <div className="official-field"><span>{label}</span><strong>{value || "—"}</strong></div>;

  return (
    <div className="official-print-sheet">
      <section className="official-page official-character-page">
        <div className="official-sheet-heading">
          <SheetSigil />
          <div className="official-heading-copy"><span> DAGGERHEART · FIELD RECORD</span><strong>CHARACTER SHEET</strong></div>
          <div className="official-heading-meta"><span>LEVEL {character.level}</span><small>{selectedClass?.name || "UNASSIGNED"}</small></div>
        </div>
        <div className="official-identity-row">
          {field("Name", character.name)}
          {field("Heritage", ancestryItems.map((item) => item.name).join(" / "))}
          {field("Pronouns", character.pronouns)}
          {field("Class & Subclass", `${selectedClass?.name || "—"}${selectedSubclass ? ` · ${selectedSubclass.name}` : ""}`)}
        </div>
        <div className="official-profile-ribbon"><span>ADVENTURER PROFILE</span><strong>{selectedClass?.domains?.join("  ·  ") || "Choose a class to establish your domains"}</strong><em>{community?.name || "Community unchosen"}</em></div>

        <div className="official-top-grid">
          <div className="official-traits">
            <div className="official-section-label">TRAITS</div>
            <div className="official-trait-grid">{CHARACTER_TRAITS.map(({ id, name }) => <div className="official-trait" key={id}><div className="official-trait-name">{name.toUpperCase()} <b>{formatTraitScore(character.traits[id])}</b></div></div>)}</div>
          </div>
          <div className="official-stat-column">
            <div className="official-column-kicker">COMBAT PROFILE <span>LEVEL {character.level}</span></div>
            <div className="official-stat-grid">{[["Evasion", stats.evasion], ["Armor", stats.armorScore], ["Level", character.level], ["Proficiency", stats.proficiency]].map(([label, value]) => <div className="official-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
            <div className="official-track-grid">{[["Hope", 6], ["Stress", stats.stress], ["HP", stats.hitPoints], ["Active Armor", stats.armorScore]].map(([label, count]) => <div className="official-track" key={label}><span>{label}</span><div>{Array.from({ length: Math.min(count || 0, 10) }, (_, index) => <i key={index} />)}</div></div>)}</div>
            <div className="official-thresholds"><span>DAMAGE THRESHOLDS</span><strong>Minor {stats.majorThreshold - 1} · Major {stats.majorThreshold} · Severe {stats.severeThreshold}</strong></div>
          </div>
        </div>

        <div className="official-content-grid">
          <div>
            <div className="official-section-label">ACTIVE WEAPONS</div>
            {[primaryWeapon, secondaryWeapon].map((weapon, index) => <div className="official-weapon" key={index}><b>{index === 0 ? "PRIMARY" : "SECONDARY"}</b>{field("Name", weapon?.name)}<div className="official-inline-fields"><span>{weapon ? `${weapon.trait} · ${weapon.range}` : "—"}</span><span>{weapon ? `${weapon.die}${weapon.bonus ? `+${weapon.bonus}` : ""} ${weapon.damageType}` : "—"}</span></div>{weapon?.feature && <small>{weapon.feature}</small>}</div>)}
            <div className="official-section-label">ARMOR</div>
            <div className="official-box">{field("Name", armor?.name)}<div className="official-inline-fields"><span>Base Score {armor ? armor.baseScore : "—"}</span><span>Base Thresholds {armor ? `${armor.baseMajor}/${armor.baseSevere}` : "—"}</span></div>{armor?.feature && <small>{armor.feature}</small>}</div>
          </div>
          <div>
            <div className="official-section-label">INVENTORY</div>
            <div className="official-inventory">{[...character.inventory, character.potion, character.classItem].filter(Boolean).map((item, index) => <div key={`${item}-${index}`}><i />{item}</div>)}</div>
            <div className="official-section-label">EXPERIENCE</div>
            <div className="official-experiences">{character.experiences.map((experience, index) => <div key={index}><i />{experience.name || ""}<b>+{experience.modifier}</b></div>)}</div>
            <div className="official-section-label">DESCRIPTION</div>
            <div className="official-writing">{character.description || ""}</div>
          </div>
        </div>

        <div className="official-feature-strip"><div className="official-section-label">HOPE FEATURE</div><strong>{selectedClass?.hopeFeature?.name || "—"}</strong><span>{selectedClass?.hopeFeature?.description || ""}</span></div>
      </section>

      <section className="official-page official-guide-page">
        <div className="official-sheet-heading">
          <SheetSigil />
          <div className="official-heading-copy"><span>DAGGERHEART · CLASS ARCHIVE</span><strong>CHARACTER GUIDE</strong></div>
          <div className="official-heading-meta"><span>{selectedClass?.name?.toUpperCase() || "CHARACTER"}</span><small>{selectedClass?.domains?.join("  ·  ") || "DOMAINS UNASSIGNED"}</small></div>
        </div>
        <div className="official-guide-lede"><div><span>YOUR PATH</span><strong>{selectedSubclass?.name || "Subclass not chosen"}</strong></div><div><span>HERITAGE</span><strong>{ancestryItems.map((item) => item.name).join(" / ") || "Not chosen"}</strong></div><div><span>COMMUNITY</span><strong>{community?.name || "Not chosen"}</strong></div></div>
        <div className="official-guide-grid">
          <div>
            <div className="official-section-label">CLASS FEATURES</div>
            {selectedClass?.features?.map((item) => <div className="official-text-block" key={item.name}><strong>{item.name}</strong><span>{item.description}</span></div>)}
            <div className="official-section-label">SUBCLASS FOUNDATION</div>
            <div className="official-text-block"><strong>{selectedSubclass?.name || "—"}</strong><span>{selectedSubclass?.foundation?.description || ""}</span></div>
            <div className="official-section-label">HERITAGE</div>
            {ancestryFeatures.map((item) => <div className="official-text-block" key={item.name}><strong>{item.name}</strong><span>{item.description}</span></div>)}
            {community?.feature && <div className="official-text-block"><strong>{community.name}: {community.feature.name}</strong><span>{community.feature.description}</span></div>}
          </div>
          <div>
            <div className="official-section-label">DOMAIN CARDS</div>
            {domainCards.map((card) => <div className="official-text-block" key={card.id}><strong>{card.name} · {card.domain} · Recall {card.recallCost}</strong><span>{card.description}</span></div>)}
            <div className="official-section-label">BACKGROUND QUESTIONS</div>
            {selectedClass?.backgroundQuestions?.map((question) => <div className="official-prompt" key={question}>{question}</div>)}
            <div className="official-section-label">CONNECTIONS</div>
            {selectedClass?.connections?.map((question) => <div className="official-prompt" key={question}>{question}</div>)}
            <div className="official-section-label">CHARACTER NOTES</div>
            {character.backgroundAnswers.filter(Boolean).map((answer, index) => <div className="official-writing" key={index}>{answer}</div>)}
            {character.connections[0]?.text && <div className="official-writing">{character.connections[0].text}</div>}
          </div>
        </div>
        <div className="official-footer-note">Daggerheart character sheet · Print-ready reference generated from your character builder</div>
      </section>
    </div>
  );
}

function CharacterSheet({ character, selectedClass, selectedSubclass, stats, onPrint }) {
  const domainCards = getSelectedDomainCards(character);
  const primaryWeapon = PRIMARY_WEAPONS.find((weapon) => weapon.id === character.primaryWeaponId);
  const secondaryWeapon = SECONDARY_WEAPONS.find((weapon) => weapon.id === character.secondaryWeaponId);
  const armor = ARMOR.find((item) => item.id === character.armorId);
  const ancestryNames = character.ancestryIds
    .map((id) => ANCESTRIES.find((ancestry) => ancestry.id === id)?.name)
    .filter(Boolean);
  const selectedAncestries = character.ancestryIds
    .map((id) => ANCESTRIES.find((ancestry) => ancestry.id === id))
    .filter(Boolean);
  const featureSources = character.ancestryFeatureSources ?? [0, 1];
  const ancestryFeatures = selectedAncestries.length === 1
    ? selectedAncestries[0]?.features ?? []
    : [0, 1].map((featureIndex) => selectedAncestries[featureSources[featureIndex]]?.features[featureIndex]).filter(Boolean);
  const community = COMMUNITIES.find((item) => item.id === character.communityId);

  return (
    <Card bg="secondary" text="light" className="shadow-lg border-start border-4 border-warning character-sheet">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <span>📜 Character Sheet</span>
        <Button variant="outline-light" size="sm" onClick={onPrint}>Print</Button>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h3 className="mb-1">{character.name || "Unnamed Hero"}</h3>
            <div className="text-secondary">
              {selectedClass?.name || "Class not chosen"}
              {selectedSubclass ? ` · ${selectedSubclass.name}` : ""}
            </div>
          </div>
          <Badge bg="warning" text="dark">Level {character.level}</Badge>
        </div>

        <div className="small mb-3">
          <strong>Heritage:</strong> {ancestryNames.join(" / ") || "Not chosen"}
          {character.communityId && ` · ${COMMUNITIES.find((item) => item.id === character.communityId)?.name}`}
        </div>

        <Row className="g-2 text-center mb-3">
          {[
            ["Evasion", stats.evasion],
            ["HP", stats.hitPoints],
            ["Stress", stats.stress],
            ["Hope", stats.hope],
            ["Armor", stats.armorScore],
            ["Prof.", stats.proficiency],
          ].map(([label, value]) => (
            <Col xs={4} md={2} key={label}>
              <div className="border border-secondary rounded p-2 h-100">
                <div className="fw-bold fs-5">{value}</div>
                <div className="small text-secondary">{label}</div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="small mb-3">
          <strong>Thresholds:</strong> {stats.majorThreshold} / {stats.severeThreshold}
          <span className="text-secondary"> (Major / Severe)</span>
        </div>

        <ListGroup variant="flush" className="mb-3">
          <ListGroup.Item className="bg-dark text-light border-secondary">
            <strong>Traits</strong>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {CHARACTER_TRAITS.map(({ id, name }) => (
                <Badge bg="primary" key={id}>{name} {formatTraitScore(character.traits[id])}</Badge>
              ))}
            </div>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-light border-secondary">
            <strong>Weapons</strong>
            <div className="small mt-1">{primaryWeapon?.name || "Primary not chosen"}{secondaryWeapon ? ` · ${secondaryWeapon.name}` : ""}</div>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-light border-secondary">
            <strong>Armor</strong>
            <div className="small mt-1">{armor?.name || "Armor not chosen"}</div>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-light border-secondary">
            <strong>Experiences</strong>
            <div className="small mt-1">{character.experiences.map((experience) => experience.name || "Unnamed").join(" · ")}</div>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-light border-secondary">
            <strong>Domain cards</strong>
            <div className="small mt-1">{domainCards.map((card) => card.name).join(" · ") || "None chosen"}</div>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-light border-secondary">
            <strong>Active heritage features</strong>
            <div className="small mt-1">{ancestryFeatures.map((item) => item.name).join(" · ") || "None chosen"}{community?.feature ? ` · ${community.feature.name}` : ""}</div>
          </ListGroup.Item>
        </ListGroup>

        {selectedClass?.features?.length > 0 && <div className="small mb-3"><strong>Class features:</strong> {selectedClass.features.map((item) => `${item.name} — ${item.description}`).join(" ")}</div>}
        {selectedSubclass?.foundation?.description && <div className="small mb-3"><strong>{selectedSubclass.name} foundation:</strong> {selectedSubclass.foundation.description}</div>}

        {character.description && <p className="fst-italic small mb-0">{character.description}</p>}
      </Card.Body>
    </Card>
  );
}

function CharacterBuilder() {
  const {
    character,
    setCharacter,
    updateCharacter,
    updateTrait,
    toggleDomainCard,
    updateExperience,
    resetCharacter,
  } = useCharacterBuilder();
  const { savedCharacters, saveCharacter, deleteCharacter, loadCharacter } = useSavedCharacters();
  const [step, setStep] = useState(0);
  const [selectedTrait, setSelectedTrait] = useState(CHARACTER_TRAITS[0].id);
  const [notice, setNotice] = useState(null);
  const importRef = useRef(null);

  const selectedClass = useMemo(() => CLASSES.find((item) => item.id === character.classId), [character.classId]);
  const selectedSubclass = selectedClass?.subclasses.find((item) => item.id === character.subclassId);
  const stats = useMemo(() => getDerivedStats(character, CLASSES, ARMOR), [character]);
  const errors = useMemo(() => validateCharacter(character), [character]);
  const domainCards = useMemo(
    () => LEVEL_ONE_DOMAIN_CARDS.filter((card) => selectedClass?.domains.includes(card.domain)),
    [selectedClass]
  );

  const save = () => {
    const record = saveCharacter(character);
    setCharacter(record);
    setNotice({ variant: "success", text: "Character saved in this browser." });
  };

  const exportCharacter = () => {
    const blob = new Blob([serializeCharacter(character)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(character.name || "daggerheart-character").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ variant: "success", text: "Character exported as JSON." });
  };

  const importCharacter = (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setCharacter(loadCharacter(reader.result));
        setNotice({ variant: "success", text: "Character imported." });
        setStep(0);
      } catch (error) {
        setNotice({ variant: "danger", text: error.message });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleClassChange = (classId) => {
    const nextClass = CLASSES.find((item) => item.id === classId);
    updateCharacter({ classId, subclassId: nextClass?.subclasses[0]?.id ?? "", primaryWeaponId: "", secondaryWeaponId: "", domainCardIds: [] });
  };

  const handleAncestryChange = (index, value) => {
    const next = [...character.ancestryIds];
    if (value) next[index] = value;
    else next.splice(index, 1);
    updateCharacter({ ancestryIds: next.filter(Boolean) });
  };

  const handleFeatureSourceChange = (featureIndex, source) => {
    const sources = [...(character.ancestryFeatureSources ?? [0, 1])];
    sources[featureIndex] = Number(source);
    updateCharacter({ ancestryFeatureSources: sources });
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <Card bg="secondary" text="light" className="shadow-lg border-start border-4 border-primary">
          <Card.Header as="h5">Step 1 · Class and identity</Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Name</Form.Label><Form.Control value={character.name} onChange={(event) => updateCharacter({ name: event.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Pronouns</Form.Label><Form.Control value={character.pronouns} onChange={(event) => updateCharacter({ pronouns: event.target.value })} /></Form.Group></Col>
              <Col xs={12}><Form.Group><Form.Label>Character description</Form.Label><Form.Control as="textarea" rows={2} value={character.description} onChange={(event) => updateCharacter({ description: event.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Class</Form.Label><Form.Select value={character.classId} onChange={(event) => handleClassChange(event.target.value)}><option value="">Choose a class...</option>{CLASSES.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Subclass</Form.Label><Form.Select value={character.subclassId} disabled={!selectedClass} onChange={(event) => updateCharacter({ subclassId: event.target.value })}><option value="">Choose a subclass...</option>{selectedClass?.subclasses.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</Form.Select></Form.Group></Col>
            </Row>
            {selectedClass && <Alert variant="dark" className="mt-4 mb-0"><strong>{selectedClass.name}</strong><div className="small mt-1">Domains: {selectedClass.domains.join(" & ")} · Starting Evasion {selectedClass.evasion} · Starting HP {selectedClass.hp}</div>{selectedSubclass?.spellcastTrait && <div className="small">Spellcast trait: {selectedSubclass.spellcastTrait}</div>}{selectedClass.hopeFeature && <div className="small mt-2"><strong>Hope feature:</strong> {selectedClass.hopeFeature.name} — {selectedClass.hopeFeature.description}</div>}{selectedClass.features?.map((item) => <div className="small mt-2" key={item.name}><strong>{item.name}:</strong> {item.description}</div>)}{selectedSubclass?.foundation && <div className="small mt-2"><strong>{selectedSubclass.name} foundation:</strong> {selectedSubclass.foundation.description}</div>}</Alert>}
          </Card.Body>
        </Card>
      );
    }
    if (step === 1) {
      const traitCounts = CHARACTER_TRAITS.reduce((counts, { id }) => {
        const value = character.traits[id];
        if (value !== null && value !== undefined) counts[value] = (counts[value] ?? 0) + 1;
        return counts;
      }, {});
      const selectedTraitValue = character.traits[selectedTrait];
      const availableScores = [2, 1, 0, -1].flatMap((value) => {
        const available = TRAIT_ARRAY.filter((score) => score === value).length - (traitCounts[value] ?? 0) + (selectedTraitValue === value ? 1 : 0);
        return Array.from({ length: Math.max(0, available) }, () => value);
      });
      const assignSelectedTrait = (value) => {
        if (selectedTrait) updateTrait(selectedTrait, value);
      };
      return (
        <Card bg="secondary" text="light" className="shadow-lg border-start border-4 border-info">
          <Card.Header as="h5">Step 2 · Heritage and traits</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3"><Form.Label>Primary ancestry</Form.Label><Form.Select value={character.ancestryIds[0] ?? ""} onChange={(event) => handleAncestryChange(0, event.target.value)}><option value="">Choose an ancestry...</option>{ANCESTRIES.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Second ancestry <span className="text-secondary">(optional Mixed Ancestry)</span></Form.Label><Form.Select value={character.ancestryIds[1] ?? ""} onChange={(event) => handleAncestryChange(1, event.target.value)}><option value="">None</option>{ANCESTRIES.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</Form.Select></Form.Group>
            {character.ancestryIds.length === 2 && <Alert variant="info" className="small">Mixed Ancestry uses the first feature from one ancestry and the second feature from the other. Choose which lineage supplies each feature.</Alert>}
            {character.ancestryIds.length === 2 && <Row className="g-2 mb-3">{[0, 1].map((featureIndex) => <Col md={6} key={featureIndex}><Form.Group><Form.Label className="small">{featureIndex === 0 ? "First feature" : "Second feature"}</Form.Label><Form.Select value={(character.ancestryFeatureSources ?? [0, 1])[featureIndex]} onChange={(event) => handleFeatureSourceChange(featureIndex, event.target.value)}><option value="0">{ANCESTRIES.find((item) => item.id === character.ancestryIds[0])?.name}</option><option value="1">{ANCESTRIES.find((item) => item.id === character.ancestryIds[1])?.name}</option></Form.Select></Form.Group></Col>)}</Row>}
            {character.ancestryIds.length > 0 && <div className="mb-3">{(character.ancestryIds.length === 1 ? (ANCESTRIES.find((item) => item.id === character.ancestryIds[0])?.features ?? []) : [0, 1].map((featureIndex) => ANCESTRIES.find((item) => item.id === character.ancestryIds[(character.ancestryFeatureSources ?? [0, 1])[featureIndex]])?.features[featureIndex])).filter(Boolean).map((item) => <Alert variant="dark" className="small py-2 mb-2" key={item.name}><strong>{item.name}:</strong> {item.description}</Alert>)}</div>}
            <Form.Group className="mb-4"><Form.Label>Community</Form.Label><Form.Select value={character.communityId} onChange={(event) => updateCharacter({ communityId: event.target.value })}><option value="">Choose a community...</option>{COMMUNITIES.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</Form.Select></Form.Group>
            {COMMUNITIES.find((item) => item.id === character.communityId)?.feature && <Alert variant="dark" className="small py-2"><strong>{COMMUNITIES.find((item) => item.id === character.communityId).feature.name}:</strong> {COMMUNITIES.find((item) => item.id === character.communityId).feature.description}</Alert>}
            <h6>Assign traits</h6>
            <p className="small text-secondary mb-2">Select a trait, then assign one of the available scores. Each chip represents one score from the SRD array.</p>
            <div className="trait-score-pool border border-secondary rounded p-2 mb-3">
              <div className="small text-secondary mb-2">Available scores for <strong className="text-light">{CHARACTER_TRAITS.find(({ id }) => id === selectedTrait)?.name}</strong>:</div>
              <div className="d-flex flex-wrap gap-2">{availableScores.map((value, index) => <Button variant="outline-warning" size="sm" key={`${value}-${index}`} onClick={() => assignSelectedTrait(value)}>{formatTraitScore(value)}</Button>)}{availableScores.length === 0 && <span className="small text-secondary">All scores assigned.</span>}</div>
            </div>
            <Row className="g-2">{CHARACTER_TRAITS.map(({ id, name }) => <Col sm={6} md={4} key={id}><Button variant={selectedTrait === id ? "primary" : "outline-light"} className="w-100 d-flex justify-content-between align-items-center text-start" onClick={() => setSelectedTrait(id)}><span>{name}</span><Badge bg={character.traits[id] === null || character.traits[id] === undefined ? "secondary" : "warning"} text={character.traits[id] === null || character.traits[id] === undefined ? "light" : "dark"}>{formatTraitScore(character.traits[id])}</Badge></Button></Col>)}</Row>
          </Card.Body>
        </Card>
      );
    }
    if (step === 2) {
      const selectedPrimary = PRIMARY_WEAPONS.find((item) => item.id === character.primaryWeaponId);
      return (
        <Card bg="secondary" text="light" className="shadow-lg border-start border-4 border-success">
          <Card.Header as="h5">Step 3 · Starting equipment and domain cards</Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Primary weapon</Form.Label><Form.Select value={character.primaryWeaponId} onChange={(event) => updateCharacter({ primaryWeaponId: event.target.value, secondaryWeaponId: "" })}><option value="">Choose a primary weapon...</option>{PRIMARY_WEAPONS.map((weapon) => <option value={weapon.id} key={weapon.id}>{weapon.name} · {weapon.trait} · {weapon.range} · {weapon.die}{weapon.bonus ? `+${weapon.bonus}` : ""}</option>)}</Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Secondary weapon <span className="text-secondary">(optional)</span></Form.Label><Form.Select value={character.secondaryWeaponId} disabled={!selectedPrimary || selectedPrimary.burden === 2} onChange={(event) => updateCharacter({ secondaryWeaponId: event.target.value })}><option value="">None</option>{SECONDARY_WEAPONS.map((weapon) => <option value={weapon.id} key={weapon.id}>{weapon.name} · {weapon.trait} · {weapon.range}</option>)}</Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Armor</Form.Label><Form.Select value={character.armorId} onChange={(event) => updateCharacter({ armorId: event.target.value })}><option value="">Choose armor...</option>{ARMOR.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.baseMajor}/{item.baseSevere} · Armor {item.baseScore}</option>)}</Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Class item</Form.Label><Form.Select value={character.classItem} disabled={!selectedClass} onChange={(event) => updateCharacter({ classItem: event.target.value })}><option value="">Choose an item...</option>{selectedClass?.items.map((item) => <option value={item} key={item}>{item}</option>)}</Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Starting potion</Form.Label><Form.Select value={character.potion} onChange={(event) => updateCharacter({ potion: event.target.value })}><option>Minor Health Potion</option><option>Minor Stamina Potion</option></Form.Select></Form.Group></Col>
            </Row>
            <hr className="border-secondary my-4" />
            <div className="d-flex justify-content-between align-items-center mb-2"><h6 className="mb-0">Level 1 domain cards</h6><Badge bg={character.domainCardIds.length === 2 ? "success" : "warning"}>{character.domainCardIds.length}/2 chosen</Badge></div>
            <p className="small text-secondary">Choose two cards from either of your class’s domains.</p>
            <Row className="g-2">{domainCards.map((card) => <Col md={6} key={card.id}><Button variant={character.domainCardIds.includes(card.id) ? "primary" : "outline-light"} className="w-100 text-start h-100" onClick={() => toggleDomainCard(card.id)}><strong>{card.name}</strong><span className="d-block small">{card.domain} · {card.type} · Recall {card.recallCost}</span><span className="d-block small mt-1">{card.description}</span></Button></Col>)}</Row>
            {!selectedClass && <p className="text-secondary small mt-3 mb-0">Choose a class first to see its available domains.</p>}
          </Card.Body>
        </Card>
      );
    }
    return (
      <Card bg="secondary" text="light" className="shadow-lg border-start border-4 border-warning">
        <Card.Header as="h5">Step 4 · Story and review</Card.Header>
        <Card.Body>
          <h6>Experiences</h6>
          <p className="small text-secondary">Create two Experiences. Each starts with a +2 modifier.</p>
          <Row className="g-2 mb-4">{character.experiences.map((experience, index) => <Col md={6} key={index}><Form.Control placeholder={`Experience ${index + 1}`} value={experience.name} onChange={(event) => updateExperience(index, event.target.value)} /></Col>)}</Row>
          <h6>Background questions</h6>
          <p className="small text-secondary">Answer any questions from your subclass guide, or write your own.</p>
          {character.backgroundAnswers.map((answer, index) => <Form.Control as="textarea" rows={2} className="mb-2" placeholder={`Background answer ${index + 1}`} value={answer} onChange={(event) => updateCharacter({ backgroundAnswers: character.backgroundAnswers.map((item, currentIndex) => currentIndex === index ? event.target.value : item) })} key={index} />)}
          <h6 className="mt-4">Connections</h6>
          <Form.Control as="textarea" rows={3} placeholder="Describe relationships with the other PCs..." value={character.connections[0]?.text ?? ""} onChange={(event) => updateCharacter({ connections: [{ text: event.target.value }] })} />
          <Alert variant={errors.length ? "warning" : "success"} className="mt-4 mb-0"><strong>{errors.length ? "Character still needs a few choices:" : "Ready to play."}</strong>{errors.length > 0 && <ul className="small mb-0 mt-2">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}</Alert>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="character-builder">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div><h2 className="mb-1">🧙 Character Builder</h2><p className="text-secondary mb-0">Create a level-1 Daggerheart character.</p></div>
        <ButtonGroup>
          <Button variant="outline-danger" onClick={resetCharacter}>Clear character</Button>
          <Button variant="outline-success" onClick={save}>Save</Button>
          <Button variant="outline-info" onClick={exportCharacter}>Export JSON</Button>
          <Button variant="outline-warning" onClick={() => importRef.current?.click()}>Import</Button>
          <Button variant="outline-light" onClick={() => window.print()}>Print sheet</Button>
        </ButtonGroup>
        <input ref={importRef} type="file" accept="application/json,.json" className="d-none" onChange={importCharacter} />
      </div>
      {notice && <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)}>{notice.text}</Alert>}
      <PrintableCharacterSheet character={character} selectedClass={selectedClass} selectedSubclass={selectedSubclass} stats={stats} />
      {savedCharacters.length > 0 && <Card bg="dark" text="light" className="mb-3 border-secondary"><Card.Body className="py-2"><Stack direction="horizontal" gap={2}><Form.Select size="sm" aria-label="Saved characters" onChange={(event) => { const record = savedCharacters.find((item) => item.id === event.target.value); if (record) setCharacter(loadCharacter(record)); }}><option value="">Load a saved character...</option>{savedCharacters.map((record) => <option value={record.id} key={record.id}>{record.name || "Unnamed hero"}</option>)}</Form.Select><Button size="sm" variant="outline-danger" onClick={() => deleteCharacter(savedCharacters[savedCharacters.length - 1].id)}>Delete last saved</Button></Stack></Card.Body></Card>}
      <div className="mb-3">{STEPS.map((label, index) => <Button key={label} variant={step === index ? "primary" : "outline-secondary"} size="sm" className="me-2 mb-2" onClick={() => setStep(index)}>{index + 1}. {label}</Button>)}</div>
      <Row className="g-4">
        <Col lg={7}>{renderStep()}<div className="d-flex justify-content-between mt-3"><Button variant="outline-light" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Back</Button><Button variant="primary" disabled={step === STEPS.length - 1} onClick={() => setStep((current) => current + 1)}>Next</Button></div></Col>
        <Col lg={5}><CharacterSheet character={character} selectedClass={selectedClass} selectedSubclass={selectedSubclass} stats={stats} onPrint={() => window.print()} /></Col>
      </Row>
      <div className="small text-secondary mt-3">Starting inventory: {STANDARD_INVENTORY.join(" · ")} · {character.potion}</div>
    </div>
  );
}

export default CharacterBuilder;
