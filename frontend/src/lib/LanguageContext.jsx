import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem("aurionpay_lang") || "en"
  );

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem("aurionpay_lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: switchLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  const isEN = lang === "en";

  return (
    <button
      onClick={() => setLang(isEN ? "zh" : "en")}
      title={isEN ? "" : "Switch to English"}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "5px 11px", borderRadius: "20px", cursor: "pointer",
        background: "rgba(99,102,241,0.08)", border: "1px solid var(--border)",
        color: "var(--text-mid)", fontFamily: "var(--display)",
        fontSize: "12px", fontWeight: 700, transition: "all 180ms",
        userSelect: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-mid)"; }}
    >
      <span style={{ fontSize: "14px" }}>{isEN ? "" : ""}</span>
      <span>{isEN ? "" : "EN"}</span>
    </button>
  );
}