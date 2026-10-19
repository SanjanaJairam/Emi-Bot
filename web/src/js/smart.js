/* Task help: uses Claude when Smart help is on, otherwise (or if Claude fails) the built-in brain. */

const FALLBACK_NOTE = "My smart help isn't available right now, so I used my built-in ideas.";

const ENERGY_HINT = {
  low: "Energy is LOW. Make 5 to 7 very tiny steps, each under 3 minutes, starting with something almost effortless (like 'open the file').",
  ok: "Energy is okay. Make 4 or 5 small steps, each under 10 minutes.",
  good: "Energy is good. Make 3 or 4 clear steps.",
};

function setBusyButton(btn, busyText) {
  if (!btn) return () => {};
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = busyText;
  return () => { btn.disabled = false; btn.textContent = label; };
}

async function breakDown(t, btn) {
  if (!S.smart) return builtInBreakDown(t);
  setBusyButton(btn, "Thinking…"); setMood("think");
  try {
    const r = await askClaudeJSON(`You help a neurodivergent student start tasks. Break this task into concrete, literal steps. ${ENERGY_HINT[S.energy || "ok"]}
Each step starts with a verb, is under 12 words, and needs no further planning.
Task: "${t.title}"
${S.memories.length ? "About the user: " + S.memories.join("; ") : ""}
Respond with ONLY JSON: {"steps": ["..."], "cheer": "one short, kind sentence"}`);
    const steps = cleanList(r.steps, 8);
    if (!steps.length) throw { code: "empty" };
    t.steps = toSteps(steps); save();
    say(r.cheer || "Here's your first tiny step. Just that one.", "happy");
    renderAll();
  } catch { builtInBreakDown(t, FALLBACK_NOTE); }
}

async function makeSmaller(t, step, btn) {
  if (!S.smart) return builtInSmaller(t, step);
  setBusyButton(btn, "Thinking…"); setMood("think");
  try {
    const r = await askClaudeJSON(`A student feels stuck on this step. Split it into 2 or 3 even smaller, literal steps, each under 3 minutes and under 10 words, starting with a verb.
Task: "${t.title}"
Step: "${step.text}"
Respond with ONLY JSON: {"steps": ["..."]}`);
    const parts = cleanList(r.steps, 3);
    if (!parts.length) throw { code: "empty" };
    t.steps.splice(t.steps.indexOf(step), 1, ...toSteps(parts)); save();
    say("Smaller now. Just do the first one.", "idle");
    renderAll();
  } catch { builtInSmaller(t, step, FALLBACK_NOTE); }
}

/* Anything in a brain dump that isn't a task (signs of crisis, harsh self-talk) never becomes
   a task and is never sent to Claude. Emi answers it kindly instead (see care.js). */
async function brainDump() {
  const raw = $("dumpInput").value.trim();
  if (!raw) return;
  const scan = careScan(raw);
  const text = scan.restText;
  const afterCare = () => { if (scan.crisis.length) showSupport(); else if (scan.harsh.length) careHarsh(); };
  if (!text) { closeDump(); renderAll(); return scan.crisis.length || scan.harsh.length ? afterCare() : undefined; }
  if (!S.smart) { builtInDump(text); return afterCare(); }
  const restore = setBusyButton($("dumpBtn"), "Sorting…"); setMood("think");
  try {
    const r = await askClaudeJSON(`Turn this messy brain dump into a short list of clear tasks. Merge duplicates. Each task starts with a verb and is under 10 words. Mark tasks that are clearly not for today as later.
Brain dump: """${text.slice(0, 3000)}"""
Respond with ONLY JSON: {"today": ["..."], "later": ["..."], "cheer": "one short kind sentence"}`);
    const forToday = cleanList(r.today, 12), forLater = cleanList(r.later, 12);
    if (!forToday.length && !forLater.length) throw { code: "empty" };
    forToday.forEach(x => addTask(x));
    forLater.forEach(x => addTask(x, { later: true }));
    closeDump();
    say(r.cheer || `I sorted that into ${forToday.length + forLater.length} tasks.`, "happy");
    renderAll();
  } catch { builtInDump(text, FALLBACK_NOTE); }
  finally { restore(); afterCare(); }
}
