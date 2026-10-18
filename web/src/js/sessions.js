/* Working together (body doubling) and breaks, with the time ring around Emi. */

const FOCUS_MINUTES = { low: 10, ok: 15, good: 25 };
const BREAK_MINUTES = 5;
const focusLen = () => FOCUS_MINUTES[S.energy || "ok"];
const RING_LENGTH = 2 * Math.PI * 140; // circumference of the ring circle (r = 140)

function startFocus() {
  const t = currentTask(), len = focusLen();
  S.session = { kind: "focus", len, end: Date.now() + len * unit(), taskId: t ? t.id : null, warned: false };
  save();
  say(pick([`Focus: ${dur(len)}.`, `Let's work together for ${durLong(len)}. I'll read my book right here.`, `I'm right here with you for ${durLong(len)}. Just the first step, nothing more.`]), "focus");
  renderAll();
}

function startBreak() {
  S.session = { kind: "break", len: BREAK_MINUTES, end: Date.now() + BREAK_MINUTES * unit(), warned: true };
  addStar();
  save();
  say(pick([`Break: ${dur(BREAK_MINUTES)}. Stand up and move.`, "Break time! Stretch with me. Maybe grab some water.", "Let's rest together. Stretch, sip some water, look out a window. I'll tell you when it's time."]), "stretch");
  renderAll();
}

/** End the current session. `early` means the person stopped it before time ran out. */
function stopSession(early) {
  const s = S.session;
  S.session = null; save();
  if (!s) return;
  chime();
  if (s.kind === "focus") {
    // Fold any due nudges into the break offer instead of interrupting separately.
    const due = S.remind === "off" ? [] : dueNudges();
    due.forEach(n => { n.last = Date.now(); });
    const extra = !early && due.length ? " " + pick(["Water and a stretch, too.", "Maybe have some water while you're up.", "While you rest, a sip of water might feel nice."]) : "";
    const text = early
      ? pick(["Session stopped.", "Stopping is okay. You showed up.", "That's okay. Starting at all was the hard part, and you did it."])
      : pick(["Time's up. Break?", `${durLong(s.len)} done! How about a break?`, `We did ${durLong(s.len)} together. I'm proud of you. Want a little break?`]) + extra;
    say(text, "happy", [{ label: `Take a ${dur(BREAK_MINUTES)} break`, fn: startBreak }, { label: "Keep going", fn: startFocus }]);
  } else {
    say(pick(["Break over.", "Break's over. Ready when you are.", "How do you feel? No rush. Come back when you're ready."]), "wave",
      [{ label: "Back to work", fn: startFocus }, { label: "Not yet", fn: () => { say("Okay. Take your time.", "idle"); renderAll(); } }]);
  }
  renderAll();
}

/** Called every second while a session runs. */
function tickSession() {
  const s = S.session, left = s.end - Date.now();
  const ring = $("ring");
  ring.removeAttribute("hidden");
  ring.classList.toggle("break", s.kind === "break");
  $("ringProg").style.strokeDashoffset = RING_LENGTH * (1 - Math.max(0, left) / (s.len * unit()));
  const timer = $("timerText");
  if (timer) timer.textContent = fmtClock(left);
  if (s.kind === "focus" && !s.warned && left <= 2 * unit()) {
    s.warned = true; save();
    say(pick([`${durLong(2)} left.`, `${durLong(2)} left. Find a good place to pause.`, `We have about ${durLong(2)} left. You can start wrapping up your thought.`]), "focus");
  }
  $("quiet").textContent = s.kind === "focus" ? "Nudges are paused while we work." : "";
  if (left <= 0) stopSession(false);
}
