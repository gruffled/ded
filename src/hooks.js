import { useState, useEffect } from "react";

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
