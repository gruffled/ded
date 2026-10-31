import { useState, useEffect } from "react";
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
