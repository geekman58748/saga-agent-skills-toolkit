import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, generationsTable } from "@workspace/db";
import { HACKATHON_PLAYBOOK_SYSTEM_PROMPT, FOUNDER_BRAND_SYSTEM_PROMPT, TELEGRAM_SYSTEM_PROMPT } from "../skills/prompts";

const router: IRouter = Router();

const conversationHistory: Map<number, Array<{ role: "user" | "assistant" | "system"; content: string }>> = new Map();

function getHistory(chatId: number) {
  if (!conversationHistory.has(chatId)) {
    conversationHistory.set(chatId, [{ role: "system", content: TELEGRAM_SYSTEM_PROMPT }]);
  }
  return conversationHistory.get(chatId)!;
}

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env["TELEGRAM_BOT_TOKEN"];
  if (!botToken) return;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

function detectSkillMdFormat(text: string): { type: "hackathon" | "founder" | null; extracted: string } {
  const lower = text.toLowerCase();

  const hasSkillStructure =
    (text.includes("## Input") || text.includes("## Description") || text.includes("## Output")) &&
    text.includes("#");

  if (!hasSkillStructure) return { type: null, extracted: text };

  if (
    lower.includes("hackathon") ||
    lower.includes("project name") ||
    lower.includes("tech stack") ||
    lower.includes("target audience")
  ) {
    return {
      type: "hackathon",
      extracted: `The user has pasted a skill spec in markdown format. Extract the relevant project details from it and generate a full hackathon playbook. Here is the pasted skill:\n\n${text}`,
    };
  }

  if (
    lower.includes("founder") ||
    lower.includes("personal brand") ||
    lower.includes("communication style") ||
    lower.includes("focus area")
  ) {
    return {
      type: "founder",
      extracted: `The user has pasted a skill spec in markdown format. Extract the relevant founder details from it and generate a full founder brand playbook. Here is the pasted skill:\n\n${text}[...]
    };
  }

  return { type: null, extracted: text };
}

const START_MESSAGE = `⚡ *Welcome to SagaSkills* — powered by SagaPad

I'm *SagaBot*, your Solana ecosystem growth strategist. I help builders win narratives, not just ship code.

Two skills available right now:

*1. Hackathon Playbook* → /hackathon
Get a 4-week X social strategy built around your project. Core story angle, daily content plan, 5 copy-paste posts, Spaces to hit, and engagement tactics. Built for Colosseum builders.

*2. Founder Brand Playbook* → /founder
Get your unique POV, content pillars, writing style guide, and 10 posts written in your voice. Stop posting like a project account. Start posting like a founder people follow.

Just tap a command to start. I'll ask the right questions and generate your full playbook in one shot. 🔥`;

router.post("/telegram/webhook", async (req, res): Promise<void> => {
  res.json({ ok: true });

  const update = req.body;
  const message = update?.message;
  if (!message?.text) return;

  const chatId: number = message.chat.id;
  const text: string = message.text;

  req.log.info({ chatId, text: text.slice(0, 100) }, "Telegram message received");

  if (text.trim() === "/start") {
    await sendTelegramMessage(chatId, START_MESSAGE);
    return;
  }

  const history = getHistory(chatId);
  const lowerText = text.toLowerCase();

  const skillMd = detectSkillMdFormat(text);
  let systemOverride: string | null = null;
  let userContent = text;

  if (skillMd.type === "hackathon") {
    systemOverride = HACKATHON_PLAYBOOK_SYSTEM_PROMPT;
    userContent = skillMd.extracted;
  } else if (skillMd.type === "founder") {
    systemOverride = FOUNDER_BRAND_SYSTEM_PROMPT;
    userContent = skillMd.extracted;
  } else if (lowerText.includes("/hackathon") || lowerText.includes("hackathon playbook")) {
    systemOverride = HACKATHON_PLAYBOOK_SYSTEM_PROMPT;
  } else if (lowerText.includes("/founder") || lowerText.includes("founder brand")) {
    systemOverride = FOUNDER_BRAND_SYSTEM_PROMPT;
  }

  history.push({ role: "user", content: userContent });

  const messages = systemOverride
    ? [{ role: "system" as const, content: systemOverride }, ...history.slice(1)]
    : history;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages,
    });

    const reply = completion.choices[0]?.message?.content ?? "Something went wrong. Try again.";
    history.push({ role: "assistant", content: reply });

    if (history.length > 20) {
      conversationHistory.set(chatId, [history[0], ...history.slice(-19)]);
    }

    const isLongOutput = reply.length > 3000;
    if (isLongOutput) {
      await db.insert(generationsTable).values({
        skillType: systemOverride?.includes("hackathon") ? "hackathon-playbook" : "founder-brand",
        inputSummary: text.slice(0, 120),
        content: reply,
      });
    }

    const chunks = reply.match(/[\s\S]{1,4000}/g) ?? [reply];
    for (const chunk of chunks) {
      await sendTelegramMessage(chatId, chunk);
    }
  } catch (err) {
    req.log.error({ err }, "Telegram AI error");
    await sendTelegramMessage(chatId, "Something went wrong. Try again in a moment.");
  }
});

export default router;
