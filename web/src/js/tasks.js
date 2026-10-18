/* Tasks and their tiny steps. */

const openTasks = () => S.tasks.filter(t => !t.done && !t.later);
const nextStep = t => (t && t.steps ? t.steps.find(s => !s.done) : null);
const toSteps = texts => texts.map(text => ({ text, done: false }));

/** The one task shown on the Now screen. */
function currentTask() {
  let t = S.tasks.find(x => x.id === S.currentId && !x.done);
  if (!t) {
    t = openTasks()[0] || S.tasks.find(x => !x.done) || null;
    S.currentId = t ? t.id : null;
  }
  return t;
}

function addTask(title, { later = false } = {}) {
  title = String(title || "").trim();
  if (!title) return null;
  const t = { id: uid(), title, done: false, later, steps: [] };
  S.tasks.push(t);
  save();
  return t;
}

function completeTask(t) {
  t.done = true; t.doneAt = Date.now(); save();
  say(pick([`Done: ${t.title}.`, `You finished "${t.title}"! Nice work.`, `You finished "${t.title}". That took effort, and you did it. Take a breath before the next thing.`]), "happy");
  setTimeout(() => { if (!prompting && !S.session) setMood("idle"); }, 4000);
  renderAll();
}

function removeTask(t) { S.tasks = S.tasks.filter(x => x !== t); save(); renderAll(); }

/** Show the next open task on the Now screen. */
function cycleTask() {
  const list = openTasks();
  if (list.length < 2) return;
  const i = list.findIndex(t => t.id === S.currentId);
  S.currentId = list[(i + 1) % list.length].id;
  save(); renderNow();
}

const doneToday = () => S.tasks.filter(t => t.done && t.doneAt && dayKey(new Date(t.doneAt)) === today()).length;
