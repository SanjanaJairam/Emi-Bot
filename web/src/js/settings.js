/* The Settings sheet. */

const TOGGLES = ["calm", "sound", "speak", "demo", "smart"];
const REMIND_HINTS = {
  quiet: "Emi acts out each nudge silently. Tap her to join in.",
  ask: "Emi asks you with a message and two buttons.",
  between: "Only suggests breaks when a work session ends.",
  off: "No nudges. Emi still offers a break after a session.",
};

/** A row of buttons bound to one setting; `cast` turns the button's data-v into the stored value. */
function bindSegment(id, key, cast) {
  const seg = $(id);
  const paint = () => [...seg.children].forEach(b => b.setAttribute("aria-pressed", String(cast(b.dataset.v) === S[key])));
  seg.onclick = e => {
    const b = e.target.closest("button");
    if (!b) return;
    S[key] = cast(b.dataset.v); save(); paint(); applyPrefs();
  };
  paint();
}

function openSettings() {
  $("nameInput").value = S.name;
  TOGGLES.forEach(k => { $(k + "Toggle").checked = S[k]; });
  bindSegment("setRemind", "remind", String);
  bindSegment("setEmpathy", "empathy", Number);
  bindSegment("setSize", "size", String);
  bindSegment("setFont", "font", String);
  renderNudgeSettings();
  renderMemories();
  $("resetConfirm").hidden = true;
  if (!$("settings").open) $("settings").showModal();
}

function renderNudgeSettings() {
  const list = $("nudgeList");
  list.innerHTML = "";
  S.nudges.forEach(n => {
    const on = h("input", { type: "checkbox", class: "switch", id: "nsw-" + n.id, "aria-label": n.label + " on or off" });
    on.checked = n.on;
    const mins = h("input", { type: "number", class: "field mins", id: "nmin-" + n.id, min: "5", max: "240", value: String(n.every), "aria-label": n.label + " every how many minutes" });
    list.append(h("div", { class: "set" },
      h("label", { for: "nmin-" + n.id }, n.label, h("small", {}, S.demo ? "every … minutes (seconds in demo speed)" : "every … minutes")),
      h("div", { class: "set-controls" }, mins, on)));
  });
}

function renderMemories() {
  const list = $("memList");
  list.innerHTML = "";
  if (!S.memories.length) {
    list.append(h("li", {}, h("span", {}, "Nothing yet. When you share things in Talk, like your routine or what helps you, Emi saves them here.")));
    return;
  }
  S.memories.forEach((m, i) => list.append(h("li", {}, h("span", {}, m),
    h("button", { type: "button", class: "small-btn", onclick: () => { S.memories.splice(i, 1); save(); renderMemories(); } }, "Forget"))));
}

/** Save the sheet when it closes with Done. */
function saveSettings() {
  const wasDemo = S.demo, wasSmart = S.smart;
  S.name = $("nameInput").value.trim();
  TOGGLES.forEach(k => { S[k] = $(k + "Toggle").checked; });
  S.nudges.forEach(n => {
    const every = parseInt($("nmin-" + n.id).value, 10);
    if (every >= 5 && every <= 240) n.every = every;
    const on = $("nsw-" + n.id).checked;
    if (on && !n.on) n.last = Date.now();
    n.on = on;
    if (wasDemo !== S.demo) n.last = Date.now(); // timings changed scale
  });
  if (S.session && wasDemo !== S.demo) S.session = null;
  save(); applyPrefs(); renderAll();
  if (wasSmart !== S.smart) renderTalk();
}

function resetEverything() {
  S = DEFAULT_STATE(); save();
  $("settings").close();
  applyPrefs(); renderAll(); renderTalk(); greet();
}

/** Apply comfort settings to the page. */
function applyPrefs() {
  const root = document.documentElement;
  root.dataset.size = S.size;
  root.dataset.font = S.font;
  root.dataset.calm = S.calm ? "on" : "off";
  $("remindHint").textContent = REMIND_HINTS[S.remind] || "";
  if (S.remind !== "quiet" && quietNudge) endQuiet();
}
