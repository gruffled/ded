import { useState, useEffect, useRef } from "react";
import { createInitialCharacter, parseCharacter } from "./characterUtils";

export const CHARACTER_STORAGE_KEY = "daggerheart-characters-v1";
export const CHARACTER_DRAFT_KEY = "daggerheart-character-draft-v1";

const readStoredCharacters = () => {
  try {
    const stored = window.localStorage.getItem(CHARACTER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Could not read saved characters:", error);
    return [];
  }
};

const writeStoredCharacters = (characters) => {
  try {
    window.localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(characters));
  } catch (error) {
    console.warn("Could not save characters:", error);
  }
};

const readDraft = () => {
  try {
    const stored = window.localStorage.getItem(CHARACTER_DRAFT_KEY);
    return stored
      ? parseCharacter({ format: "daggerheart-character", version: 1, character: JSON.parse(stored) })
      : createInitialCharacter();
  } catch (error) {
    console.warn("Could not read character draft:", error);
    return createInitialCharacter();
  }
};

export const useCharacterBuilder = () => {
  const [character, setCharacter] = useState(readDraft);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHARACTER_DRAFT_KEY, JSON.stringify(character));
    } catch (error) {
      console.warn("Could not save character draft:", error);
    }
  }, [character]);

  const updateCharacter = (changes) => {
    setCharacter((current) => ({ ...current, ...changes }));
  };

  const updateTrait = (trait, value) => {
    setCharacter((current) => ({
      ...current,
      traits: { ...current.traits, [trait]: value === null ? null : Number(value) },
    }));
  };

  const toggleDomainCard = (cardId) => {
    setCharacter((current) => {
      const selected = current.domainCardIds.includes(cardId);
      if (selected) {
        return { ...current, domainCardIds: current.domainCardIds.filter((id) => id !== cardId) };
      }
      if (current.domainCardIds.length >= 2) return current;
      return { ...current, domainCardIds: [...current.domainCardIds, cardId] };
    });
  };

  const updateExperience = (index, name) => {
    setCharacter((current) => ({
      ...current,
      experiences: current.experiences.map((experience, currentIndex) =>
        currentIndex === index ? { ...experience, name } : experience
      ),
    }));
  };

  const resetCharacter = () => setCharacter(createInitialCharacter());

  return {
    character,
    setCharacter,
    updateCharacter,
    updateTrait,
    toggleDomainCard,
    updateExperience,
    resetCharacter,
  };
};

export const useSavedCharacters = () => {
  const [savedCharacters, setSavedCharacters] = useState(readStoredCharacters);
  const hasChanged = useRef(false);

  // Persist only after a user change, so merely opening the app never
  // overwrites whatever is in storage.
  useEffect(() => {
    if (hasChanged.current) writeStoredCharacters(savedCharacters);
  }, [savedCharacters]);

  const saveCharacter = (character) => {
    const record = {
      ...character,
      id: character.id ?? crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    hasChanged.current = true;
    setSavedCharacters((current) => [
      ...current.filter((item) => item.id !== record.id),
      record,
    ]);
    return record;
  };

  const deleteCharacter = (id) => {
    hasChanged.current = true;
    setSavedCharacters((current) => current.filter((item) => item.id !== id));
  };

  const loadCharacter = (record) =>
    typeof record === "string"
      ? parseCharacter(record)
      : parseCharacter({
          format: "daggerheart-character",
          version: 1,
          character: record,
        });

  return { savedCharacters, saveCharacter, deleteCharacter, loadCharacter };
};
