/* The Now screen: setup, energy check-in, then one task and its next tiny step. */

const TALK_STYLES = [["Just facts", "Short and direct"], ["Friendly", "Warm and brief"], ["Extra gentle", "Checks how you feel"]];
const REMIND_STYLES = [["quiet", "Quiet", "Emi acts it out"], ["between", "Between", "Only after sessions"], ["off", "Off", "No reminders"]];
const ENERGY_LEVELS = [["low", "Low", "Tiny steps"], ["ok", "Okay", "Small steps"], ["good", "Good", "Bigger steps"]];

const eyebrow = text => h("div", { class: "eyebrow" }, text);
const title = text => h("div", { class: "task-title" }, text);
const hint = text => h("div", { class: "hint" }, text);
const choiceGrid = (options, isPicked, onPick) => h("div", { class: "choice" },
  options.map(([value, label, sub]) => h("button", { "aria-pressed": String(isPicked(value)), onclick: () => onPick(value) }, label, h("small", {}, sub))));

function renderNow() {
  const card = $("nowCard");
  card.innerHTML = "";
  const needsEnergy = S.onboard === 2 || S.energyDate !== today();

  if (S.onboard === 0) return card.append(...askName());
  if (S.onboard === 1) return card.append(...askTalkStyle());
  if (S.onboard === 2 && S.remindAsked === false) return card.append(...askRemindStyle());
  if (needsEnergy && !S.session) return card.append(...askEnergy());
  if (S.session) return card.append(...sessionView());

  const t = currentTask();
  card.append(...(t ? taskView(t) : firstTaskView()));
}

/* ---------- Setup: four gentle questions ---------- */
function askName() {
  const input = h("input", { class: "field", id: "obName", placeholder: "Your name (optional)", autocomplete: "off" });
  const go = () => {
    S.name = input.value.trim(); S.onboard = 1; save();
    say(`Nice to meet you${S.name ? ", " + S.name : ""}! How should I talk to you?`, "happy");
    renderAll();
  };
  input.onkeydown = e => { if (e.key === "Enter") go(); };
  return [eyebrow("Hello"), title("What should Emi call you?"), h("label", { class: "sr", for: "obName" }, "Your name"), input,
    h("div", { class: "row" }, h("button", { class: "btn", onclick: go }, "Continue"), h("button", { class: "btn soft", onclick: () => { input.value = ""; go(); } }, "Skip"))];
}

function askTalkStyle() {
  const options = TALK_STYLES.map(([label, sub], i) => [i, label, sub]);
  return [eyebrow("Step 2 of 4"), title("How should Emi talk to you?"),
    choiceGrid(options, i => S.empathy === i, i => {
      S.empathy = i; S.onboard = 2; S.remindAsked = false; save();
      say(pick(["Got it. Short and clear.", "Okay! Friendly and brief.", "I'll be gentle with you."]), "happy");
      renderAll();
    }),
    hint("You can change this anytime in Settings.")];
}

function askRemindStyle() {
  const reply = { quiet: "I'll just sip my water or stretch nearby. Tap me if you want to join.", between: "Okay. I'll only suggest breaks after we finish working.", off: "Okay, no reminders. I'm still here if you need me." };
  return [eyebrow("Step 3 of 4"), title("How should Emi remind you to take care of yourself?"),
    choiceGrid(REMIND_STYLES, v => S.remind === v, v => {
      S.remind = v; S.remindAsked = true; save();
      say(reply[v], v === "quiet" ? "sip" : "happy");
      renderAll();
    }),
    hint("You can change this anytime in Settings.")];
}

function askEnergy() {
  return [eyebrow(S.onboard === 2 ? "Step 4 of 4" : "Quick check-in"), title("How's your energy right now?"),
    choiceGrid(ENERGY_LEVELS, v => S.energy === v, v => setEnergy(v)),
    h("div", { class: "row" }, h("button", { class: "link-btn", onclick: () => setEnergy(S.energy || "ok", true) }, "Skip for today"))];
}

function setEnergy(level, skipped) {
  const finishingSetup = S.onboard === 2;
  S.energy = level; S.energyDate = today(); S.onboard = 3; save();
  if (finishingSetup) {
    say(`You're all set${S.name ? ", " + S.name : ""}. Let's do one thing at a time.`, "wave");
  } else if (!skipped) {
    const lines = {
      low: ["Low energy. Tiny steps.", "Low energy is okay. We'll keep things tiny.", "Thank you for telling me. Let's be gentle today and keep everything small."],
      ok: ["Okay energy. Small steps.", "Okay! Small steps today.", "Okay is good enough. Small steps."],
      good: ["Good energy.", "Nice! Let's make the most of it.", "I'm glad you're feeling good. Let's go, gently."],
    };
    say(pick(lines[level]), level === "low" ? "sleepy" : "happy");
  }
  renderAll();
}

/* ---------- Working together / break ---------- */
function sessionView() {
  const s = S.session, focus = s.kind === "focus", t = currentTask();
  const step = focus && t ? nextStep(t) : null;
  const parts = [
    eyebrow(focus ? "Working together" : "Break time"),
    title(focus ? (t ? t.title : "Your work") : "Stretch, sip, look away"),
    h("div", { class: "timer", id: "timerText" }, fmtClock(s.end - Date.now())),
  ];
  if (step) parts.push(stepBox(t, step, false));
  parts.push(focus
    ? h("div", { class: "row" },
        h("button", { class: "btn soft", onclick: () => stopSession(true) }, "Stop for now"),
        t ? h("button", { class: "btn soft", onclick: () => { stopSession(true); completeTask(t); } }, "Task is done") : "")
    : h("div", { class: "row" }, h("button", { class: "btn", onclick: () => stopSession(false) }, "I'm ready to go back")));
  return parts;
}

/* ---------- One task, one step ---------- */
function firstTaskView() {
  const input = h("input", { class: "field", id: "firstTask", placeholder: "e.g. Write intro paragraph", autocomplete: "off" });
  const go = () => {
    const t = addTask(input.value);
    if (!t) return;
    S.currentId = t.id; save();
    say("Got it. Want me to break it into tiny steps?", "happy");
    renderAll();
  };
  input.onkeydown = e => { if (e.key === "Enter") go(); };
  return [eyebrow("Right now"), title("What's one thing you'd like to do?"), h("label", { class: "sr", for: "firstTask" }, "One task"), input,
    h("div", { class: "row" }, h("button", { class: "btn", onclick: go }, "Add it"))];
}

function taskView(t) {
  const step = nextStep(t);
  const heading = title(t.title);
  if (t.example) heading.append(h("span", { class: "tag" }, "Example"));
  const parts = [eyebrow("Right now"), heading];

  if (step) parts.push(stepBox(t, step, true));
  else if (t.steps.length) parts.push(hint("All steps done! You can mark the task finished."));
  else {
    const btn = h("button", { class: "btn butter" }, "Break it into tiny steps");
    btn.onclick = () => breakDown(t, btn);
    parts.push(h("div", { class: "row" }, btn));
  }

  parts.push(
    h("div", { class: "row" }, h("button", { class: "btn", onclick: startFocus }, `Start ${dur(focusLen())} with Emi`)),
    h("div", { class: "row spread" },
      openTasks().length > 1 ? h("button", { class: "link-btn", onclick: cycleTask }, "Show a different task") : h("span"),
      h("button", { class: "link-btn", onclick: () => completeTask(t) }, "Mark task done")));
  return parts;
}

function stepBox(t, step, canShrink) {
  const check = h("input", { type: "checkbox", class: "check", id: "stepCheck", "aria-label": "Step done: " + step.text });
  check.onchange = () => {
    step.done = true; save();
    say(nextStep(t)
      ? pick(["Next step.", "Yes! On to the next tiny step.", "Lovely. One step at a time, just like that."])
      : pick(["All steps done.", "That was the last step!", "That was the last step. You did all of it."]), "love");
    setTimeout(idleIfFree, 3000);
    renderNow(); renderList();
  };
  const box = h("div", { class: "step-box" }, check,
    h("div", { class: "txt" }, h("span", { class: "lbl" }, `Next tiny step · ${t.steps.indexOf(step) + 1} of ${t.steps.length}`), step.text));
  if (!canShrink) return box;
  const smaller = h("button", { class: "link-btn" }, "Make this step smaller");
  smaller.onclick = () => makeSmaller(t, step, smaller);
  return h("div", { class: "step" }, box, h("div", {}, smaller));
}
