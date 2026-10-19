/* Behavioural tests for Emi's care check, in the style of CheckList (Ribeiro et al., 2020).

    node web/src/tests/care_test.js

Each group tests one expected behaviour. The "must stay quiet" groups are the failures found when
auditing a hate-speech filter: it flagged swearing, missed negation, and over-flagged slang,
African American English and identity words. Emi must not repeat them. */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "..", "js", "care.js"), "utf8");
const { careCheck, careScan } = new Function(src + "\nreturn { careCheck, careScan };")();

const GROUPS = [
  ["Venting and swearing stay quiet", "none", [
    "this damn printer jammed again", "ugh this fucking essay", "shit I forgot my laundry",
    "I'm so tired of this assignment", "I hate Mondays", "this is so stupid", "my code is garbage today lol",
  ]],
  ["Figures of speech stay quiet", "none", [
    "this homework is killing me", "I'm dead 💀 that was so funny", "lowkey dying of laughter rn",
    "my phone died again", "I could kill for a coffee", "deadline is tomorrow", "dead tired today",
    "I want to die of embarrassment", "this lecture is the worst", "kill the bug in my code",
  ]],
  ["Negation stays quiet", "none", [
    "I'm not stupid, this assignment is", "I don't hate myself, I just hate Mondays", "I'm not lazy, I'm just tired",
    "I don't think I'm a failure anymore", "I'm no longer a mess about this", "I never said I'm useless",
  ]],
  ["Slang and African American English stay quiet", "none", [
    "finna start this essay fr", "deadass this class be hard", "on god I'm finishing tonight",
    "ion even know where to start lol", "bruh this hw got me stressed", "it's giving procrastination",
    "I'm tired tired", "she be studying all night",
  ]],
  ["Identity statements stay quiet", "none", [
    "I'm a proud Black woman", "I'm queer and I love who I am", "I'm autistic and I need quiet to focus",
    "I'm a disabled student", "fasting today so my energy is low", "I'm a proud Canadian woman", "I am a white person",
  ]],
  ["Coursework about hard topics stays quiet", "none", [
    "read the suicide prevention chapter for psych", "email prof about meeting", "finish slides for thursday",
    "write self-harm awareness poster for club", "watch suicide squad with friends",
  ]],
  ["Harsh self-talk gets a gentle reply", "harsh", [
    "I'm so stupid", "i'm such an idiot", "I hate myself", "ugh I'm literally useless", "I'm a failure",
    "what's wrong with me", "I can't do anything right", "I feel like a burden", "I always mess everything up",
    "I'm a fucking idiot", "im so dumb lol", "I'm not good enough", "I’m such a mess", "I suck at everything",
  ]],
  ["Signs of crisis get the support card", "crisis", [
    "I want to die", "i wanna die", "I want to kill myself", "kms", "I've been thinking about suicide",
    "I keep hurting myself", "I don't want to be alive anymore", "everyone would be better off without me",
    "I want to end it all", "there's no reason to live", "I'm thinking of ending my life", "i want to unalive myself",
    "i wish i was dead", "I can't go on like this", "I don't want to wake up tomorrow", "I’ve been cutting myself again",
  ]],
  ["Saying you won't still gets the card (erring toward support)", "crisis", [
    "I'm not going to hurt myself but I think about it", "I don't want to kill myself, I just feel empty",
  ]],
];

let failed = 0, total = 0;
for (const [name, expected, cases] of GROUPS) {
  const misses = cases.filter(c => careCheck(c) !== expected);
  total += cases.length; failed += misses.length;
  console.log(`${misses.length ? "FAIL" : "pass"}  ${name}: ${cases.length - misses.length}/${cases.length}`);
  misses.forEach(c => console.log(`        "${c}" -> ${careCheck(c)} (expected ${expected})`));
}

// Brain dump: tasks are kept, anything else is set aside and never becomes a task.
const dump = careScan("email prof, I want to die, laundry; I'm so stupid. also finish slides");
const dumpOk = dump.crisis.length === 1 && dump.harsh.length === 1
  && dump.restText === "email prof\nlaundry\nfinish slides";
total += 1; if (!dumpOk) failed += 1;
console.log(`${dumpOk ? "pass" : "FAIL"}  Brain dump keeps tasks and sets the rest aside`);
if (!dumpOk) console.log("        got", JSON.stringify(dump));

console.log(`\n${total - failed}/${total} passed`);
process.exit(failed ? 1 : 0);
