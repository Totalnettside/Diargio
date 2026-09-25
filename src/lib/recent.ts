import { useEffect, useState } from "react";

const KEY = "diargio-recent";

export function addRecent(id: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    const next = [id, ...list.filter((x) => x !== id)].slice(0, 12);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function useRecent() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {
      setIds([]);
    }
  }, []);
  return ids;
}
