import { useRef, useState } from "react";
import Header from "./components/Header";

const REPO_URL = "https://github.com/Babug01/base64-toolkit";

// btoa/atob only handle Latin1 — encoding a UTF-8 string with them directly
// throws on anything outside that range (emoji, accented characters). Route
// through TextEncoder/TextDecoder so real-world text round-trips correctly.
function encodeBase64(text, urlSafe) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  let out = btoa(binary);
  if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return out;
}

function decodeBase64(text) {
  // Accept URL-safe input transparently — restore standard alphabet/padding
  // before handing it to atob, which only understands the standard alphabet.
  let normalized = text.trim().replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) normalized += "=";
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const styles = {
  root: { height: "100dvh", boxSizing: "border-box", display: "flex", flexDirection: "column" },
  content: { fontFamily: "system-ui, sans-serif", padding: "20px 24px", flex: 1, minHeight: 0, boxSizing: "border-box", display: "flex", flexDirection: "column", background: "var(--bg-subtle, #f0efed)" },
  header: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text, #1a1a1a)" },
  subtitle: { fontSize: 13, opacity: 0.55, margin: "4px 0 0", color: "var(--text, #1a1a1a)" },
  usesNote: { fontSize: 11, opacity: 0.5, margin: "6px 0 0", color: "var(--text, #1a1a1a)" },
  body: { display: "flex", gap: 16, flex: 1, minHeight: 0, minWidth: 0 },
  pane: { flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 },
  paneHeader: { fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", opacity: 0.6, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text, #1a1a1a)" },
  textarea: {
    flex: 1, resize: "none", fontFamily: "'SFMono-Regular', Consolas, monospace", fontSize: 13, padding: 12,
    borderRadius: 8, border: "1px solid var(--border, #e5e7eb)", background: "var(--input-bg, #f9fafb)",
    color: "var(--text, #1a1a1a)", outline: "none",
  },
  iconBtn: {
    padding: "2px 10px", borderRadius: 6, border: "1px solid var(--border, #e5e7eb)", background: "transparent",
    color: "var(--text, #1a1a1a)", cursor: "pointer", fontSize: 11, textTransform: "none", fontWeight: 400,
  },
  empty: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4, fontSize: 13,
    border: "1px dashed var(--border, #e5e7eb)", borderRadius: 8, color: "var(--text, #1a1a1a)",
  },
  errorBox: {
    flex: 1, padding: 16, borderRadius: 8, border: "1px solid #e05c5c", background: "rgba(224,92,92,0.08)",
    color: "#e05c5c", fontSize: 13, fontFamily: "'SFMono-Regular', Consolas, monospace", whiteSpace: "pre-wrap", overflow: "auto",
  },
  rail: { display: "flex", flexDirection: "column", gap: 10, width: 168, flexShrink: 0 },
  btn: (kind) => ({
    padding: "10px 14px", borderRadius: 6, border: kind === "primary" ? "none" : "1px solid var(--border, #e5e7eb)",
    background: kind === "primary" ? "var(--accent, #4f46e5)" : "transparent",
    color: kind === "primary" ? "#fff" : "var(--text, #1a1a1a)",
    cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%",
  }),
  railDivider: { height: 1, background: "var(--border, #e5e7eb)", margin: "2px 0" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text, #1a1a1a)" },
};

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  function encode() {
    if (!input) { setOutput(""); setError(null); return; }
    setOutput(encodeBase64(input, urlSafe));
    setError(null);
  }

  function decode() {
    if (!input.trim()) { setOutput(""); setError(null); return; }
    try {
      setOutput(decodeBase64(input));
      setError(null);
    } catch (e) {
      setOutput("");
      setError("Not valid base64 (or it decodes to bytes that aren't valid UTF-8 text) — " + e.message);
    }
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setError(null);
  }

  function swap() {
    setInput(output);
    setOutput(input);
    setError(null);
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChosen(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result || ""));
      setOutput("");
      setError(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={styles.root}>
      <Header title="Base64 Encoder / Decoder" repoUrl={REPO_URL} />
      <div style={styles.content}>
      <div style={styles.header}>
        <h1 style={styles.title}>Base64 Encoder / Decoder</h1>
        <p style={styles.subtitle}>Paste text or base64, encode or decode it. Handles UTF-8 text correctly (not just ASCII) and accepts URL-safe base64 on decode.</p>
        <p style={styles.usesNote}>Common uses: Kubernetes Secret values (always stored base64-encoded), HTTP Basic Auth headers (user:pass), and JWT header/payload segments. "URL-safe" swaps +/ for -_ and drops padding — needed anywhere the result goes in a URL or JWT, since +/= have special meaning there.</p>
      </div>

      <div style={styles.body}>
        <div style={styles.pane}>
          <div style={styles.paneHeader}><span>Input</span></div>
          <textarea style={styles.textarea} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text or base64 here..." spellCheck={false} />
          <input ref={fileInputRef} type="file" accept=".txt" style={{ display: "none" }} onChange={handleFileChosen} />
        </div>

        <div style={styles.rail}>
          <button style={styles.btn("secondary")} onClick={handleUploadClick}>Upload Data</button>
          <div style={styles.railDivider} />
          <button style={styles.btn("primary")} onClick={encode}>Encode</button>
          <button style={styles.btn("secondary")} onClick={decode}>Decode</button>
          <div style={styles.checkboxRow}>
            <input type="checkbox" id="urlSafe" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} />
            <label htmlFor="urlSafe">URL-safe encode (-_ , no padding)</label>
          </div>
          <div style={styles.railDivider} />
          <button style={styles.btn("secondary")} onClick={swap}>Swap Input/Output</button>
          <button style={styles.btn("secondary")} onClick={() => downloadText("output.txt", output)}>Download</button>
          <button style={styles.btn("secondary")} onClick={clearAll}>Clear</button>
        </div>

        <div style={styles.pane}>
          <div style={styles.paneHeader}>
            <span>Output</span>
            {output && <button style={styles.iconBtn} onClick={copyOutput}>{copied ? "Copied" : "Copy"}</button>}
          </div>
          {error ? (
            <div style={styles.errorBox}>{error}</div>
          ) : output ? (
            <textarea style={styles.textarea} value={output} readOnly spellCheck={false} />
          ) : (
            <div style={styles.empty}>Result will appear here.</div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
