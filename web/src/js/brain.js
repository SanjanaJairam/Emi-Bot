/* Emi's built-in brain: works with no AI at all. */

/* Step templates by kind of task, each with tinier steps for low energy.
   The first template whose pattern matches the task title wins, so more specific kinds come first. */
const STEP_TEMPLATES = [
  { kind: "email", re: /\b(e-?mails?|reply|respond|message|text|dm|follow[- ]?up|write back)\b/i,
    low: ["Open your inbox", "Find the email", "Read it once", "Write one sentence that answers the main question", "Add a hello and a thank you", "Press send"],
    ok: ["Open the email and read it", "Write the main answer in one or two sentences", "Add a greeting and a sign-off", "Read it once, then send"],
    good: ["Read the email and note what they need", "Write and send your reply", "Add any follow-up to your list"] },
  { kind: "slides", re: /\b(slides?|presentation|deck|poster|talk|pitch)\b/i,
    low: ["Open a blank slide deck", "Type the title on slide one", "Make one slide per main idea, titles only", "Add one line to the first slide", "Save the file"],
    ok: ["Open the deck", "Write slide titles for the main points", "Fill in the first two slides", "Add one picture or chart", "Save the file"],
    good: ["Outline the story slide by slide", "Fill in all the slide content", "Do one practice run out loud"] },
  { kind: "study", re: /\b(study|exams?|tests?|quiz|revise|revision|homework|assignment|problem sets?|pset|flashcards|lecture)\b/i,
    low: ["Get your notes or materials out", "Pick one topic", "Read one page of notes", "Answer one practice question", "Write down one thing you're unsure about"],
    ok: ["Gather your notes", "Choose one topic to cover", "Review that topic for 10 minutes", "Try three practice questions"],
    good: ["List the topics to cover", "Work through the first two topics", "Test yourself on what you covered"] },
  { kind: "code", re: /\b(code|coding|debug|bugs?|implement|script|program|deploy|robot|app|function|api|website)\b/i,
    low: ["Open your code editor", "Open the file you need", "Read the error or the part to change", "Write one comment saying what to do next", "Make one small change", "Run it once"],
    ok: ["Open the project and the right file", "Write down what should happen", "Make the smallest change that moves it forward", "Run it and check the result", "Save or commit your progress"],
    good: ["Write a short plan of the changes", "Build the first piece", "Run and test it", "Commit your progress"] },
  { kind: "chores", re: /\b(clean|tidy|laundry|dishes|room|organi[sz]e|vacuum|trash|groceries|shopping|cook)\b/i,
    low: ["Stand up", "Pick up five things and put them away", "Throw away any trash you can see", "Set a 5-minute timer and keep going", "Stop when the timer ends. That counts."],
    ok: ["Pick one area to start", "Put away ten things", "Wipe one surface", "Take out anything that needs to go"],
    good: ["Clear the biggest area first", "Put everything back in its place", "Finish with a quick wipe-down"] },
  { kind: "meeting", re: /\b(meeting|office hours|call|prep|prepare|interview|appointment|advisor)\b/i,
    low: ["Check the time in your calendar", "Open any notes for it", "Write one question you want to ask", "Write one thing you want to share", "Set a reminder 10 minutes before"],
    ok: ["Check the time and the link or room", "Look over your notes", "Write two questions or updates", "Set a reminder"],
    good: ["Review what you need to cover", "Write your talking points", "Gather any files to share"] },
  { kind: "reading", re: /\b(read|reading|article|book|pages|papers? to read)\b/i,
    low: ["Open the reading", "Read only the title and first paragraph", "Look at the headings", "Read one section", "Write one sentence about what you learned"],
    ok: ["Skim the headings and figures", "Read the introduction", "Read one main section", "Write three short notes"],
    good: ["Skim the whole thing first", "Read the key sections closely", "Write a short summary in your own words"] },
  { kind: "writing", re: /\b(write|draft|essay|paper|intro|introduction|report|thesis|chapter|abstract|review|blog|proposal|statement|letter|summary)\b/i,
    low: ["Open the document", "Read the last sentence you wrote", "Write one messy sentence about the main idea", "Write two more sentences, typos allowed", "List three points you want to make", "Save the file"],
    ok: ["Open the document and read the last paragraph", "List three points you want to make", "Write a messy first sentence for each point", "Turn the first point into a short paragraph", "Save and note where to start next time"],
    good: ["Outline the main points in a short list", "Draft the first section without editing", "Draft the next section", "Read it once and fix only big problems"] },
];
const GENERIC_STEPS = {
  low: ["Put what you need for this in front of you", "Say what 'done' looks like in one sentence", "Do the very first tiny bit", "Do one more small bit", "Check how it's going"],
  ok: ["Gather what you need", "Write what 'done' looks like", "Do the first small part", "Do the next part", "Check your progress"],
  good: ["Plan the main parts", "Do the first part", "Do the rest", "Check that it's done"],
};

function templateSteps(title) {
  const template = STEP_TEMPLATES.find(t => t.re.test(title)) || GENERIC_STEPS;
  return template[S.energy || "ok"];
}

/** Gives a task built-in steps if it has none yet. */
function ensureSteps(t) {
  if (!t.steps.length) { t.steps = toSteps(templateSteps(t.title)); save(); }
}

function builtInBreakDown(t, note) {
  t.steps = toSteps(templateSteps(t.title)); save();
  say(note || pick(["Steps ready. Start with the first.", "Here are some tiny steps. Just the first one for now.", "I made the steps small. You only need to do the first one."]), "happy");
  renderAll();
}

function builtInSmaller(t, step, note) {
  const lower = step.text.charAt(0).toLowerCase() + step.text.slice(1);
  const parts = ["Set a 2-minute timer", `Do only the first part of: ${lower}`, "Check it off, even if it isn't perfect"];
  t.steps.splice(t.steps.indexOf(step), 1, ...toSteps(parts)); save();
  say(note || "Smaller now. Just the 2-minute timer first.", "idle");
  renderAll();
}

/* Brain dump: split on lines, commas, semicolons, sentences, bullets and "and then"/"also".
   Anything that mentions a later day goes to Later. */
const LATER_RE = /\b(later|tomorrow|next (week|month)|someday|eventually|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
function builtInDump(text, note) {
  const seen = new Set();
  let forToday = 0, forLater = 0;
  text.split(/\n|;|,|\.\s|•|\band then\b|\balso\b/i)
    .map(x => x.replace(/^[\s\-*•\d.)]+/, "").trim())
    .filter(x => x.length > 1)
    .forEach(x => {
      const key = x.toLowerCase();
      if (seen.has(key) || seen.size >= 20) return;
      seen.add(key);
      const isLater = LATER_RE.test(x);
      addTask(capitalize(x).slice(0, 80), { later: isLater });
      if (isLater) forLater++; else forToday++;
    });
  closeDump();
  say(note || `I sorted that into ${forToday} for today${forLater ? ` and ${forLater} for later` : ""}.`, "happy");
  renderAll();
}
