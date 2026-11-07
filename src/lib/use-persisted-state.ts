import { useEffect, useRef, useState, type SetStateAction } from 'react';
import { loadJSON, saveJSON, PREFIX } from './storage';

// Cross-tab conflicts use the last successfully written value. Invalid writes are ignored.
export function usePersistedState<T>(key: string, fallback: T, validate: (value: unknown) => value is T) {
  const [value, setValue] = useState(() => loadJSON(key, fallback, validate));
  const [error, setError] = useState(false);
  const latest = useRef(value);
  useEffect(() => {
    const update = (event: StorageEvent) => {
      if (event.key !== null && event.key !== PREFIX + key) return;
      latest.current = loadJSON(key, fallback, validate);
      setValue(latest.current);
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [key, fallback, validate]);
  const commit = (next: SetStateAction<T>) => {
    const result = typeof next === 'function' ? (next as (previous: T) => T)(latest.current) : next;
    if (!validate(result)) return false;
    latest.current = result;
    setValue(result);
    const saved = saveJSON(key, result);
    setError(!saved);
    return saved;
  };
  return [value, commit, error] as const;
}
