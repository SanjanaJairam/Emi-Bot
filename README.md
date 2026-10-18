# Emi 🐱: An AI Desk Companion

Emi is a little cat-inspired desk companion made to help students stay focused, manage their tasks, and remember to take care of themselves while working.

The idea was to create something that feels more like a companion than another productivity app. Emi can help you get started on assignments, break down overwhelming tasks, remind you to drink water or take a break, and quietly keep you company while you work.

She's designed to be helpful without constantly interrupting you.

**Try Emi:** [emi-bot.vercel.app](https://emi-bot.vercel.app)
**Early prototype demo (v1):** [Watch here](https://youtu.be/Et_nOuvK6xc)

<!-- Add a screenshot or GIF of Emi here, e.g. ![Emi](docs/emi.png) -->

## About the Project

Emi started as part of **Desk Buddy**, a human-robot interaction design research project (I540) by Sanjana Jairam, Vivian, and Haoru.

We wanted to explore how a desk robot could support students during long work or study sessions without becoming another distraction.

For our research, we conducted 11 interviews, surveyed 8 participants, and observed three existing desk robots: Vector, Eilik, and Emo.

A few things stood out:
- People wanted help with tasks, scheduling, and motivation. Task reminders were the most requested feature (87.5% of survey participants).
- Not everyone wanted a robot checking in on their emotions. Opinions on emotional check-ins split roughly into thirds.
- Interruptions during focused work were a big concern. Half of survey participants said a robot would be unwelcome while they were concentrating.
- People liked the idea of a companion that could remember small things about them.
- Getting started on a task was often harder than actually doing it.

These findings helped shape how Emi works.

## What Emi Can Do

**Help you get started**

Emi can break larger tasks into smaller steps, help you plan your next hour, or organize a brain dump when you have too much on your mind.

**Keep you company while you work**

You can start a "Working together" session where Emi sits quietly beside you while you focus. Reminders are paused so you can work without interruptions.

**Remind you to take care of yourself**

Emi gives gentle reminders to drink water, stretch, rest your eyes, and take breaks. Instead of always sending a notification, she might just take a sip of water or stretch herself.

**Adjust to your preferences**

Not everyone wants the same kind of companion. You can change how Emi talks, how often she checks in, and whether she uses animations or sounds.

**Make breaks feel rewarding**

Emi has a cozy jar that collects stars when you take care of yourself. There are no streaks to maintain or rewards to lose. The goal is to encourage breaks, not make productivity feel like another competition.

## Designing for Different Needs

[After the course, I developed Emi into a working prototype.] One thing I wanted to be mindful of was making Emi comfortable for people who get overwhelmed easily, including neurodivergent users.

I looked at apps like Finch, Tiimo, and Goblin Tools for inspiration, along with cognitive accessibility guidelines.

Some of the design choices include:

- Showing one task and its next step instead of everything at once.
- Breaking tasks into even smaller steps when needed.
- Adjusting work sessions based on how much energy you have.
- Letting users choose between quiet reminders, check-ins, or no reminders.
- Keeping a "Not now" option without making users feel guilty.
- Offering a calm mode that turns off movement, sound, and speech.

Emi is meant to work around the user, rather than expecting the user to work a certain way.

## How Emi Works

Emi has a built-in system that works without AI. It handles common conversations, task breakdowns, work sessions, reminders, and brain-dump organization.

There's also an optional **Smart help** setting that connects to Claude. When enabled, Emi can give more personalized task suggestions, organize thoughts, and respond to open-ended messages.

If Smart help is off or unavailable, Emi still works using her built-in features.

Tasks, preferences, stars, and saved memories are stored locally in the browser.

### Built With

- HTML, CSS, and JavaScript
- SVG illustrations and CSS animations for Emi
- Claude API for optional AI features
- Vercel for deployment
- Python build script to combine the app into one page

Emi herself is an original SVG character with different expressions and animations. She can wave, stretch, sip water, look sleepy, celebrate with you, or just sit quietly while you work.

## Project Structure

The app is organized into a few main parts:

- `web/src/` — Main app code, styles, and Emi's animations
- `web/index.html` — Generated version of the app
- `web/src/build.py` — Combines the source files into one page
- `api/chat.js` — Handles requests to Claude
- `legacy/flask-v1/` — Original Flask prototype (not deployed)

## Running the Project

Emi can run without an API key if you don't need Smart help.

To rebuild the app after making changes:

```bash
python3 web/src/build.py
```

To run it locally with Vercel:

```bash
npm i -g vercel
vercel dev
```

Then open `http://localhost:3000`.

### Enabling Smart Help

If you want to use Claude:

1. Get an API key from [Anthropic](https://console.anthropic.com).
2. Add `ANTHROPIC_API_KEY` to your local `.env` file or Vercel environment variables.
3. Enable **Smart help** in Emi's settings.

The API key stays on the server and isn't exposed in the browser.

You can also deploy the project through [Vercel](https://vercel.com) by importing the GitHub repository.

## License

This project is open source under the [MIT License](https://github.com/SanjanaJairam/Emi-Bot/blob/main/LICENSE).
