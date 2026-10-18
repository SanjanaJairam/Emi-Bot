# Emi 🐱 — An AI Desk Companion

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

## Designing for Different Needs

Many people who want a desk companion find it easy to get overwhelmed, including neurodivergent users. Drawing on Finch, Tiimo, Goblin Tools, and W3C cognitive accessibility guidance, Emi shows one task at a time, sizes steps and sessions to your energy, and offers a calm mode with no motion or sound. She is meant to work around the user, rather than expecting the user to work a certain way.

## How It Works

Emi runs entirely in the browser using HTML, CSS, and JavaScript, and is drawn as an original animated SVG character. A built-in system handles conversations, task breakdowns, and reminders without AI. An optional **Smart help** setting uses Claude for personalized steps and open-ended conversation, and falls back to the built-in system if unavailable. All data stays in the browser.

## Running Locally

```bash
python3 web/src/build.py   # rebuild after editing web/src/
npm i -g vercel
vercel dev                 # open http://localhost:3000
```

Smart help is optional. To enable it, set `ANTHROPIC_API_KEY` in a `.env` file or in Vercel's environment variables. The key stays on the server.

**Structure:** `web/src/` (source), `web/index.html` (built app), `api/chat.js` (Claude endpoint), `legacy/flask-v1/` (original prototype).

## License

[MIT](https://github.com/SanjanaJairam/Emi-Bot/blob/main/LICENSE)
