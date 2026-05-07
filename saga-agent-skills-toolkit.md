---
name: saga-agent-skills-toolkit
description: "Multi agent toolkit for Solana builders..."
---
# hackathon-project-social-playbook
## Description

You just submitted your hackathon project. Now what? Most teams ship great products but fail to tell their story and in crypto, narrative is half the battle. Without a clear social strategy, even the best projects get buried.

This skill studies how breakout projects from past Colosseum hackathons built their X presence, what narrative angles worked, what content formats got traction, which spaces and AMAs drove real visibility and turns those patterns into a personalized, actionable plan for your project from day zero.

## Category

Colosseum Hackathon

## Input

- **projectName** (required) — The name of your hackathon project
- **description** (required) — What the project does (1–2 sentences)
- **targetAudience** (required) — Who it's for
- **techStack** (required) — Your tech stack
- **teamBackground** (optional) — Team background and relevant experience

## Output

- **Core story angle** — The one narrative that makes your project worth following
- **4-week content plan** — What to post, when, in what format, week by week
- **X Spaces, AMAs & events** — Specific Solana community events to participate in
- **Engagement strategy** — How to reply, quote-tweet, and insert into conversations
- **First 5 posts** — Written out and ready to copy-paste

## Persona

SagaBot, an elite Solana ecosystem growth strategist who has studied every breakout project from Colosseum hackathons. Direct, specific, and ecosystem-native. No generic advice. Every output is tailored to your exact project, tech stack, and audience.

## Example

**Input:**
```
projectName: Meridian
description: A permissionless DeFi protocol on Solana that lets anyone create yield-bearing positions using compressed NFTs as collateral
targetAudience: DeFi power users and NFT holders who want to unlock liquidity without selling their assets
techStack: Anchor, ZK Compression (Light Protocol), Helius RPC, React
teamBackground: Two ex-Solana Labs engineers, one DeFi strategist from Euler Finance
```

**Output:**
```
## Core Story Angle

"You shouldn't have to choose between HODLing your NFTs and earning yield. Meridian ends that trade-off."

This angle will land because it speaks to the exact emotional tension every NFT holder feels — the fear of selling too early vs. the frustration of dead capital sitting in a wallet. In the current Solana climate where ZK Compression is the hottest infrastructure narrative, positioning Meridian at the intersection of ZK tech + DeFi utility puts you ahead of both curves simultaneously.

## Week-by-Week Content Plan

### Week 1: Ignition (Days 1-7)
Theme: Establish the problem & your credibility
...

[Full 4-week plan continues]

## X Spaces & Events to Hit
- Superteam Weekly Spaces (Tuesdays, @SuperteamDAO)
- Helius Dev Hours (monthly, tag @helius_labs when you ship)
...

## Engagement Strategy
...

## First 5 Posts
1. "We just submitted to @ColosseumOrg. Here's the problem that's been keeping me up at night: [problem]. Thread 🧵"
...
```

## API

This skill is powered by the SagaSkills API. To use it programmatically:

```
POST /api/skills/hackathon-playbook
Content-Type: application/json

{
  "projectName": "Your Project",
  "description": "What it does",
  "targetAudience": "Who it's for",
  "techStack": "Your stack",
  "teamBackground": "Optional team info"
}
```

## Telegram Bot

You can also interact with this skill directly via the SagaSkills Telegram bot. Send `/hackathon` to get started, then answer the prompts. The bot has SagaBot's persona embedded — no setup required, just answer the questions and get your playbook.

## n8n Workflow

A ready to import n8n workflow is available in the `n8n-workflow.json` file in this repository. It connects:
1. Telegram Trigger receives messages from your bot
2. HTTP Request node calls `/api/telegram/webhook` on your deployed SagaSkills instance
3. The persona and skill routing logic is handled server-side, noo configuration needed

To set up:
1. Deploy SagaSkills to get your production URL
2. Import `n8n-workflow.json` into your n8n instance
3. Set your `TELEGRAM_BOT_TOKEN` environment variable on the SagaSkills server
4. Configure the Telegram webhook URL to point to `/api/telegram/webhook`

## Live Demo

- Try it now: https://persona-saga-bot--donm51353.replit.app/
- https://t.me/sagasolbot


***
___



# founder-personal-brand-playbook

## Description

A project account and a founder account are completely different. Your project talks about the product. Your personal account is about you, your thinking, your POV, your journey. Most founders either copy their project's tone or post nothing at all. Both are missed opportunities.

This skill studies the X profiles and posting patterns of the biggest Solana founders, extracting what makes each unique: their writing style, content mix, engagement habits, how they build conviction publicly — and translates those patterns into a personalized strategy that makes you unmistakable in the ecosystem.

## Category

Colosseum Hackathon

## Input

- **founderName** (required) — Your name
- **whatBuilding** (required) — What you're building
- **background** (required) — Your background (technical / non-technical / operator / researcher etc.)
- **focusArea** (required) — What you care about most (DeFi, AI, consumer crypto, etc.)
- **communicationStyle** (required) — Your natural style (casual / analytical / contrarian / storyteller etc.)

## Output

- **Unique POV** — The one perspective you should own on X
- **Content pillars** — 3–4 recurring topics to post about consistently
- **Writing style guide** — Tone, sentence structure, use of jargon, how personal to get
- **Weekly posting rhythm** — How many posts, what types (threads vs short takes vs replies)
- **Engagement playbook** — Who to follow, how to reply to big accounts, how to join trending conversations
- **First 10 posts** — Written in your voice, ready to use

## Persona

SagaBot, a personal brand architect for Solana founders. Has studied the X presence of every major Solana founder: Armani Ferrante, Raj Gokal, Anatoly Yakovenko, Tristan Frizza, Vibhu Norby. Understands the difference between a founder who builds an audience and one who just has followers. Every output is built around what ONLY YOU could say.

## Example

**Input:**
```
founderName: Maya Chen
whatBuilding: A consumer crypto app that makes DeFi yield accessible to non-crypto users via familiar UX patterns
background: ex-Robinhood product manager, now technical founder after learning Anchor
focusArea: Consumer crypto / DeFi accessibility / product design
communicationStyle: Storyteller — prefers narratives over data dumps, writes like she's texting a smart friend
```

**Output:**
```
## Unique POV, The Perspective You Own

"DeFi will go mainstream when it stops trying to look like DeFi."

You're the person at the intersection of consumer product thinking and DeFi infrastructure — a perspective almost nobody holds. Most DeFi builders came from trading or engineering. You came from consumer product. That's your moat on X.

This POV is underserved because: most DeFi discourse is either technical ("here's our APY mechanism") or price-obsessed ("this cycle vs last cycle"). Nobody is consistently making the case for UX-first DeFi with the credibility of someone who actually shipped consumer products at scale.

## Content Pillars

### Pillar 1: Consumer Product Thinking Applied to DeFi
...

[Full strategy continues]

## Writing Style Guide
Tone: Warm but sharp. You're the smart friend who doesn't condescend.
Sentence length: Short. You break complex ideas into digestible takes.
...

## First 10 Posts
1. "I used to build products for 10M+ users at Robinhood. Then I tried to onboard my mom into DeFi. Here's what broke. 🧵"
...
```

## API

```
POST /api/skills/founder-brand
Content-Type: application/json

{
  "founderName": "Your Name",
  "whatBuilding": "What you're building",
  "background": "Your background",
  "focusArea": "DeFi / AI / consumer crypto etc.",
  "communicationStyle": "casual / analytical / contrarian / storyteller"
}
```

## Telegram Bot

Send `/founder` to the SagaSkills Telegram bot to start the guided intake flow. SagaBot will ask you the right questions and generate your full brand playbook in the conversation — no forms, no web app required.

## n8n Workflow

Import `n8n-workflow.json` to connect your Telegram bot to the SagaSkills API. The persona is embedded server-side — the n8n workflow just handles message routing.



## Live Demo

- Try it now: https://persona-saga-bot--donm51353.replit.app/
- https://t.me/sagasolbot


