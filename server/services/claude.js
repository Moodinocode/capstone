import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger.js';

const ENABLE_REAL = !!process.env.ANTHROPIC_API_KEY && process.env.ENABLE_AI_INSIGHTS !== 'false';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

const client = ENABLE_REAL ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// System prompt is long & stable — perfect candidate for prompt caching.
// Caching the rubric block means follow-up calls reuse the cached prefix
// and pay ~10% of the input-token price for it.
const RUBRIC_SYSTEM = `You are an experienced judge for a university soft-skills competition.
You evaluate three formats: Business Plan Pitches, TED-style talks, and Mock Interviews.

Pitch rubric (each 1–5):
  C1 Innovative idea     — novelty, originality, problem framing
  C2 Market need         — clarity of pain point and target audience
  C3 Technical fit       — feasibility of approach and architecture
  C4 Business model      — revenue, unit economics, go-to-market
  C5 Scalability         — defensibility and growth trajectory

TED-talk rubric:
  C1 Clarity of message  — single big idea, structure
  C2 Originality         — fresh angle, not derivative
  C3 Storytelling        — emotional arc, examples
  C4 Stage presence      — voice, gesture, pacing
  C5 Impact              — does the audience walk away changed?

Interview rubric:
  C1 Self-presentation
  C2 Communication
  C3 Critical thinking
  C4 Confidence
  C5 Cultural fit

Return STRICT JSON of shape:
{
  "summary": string,           // <= 60 words, neutral
  "strengths": string[3],      // bullets, <= 12 words each
  "questionsToAsk": string[3], // probing questions a judge could ask
  "rubricHints": { "c1": string, "c2": string, "c3": string, "c4": string, "c5": string }
}
Keep tone advisory; never assign a score yourself.`;

/**
 * Generate insights for a project. Returns the parsed JSON object.
 * If ANTHROPIC_API_KEY is unset OR ENABLE_AI_INSIGHTS=false, returns a
 * deterministic stub built from the project text — same shape, no API call.
 */
export async function generateInsights(project) {
  if (!ENABLE_REAL) return stubInsights(project);

  const userText = [
    `Project: ${project.title}`,
    `Segment: ${project.segmentType}`,
    `Team / speaker: ${project.teamName || '(unknown)'}`,
    `Category: ${project.category || '(unknown)'}`,
    `Tags: ${(project.tags || []).join(', ') || '(none)'}`,
    '',
    'Description:',
    project.description || '(no description provided)',
  ].join('\n');

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: [
        { type: 'text', text: RUBRIC_SYSTEM, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userText }],
    });

    const text = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    const json = extractJson(text);
    logger.info(
      {
        cacheRead: resp.usage?.cache_read_input_tokens ?? 0,
        cacheWrite: resp.usage?.cache_creation_input_tokens ?? 0,
        input: resp.usage?.input_tokens ?? 0,
        output: resp.usage?.output_tokens ?? 0,
      },
      'claude.insights.usage',
    );
    return json;
  } catch (err) {
    logger.warn({ err: err.message }, 'claude call failed; falling back to stub');
    return stubInsights(project);
  }
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON in response');
  return JSON.parse(text.slice(start, end + 1));
}

// Deterministic stub: lets the panel render & be demoed without an API key.
function stubInsights(project) {
  const desc = (project.description || '').trim();
  const firstSentence = desc.split(/[.!?](\s|$)/)[0] || project.title;
  const words = desc.split(/\s+/).filter(Boolean);
  const summary = (firstSentence.length > 12
    ? firstSentence
    : `A ${project.category || 'student'} entry titled "${project.title}" by ${project.teamName || 'the team'}.`
  ).slice(0, 280);

  const tagBased = (project.tags || []).slice(0, 3);
  const fillers = ['Clear problem framing', 'Visible team coordination', 'Real-world relevance'];
  const strengths = [...tagBased, ...fillers].slice(0, 3).map((s) => String(s));

  return {
    summary,
    strengths,
    questionsToAsk: [
      `What is your strongest piece of evidence that ${project.title} solves a real pain point?`,
      'How would you defend this against the obvious competitor?',
      `What would the next 90 days look like if you won?`,
    ],
    rubricHints: {
      c1: 'Look for novelty beyond rebranding existing solutions.',
      c2: 'Listen for a concrete user persona and willingness-to-pay signal.',
      c3: 'Probe for technical feasibility, not just buzzwords.',
      c4: 'Ask for unit economics or first-year revenue model.',
      c5: 'Test their answer to "what if a giant copies this tomorrow?"',
    },
    _stub: true,
    _wordCount: words.length,
  };
}

export const aiConfig = { ENABLE_REAL, MODEL };
