import { useState, useEffect } from "react";
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

  const saveCharacter = (character) => {
    const record = {
      ...character,
      id: character.id ?? crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    setSavedCharacters((current) => {
      const next = [...current.filter((item) => item.id !== record.id), record];
      writeStoredCharacters(next);
      return next;
    });
    return record;
  };

  const deleteCharacter = (id) => {
    setSavedCharacters((current) => {
      const next = current.filter((item) => item.id !== id);
      writeStoredCharacters(next);
      return next;
    });
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

/**
 * Hook to fetch adversary data
 */
export const useAdversaryData = () => {
  const [allAdversaries, setAllAdversaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdversaries = async () => {
      try {
        const response = await fetch("/adversaries.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllAdversaries(data);
      } catch (e) {
        console.error("Failed to fetch adversary data:", e);
        setError(
          "Could not load adversary data. Please make sure 'adversaries.json' is in the public directory."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdversaries();
  }, []);

  return { allAdversaries, isLoading, error };
};

/**
 * Hook to fetch SRD 2.0 environment data.
 */
export const useEnvironmentData = () => {
  const [allEnvironments, setAllEnvironments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        const response = await fetch("/environments.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setAllEnvironments(await response.json());
      } catch (e) {
        console.error("Failed to fetch environment data:", e);
        setError(
          "Could not load environment data. Please make sure 'environments.json' is in the public directory."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnvironments();
  }, []);

  return { allEnvironments, isLoading, error };
};

/**
 * Hook to manage encounter state
 */
export const useEncounter = () => {
  const [encounter, setEncounter] = useState([]);

  const addAdversary = (adversary) => {
    setEncounter((current) => [
      ...current,
      { ...adversary, id: crypto.randomUUID() },
    ]);
  };

  const removeAdversary = (id) => {
    setEncounter((current) => current.filter((adv) => adv.id !== id));
  };

  const clearEncounter = () => {
    setEncounter([]);
  };

  return {
    encounter,
    addAdversary,
    removeAdversary,
    clearEncounter,
  };
};
