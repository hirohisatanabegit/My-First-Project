import { useState } from 'react';

/**
 * useState と同じ API で、値を localStorage に自動永続化するフック。
 * リロード後も値が保持される。
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? (JSON.parse(saved) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof value === 'function'
        ? (value as (prev: T) => T)(prev)
        : value;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // quota exceeded など – 無視して state だけ更新
      }
      return next;
    });
  };

  return [state, setValue];
}
