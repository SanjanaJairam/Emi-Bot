/* The Talk tab.
   Without Smart help: tap-to-reply conversations (TALK_FLOWS).
   With Smart help: free typing, answered by Claude. */

function addMsg(role, text) {
  const msg = h("div", { class: "msg " + role }, text);
  $("log").append(msg);
  $("log").scrollTop = $("log").scrollHeight;
  return msg;
}
function logChat(role, text) {
  S.chat.push({ role, text }); save();
  addMsg(role === "user" ? "me" : "emi-m", text);
}

function renderTalk() {
  $("log").innerHTML = "";
  S.chat.slice(-30).forEach(m => addMsg(m.role === "user" ? "me" : "emi-m", m.text));
  $("talkChips").hidden = !S.smart;
  $("sendForm").hidden = !S.smart;
  $("choices").innerHTML = "";
  const hi = `Hi${S.name ? " " + S.name : ""}! `;
  if (!S.smart) {
    const root = TALK_FLOWS.root();
    addMsg("emi-m", (S.chat.length ? "" : hi) + root.text);
    showChoices(root.options);
  } else if (!S.chat.length) {
    addMsg("emi-m", hi + "Tell me what you're working on, ask for help starting, or tell me how you feel.");
  }
  $("aiStatus").textContent = S.smart
    ? "Smart help is on. What you type here is sent to Claude to write Emi's replies."
    : "Want to type to Emi freely? Turn on Smart help in Settings.";
}

/* ---------- Tap-to-reply conversations ----------
   Each step returns { text, mood, options }. An option's target is either the name of the
   next step, or a function to run. A function can return "stay" to keep its own choices. */
const goNow = fn => () => { switchTab("now"); fn(); };
const openList = () => switchTab("list");

const TALK_FLOWS = {
  root: () => ({ text: pick(["What do you need?", "What would help right now?", "I'm here. What would help right now?"]), mood: "wave",
    options: [["Help me start", "start"], ["I feel overwhelmed", "overwhelm"], ["Plan my next hour", "plan"], ["How am I doing?", "doing"]] }),

  start: () => ({ text: "Let's find a tiny way in. Which feels closest?", mood: "think",
    options: [["I don't know where to begin", "begin"], ["It feels too big", "begin"], ["I keep getting distracted", "distract"]] }),

  begin: () => {
    const t = currentTask();
    if (!t) return { text: "Add one thing you'd like to do in My list, and I'll break it into tiny steps.", mood: "idle", options: [["Open my list", openList]] };
    ensureSteps(t); renderAll();
    const step = nextStep(t);
    return {
      text: step ? `Let's start "${t.title}" with one tiny step: ${step.text}.` : `All the steps for "${t.title}" are done. You can mark it finished.`,
      mood: "happy",
      options: [[`Start ${dur(focusLen())} together`, goNow(startFocus)], ["Make it even smaller", () => { if (step) { builtInSmaller(t, step); switchTab("now"); } }]],
    };
  },

  distract: () => ({ text: "Let's work side by side. I'll read my book and keep you company. Nudges stay quiet while we work.", mood: "focus",
    options: [[`Start ${dur(focusLen())} together`, goNow(startFocus)], ["I need a break first", goNow(startBreak)]] }),

  overwhelm: () => ({ text: pick(["That's a lot. Let's breathe once: in for 4, out for 4.", "That sounds like a lot. Let's take one slow breath together. In, and out.", "I'm right here. That sounds really heavy. Let's take one slow breath together. In, and out."]), mood: "comfort",
    options: [["Okay, I breathed", "oneThing"], ["It's more than work", "heavy"]] }),

  oneThing: () => ({ text: "Thank you. Now we pick just one thing. Everything else can wait safely in your list.", mood: "comfort",
    options: [["Show me one thing", () => switchTab("now")], ["I need a break", goNow(startBreak)]] }),

  heavy: () => ({ text: "Thank you for telling me. I'm a robot cat, so I can't help the way a person can. Talking to someone you trust, like a friend, family member or counselor, can really help. If you're in danger or crisis, a crisis line can help right now.", mood: "comfort",
    options: [["Show support numbers", () => showSupport({ noticed: false })], ["Okay", "root"]] }),

  plan: () => {
    const t = currentTask(), n = focusLen();
    if (!t) return { text: "Add one task in My list first, then I can make a gentle plan.", mood: "idle", options: [["Open my list", openList]] };
    return {
      text: `Here's a gentle plan for the next hour:\n1. ${dur(n)} on "${t.title}" with me\n2. A ${dur(BREAK_MINUTES)} break\n3. ${dur(n)} more\n4. A longer rest`,
      mood: "happy",
      options: [["Start part 1", goNow(startFocus)], ["Pick a different task", () => { cycleTask(); runFlow("plan"); return "stay"; }]],
    };
  },

  doing: () => {
    const stars = S.stars[today()] || 0;
    return { text: `Today you've added ${plural(stars, "star")} to your jar and finished ${plural(doneToday(), "task")}. Showing up counts too.`, mood: "love",
      options: [["Thanks, Emi", "root"]] };
  },
};

function runFlow(name) {
  const step = TALK_FLOWS[name]();
  logChat("emi", step.text);
  if (!prompting) { setMood(step.mood); setBubble(step.text.split("\n")[0]); }
  showChoices(step.options);
}

function showChoices(options) {
  const box = $("choices");
  box.innerHTML = "";
  options.forEach(([label, target]) => box.append(h("button", {
    class: "choice-btn",
    onclick: () => {
      logChat("user", label);
      box.innerHTML = "";
      if (typeof target === "string") runFlow(target);
      else if (target() !== "stay") showChoices([["Talk about something else", "root"]]);
    },
  }, label)));
}

/* ---------- Free typing with Smart help ---------- */
const TONE = [
  "Be brief and factual: one or two short sentences. No emotional commentary unless they ask.",
  "Be warm and brief: two or three short sentences.",
  "Be extra gentle. Acknowledge feelings first, then offer one small idea. Up to four short sentences.",
];
const HEAVY_WORDS = /overwhelm|stress|anxious|sad|cry|tired|exhausted|can't do|cant do|hate myself|burn(ed|t)? out/i;

function chatPrompt() {
  const tasks = S.tasks.filter(t => !t.done)
    .map(t => `- ${t.title}${t.later ? " (later)" : ""}${t.steps.length ? ` [next step: ${nextStep(t)?.text || "all done"}]` : ""}`)
    .join("\n") || "(none)";
  const history = S.chat.slice(-12).map(m => (m.role === "user" ? "User: " : "Emi: ") + m.text).join("\n");
  const time = new Date().toLocaleString([], { weekday: "long", hour: "numeric", minute: "2-digit" });
  return `You are Emi, a small, soft cat desk-buddy robot with a glowing antenna. You keep a student company while they work, like a calm body double. Many of your users are neurodivergent (ADHD, autism, dyslexia).

How you talk:
- ${TONE[S.empathy]}
- Use short, plain, literal sentences. No sarcasm, idioms or vague phrases.
- Suggest ONE thing at a time. If you give options, give at most two.
- Never shame, guilt or pressure. Never mention what they failed to do. Missing things is normal.
- Never say "just" about something hard. Starting is the hardest part; praise effort, not output.
- No markdown, no emoji, no lists unless they ask for steps.
- You are a robot cat, not a human or therapist. If they mention self-harm or crisis, gently encourage contacting a trusted person or a local crisis line.

What you know:
- Name: ${S.name || "unknown"}. Energy today: ${S.energy || "unknown"}. Time: ${time}.
- Currently working together: ${S.session ? S.session.kind : "no"}.
- Tasks:\n${tasks}
- Remembered about them:\n${S.memories.map(m => "- " + m).join("\n") || "(nothing yet)"}

Conversation:
${history || "(new)"}

Reply with ONLY a JSON object:
{"reply": "what Emi says", "mood": "idle|wave|happy|love|sleepy|stretch|sip|eat|focus|think|comfort (use comfort when they feel sad, stressed or overwhelmed)", "remember": ["a short helpful fact they shared about themselves, if any"], "add_tasks": ["only tasks they asked you to add"], "suggest": "focus|break|none"}`;
}

let chatBusy = false;
function setChatBusy(busy) {
  chatBusy = busy;
  $("sendBtn").disabled = busy;
  document.querySelectorAll("#talkChips button").forEach(b => { b.disabled = busy; });
}

async function talk(text) {
  if (chatBusy) return;
  setChatBusy(true);
  logChat("user", text);
  const care = careCheck(text);
  if (care === "crisis") showSupport();
  const typing = addMsg("emi-m", "");
  typing.innerHTML = `<span class="typing" aria-label="Emi is thinking"><i></i><i></i><i></i></span>`;
  if (!prompting) setMood(care !== "none" || HEAVY_WORDS.test(text) ? "comfort" : "think");
  try {
    const r = await askClaudeJSON(chatPrompt() + carePromptNote(care));
    if (care === "crisis") { r.remember = []; r.add_tasks = []; r.suggest = "none"; }
    const reply = String(r.reply || "").trim() || "Could you say that another way?";
    typing.textContent = reply;
    S.chat.push({ role: "emi", text: reply });

    cleanList(r.remember, 5).forEach(m => { if (!S.memories.includes(m)) S.memories.push(m); });
    S.memories = S.memories.slice(-30);
    const added = cleanList(r.add_tasks, 10);
    added.forEach(x => addTask(x));
    if (added.length) addMsg("note", `Added ${added.length} to your list`);

    if (!prompting) {
      const offer = S.session ? []
        : r.suggest === "focus" ? [{ label: `Start ${dur(focusLen())} together`, fn: goNow(startFocus) }]
        : r.suggest === "break" ? [{ label: `Take a ${dur(BREAK_MINUTES)} break`, fn: goNow(startBreak) }]
        : [];
      say(reply, isMood(r.mood) ? r.mood : "idle", offer);
    }
    save(); renderList();
  } catch (e) {
    typing.className = "msg note";
    typing.textContent = aiErrorText(e) + " You can use the buttons below instead.";
    if (!prompting) setMood("sleepy");
    runFlow("root");
  } finally {
    setChatBusy(false);
  }
}

/* ---------- Voice input (works where the browser allows the microphone) ---------- */
function setupVoice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return;
  const mic = $("micBtn");
  let rec = null;
  mic.hidden = false;
  mic.onclick = () => {
    if (rec) return rec.stop();
    try {
      rec = new Recognition();
      rec.lang = "en-US"; rec.interimResults = true;
      mic.setAttribute("aria-pressed", "true");
      rec.onresult = e => { $("sendInput").value = [...e.results].map(r => r[0].transcript).join(""); };
      rec.onerror = e => addMsg("note", e.error === "not-allowed"
        ? "The microphone isn't allowed here. Voice works on your own site. Typing works everywhere."
        : "Voice stopped. You can type instead.");
      rec.onend = () => {
        mic.setAttribute("aria-pressed", "false"); rec = null;
        const said = $("sendInput").value.trim();
        if (said) { $("sendInput").value = ""; talk(said); }
      };
      rec.start();
    } catch {
      rec = null; mic.setAttribute("aria-pressed", "false");
      addMsg("note", "Voice isn't available here. You can type instead.");
    }
  };
}
