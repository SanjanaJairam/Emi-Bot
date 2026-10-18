/* Small helpers used everywhere. */

const $ = id => document.getElementById(id);

/** Create an element: h("button", { class: "btn", onclick: fn }, "Label", childNode). */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el[k] = v;
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  kids.flat().forEach(k => el.append(k instanceof Node ? k : document.createTextNode(k)));
  return el;
}

const pad2 = n => String(n).padStart(2, "0");
const dayKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const today = () => dayKey(new Date());
const uid = () => Math.random().toString(36).slice(2, 9);
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "4:05" style countdown. */
function fmtClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}
