# Emi 🐱: An AI Desk Companion

Emi is a cat-inspired desk companion that helps students stay focused, manage tasks, and remember to take breaks without becoming another distraction.

**[Try Emi](https://emi-bot.vercel.app)** · [Original demo](https://youtu.be/Et_nOuvK6xc)

## About the Project

Emi started as part of **Desk Buddy**, a human-robot interaction project (I540) by Sanjana Jairam, Vivian, and Haoru. We interviewed 11 people, surveyed 8, and explored existing desk robots to understand what people actually wanted from a desk companion.

After the course, I continued developing Emi into a working web app.

## What Emi Does

- **Task help:** Breaks overwhelming tasks into smaller steps.
- **Focus sessions:** Keeps you company without interrupting.
- **Gentle reminders:** Encourages breaks, water, and stretching without nagging.
- **Personalization:** Lets you adjust Emi's personality, reminders, and animations.
- **Cozy jar:** Rewards self-care without streaks or pressure.
- **Optional AI:** Uses Claude for more personalized help, but works without it too.

## Designing With Care

I also wanted Emi to be comfortable for people who get overwhelmed easily, including neurodivergent users. She shows one task at a time, adjusts to your energy, and has a calm mode without motion or sound.

Building on my earlier [hate-speech classifier audit](https://github.com/SanjanaJairam/abusive-language-detection), I added a local care check that avoids treating swearing, slang, or everyday frustration as harmful. Emi responds gently to harsh self-talk and offers crisis resources when needed, without blocking the user.

## Built With

HTML, CSS, JavaScript, SVG animations, and optional Claude API integration. Tasks and preferences are stored locally in the browser.

## Running Locally

```bash
python3 web/src/build.py
node web/src/tests/care_test.js
npm i -g vercel
vercel dev
```

Smart help requires an `ANTHROPIC_API_KEY` in your `.env` file or Vercel environment variables.

## License

[MIT License](https://github.com/SanjanaJairam/Emi-Bot/blob/main/LICENSE)
