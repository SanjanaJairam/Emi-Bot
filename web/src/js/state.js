/* Everything Emi knows, saved in this browser only. */

const STORAGE_KEY = "emi.desk.v2";

const DEFAULT_NUDGES = () => [
  { id: "water", label: "Sip some water", every: 45, on: true, last: Date.now() },
  { id: "eyes", label: "Rest your eyes", every: 20, on: false, last: Date.now() },
  { id: "move", label: "Stretch and move", every: 60, on: false, last: Date.now() },
  { id: "snack", label: "Eat something", every: 180, on: false, last: Date.now() },
];

const DEFAULT_STATE = () => ({
  // About you
  name: "", empathy: 1, energy: null, energyDate: "",
  // Setup progress: 0 name, 1 talk style, 2 reminder style + energy, 3 done
  onboard: 0,
  // Preferences
  remind: "quiet", smart: false, demo: true, calm: false, sound: false, speak: false, size: "m", font: "atk",
  memories: [],
  tasks: [
    { id: uid(), title: "Build robot for HRI", done: false, later: false, example: true, steps: [] },
    { id: uid(), title: "Reply to RA project email", done: false, later: false, example: true, steps: [] },
    { id: uid(), title: "Prep for TA office hours", done: false, later: true, example: true, steps: [] },
  ],
  currentId: null,
  nudges: DEFAULT_NUDGES(),
  stars: {}, starsTotal: 0,
  chat: [],
  session: null,
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = Object.assign(DEFAULT_STATE(), JSON.parse(raw));
      // Add any nudges introduced since this browser last saved.
      DEFAULT_NUDGES().forEach(d => { if (!saved.nudges.some(n => n.id === d.id)) saved.nudges.push(d); });
      return saved;
    }
  } catch {}
  return DEFAULT_STATE();
}
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch {} }

let S = loadState();

const who = () => S.name || "friend";
/** Milliseconds per "minute": demo speed makes a minute last one second. */
const unit = () => (S.demo ? 1000 : 60000);
/** Time labels that match demo speed: "15 min" / "15 sec", "15 minutes" / "15 seconds". */
const dur = n => `${n} ${S.demo ? "sec" : "min"}`;
const durLong = n => plural(n, S.demo ? "second" : "minute");
/** Pick the line that matches how Emi talks: [just facts, friendly, extra gentle]. */
const pick = lines => lines[Math.min(S.empathy, lines.length - 1)];
