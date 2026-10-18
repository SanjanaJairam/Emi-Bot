/* Gentle self-care nudges and the cozy star jar.
   Styles: quiet (Emi acts it out silently), ask (message + two buttons),
   between (only folded into the end of a work session), off. */

const NUDGES = {
  water: { mood: "sip", quiet: "Emi is sipping water. Tap her if you'd like to join.",
    lines: () => ["Water.", "Sip check! I'm having some too.", `Let's both have a sip of water, ${who()}. Small things count.`] },
  eyes: { mood: "sleepy", quiet: "Emi is resting her eyes. Tap her to rest yours too.",
    lines: () => ["Look far away for 20 seconds.", "Let's rest our eyes. Look at something far away for 20 seconds.", "Your eyes work hard. Let them soften on something far away for 20 seconds with me."] },
  move: { mood: "stretch", quiet: "Emi is stretching. Tap her to stretch with her.",
    lines: () => ["Stand up and stretch.", "Stretch with me! Arms up, big reach.", `Your body might like a little stretch, ${who()}. Reach up with me.`] },
  snack: { mood: "eat", quiet: "Emi is having a snack. Tap her if you're hungry too.",
    lines: () => ["Eat something.", "Snack time! I'm having noodles. What about you?", `Your brain runs on food, ${who()}. Let's both have a little something to eat.`] },
};
const QUIET_SECONDS = 25;
const SNOOZE_MINUTES = 10;

const dueIn = n => n.last + n.every * unit() - Date.now();
const pausedToday = n => n.pausedDay === today();
const activeNudges = () => S.nudges.filter(n => n.on && !pausedToday(n));
const dueNudges = () => activeNudges().filter(n => dueIn(n) <= 0);

function addStar() {
  S.stars[today()] = (S.stars[today()] || 0) + 1;
  S.starsTotal++;
  save(); renderJar();
}

function nudgeDone(n) {
  n.last = Date.now(); n.skips = 0; addStar(); save();
  say(pick(["+1 star.", "Yay, a star for your jar!", "That's a star for your cozy jar. Thank you for caring for yourself."]), "happy");
  setTimeout(idleIfFree, 3500);
}

/** "Not now": snooze, and after two in a row, stop asking about it for the rest of the day. */
function nudgeSkip(n) {
  n.skips = (n.skips || 0) + 1;
  if (n.skips >= 2) {
    n.pausedDay = today(); n.skips = 0; n.last = Date.now(); save();
    say(pick([`${n.label}: off for today.`, "I'll stop asking about that for today. You can turn it back on in Settings.", "That's okay. I won't ask about that again today. You're the one who knows what you need."]), "idle");
  } else {
    n.last = Date.now() - (n.every - SNOOZE_MINUTES) * unit(); save();
    say(pick([`Okay. ${durLong(SNOOZE_MINUTES)}.`, "No worries! I'll ask again in a bit.", "That's completely fine. I'll check back later."]), "idle");
  }
}

function askNudge(n) {
  chime();
  say(pick(NUDGES[n.id].lines()), NUDGES[n.id].mood, [
    { label: "Done", fn: () => nudgeDone(n) },
    { label: "Not now", fn: () => nudgeSkip(n) },
  ]);
}

/* Quiet style: Emi acts it out; nothing to answer unless you tap her. */
let quietNudge = null, quietTimer = null;
function startQuiet(n) {
  quietNudge = n;
  setMood(NUDGES[n.id].mood);
  const spot = $("spot");
  spot.classList.add("tappable");
  spot.setAttribute("tabindex", "0");
  spot.setAttribute("role", "button");
  spot.setAttribute("aria-label", NUDGES[n.id].quiet);
  clearTimeout(quietTimer);
  quietTimer = setTimeout(() => {
    if (quietNudge !== n) return;
    n.last = Date.now(); save();
    endQuiet(); idleIfFree();
  }, QUIET_SECONDS * 1000);
}
function endQuiet() {
  quietNudge = null;
  clearTimeout(quietTimer);
  const spot = $("spot");
  spot.classList.remove("tappable");
  ["tabindex", "role", "aria-label"].forEach(a => spot.removeAttribute(a));
}

/** Called every second when no session is running. */
function tickNudges() {
  const usesClock = S.remind === "ask" || S.remind === "quiet";
  if (usesClock && !prompting && !quietNudge && S.onboard >= 3 && !document.hidden) {
    const due = dueNudges()[0];
    if (due) S.remind === "quiet" ? startQuiet(due) : askNudge(due);
  }
  $("quiet").textContent = nudgeStatus();
}

function nudgeStatus() {
  if (S.onboard < 3) return "";
  if (quietNudge) return NUDGES[quietNudge.id].quiet;
  if (S.remind === "off") return "Reminders are off. I'll still offer a break after we work together.";
  if (S.remind === "between") return "I'll only suggest breaks when a work session ends.";
  const next = activeNudges().sort((a, b) => dueIn(a) - dueIn(b))[0];
  if (next) return `Next gentle nudge: ${next.label.toLowerCase()} in ${dur(Math.max(1, Math.ceil(dueIn(next) / unit())))}`;
  return S.nudges.some(n => n.on && pausedToday(n)) ? "No more nudges today." : "Nudges are off.";
}
