# Emi: an AI desk buddy for long hours at the desk

**Emi** is a cat desk-buddy that helps students and academics get work done while looking after themselves. Emi reminds you to take breaks, drink water and rest your eyes. It stays quiet while you focus, breaks big tasks into small steps, and checks in on how you're feeling, at whatever level of warmth you choose.

Emi comes out of **Desk Buddy**, a human-robot interaction design research project (I540) by Sanjana Jairam, Vivian and Haoru. We ran 11 interviews, an 8-person survey, and observation studies of three commercial desk robots (Vector, Eilik, Emo).

Original v1 demo video: https://youtu.be/Et_nOuvK6xc

---

## From research to design

| What we found | How Emi responds |
| --- | --- |
| Task reminders (87.5%), scheduling and emotional support (75% each) were the top wanted benefits | Today task list, an AI "plan my next hour" helper, and AI check-ins |
| Opinions on robot empathy and mood recognition split into thirds | A **"How Emi talks"** setting (Just facts, Friendly, Extra gentle) that changes both nudges and the AI's tone |
| 50% said a robot would be unwelcome while concentrating or in meetings | **Working together** sessions pause every nudge while Emi quietly reads beside you |
| Interviewees wanted gamification, but not rewards for finishing work | A **cozy jar** fills with stars for breaks, water and stretches only. Stars never go away, and there are no streaks to lose |
| People wanted a robot that remembers them and feels like a friend | Emi saves small details you share and uses them later. You can view and delete them in Settings |
| A subtle, embodied "walk with me" nudge beat a plain alert | Emi acts out each nudge herself: she sips from a mug, stretches, or rests her eyes |
| Voice was the preferred input, and poor recognition frustrated users of existing robots | Optional spoken replies and voice input, with typing always available |
| Writer's block and getting started were common pain points | "I'm stuck" and "Break down" turn a task into a first step that takes under 5 minutes |

## Designed for neurodivergent users

Many people who want a desk buddy have ADHD, autism or dyslexia, so Emi follows calm-design patterns from apps like Finch, Tiimo and Goblin Tools, and from W3C's cognitive accessibility guidance:

- **One thing at a time.** The main screen shows one task and its next tiny step. Everything else is one tab away.
- **Gentle setup.** Three taps: your name, how Emi talks, and your energy.
- **Energy check-in.** Low energy gives tinier steps and shorter sessions (10, 15 or 25 minutes).
- **Body doubling.** Emi reads beside you during a session, and a ring shows time passing.
- **A 2-minute heads-up** before each session ends, to ease the transition.
- **Where was I?** When you come back to the tab, Emi tells you which task and step you were on.
- **Reminders that don't nag.** You choose a style during setup:
  - **Quiet** (the default): Emi sips water or stretches silently, and you tap her if you want to join.
  - **Ask me**: a message with two buttons.
  - **Between sessions**: breaks are only suggested when a work session ends.
  - **Off**.

  If you tap "Not now" twice in a row, Emi stops asking about that nudge for the rest of the day.
- **No guilt.** No streaks, no red, and "Not now" is always an option.
- **Brain dump.** Type everything on your mind and Emi sorts it into today and later.
- **"Make this step smaller"** for when a step still feels too big.
- **You control the stimulation.** Calm mode turns off motion, sound and speech. You can also change the text size and switch to the Lexend reading font.

Emi herself is an original character drawn in SVG, with eleven moods: idle, wave, happy, love, sleepy, stretch, sip, eat, focus, think and comfort. She wiggles when you tap her, shows hearts when you finish a step, and holds a heart for you when you're overwhelmed. Calm mode keeps her still.

---

## Project structure

```
web/index.html     The Emi app (one self-contained file, built from web/src)
web/src/           app.html, emi-svg.html (Emi), emi.css, build.py
api/chat.js        Serverless endpoint that calls Claude with your API key
vercel.json        Tells Vercel to serve web/ and api/
app/, main.py      Original v1 Flask prototype
```

### Scripted by default, AI when you want it

Emi works fully without AI. Her built-in brain covers tap-to-reply conversations (help me start, overwhelmed, plan my next hour, how am I doing), step templates for common tasks (writing, email, reading, studying, coding, slides, cleaning, meetings), scaled to your energy, and brain-dump sorting. This keeps her predictable, instant and private, and she can run on free static hosting.

Turning on **Settings → Smart help** lets Claude write steps for your exact task, sort brain dumps more intelligently, and chat freely. If the AI is unavailable, Emi quietly falls back to her built-in ideas.

The page calls one function, `askEmi(prompt)`. On claude.ai it uses Claude directly. On your own site it sends the prompt to `/api/chat`, which keeps the API key on the server. Tasks, stars and memories are stored in each visitor's own browser.

> Without Smart help you can host `web/` anywhere static (GitHub Pages, Netlify, Vercel) with no API key.

---

## Deploy your own (Vercel, free tier)

1. Get an API key from https://console.anthropic.com.
2. Go to https://vercel.com, choose **Add New → Project**, and import this GitHub repo.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` with your key.
4. Click **Deploy**. Vercel gives you a link like `emi-bot.vercel.app` to share.

Every push to `main` redeploys automatically. After editing anything in `web/src/`, run `python3 web/src/build.py` to rebuild `web/index.html`.

Optional: set `EMI_MODEL` to choose a different Claude model (the default is a fast, low-cost model).

## Run locally

```bash
npm i -g vercel
vercel dev        # serves web/ and api/ at http://localhost:3000
```

Put `ANTHROPIC_API_KEY=...` in a `.env` file first. The `.gitignore` excludes it.

Reminders, tasks, focus mode and points work without the AI. Only chat, check-ins and "Break down" need it.

### Running the original Flask v1

```bash
pip install -r requirements.txt
python main.py
```

---

## License

Open source under the [MIT License](LICENSE).
