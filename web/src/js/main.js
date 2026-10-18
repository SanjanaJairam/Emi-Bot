/* Wiring and start-up. */

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
  ["now", "list", "talk"].forEach(n => { $("tab-" + n).hidden = n !== name; });
  if (name === "talk") $("log").scrollTop = $("log").scrollHeight;
}

function renderAll() {
  const chip = $("energyChip");
  chip.hidden = !(S.onboard >= 3 && S.energy);
  chip.textContent = "Energy · " + ({ low: "low", ok: "okay", good: "good" }[S.energy] || "");
  renderNow(); renderList(); renderJar(); tick();
}

/** Runs every second: the session timer, or nudges when no session is running. */
function tick() {
  if (S.session) return tickSession();
  $("ring").setAttribute("hidden", "");
  tickNudges();
}

function greet() {
  const hour = new Date().getHours();
  if (S.onboard < 3) {
    setMood("wave");
    setBubble(S.onboard === 0 ? "Hi! I'm Emi, your desk buddy. I'll keep you company while you work." : "Let's finish setting up. Just a couple of taps.");
  } else if (S.session) {
    setMood(S.session.kind === "focus" ? "focus" : "stretch");
    setBubble("Welcome back. We're still going.");
  } else if (hour >= 23 || hour < 5) {
    say(`It's late, ${who()}. Rest is part of the work too.`, "sleepy");
  } else {
    const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    say(pick([`Good ${part}.`, `Good ${part}, ${who()}!`, `Good ${part}, ${who()}. I'm happy you're here.`]), "wave");
  }
}

/* Tapping Emi: join a quiet nudge, or get a wiggle and a kind word. */
const TAP_LINES = [
  ["Hi.", "I'm here.", "Ready when you are."],
  ["Hehe, hi!", "Boop!", "I'm right here with you.", "That tickles!"],
  ["Hi friend. I'm right here.", "I'm happy you're here.", "You're doing better than you think.", "Take your time. I'll wait with you."],
];
let lastTap = 0;
function onEmiTap() {
  if (quietNudge) { const n = quietNudge; endQuiet(); askNudge(n); return; }
  if (Date.now() - lastTap < 1500) return;
  lastTap = Date.now();
  wiggle();
  if (!prompting && !S.session && S.onboard >= 3) {
    const lines = TAP_LINES[S.empathy];
    setBubble(lines[Math.floor(Math.random() * lines.length)]);
  }
}

/* "Where was I?": after a few minutes away, remind the person of their task and step. */
let hiddenAt = 0;
function onVisibilityChange() {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  const away = Date.now() - hiddenAt;
  if (!hiddenAt || away < (S.demo ? 8000 : 180000) || prompting || S.onboard < 3) return;
  const t = currentTask();
  if (!t) return;
  const step = nextStep(t);
  say(`Welcome back! You were working on "${t.title}".` + (step ? ` Next tiny step: ${step.text}` : ""), "wave");
}

function wireEvents() {
  document.querySelectorAll(".tab").forEach(t => { t.onclick = () => switchTab(t.dataset.tab); });
  document.addEventListener("visibilitychange", onVisibilityChange);

  $("spot").onclick = onEmiTap;
  $("spot").onkeydown = e => {
    if ((e.key === "Enter" || e.key === " ") && quietNudge) { e.preventDefault(); onEmiTap(); }
  };
  $("energyChip").onclick = () => {
    S.energyDate = ""; save();
    switchTab("now"); renderAll();
    say("How's your energy now?", "think");
  };

  $("addForm").onsubmit = e => {
    e.preventDefault();
    if (addTask($("addInput").value)) { $("addInput").value = ""; renderAll(); }
  };
  $("dumpBtn").onclick = brainDump;

  $("sendForm").onsubmit = e => {
    e.preventDefault();
    const text = $("sendInput").value.trim();
    if (text) { $("sendInput").value = ""; talk(text); }
  };
  $("talkChips").onclick = e => { const b = e.target.closest("button"); if (b) talk(b.dataset.say); };
  setupVoice();

  $("settingsBtn").onclick = openSettings;
  $("settingsForm").addEventListener("submit", saveSettings);
  $("resetBtn").onclick = () => { $("resetConfirm").hidden = false; };
  $("resetNo").onclick = () => { $("resetConfirm").hidden = true; };
  $("resetYes").onclick = resetEverything;
}

function start() {
  if (S.session && S.session.end <= Date.now()) S.session = null;
  $("ringProg").style.strokeDasharray = RING_LENGTH;
  wireEvents();
  applyPrefs();
  renderAll();
  greet();
  renderTalk();
  setInterval(tick, 1000);
}

start();
