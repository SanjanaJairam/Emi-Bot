/* Emi's face, words, voice and chime. */

const emi = $("emi");

const MOOD_LABELS = {
  idle: "Emi the cat, sitting with you", wave: "Emi waving hello", happy: "Emi smiling happily",
  love: "Emi happy, with little hearts", sleepy: "Emi resting her eyes", stretch: "Emi stretching",
  sip: "Emi sipping from a mug", eat: "Emi slurping noodles", focus: "Emi reading a book beside you",
  think: "Emi thinking", comfort: "Emi holding a heart for you",
};
const isMood = m => m in MOOD_LABELS;

function setMood(mood) {
  emi.dataset.mood = mood;
  emi.querySelectorAll("[data-m]").forEach(el => el.toggleAttribute("hidden", !el.dataset.m.split(" ").includes(mood)));
  emi.setAttribute("aria-label", MOOD_LABELS[mood] || MOOD_LABELS.idle);
}

/** True while Emi's bubble is waiting for an answer (its buttons are showing). */
let prompting = false;

/** Show a message in Emi's bubble, optionally with a mood and up to two answer buttons. */
function say(text, mood, actions = []) {
  if (quietNudge) endQuiet();
  $("bubble").textContent = text;
  if (mood) setMood(mood);
  const box = $("bubbleActions");
  box.innerHTML = "";
  prompting = actions.length > 0;
  actions.slice(0, 2).forEach((a, i) => box.append(h("button", {
    class: i ? "btn soft" : "btn",
    onclick: () => { box.innerHTML = ""; prompting = false; a.fn(); },
  }, a.label)));
  speak(text);
}

/** Change only the bubble text (no voice, no mood, keeps any buttons). */
const setBubble = text => { $("bubble").textContent = text; };

function speak(text) {
  if (!S.speak || !("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = .95; u.pitch = 1.2;
    speechSynthesis.speak(u);
  } catch {}
}

let audioCtx = null;
/** A soft two-note chime. Off unless the person turns it on; never in Calm mode. */
function chime() {
  if (!S.sound || S.calm) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [660, 880].forEach((freq, i) => {
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), t = audioCtx.currentTime + i * .18;
      osc.type = "sine"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(.06, t + .03);
      gain.gain.exponentialRampToValueAtTime(.0001, t + .6);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t); osc.stop(t + .65);
    });
  } catch {}
}

function wiggle() {
  emi.classList.remove("wiggle");
  void emi.getBBox(); // restart the animation
  emi.classList.add("wiggle");
  setTimeout(() => emi.classList.remove("wiggle"), 650);
}

/** Back to a calm resting state, unless Emi is busy with something. */
function idleIfFree() {
  if (prompting || S.session) return;
  setMood("idle");
  const t = currentTask();
  setBubble(t ? pick([`Next: ${t.title}.`, "I'm here when you're ready.", "I'm right here, whenever you're ready."]) : "I'm here when you need me.");
}
