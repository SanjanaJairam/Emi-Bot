# Emi 🐱: An AI Desk Companion

Emi is a cat-inspired desk companion that keeps students company during long study sessions. She helps you start tasks, reminds you to rest, and stays quiet while you focus. The question behind her: how can a desk companion support productivity and well-being without becoming another distraction?

**Try Emi:** [emi-bot.vercel.app](https://emi-bot.vercel.app) · **Early prototype (v1):** [video](https://youtu.be/Et_nOuvK6xc)

## Background

Emi grew out of **Desk Buddy**, a human-robot interaction design research project (I540) by Sanjana Jairam, Vivian, and Haoru. We interviewed 11 people, surveyed 8, and observed three commercial desk robots (Vector, Eilik, and Emo). [After the course, I developed Emi into a working prototype.]

## From Findings to Design

- **Interruptions were the biggest concern.** Half of survey participants said a robot would be unwelcome during focused work. In a "Working together" session, Emi sits quietly beside you with every reminder paused.
- **Starting was harder than doing.** Emi breaks tasks into small first steps, and can make any step smaller still.
- **Not everyone wanted emotional check-ins.** Opinions split roughly into thirds, so you choose how Emi talks: just facts, friendly, or extra gentle.
- **People wanted reminders, not nagging.** Task reminders were the most requested feature (87.5%). By default, Emi simply sips water or stretches, and you can join in if you like. Taking care of yourself adds a star to a cozy jar, with no streaks to lose.
- **People liked being remembered.** Emi keeps small details you share, and you can view or delete them at any time.

## Looking Out for People, Without Policing Them

Before adding any safety features, I audited a hate-speech classifier ([project](https://github.com/SanjanaJairam/abusive-language-detection) · [interactive explainer](https://abusive-language-detection-explain.vercel.app/)). It treated swearing as harm, missed negation, and over-flagged slang, African American English and identity words. Emi's care check is designed so it doesn't repeat those mistakes:

- **Venting is always fine.** Emi never reacts to swearing or single words, only to a few clear phrases about yourself.
- **Harsh self-talk gets a gentle reply.** "I'm so stupid" gets a kind word and an offer to find one tiny step; "I'm not stupid" gets nothing.
- **Signs of crisis bring real people in.** Emi shows a calm card with the 988 Suicide & Crisis Lifeline, Crisis Text Line and [findahelpline.com](https://findahelpline.com) for other countries. It errs toward showing, is always dismissible, and has a "That's not what I meant" button.
- **Nothing becomes a task by accident.** In a brain dump, anything that isn't a task is set aside: it is never added to your list and never sent to Claude.
- **It runs on your device.** The check never blocks anything, and the support numbers are always in Settings.

`node web/src/tests/care_test.js` runs 76 behavioural tests, built like the audit's checks: venting, figures of speech ("this essay is killing me"), negation, slang and AAE, identity statements and coursework must stay quiet; harsh self-talk and signs of crisis must not. A phrase list will miss things, so this supports people and doesn't replace them.

## Designing for Different Needs

Many people who want a desk companion find it easy to get overwhelmed, including neurodivergent users. Drawing on Finch, Tiimo, Goblin Tools, and W3C cognitive accessibility guidance, Emi shows one task at a time, sizes steps and sessions to your energy, and offers a calm mode with no motion or sound. She is meant to work around the user, rather than expecting the user to work a certain way.

## How It Works

Emi runs entirely in the browser using HTML, CSS, and JavaScript, and is drawn as an original animated SVG character. A built-in system handles conversations, task breakdowns, and reminders without AI. An optional **Smart help** setting uses Claude for personalized steps and open-ended conversation, and falls back to the built-in system if unavailable. All data stays in the browser.

## Running Locally

```bash
python3 web/src/build.py   # rebuild after editing web/src/
node web/src/tests/care_test.js   # care-check tests
npm i -g vercel
vercel dev                 # open http://localhost:3000
```

Smart help is optional. To enable it, set `ANTHROPIC_API_KEY` in a `.env` file or in Vercel's environment variables. The key stays on the server.

**Structure:** `web/src/` (source), `web/index.html` (built app), `api/chat.js` (Claude endpoint), `legacy/flask-v1/` (original prototype).

## License

[MIT](https://github.com/SanjanaJairam/Emi-Bot/blob/main/LICENSE)
