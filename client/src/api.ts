import { useEffect, useState } from 'react';

export interface Entry {
  id: string;
  name: string;
  msg: string;
  at: string; // 표시용 MM.DD (KST, 서버 기준)
}

export function useGuestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/guestbook')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!cancelled && Array.isArray(j.entries)) setEntries(j.entries);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (name: string, msg: string): Promise<boolean> => {
    try {
      const r = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, msg }),
      });
      if (!r.ok) return false;
      const e: Entry = await r.json();
      setEntries((prev) => [e, ...prev]);
      return true;
    } catch {
      return false;
    }
  };

  return { entries, submit };
}
