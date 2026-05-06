# SagaSkills: Technical Documentation
Hi Yall, you can address me as Maxx, i love shipping and building stuff and here's why i built SagaSkills with a different approach entirely. 
 - Classic skills are limited to scripts, I don’t see "Skills" as just static scripts or terminal commands. I see them hitting Escape Velocity, evolving into custom mini applications with native AI interfaces and to achieve mass adoption, you have to go where the users already live. In the Web3 world, that home is Telegram.
 - I hate complex systems and i am LAZY LMAOO. But fr complexity is where adoption goes to die. I built the frontend to handle all the "dirty work" so you do not have to.

**Two SagaPad Skills for Solana builders who want to win narratives.**

Live demo: https://persona-saga-bot--donm51353.replit.app
Telegram bot: [@SagaSolBot](http://t.me/sagasolbot)

---

## What Is a Skill (and Why This Isn't Just a Script)

A script takes input and runs a fixed function. A skill does something fundamentally different: it carries embedded expertise, structured intent, and a defined behavioral contract that makes it composable across platforms.

SagaSkills is classified as a skill AND not a script, NOT a chatbot wrapper for three specific reasons:

### 1. It has a typed, validated API contract

Every skill invocation is governed by an OpenAPI spec (`lib/api-spec/openapi.yaml`). Inputs are validated by Zod schemas before anything touches the AI layer:

```typescript
// artifacts/api-server/src/routes/skills/index.ts
const parsed = GenerateHackathonPlaybookBody.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ error: parsed.error.message });
  return;
}
```

A script accepts any input and does its best. A skill enforces a contract: `projectName`, `description`, `targetAudience`, `techStack` are required. Missing fields return a structured `ApiError`. This is what makes it callable by other agents and composable into larger workflows.

### 2. It has hardcoded, domain specific expertise, not a system prompt you typed in 5 minutes

The persona and behavioral rules are engineered into the system prompt (`artifacts/api-server/src/routes/skills/prompts.ts`) with explicit output schemas, ecosystem specific knowledge, and rules that **cannot be overridden by the user**:

```typescript
// prompts.ts — HACKATHON_PLAYBOOK_SYSTEM_PROMPT (excerpt)
`You have studied every breakout project from Colosseum hackathons:
Ore, Backpack, Tensor, Mad Lads, Parcl, Drift, and dozens more.
...
Rules you never break:
- Never write generic advice that could apply to any project
- Always tie strategy to their specific tech stack, audience, and team background
- Reference real Solana ecosystem dynamics and current market context`
```

The output format is also hardcoded into the prompt, structured markdown sections that are always produced in the same order:
- `## Core Story Angle`
- `## Week-by-Week Content Plan (4 Weeks)`
- `## X Spaces, AMAs & Events to Hit`
- `## Engagement Strategy`
- `## First 5 Posts (Ready to Copy-Paste)`

This is not "AI with a description." This is a defined behavioral specification.

### 3. It persists outputs and has memory architecture

Every generation is written to a PostgreSQL database (`lib/db/src/schema/generations.ts`):

```typescript
export const generationsTable = pgTable("generations", {
  id: serial("id").primaryKey(),
  skillType: text("skill_type").notNull(),     // "hackathon-playbook" | "founder-brand"
  inputSummary: text("input_summary").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

The Telegram bot maintains per user conversation history with a rolling 20-message window:

```typescript
// artifacts/api-server/src/routes/telegram/index.ts
const conversationHistory: Map<number, Array<{
  role: "user" | "assistant" | "system";
  content: string
}>> = new Map();

if (history.length > 20) {
  conversationHistory.set(chatId, [history[0], ...history.slice(-19)]);
}
```

Scripts don't have memory. Skills do.

---

## Why This Is Different From ChatGPT

Hmm i asked myself this same very question and knew youd ask. This question matters for judging, and the answer is architectural.

### The persona is locked server side

When you ask ChatGPT for a social strategy, you get a generic response shaped by whoever wrote the system prompt for that conversation which is you, right now, winging it. SagaSkills has a persona that was engineered once and is **immutable at the server level**. No user can override it. No jailbreak changes the output quality. The skill always runs at full depth.

```typescript
// The user never touches this. It runs server side every single time.
messages: [
  { role: "system", content: HACKATHON_PLAYBOOK_SYSTEM_PROMPT },
  { role: "user", content: userMessage },
]
```

### It refuses scope creep by design

ChatGPT will write your smart contract if you ask it to. That's a feature for ChatGPT. It's a bug for a skill. SagaSkills is architecturally restricted to two domains:

```typescript
// artifacts/api-server/src/routes/telegram/index.ts
// Command routing — only two paths exist
if (skillMd.type === "hackathon") {
  systemOverride = HACKATHON_PLAYBOOK_SYSTEM_PROMPT;
} else if (skillMd.type === "founder") {
  systemOverride = FOUNDER_BRAND_SYSTEM_PROMPT;
} else if (lowerText.includes("/hackathon")) {
  systemOverride = HACKATHON_PLAYBOOK_SYSTEM_PROMPT;
} else if (lowerText.includes("/founder")) {
  systemOverride = FOUNDER_BRAND_SYSTEM_PROMPT;
}
```

And the TELEGRAM_SYSTEM_PROMPT explicitly enforces this at the model level:
```
STRICT RULES, never break these:
- If a user asks for ANYTHING outside these two skills (code, smart contracts,
  general questions), respond with: "I'm a specialized tool..."
- Never write code, smart contracts, or technical implementations
- Never pretend to be a general assistant
```

Scope is a skill property. Boundlessness is a chatbot property.

### It knows Solana specifically

ChatGPT knows Solana the way Wikipedia knows Solana. Although i am still working on a robust accurate  up to date **juicy Data Set** SagaSkills knows Solana the way someone who has been building in the ecosystem knows it:

- References real Colosseum breakout projects by name (Ore, Tensor, Backpack, Mad Lads, Parcl, Drift)
- References real recurring community events (Superteam Weekly Spaces, Helius Dev Hours)
- References real founder X accounts with specific analysis of their style (Armani Ferrante, Raj Gokal, Anatoly, Tristan Frizza, Vibhu Norby)
- Understands the current Solana narrative arcs (ZK Compression, consumer crypto, DeFi resurgence)

This knowledge is **hardcoded into the persona**, It's the difference between a consultant who Googled your industry and one who has lived in it.

### It produces a consistent, structured output every time

ChatGPT's output format varies based on how you phrased the question. SagaSkills always returns:

```
POST /api/skills/hackathon-playbook
→ Always returns:
  { id, skillType, content, createdAt }
  where content always contains:
  ## Core Story Angle
  ## Week-by-Week Content Plan (4 Weeks)
  ## X Spaces, AMAs & Events to Hit
  ## Engagement Strategy
  ## First 5 Posts (Ready to Copy-Paste)
```

This predictability is what makes it composable. An n8n workflow can call it and know exactly what it gets back. An agent can parse it. A Telegram bot can chunk it and send it. ChatGPT's output is a conversation. SagaSkills' output is a document.

---

## How It Processes a Request

Here is the exact execution path from button click to playbook:

### Web App Path

```
User fills form → React submits to POST /api/skills/hackathon-playbook
  → Zod validates input schema (GenerateHackathonPlaybookBody)
  → Input fields are assembled into a structured user message:
      "Project Name: X
       What it does: Y
       Who it's for: Z
       Tech stack: W
       Generate my complete hackathon social playbook."
  → OpenAI API call with:
      model: gpt-5.4
      max_completion_tokens: 8192
      system: HACKATHON_PLAYBOOK_SYSTEM_PROMPT (hardcoded, ~800 tokens)
      user: structured message above
  → Response written to PostgreSQL (generations table)
  → Row returned to frontend as { id, skillType, content, createdAt }
  → Frontend renders content as markdown
```

### Telegram Bot Path

```
User sends message → Telegram delivers to POST /api/telegram/webhook
  → Server immediately responds { ok: true } (Telegram requires <5s ACK)
  → Async processing begins:
      1. Check for /start → send welcome message, return
      2. Check for skill.md format (detectSkillMdFormat)
      3. Check for /hackathon or /founder commands
      4. Set systemOverride if skill detected
      5. Push user message to per-chat conversation history (Map<chatId, messages[]>)
      6. Build message array:
         - If skill detected: [skillSystemPrompt, ...history.slice(1)]
         - Otherwise: [...full history with general TELEGRAM_SYSTEM_PROMPT]
      7. OpenAI API call (gpt-5.4, 8192 tokens)
      8. Append reply to history
      9. If history > 20 messages: trim oldest (keep system prompt + last 19)
      10. If reply > 3000 chars: save to DB
      11. Split reply into 4000-char chunks (Telegram message limit)
      12. Send each chunk via Telegram Bot API
```

### Skill.md Auto Detection

The bot can also accept a pasted skill.md document and auto-route it:

```typescript
function detectSkillMdFormat(text: string) {
  const hasSkillStructure =
    (text.includes("## Input") || text.includes("## Description") ||
     text.includes("## Output")) && text.includes("#");

  if (!hasSkillStructure) return { type: null, extracted: text };

  if (lower.includes("hackathon") || lower.includes("tech stack")) {
    return { type: "hackathon", extracted: `Extract details and generate: ${text}` };
  }
  // ... founder detection
}
```

---

## How to Install / Use

### On SagaPad (primary)

1. Go to [sagapad.com](https://sagapad.com)
2. Search for **"Saga-agent-skills-toolkit"** 
3. Click Install
4. Run from the SagaPad interface — no setup required

### Via Telegram (conversational)

1. Open Telegram, search `@SagaSkillsBot`
2. Send `/start` to see the menu
3. Send `/hackathon` or `/founder` to begin
4. Answer the questions. Get your playbook.

No account. No login. No configuration.

### Via REST API (for developers and agents)

Any AI agent, n8n workflow, or developer tool can call this directly:

**Hackathon Playbook:**
```bash
curl -X POST https://persona-saga-bot--donm51353.replit.app/api/skills/hackathon-playbook \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Meridian",
    "description": "Permissionless yield on Solana using compressed NFTs as collateral",
    "targetAudience": "DeFi power users and NFT holders",
    "techStack": "Anchor, ZK Compression, Helius, React",
    "teamBackground": "Ex-Solana Labs engineers"
  }'
```

**Founder Brand Playbook:**
```bash
curl -X POST https://persona-saga-bot--donm51353.replit.app/api/skills/founder-brand \
  -H "Content-Type: application/json" \
  -d '{
    "founderName": "Alex",
    "whatBuilding": "Consumer DeFi app for non-crypto users",
    "background": "Ex-Robinhood PM, now technical founder",
    "focusArea": "Consumer crypto / DeFi accessibility",
    "communicationStyle": "Storyteller — warm, punchy, accessible"
  }'
```

**Response schema:**
```json
{
  "id": 42,
  "skillType": "hackathon-playbook",
  "content": "## Core Story Angle\n...(full markdown playbook)...",
  "createdAt": "2025-05-06T21:36:53.699Z"
}
```

### On Claude (via tool use)

Define SagaSkills as a custom tool in your Claude API call:

```json
{
  "name": "generate_hackathon_playbook",
  "description": "Generates a 4-week Solana hackathon social strategy",
  "input_schema": {
    "type": "object",
    "properties": {
      "projectName": { "type": "string" },
      "description": { "type": "string" },
      "targetAudience": { "type": "string" },
      "techStack": { "type": "string" }
    },
    "required": ["projectName", "description", "targetAudience", "techStack"]
  }
}
```

When Claude decides to call it, route the tool call to:
`POST https://persona-saga-bot--donm51353.replit.app/api/skills/hackathon-playbook`

### On Gemini (via function calling)

```python
generate_playbook = genai.protos.Tool(
    function_declarations=[
        genai.protos.FunctionDeclaration(
            name="generate_hackathon_playbook",
            description="Generate a Solana hackathon social strategy",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "projectName": genai.protos.Schema(type=genai.protos.Type.STRING),
                    "description": genai.protos.Schema(type=genai.protos.Type.STRING),
                    "targetAudience": genai.protos.Schema(type=genai.protos.Type.STRING),
                    "techStack": genai.protos.Schema(type=genai.protos.Type.STRING),
                },
                required=["projectName", "description", "targetAudience", "techStack"]
            )
        )
    ]
)
```

Route calls to the same REST endpoint. SagaSkills is platform-agnostic — it doesn't care what called it.

### Via n8n (workflow automation)

Import `n8n-workflow.json` from this repo. The workflow:
1. Receives Telegram updates via Telegram Trigger node
2. Routes to `POST /api/telegram/webhook` via HTTP Request node
3. All persona and skill routing logic lives server-side — no n8n config needed beyond the URL

---

## What Makes This Better Than Simpler Skills

Most skills in AI marketplaces are wrappers: take input, append to a prompt, return output. They work once and are forgotten.

SagaSkills is built differently at every layer:

| Layer | Simple Skill | SagaSkills |
|---|---|---|
| Input validation | None | Zod schema enforcement, typed errors |
| Persona | User-written prompt | Engineered server-side, immutable |
| Domain knowledge | Generic AI | Solana-specific, real projects/people |
| Scope enforcement | None | Hard refusal of off-topic requests |
| Output format | Whatever the AI produces | Structured markdown, consistent sections |
| Persistence | None | PostgreSQL, full history feed |
| Interfaces | One | Web app + Telegram + REST API |
| Composability | No | OpenAPI spec, callable by any agent |
| Conversation memory | None | Per-user rolling 20-message window |

The test: take the same input and run it through ChatGPT, then through SagaSkills. ChatGPT will give you advice you could have Googled. SagaSkills will give you the specific Superteam Spaces to join, the exact narrative angle that fits your tech stack and the current Solana meta, and 5 posts you can copy nd paste right now. That difference is the skill.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Interfaces                        │
│  Web App (React+Vite)  │  Telegram Bot  │  REST API  │
└────────────┬───────────┴───────┬────────┴─────┬──────┘
             │                   │               │
             ▼                   ▼               ▼
┌─────────────────────────────────────────────────────┐
│              Express API Server (Node.js)            │
│                                                      │
│  POST /api/skills/hackathon-playbook                 │
│  POST /api/skills/founder-brand                      │
│  GET  /api/skills/generations                        │
│  POST /api/telegram/webhook                          │
│                                                      │
│  Input validation: Zod (drizzle-zod + orval codegen)│
│  Persona layer: prompts.ts (hardcoded, immutable)    │
│  AI layer: OpenAI gpt-5.4 via Replit AI Integration  │
│  Memory: Map<chatId, messages[]> (Telegram)          │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐    ┌─────────────────┐
│  PostgreSQL   │    │   OpenAI API    │
│  generations  │    │   gpt-5.4       │
│  table        │    │   8192 tokens   │
└───────────────┘    └─────────────────┘
```

---

## Backend Repository Structure

```
artifacts/
  api-server/src/routes/
    skills/index.ts        — POST endpoints, Zod validation, DB writes
    skills/prompts.ts      — Hardcoded personas (the skill's brain)
    telegram/index.ts      — Webhook handler, routing, memory, chunking
lib/
  api-spec/openapi.yaml    — OpenAPI contract (source of truth)
  api-zod/src/generated/   — Generated Zod schemas (server-side validation)
  api-client-react/src/    — Generated React Query hooks (frontend)
  db/src/schema/           — Drizzle ORM schema (PostgreSQL)
skill-hackathon-playbook/
  skill.md                 — Topic 1 SagaPad submission
skill-founder-personal-brand/
  skill.md                 — Topic 2 SagaPad submission
n8n-workflow.json          — Ready-to-import n8n Telegram workflow
```

---

*Built for SagaPad Colosseum Hackathon Skills Track. Submitting Topic 1 and Topic 2.*

