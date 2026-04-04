import React, { useState, useRef } from "react";
import {
  Brain, AlertTriangle, CheckCircle2, FileText,
  RefreshCw, Zap, Shield, AlertCircle, Info,
  ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_RELAYER_URL?.replace("/relayer", "") || "http://localhost:3000";

function RiskBadge({ level }) {
  const cfg = {
    LOW:    { color: "var(--green)",  bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
    MEDIUM: { color: "var(--amber)",  bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
    HIGH:   { color: "var(--red)",    bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
  }[level] || { color: "var(--text-dim)", bg: "rgba(71,85,105,0.1)", border: "rgba(71,85,105,0.2)" };

  return (
    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, letterSpacing: "0.05em" }}>
      {level}
    </span>
  );
}

function AnomalyChecker({ address }) {
  const [walletInput, setWalletInput] = useState(address || "");
  const [amount,      setAmount]      = useState("100");
  const [invoiceId,   setInvoiceId]   = useState("");
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const check = async () => {
    if (!walletInput) return setError("Enter a wallet address");
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${BACKEND_URL}/ai/check-anomaly`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: walletInput, amount: parseFloat(amount), invoiceId: invoiceId || "manual-check", nullifierAttempts: 0 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 1.6 }}>
        Check any wallet address and payment for fraud risk before processing. The AI analyzes patterns, amounts, and behavior signals.
      </div>
      <div>
        <div className="field-label">Wallet Address</div>
        <input className="text-input" value={walletInput} onChange={e => setWalletInput(e.target.value)}
          placeholder="0x..." style={{ fontFamily: "var(--mono)", fontSize: "12px" }} />
      </div>
      <div className="two-col" style={{ gap: "10px" }}>
        <div>
          <div className="field-label">Amount</div>
          <input className="text-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" />
        </div>
        <div>
          <div className="field-label">Invoice ID (optional)</div>
          <input className="text-input" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} placeholder="0x..." style={{ fontFamily: "var(--mono)", fontSize: "11px" }} />
        </div>
      </div>
      {error && <div className="status-bar error"><AlertCircle size={13} /><span>{error}</span></div>}
      <button className="btn-primary" onClick={check} disabled={loading}
        style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
        {loading ? <RefreshCw size={14} className="spin" /> : <Shield size={14} />}
        {loading ? "Analyzing..." : "Check Risk"}
      </button>
      {result && (
        <div style={{ padding: "16px", background: "rgba(99,102,241,0.05)", border: "1px solid var(--border)", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontWeight: 800, fontSize: "13px", color: "var(--text)" }}>Risk Assessment</span>
            <RiskBadge level={result.riskLevel} />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Risk Score</span>
              <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "var(--mono)", color: result.riskScore >= 70 ? "var(--red)" : result.riskScore >= 40 ? "var(--amber)" : "var(--green)" }}>{result.riskScore}/100</span>
            </div>
            <div style={{ height: "6px", background: "rgba(99,102,241,0.12)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "4px", width: `${result.riskScore}%`, background: result.riskScore >= 70 ? "var(--red)" : result.riskScore >= 40 ? "var(--amber)" : "var(--green)", transition: "width 0.6s ease" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Recommendation</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: result.recommendation === "BLOCK" ? "var(--red)" : result.recommendation === "REVIEW" ? "var(--amber)" : "var(--green)" }}>
              {result.recommendation}
            </span>
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--text-mid)", padding: "8px 10px", background: "rgba(99,102,241,0.05)", borderRadius: "8px", marginBottom: "8px", lineHeight: 1.5 }}>
            {result.reason}
          </div>
          {result.flags?.length > 0 && (
            <div>
              <div className="field-label" style={{ marginBottom: "6px" }}>Flags</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {result.flags.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "11px", color: "var(--amber)" }}>
                    <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.flags?.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--green)" }}>
              <CheckCircle2 size={13} /> No suspicious flags detected
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InvoiceAssistant({ onGenerated }) {
  const [description, setDescription] = useState("");
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const textRef = useRef();

  const generate = async () => {
    if (!description.trim()) return setError("Describe your payment first");
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`${BACKEND_URL}/ai/generate-invoice`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const examples = [
    "Charge client $50 for logo design",
    "Monthly subscription 25 USDT",
    "Invoice for 200 worth of consulting",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 1.6 }}>
        Describe your payment in plain English. The AI will generate the invoice parameters for you.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {examples.map(ex => (
          <button key={ex} onClick={() => setDescription(ex)}
            style={{ fontSize: "10.5px", padding: "4px 10px", borderRadius: "20px", background: "rgba(99,102,241,0.07)", border: "1px solid var(--border)", color: "var(--text-dim)", cursor: "pointer", transition: "all 150ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}>
            {ex}
          </button>
        ))}
      </div>
      <div>
        <div className="field-label">Payment Description</div>
        <textarea ref={textRef} className="text-input" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Charge my client $120 for web development work..."
          rows={3} style={{ resize: "vertical", lineHeight: 1.5, fontFamily: "var(--display)", fontWeight: 400 }} />
      </div>
      {error && <div className="status-bar error"><AlertCircle size={13} /><span>{error}</span></div>}
      <button className="btn-primary" onClick={generate} disabled={loading || !description.trim()}
        style={{ background: "linear-gradient(135deg, #06b6d4, #4f46e5)" }}>
        {loading ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
        {loading ? "Generating..." : "Generate Invoice Params"}
      </button>
      {result && (
        <div style={{ padding: "16px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "12px" }}>
          <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--text)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "7px" }}>
            <Sparkles size={14} color="var(--accent2)" /> Generated Invoice
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Amount</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--accent2)", fontWeight: 800 }}>{result.amount} USDT</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Micro-units</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-mid)" }}>{result.amountMicro?.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim)", flexShrink: 0 }}>Description</span>
              <span style={{ fontSize: "12px", color: "var(--text-mid)", textAlign: "right" }}>{result.invoiceNote}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Confidence</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: result.confidence === "high" ? "var(--green)" : result.confidence === "medium" ? "var(--amber)" : "var(--red)" }}>
                {result.confidence?.toUpperCase()}
              </span>
            </div>
            {result.suggestions?.length > 0 && (
              <div style={{ padding: "8px 10px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 700, marginBottom: "4px" }}>Clarification needed</div>
                {result.suggestions.map((s, i) => (
                  <div key={i} style={{ fontSize: "11px", color: "var(--text-dim)" }}>{s}</div>
                ))}
              </div>
            )}
          </div>
          {onGenerated && (
            <button className="btn-primary" onClick={() => onGenerated(result)}
              style={{ marginTop: "12px", background: "linear-gradient(135deg, var(--accent2), var(--accent))" }}>
              <Zap size={14} /> Use These Values
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ZKExplainer() {
  const [commitment,  setCommitment]  = useState("");
  const [nullifier,   setNullifier]   = useState("");
  const [amount,      setAmount]      = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const explain = async () => {
    if (!commitment && !nullifier) return setError("Enter at least a commitment or nullifier hash");
    setLoading(true); setError(""); setExplanation("");
    try {
      const res  = await fetch(`${BACKEND_URL}/ai/explain-tx`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitment, nullifier, amount, timestamp: new Date().toISOString(), merchantAddress: "0x..." }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 1.6 }}>
        Paste the details of a completed ZK payment and the AI will explain in plain English what privacy guarantees were provided.
      </div>
      <div>
        <div className="field-label">Commitment Hash</div>
        <input className="text-input" value={commitment} onChange={e => setCommitment(e.target.value)}
          placeholder="0x..." style={{ fontFamily: "var(--mono)", fontSize: "11px" }} />
      </div>
      <div>
        <div className="field-label">Nullifier Hash</div>
        <input className="text-input" value={nullifier} onChange={e => setNullifier(e.target.value)}
          placeholder="0x..." style={{ fontFamily: "var(--mono)", fontSize: "11px" }} />
      </div>
      <div>
        <div className="field-label">Amount (optional)</div>
        <input className="text-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" />
      </div>
      {error && <div className="status-bar error"><AlertCircle size={13} /><span>{error}</span></div>}
      <button className="btn-primary" onClick={explain} disabled={loading}
        style={{ background: "linear-gradient(135deg, #a855f7, #4f46e5)" }}>
        {loading ? <RefreshCw size={14} className="spin" /> : <Brain size={14} />}
        {loading ? "Explaining..." : "Explain This Transaction"}
      </button>
      {explanation && (
        <div style={{ padding: "16px", background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "12px" }}>
          <div style={{ fontWeight: 800, fontSize: "12px", color: "var(--accent3)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Brain size={13} /> Plain English Explanation
          </div>
          <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.7 }}>{explanation}</div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "anomaly",   label: "Risk Scanner",      icon: Shield,    color: "var(--accent)" },
  { id: "invoice",   label: "Invoice Assistant", icon: Sparkles,  color: "var(--accent2)" },
  { id: "explainer", label: "ZK Explainer",      icon: Brain,     color: "var(--accent3)" },
];

export default function AIPanel({ address }) {
  const [activeTab, setActiveTab] = useState("anomaly");

  return (
    <div className="fade-in" style={{ maxWidth: "860px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <div style={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Brain size={20} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>AI Tools</div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>Powered by OpenAI  fraud detection, invoice generation, ZK explainer</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "10px", padding: "3px 10px", borderRadius: "20px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "var(--accent)", fontWeight: 700 }}>
          LIVE
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "18px", background: "rgba(99,102,241,0.05)", padding: "5px", borderRadius: "12px", border: "1px solid var(--border)" }}>
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "9px 12px", borderRadius: "9px", border: "none", cursor: "pointer", transition: "all 180ms", fontFamily: "var(--display)", fontSize: "12.5px", fontWeight: 700,
              background: activeTab === id ? "var(--surface)" : "transparent",
              color: activeTab === id ? color : "var(--text-dim)",
              boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
            }}>
            <Icon size={14} />
            <span style={{ display: "none" }} className="tab-label">{label}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="card">
        {activeTab === "anomaly"   && <AnomalyChecker address={address} />}
        {activeTab === "invoice"   && <InvoiceAssistant />}
        {activeTab === "explainer" && <ZKExplainer />}
      </div>
    </div>
  );
}