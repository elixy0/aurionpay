import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AurionContext = createContext({});

export function AurionProvider({ children }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem("aurion-mode") || "merchant"
  );

  function switchMode(newMode) {
    localStorage.setItem("aurion-mode", newMode);
    setMode(newMode);
  }

  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aurion-notes") || "[]");
    } catch {
      return [];
    }
  });

  function saveNote(noteString) {
    const updated = [...notes, noteString];
    setNotes(updated);
    localStorage.setItem("aurion-notes", JSON.stringify(updated));
  }

  function removeNote(index) {
    const updated = notes.filter((_, i) => i !== index);
    setNotes(updated);
    localStorage.setItem("aurion-notes", JSON.stringify(updated));
  }

  const [intents, setIntents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aurion-intents") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("aurion-intents", JSON.stringify(intents));
  }, [intents]);

  const addIntent = useCallback((intent) => {
    setIntents((prev) => {
      const exists = prev.some((it) => String(it.id) === String(intent.id));
      if (exists) return prev;
      return [intent, ...prev]; 
    });
  }, []);

  const updateIntentStatus = useCallback((intentId, status) => {
    setIntents((prev) =>
      prev.map((it) =>
        String(it.id) === String(intentId) ? { ...it, status } : it
      )
    );
  }, []);

  const getIntent = useCallback(
    (intentId) =>
      intents.find((it) => String(it.id) === String(intentId)) ?? null,
    [intents]
  );

  const clearExpiredIntents = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    setIntents((prev) =>
      prev.map((it) =>
        it.status === "OPEN" && it.expiresAt && it.expiresAt < now
          ? { ...it, status: "EXPIRED" }
          : it
      )
    );
  }, []);

  useEffect(() => {
    clearExpiredIntents();
    const id = setInterval(clearExpiredIntents, 30_000);
    return () => clearInterval(id);
  }, [clearExpiredIntents]);

  const value = {
    mode,
    switchMode,
    notes,
    saveNote,
    removeNote,
    intents,
    addIntent,
    updateIntentStatus,
    getIntent,
  };

  return (
    <AurionContext.Provider value={value}>
      {children}
    </AurionContext.Provider>
  );
}

export function useAurion() {
  return useContext(AurionContext);
}