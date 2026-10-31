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

const dataUrl = (file) => `${import.meta.env.BASE_URL}${file}`;

/**
 * Fetch a JSON array from the public directory, cancelling on unmount.
 */
const useJsonData = (file, label) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(dataUrl(file), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        if (!Array.isArray(json)) {
          throw new Error(`${file} did not contain a list`);
        }
        setData(json);
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error(`Failed to fetch ${label} data:`, e);
        setError(
          `Could not load ${label} data. Please make sure '${file}' is in the public directory.`
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [file, label]);

  return { data, isLoading, error };
};

/**
 * Hook to fetch adversary data
 */
export const useAdversaryData = () => {
  const { data, isLoading, error } = useJsonData("adversaries.json", "adversary");
  return { allAdversaries: data, isLoading, error };
};

/**
 * Hook to fetch SRD 2.0 environment data.
 */
export const useEnvironmentData = () => {
  const { data, isLoading, error } = useJsonData("environments.json", "environment");
  return { allEnvironments: data, isLoading, error };
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
