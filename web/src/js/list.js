/* The List tab: every task, brain dump, and the cozy jar. */

function renderList() {
  const ul = $("taskList");
  ul.innerHTML = "";
  const ordered = [
    ...S.tasks.filter(t => !t.done && !t.later),
    ...S.tasks.filter(t => !t.done && t.later),
    ...S.tasks.filter(t => t.done),
  ];
  if (!ordered.length) return ul.append(h("li", { class: "hint" }, "No tasks yet. Add one above."));
  ordered.forEach(t => ul.append(taskRow(t)));
}

function taskRow(t) {
  const check = h("input", { type: "checkbox", class: "check", "aria-label": "Done: " + t.title });
  check.checked = t.done;
  check.onchange = () => {
    if (check.checked) completeTask(t);
    else { t.done = false; save(); renderAll(); }
  };

  const label = h("div", { class: "t" }, t.title);
  if (t.later && !t.done) label.append(h("span", { class: "tag" }, "Later"));
  if (t.example) label.append(h("span", { class: "tag" }, "Example"));
  const progress = t.steps.length ? h("div", { class: "sub" }, `${t.steps.filter(s => s.done).length} of ${t.steps.length} steps`) : "";

  const more = h("div", { class: "more" });
  more.hidden = true;
  if (!t.done) more.append(
    h("button", { class: "small-btn", onclick: () => { S.currentId = t.id; t.later = false; save(); switchTab("now"); renderAll(); } }, "Do this now"),
    h("button", { class: "small-btn", onclick: () => { t.later = !t.later; save(); renderAll(); } }, t.later ? "Move to today" : "Save for later"));
  more.append(h("button", { class: "small-btn", onclick: () => removeTask(t) }, "Remove"));

  const toggle = h("button", { class: "small-btn", "aria-expanded": "false", "aria-label": "Options for " + t.title }, "•••");
  toggle.onclick = () => { more.hidden = !more.hidden; toggle.setAttribute("aria-expanded", String(!more.hidden)); };

  return h("li", { class: "task" + (t.done ? " done" : "") }, check, h("div", {}, label, progress), toggle, more);
}

function closeDump() { $("dumpInput").value = ""; $("dump").open = false; }

/* The jar shows up to 24 stars in staggered rows, filling from the bottom. */
const STAR_PATH = "M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3 Z";
function renderJar() {
  const n = S.starsTotal;
  $("jarCount").textContent = plural(n, "star");
  let stars = "";
  for (let i = 0; i < Math.min(n, 24); i++) {
    const col = i % 4, row = Math.floor(i / 4);
    stars += `<path class="st" transform="translate(${28 + col * 15 + (row % 2) * 7} ${104 - row * 12}) scale(.55)" d="${STAR_PATH}"/>`;
  }
  $("jar").innerHTML = `<rect class="lid" x="26" y="8" width="48" height="14" rx="5"/>`
    + `<path class="glass" d="M30 22 h40 q12 6 12 24 v54 q0 14 -14 14 h-36 q-14 0 -14 -14 v-54 q0 -18 12 -24 z"/>${stars}`;
}
