import React, { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { CHARACTER_TRAITS, CLASSES } from "../characterData";
import {
  ADVANCEMENT_CARD_CAP,
  ADVANCEMENT_OPTIONS,
  MAX_LEVEL,
  TIER_ACHIEVEMENT_LEVELS,
  emptyLevelUp,
  getAvailableCards,
  getCard,
  getLevel,
  getMarkedTraits,
  getOpenTiers,
  getOption,
  getProgress,
  validateLevelUp,
} from "../levelUp";

const traitName = (id) => CHARACTER_TRAITS.find((trait) => trait.id === id)?.name ?? id;
const cardLabel = (card) => `${card.name} · ${card.domain} · Level ${card.level}`;

const describePick = (pick, experiences) => {
  switch (pick.option) {
    case "traits":
      return `+1 ${(pick.traits ?? []).map(traitName).join(" & ")}`;
    case "hp":
      return "+1 Hit Point slot";
    case "stress":
      return "+1 Stress slot";
    case "evasion":
      return "+1 Evasion";
    case "experiences":
      return `+1 ${(pick.experiences ?? []).map((index) => experiences[index]?.name || `Experience ${index + 1}`).join(" & ")}`;
    case "domainCard":
      return `Extra card: ${getCard(pick.cardId)?.name ?? "—"}`;
    case "subclass":
      return "Upgraded subclass card";
    case "proficiency":
      return "+1 Proficiency";
    case "multiclass":
      return `Multiclass: ${CLASSES.find((item) => item.id === pick.classId)?.name ?? "—"}`;
    default:
      return pick.option;
  }
};

function PickEditor({ pick, onChange, context }) {
  const { character, nextLevel, experienceNames, markedTraits, selectedClass, upgradeName, upgradeFeatures } = context;
  const picked = (index) => (pick.traits ?? [])[index] ?? "";
  const setList = (key, index, value) => {
    const list = [...(pick[key] ?? ["", ""])];
    list[index] = value;
    onChange({ ...pick, [key]: list });
  };

  if (pick.option === "traits") {
    return (
      <Row className="g-2 mt-1">
        {[0, 1].map((index) => (
          <Col sm={6} key={index}>
            <Form.Select
              size="sm"
              aria-label={`Trait to increase ${index + 1}`}
              value={picked(index)}
              onChange={(event) => setList("traits", index, event.target.value)}
            >
              <option value="">Choose a trait...</option>
              {CHARACTER_TRAITS.map(({ id, name }) => (
                <option key={id} value={id} disabled={markedTraits.includes(id) || (pick.traits ?? [])[1 - index] === id}>
                  {name}{markedTraits.includes(id) ? " (marked)" : ""}
                </option>
              ))}
            </Form.Select>
          </Col>
        ))}
      </Row>
    );
  }
  if (pick.option === "experiences") {
    return (
      <Row className="g-2 mt-1">
        {[0, 1].map((index) => (
          <Col sm={6} key={index}>
            <Form.Select
              size="sm"
              aria-label={`Experience to increase ${index + 1}`}
              value={(pick.experiences ?? [])[index] ?? ""}
              onChange={(event) => setList("experiences", index, event.target.value === "" ? "" : Number(event.target.value))}
            >
              <option value="">Choose an Experience...</option>
              {experienceNames.map((name, position) => (
                <option key={position} value={position} disabled={(pick.experiences ?? [])[1 - index] === position}>
                  {name || `Experience ${position + 1}`}
                </option>
              ))}
            </Form.Select>
          </Col>
        ))}
      </Row>
    );
  }
  if (pick.option === "domainCard") {
    const cards = getAvailableCards(character, nextLevel, context.ownedIds, { cap: ADVANCEMENT_CARD_CAP[pick.tier] });
    return (
      <Form.Select
        size="sm"
        className="mt-1"
        aria-label="Additional domain card"
        value={pick.cardId ?? ""}
        onChange={(event) => onChange({ ...pick, cardId: event.target.value })}
      >
        <option value="">Choose a domain card...</option>
        {cards.map((card) => <option key={card.id} value={card.id}>{cardLabel(card)}</option>)}
      </Form.Select>
    );
  }
  if (pick.option === "subclass") {
    return (
      <div className="small mt-1 text-info">
        You take your {upgradeName} card
        {upgradeFeatures.length > 0 && `: ${upgradeFeatures.join(", ")}`}.
      </div>
    );
  }
  if (pick.option === "multiclass") {
    const chosen = CLASSES.find((item) => item.id === pick.classId);
    const set = (changes) => onChange({ ...pick, ...changes });
    return (
      <Row className="g-2 mt-1">
        <Col sm={6}>
          <Form.Select
            size="sm"
            aria-label="Multiclass class"
            value={pick.classId ?? ""}
            onChange={(event) => set({ classId: event.target.value, domain: "", featureName: "", subclassId: "" })}
          >
            <option value="">Choose a class...</option>
            {CLASSES.filter((item) => item.id !== selectedClass?.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Form.Select>
        </Col>
        <Col sm={6}>
          <Form.Select size="sm" aria-label="Multiclass domain" disabled={!chosen} value={pick.domain ?? ""} onChange={(event) => set({ domain: event.target.value })}>
            <option value="">Choose a domain...</option>
            {chosen?.domains.map((domain) => (
              <option key={domain} value={domain} disabled={selectedClass?.domains.includes(domain)}>{domain}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={6}>
          <Form.Select size="sm" aria-label="Multiclass class feature" disabled={!chosen} value={pick.featureName ?? ""} onChange={(event) => set({ featureName: event.target.value })}>
            <option value="">Choose a class feature...</option>
            {chosen?.features.map((feature) => <option key={feature.name} value={feature.name}>{feature.name}</option>)}
          </Form.Select>
        </Col>
        <Col sm={6}>
          <Form.Select size="sm" aria-label="Multiclass subclass foundation" disabled={!chosen} value={pick.subclassId ?? ""} onChange={(event) => set({ subclassId: event.target.value })}>
            <option value="">Choose a subclass foundation...</option>
            {chosen?.subclasses.map((subclass) => <option key={subclass.id} value={subclass.id}>{subclass.name}</option>)}
          </Form.Select>
        </Col>
      </Row>
    );
  }
  return null;
}

function LevelUpPanel({ character, onChange, selectedClass, selectedSubclass }) {
  const [draft, setDraft] = useState(null);
  const levelUps = character.levelUps ?? [];
  const level = getLevel(character);
  const nextLevel = level + 1;
  const progress = getProgress(character);
  const ready = Boolean(selectedClass && selectedSubclass);

  const commit = (changes) => onChange({ ...changes, level: 1 + changes.levelUps.length });

  const undo = () => {
    if (!window.confirm(`Undo the level ${level} level-up?`)) return;
    setDraft(null);
    commit({ levelUps: levelUps.slice(0, -1) });
  };

  const renderHistory = () => {
    if (levelUps.length === 0) return <p className="small text-secondary mb-0">No level-ups yet. This character is level 1.</p>;
    return (
      <ListGroup variant="flush">
        {levelUps.map((entry, index) => (
          <ListGroup.Item key={index} className="bg-dark text-light border-secondary small">
            <strong>Level {index + 2}</strong>
            {entry.experience && <> · new Experience “{entry.experience}”</>}
            <div>{entry.picks.map((pick) => describePick(pick, progress.experiences)).join(" · ") || "No advancements"}</div>
            <div className="text-secondary">
              New card: {getCard(entry.domainCardId)?.name ?? "—"}
              {entry.exchange?.fromId && ` · exchanged ${getCard(entry.exchange.fromId)?.name ?? "—"} for ${getCard(entry.exchange.toId)?.name ?? "—"}`}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  const header = (
    <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
      <span>Step 5 · Level up</span>
      <Badge bg="warning" text="dark">Level {level} · Tier {progress.tier}</Badge>
    </Card.Header>
  );

  const summary = (
    <div className="small mb-3">
      Proficiency {progress.proficiency}
      {" · "}+{progress.hitPoints} Hit Point slots · +{progress.stress} Stress slots · +{progress.evasion} Evasion
      {progress.subclassUpgrades.length > 0 && ` · ${progress.subclassUpgrades.join(" & ")} unlocked`}
      {progress.multiclass && ` · multiclassed into ${CLASSES.find((item) => item.id === progress.multiclass.classId)?.name}`}
    </div>
  );

  if (!draft) {
    return (
      <Card bg="secondary" text="light" className="shadow-lg border-start border-4 border-info">
        {header}
        <Card.Body>
          {summary}
          {!ready && <Alert variant="warning">Choose a class and subclass in step 1 before levelling up.</Alert>}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Button variant="info" disabled={!ready || level >= MAX_LEVEL} onClick={() => setDraft(emptyLevelUp())}>
              {level >= MAX_LEVEL ? "Maximum level reached" : `Level up to ${nextLevel}`}
            </Button>
            <Button variant="outline-danger" disabled={levelUps.length === 0} onClick={undo}>Undo level {level}</Button>
          </div>
          <h6>History</h6>
          {renderHistory()}
        </Card.Body>
      </Card>
    );
  }

  // --- Drafting the next level-up ---
  const priorPicks = levelUps.flatMap((entry) => entry.picks);
  const picksSoFar = [...priorPicks, ...draft.picks];
  const spent = draft.picks.reduce((total, pick) => total + (getOption(pick.option)?.cost ?? 1), 0);
  const achievesTier = TIER_ACHIEVEMENT_LEVELS.includes(nextLevel);
  const experienceNames = [...progress.experiences.map((experience) => experience.name), ...(achievesTier ? [draft.experience] : [])];
  const markedTraits = getMarkedTraits(levelUps, nextLevel);
  const upgradeIndex = progress.subclassUpgrades.length + draft.picks.filter((pick) => pick.option === "subclass").length;
  const upgradeName = upgradeIndex === 0 ? "specialization" : "mastery";
  const upgradeFeatures = (selectedSubclass?.[upgradeName] ?? []).map((feature) => feature.name);
  const withDraft = { ...character, levelUps: [...levelUps, { ...draft, domainCardId: "" }] };
  const ownedAfterPicks = getProgress(withDraft).cardIds;
  const stepFourCards = getAvailableCards(withDraft, nextLevel, ownedAfterPicks);
  const errors = validateLevelUp(character, draft, nextLevel, levelUps);

  const addPick = (optionId) => {
    const [tier] = getOpenTiers(optionId, nextLevel, picksSoFar);
    setDraft({ ...draft, picks: [...draft.picks, { option: optionId, tier }] });
  };
  const updatePick = (index, pick) => setDraft({ ...draft, picks: draft.picks.map((item, i) => (i === index ? pick : item)) });
  const removePick = (index) => setDraft({ ...draft, picks: draft.picks.filter((_, i) => i !== index) });

  const ownedIds = getProgress(character).cardIds;
  const exchangeFrom = getCard(draft.exchange?.fromId);
  const exchangeTargets = exchangeFrom
    ? getAvailableCards(withDraft, nextLevel, ownedAfterPicks).filter((card) => card.level <= exchangeFrom.level)
    : [];

  return (
    <Card bg="secondary" text="light" className="shadow-lg border-start border-4 border-info">
      {header}
      <Card.Body>
        <h5 className="mb-3">Level {level} → {nextLevel}</h5>

        <h6>1 · Tier achievements</h6>
        <p className="small text-secondary">
          Damage thresholds increase by 1.
          {achievesTier && " You gain a new Experience at +2 and +1 Proficiency, and trait marks are cleared."}
        </p>
        {achievesTier && (
          <Form.Control
            className="mb-3"
            aria-label="New Experience"
            placeholder="Name your new Experience (+2)"
            value={draft.experience}
            onChange={(event) => setDraft({ ...draft, experience: event.target.value })}
          />
        )}

        <h6>2 · Advancements <span className="text-secondary small">(choose two · {spent}/2 chosen)</span></h6>
        <div className="d-flex flex-wrap gap-2 mb-2">
          {ADVANCEMENT_OPTIONS.map((option) => {
            const open = getOpenTiers(option.id, nextLevel, picksSoFar);
            const disabled = open.length === 0 || spent + option.cost > 2;
            return (
              <Button key={option.id} size="sm" variant="outline-light" disabled={disabled} onClick={() => addPick(option.id)}>
                {option.label}{option.cost === 2 ? " (uses both)" : ""}
              </Button>
            );
          })}
        </div>
        {draft.picks.map((pick, index) => (
          <div key={index} className="border border-secondary rounded p-2 mb-2 bg-dark">
            <div className="d-flex justify-content-between align-items-center">
              <strong className="small">{getOption(pick.option)?.label} <Badge bg="secondary">Tier {pick.tier}</Badge></strong>
              <Button size="sm" variant="outline-danger" onClick={() => removePick(index)}>Remove</Button>
            </div>
            <PickEditor
              pick={pick}
              onChange={(next) => updatePick(index, next)}
              context={{ character, nextLevel, experienceNames, markedTraits: [...markedTraits, ...draft.picks.filter((other, i) => i !== index && other.option === "traits").flatMap((other) => other.traits ?? [])], selectedClass, upgradeName, upgradeFeatures, ownedIds: [...ownedIds, ...draft.picks.filter((other, i) => i !== index && other.option === "domainCard").map((other) => other.cardId)] }}
            />
          </div>
        ))}

        <h6 className="mt-3">3 · New domain card</h6>
        <p className="small text-secondary">Take a card at your level or lower from one of your domains.</p>
        <Form.Select
          size="sm"
          className="mb-2"
          aria-label="New domain card"
          value={draft.domainCardId}
          onChange={(event) => setDraft({ ...draft, domainCardId: event.target.value })}
        >
          <option value="">Choose a domain card...</option>
          {stepFourCards.map((card) => <option key={card.id} value={card.id}>{cardLabel(card)}</option>)}
        </Form.Select>
        {getCard(draft.domainCardId) && <div className="small card-text mb-3">{getCard(draft.domainCardId).description}</div>}

        <details className="mb-3">
          <summary className="small">Optionally exchange a card you already have</summary>
          <Row className="g-2 mt-1">
            <Col sm={6}>
              <Form.Select
                size="sm"
                aria-label="Card to exchange away"
                value={draft.exchange?.fromId ?? ""}
                onChange={(event) => setDraft({ ...draft, exchange: event.target.value ? { fromId: event.target.value, toId: "" } : null })}
              >
                <option value="">Keep all cards</option>
                {ownedIds.map(getCard).filter(Boolean).map((card) => <option key={card.id} value={card.id}>{cardLabel(card)}</option>)}
              </Form.Select>
            </Col>
            <Col sm={6}>
              <Form.Select
                size="sm"
                aria-label="Card to exchange for"
                disabled={!exchangeFrom}
                value={draft.exchange?.toId ?? ""}
                onChange={(event) => setDraft({ ...draft, exchange: { ...draft.exchange, toId: event.target.value } })}
              >
                <option value="">Choose a replacement...</option>
                {exchangeTargets.map((card) => <option key={card.id} value={card.id}>{cardLabel(card)}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </details>

        {errors.length > 0 && (
          <Alert variant="warning" className="small py-2">
            <ul className="mb-0">{errors.map((message) => <li key={message}>{message}</li>)}</ul>
          </Alert>
        )}
        <div className="d-flex gap-2">
          <Button variant="info" disabled={errors.length > 0} onClick={() => { commit({ levelUps: [...levelUps, draft] }); setDraft(null); }}>
            Confirm level {nextLevel}
          </Button>
          <Button variant="outline-light" onClick={() => setDraft(null)}>Cancel</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default LevelUpPanel;
