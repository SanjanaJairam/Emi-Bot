/* Care check: notices harsh self-talk and signs of crisis in what someone types.

   Lessons from auditing a hate-speech filter (github.com/SanjanaJairam/abusive-language-detection):
   - Swearing, slang and dialect are not harm. Nothing here reacts to profanity or to single words.
   - Negation fooled that filter. "I'm not stupid" and "I don't hate myself" must not trigger.
   - Don't act on the person. Emi never blocks, deletes or scolds; she offers something.
   - Point to people for the serious cases, and let the person say "that's not what I meant".

   Runs entirely on this device. The phrase lists will miss things, so for crisis the check
   errs toward offering support: an extra kind card costs far less than missing someone.
   Tested by web/src/tests/care_test.js. */

const CARE_CRISIS = [
  /\bkill(?:ing)? ?my ?self\b/, /\bkms\b/, /\bunalive\b/,
  /\b(?:want|wanna|going|gonna|plan(?:ning)?|ready|deserve) to die\b/, /\bwanna die\b/,
  /\bwish (?:i|i'd) (?:was|were|had) (?:dead|died|never been born)\b/,
  /\bsuicid\w*/, /\bself[- ]?harm\w*/,
  /\b(?:hurt(?:ing)?|harm(?:ing)?|cut(?:ting)?|burn(?:ing)?|starv(?:e|ing)) ?my ?self\b/,
  /\bend(?:ing)? (?:my life|it all)\b/,
  /\bno (?:reason|point) (?:to|in) (?:live|living|going on|being alive)\b/,
  /\b(?:better off|be better) (?:without me|dead|if i (?:was|were)n't here)\b/,
  /\b(?:don't|do not|dont) want to (?:live|be alive|exist|wake up)\b/,
  /\b(?:don't|do not|dont) want to be here (?:anymore|any more)\b/,
  /\bcan't go on\b/, /\bcant go on\b/,
];
// Phrases that mention the topic without being about the person: coursework, films, research.
const CARE_CRISIS_EXCEPT = /\bsuicide (?:prevention|squad|awareness|rates?|research|statistics|hotline|lifeline)\b|\bself[- ]harm (?:awareness|research|prevention)\b|\bdie (?:of|from) (?:embarrassment|laughter|cringe|boredom)\b/;

const CARE_FILLER = "(?:so|such|a|an|really|just|completely|totally|literally|honestly|the|absolute|total|complete|actually|truly|kind of|kinda|lowkey|fucking|freaking|bloody|damn|super|very|an absolute)";
const CARE_HARSH_WORDS = "(?:stupid|useless|worthless|failure|lazy|pathetic|idiot|hopeless|dumb|mess|garbage|trash|burden|disappointment|worst|incompetent|loser)";
const CARE_HARSH = [
  new RegExp(`\\b(?:i'm|im|i am) (?:${CARE_FILLER} )*${CARE_HARSH_WORDS}\\b`),
  new RegExp(`\\bi feel (?:like )?(?:${CARE_FILLER} )*${CARE_HARSH_WORDS}\\b`),
  /\bi (?:(?:really|kinda|kind of|just|so|honestly|literally|fucking) )*hate (?:my ?self|who i am)\b/,
  /\bi can't do anything right\b/, /\bi cant do anything right\b/,
  /\bi (?:always|keep) (?:mess|screw|fuck)(?:ing)? (?:it |things |everything )?up\b/,
  /\bi ruin everything\b/, /\bwhat's wrong with me\b/, /\bwhats wrong with me\b/,
  /\b(?:i'm|im|i am) not good enough\b/, /\bi'll never be good enough\b/,
  /\bi suck at everything\b/,
];
// A negation just before a harsh phrase ("I'm not stupid", "I don't think I'm a failure").
const CARE_NEGATED = /\b(?:not|don't|dont|never|no longer|isn't|doesn't|wasn't|ain't)\b(?:\s+\w+){0,2}\s*$/;

const careNormalise = text => String(text || "").toLowerCase().replace(/[‘’ʼ]/g, "'");

/** One piece of text -> "crisis", "harsh" or "none". */
function careCheck(text) {
  const t = careNormalise(text);
  if (!CARE_CRISIS_EXCEPT.test(t) && CARE_CRISIS.some(re => re.test(t))) return "crisis";
  for (const re of CARE_HARSH) {
    const m = re.exec(t);
    if (m && !CARE_NEGATED.test(t.slice(0, m.index))) return "harsh";
  }
  return "none";
}

/** Split a brain dump the same way the built-in sorter does, and set aside anything that isn't a task. */
const CARE_SPLIT = /\n|;|,|\.\s|•|\band then\b|\balso\b/i;
function careScan(text) {
  const out = { crisis: [], harsh: [], rest: [] };
  String(text || "").split(CARE_SPLIT).map(x => x.trim()).filter(Boolean).forEach(part => {
    const level = careCheck(part);
    out[level === "none" ? "rest" : level].push(part);
  });
  return { ...out, restText: out.rest.join("\n") };
}

/* ---------- What Emi does (browser only) ---------- */

const CARE_HARSH_LINES = [
  "That's a harsh thing to say about yourself. Having a hard time doesn't make it true.",
  "Hey, go easy on yourself. Having a hard time doesn't make that true about you.",
  "That sounds like a really hard moment. Having a hard time doesn't make that true about you. Brains get stuck, especially when things feel big.",
];

/** Gentle answer to harsh self-talk, with a way forward and a way to just vent. */
function careHarsh() {
  say(pick(CARE_HARSH_LINES), "comfort", [
    { label: "Help me start", fn: () => { switchTab("talk"); runFlow("begin"); } },
    { label: "I just needed to vent", fn: () => say("That's okay. Venting counts. I'm here.", "comfort") },
  ]);
}

/** The support card: real people to talk to. Always dismissible, never a lecture. */
function showSupport({ noticed = true } = {}) {
  const box = $("care");
  box.innerHTML = "";
  box.append(
    h("h2", { class: "care-title" }, "You don't have to handle this alone"),
    h("p", {}, "I'm a robot cat, so I can't help the way a person can. These people can, any time, for free."),
    h("ul", { class: "care-list" },
      h("li", {}, h("b", {}, "Call or text 988"), " · 988 Suicide & Crisis Lifeline (US). ",
        h("a", { href: "tel:988" }, "Call"), " · ", h("a", { href: "sms:988" }, "Text"), " · ",
        h("a", { href: "https://988lifeline.org/chat/", target: "_blank", rel: "noopener" }, "Chat online")),
      h("li", {}, h("b", {}, "Text HOME to 741741"), " · Crisis Text Line (US)"),
      h("li", {}, h("b", {}, "Outside the US"), " · ",
        h("a", { href: "https://findahelpline.com", target: "_blank", rel: "noopener" }, "findahelpline.com"), " lists free helplines by country"),
      h("li", {}, h("b", {}, "In danger right now?"), " Call your local emergency number."),
    ),
    noticed ? h("p", { class: "hint" }, "I showed this because of words that can mean someone is struggling. This check runs on your device, and nothing about it is sent anywhere.") : "",
    h("div", { class: "row" },
      h("button", { class: "btn", type: "button", onclick: () => closeSupport("thanks") }, "Thanks, Emi"),
      noticed ? h("button", { class: "btn soft", type: "button", onclick: () => closeSupport("misread") }, "That's not what I meant") : "",
    ),
  );
  box.hidden = false;
  say(pick(["I'm here.", "I'm right here with you.", "I'm right here with you. Take your time."]), "comfort");
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeSupport(why) {
  $("care").hidden = true;
  if (why === "misread") say("Thanks for telling me. I'll carry on. If things ever feel that heavy, the support numbers are in Settings.", "idle");
  else say(pick(["I'm here.", "I'm right here with you.", "I'm right here with you. Take all the time you need."]), "comfort");
}

/** For Talk with Smart help: what Claude should know about this message. */
function carePromptNote(level) {
  if (level === "crisis") return "\n\nSAFETY: The user's last message may describe thoughts of suicide or self-harm. Emi has already shown crisis resources (988 Suicide & Crisis Lifeline, Crisis Text Line, findahelpline.com). Reply with warmth in two or three short sentences. Do not diagnose, do not suggest tasks or focus sessions, and gently encourage reaching out to one of those resources or a trusted person. Set suggest to none and leave remember and add_tasks empty.";
  if (level === "harsh") return "\n\nThe user just said something harsh about themselves. Gently and briefly disagree with it in your first sentence, without lecturing.";
  return "";
}
