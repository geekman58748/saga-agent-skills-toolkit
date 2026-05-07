import { Router, type IRouter } from "express";
import { db, generationsTable } from "@workspace/db";
import {
  GenerateHackathonPlaybookBody,
  GenerateFounderBrandBody,
  ListGenerationsResponse,
  GenerateHackathonPlaybookResponse,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { HACKATHON_PLAYBOOK_SYSTEM_PROMPT, FOUNDER_BRAND_SYSTEM_PROMPT } from "./prompts";
import { desc, count } from "drizzle-orm";

const router: IRouter = Router();

router.post("/skills/hackathon-playbook", async (req, res): Promise<void> => {
  const parsed = GenerateHackathonPlaybookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { projectName, description, targetAudience, techStack, teamBackground } = parsed.data;

  const userMessage = `Project Name: ${projectName}
What it does: ${description}
Who it's for: ${targetAudience}
Tech stack: ${techStack}${teamBackground ? `\nTeam background: ${teamBackground}` : ""}

Generate my complete hackathon social playbook.`;

  req.log.info({ projectName }, "Generating hackathon playbook");

  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: HACKATHON_PLAYBOOK_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";

  const inputSummary = `${projectName} — ${description.slice(0, 80)}`;

  const [row] = await db
    .insert(generationsTable)
    .values({ skillType: "hackathon-playbook", inputSummary, content })
    .returning();

  res.json(GenerateHackathonPlaybookResponse.parse(row));
});

router.post("/skills/founder-brand", async (req, res): Promise<void> => {
  const parsed = GenerateFounderBrandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { founderName, whatBuilding, background, focusArea, communicationStyle } = parsed.data;

  const userMessage = `Founder: ${founderName}
What they're building: ${whatBuilding}
Background: ${background}
Focus area: ${focusArea}
Communication style: ${communicationStyle}

Generate my complete founder personal brand playbook.`;

  req.log.info({ founderName }, "Generating founder brand playbook");

  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: FOUNDER_BRAND_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  const inputSummary = `${founderName} — building ${whatBuilding.slice(0, 60)}`;

  const [row] = await db
    .insert(generationsTable)
    .values({ skillType: "founder-brand", inputSummary, content })
    .returning();

  res.json(GenerateHackathonPlaybookResponse.parse(row));
});

router.get("/skills/count", async (req, res): Promise<void> => {
  const [row] = await db.select({ total: count() }).from(generationsTable);
  res.json({ total: row?.total ?? 0 });
});

router.get("/skills/generations", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: generationsTable.id,
      skillType: generationsTable.skillType,
      inputSummary: generationsTable.inputSummary,
      createdAt: generationsTable.createdAt,
    })
    .from(generationsTable)
    .orderBy(desc(generationsTable.createdAt))
    .limit(20);

  res.json(ListGenerationsResponse.parse(rows));
});

export default router;
