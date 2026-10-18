/* Connection to Claude for Smart help.
   Inside claude.ai the page uses Claude directly; anywhere else it posts to
   your own server (EMI_API_URL, default /api/chat, see api/chat.js). */

window.EMI_API_URL = window.EMI_API_URL || "/api/chat";

let samplePromise = null;
function getSample() {
  if (!samplePromise) {
    samplePromise = window.claude && typeof window.claude.use === "function"
      ? window.claude.use("sample").catch(() => null)
      : Promise.resolve(null);
  }
  return samplePromise;
}

async function askClaude(prompt) {
  const sample = await getSample();
  if (sample) return (await sample(prompt, { modelTier: "quick", cache: false })).text;
  const res = await fetch(window.EMI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw { code: "backend_" + res.status };
  return (await res.json()).text;
}

/** Ask Claude for JSON; tolerates extra text around the object. */
async function askClaudeJSON(prompt) {
  const text = await askClaude(prompt);
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end < start) return { reply: text.trim() };
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return { reply: text.trim() }; }
}

const cleanList = (arr, max) => (Array.isArray(arr) ? arr : []).filter(x => typeof x === "string" && x.trim()).map(x => x.trim()).slice(0, max);

function aiErrorText(e) {
  const code = e && e.code;
  if (code === "not_granted") return "I need your permission to use my AI brain. Reload and choose Allow. Everything else still works.";
  if (code === "rate_limited") return "I'm a little busy. Let's try again in a minute.";
  if (code && String(code).startsWith("backend_")) return "My AI server didn't answer. Tasks and nudges still work.";
  return "I couldn't think of an answer just now. Tasks and nudges still work. Try again in a moment.";
}
