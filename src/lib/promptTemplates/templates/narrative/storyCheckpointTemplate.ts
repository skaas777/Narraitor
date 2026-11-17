import type { StoryCheckpointRequestBody } from '@/types/story-checkpoint.types';
import type { NarrativeTemplateContext } from './context';
import { isFeatureEnabled } from '@/lib/featureFlags';

const RESPONSE_SCHEMA = `{
  "segment": "1-3 concise sentences summarizing ONLY the events provided in this checkpoint",
  "highlights": ["1-3 factual bullets supported by these recorded events"],
  "majorEvents": ["Chronological recap of the major events in this checkpoint"],
  "includedEvents": 3,
  "includedDecisions": 1,
  "lastEventTimestamp": "2025-11-20T15:31:39Z"
}`;

const formatEvents = (events: StoryCheckpointRequestBody['events']): string => {
  return events
    .map((event, index) => {
      const parts = [
        `${index + 1}. [${event.timestamp}]`,
        event.characterName ? `${event.characterName}:` : undefined,
        event.description,
      ].filter(Boolean);
      return parts.join(' ');
    })
    .join('\n');
};

const formatDecisions = (
  decisions: StoryCheckpointRequestBody['decisions']
): string => {
  if (!decisions || decisions.length === 0) {
    return 'None recorded.';
  }

  return decisions
    .map((decision, index) => {
      const consequence = decision.consequence
        ? ` → Consequence: ${decision.consequence}`
        : '';
      return `${index + 1}. ${decision.text}${consequence}`;
    })
    .join('\n');
};

export const storyCheckpointTemplate = (
  context: NarrativeTemplateContext
): string => {
  const payload = context.checkpoint;
  if (!payload) return '';
  if (isFeatureEnabled('CHAPTERS') && payload.mode === 'chapter') {
    return chapterRecapTemplate(context);
  }
  const eventsText = formatEvents(
    [...payload.events].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  );
  const toneDirectives = context.checkpointToneInstructions;

  // Older prose and player intentions leaked into recaps despite instructions
  // to ignore them. Only pass recorded events into this event-batch summary.

  return `Summarize recorded events for an adventure journal. Do not continue the story or invent a new scene.

${payload.characterName ? `- Protagonist: ${payload.characterName}` : '- Protagonist: [unnamed character]'}

RECORDED EVENTS (chronological order; these are the only events to summarize):
${eventsText}

SUMMARY REQUIREMENTS:
- Summarize ONLY recorded events, preserving chronology, uncertainty, holders, quantities and outcomes.
- A request, plan, promise or attempt remains a request, plan, promise or attempt; it is not a completed result.
- Never invent travel, handovers, transactions, resolutions or transitions to connect events. The final location does not establish an extra return trip.
- Do not add backstory, infer an earlier arrival, or explain why events happened unless it is explicitly recorded.
- Do not infer new damage, accidents or mysteries from an object's appearance.
- Apply these tone and language rules: ${toneDirectives}
- Use concise third-person past-tense prose. Prefer exact names over inferred pronouns.
- Preserve only cause-and-effect relationships explicitly supported by recorded events
- Use 1-3 sentences at most. For one short event, one accurate sentence is enough; never pad it with invented detail.
- Treat the events listed above as authoritative canon; prefer names to inferred gendered pronouns
- Write ONLY in past tense (was/were, did, had) - NEVER present tense (is/are, does, has)
- Use third-person limited perspective that can be read aloud

Return STRICT JSON (no markdown fences):
${RESPONSE_SCHEMA}
`;
};

const chapterRecapTemplate = ({
  checkpoint: payload,
}: NarrativeTemplateContext): string => {
  if (!payload) return '';
  return `Write a chapter hand-off for the next narrative prompt using ONLY this recorded canon.
Keep names, locations, cast status, held items, and unresolved threads exact. Do not invent resolutions, possessions, or hidden knowledge.
Return STRICT JSON with exactly this shape, no markdown:
{"recap":{"previously":"key events","whereItStopped":"location and last situation","cast":"names with current status","holding":"current possessions","openThreads":"unfinished business"}}
The five values together must fit in five labeled lines of at most 850 characters total. Keep each value under 150 characters. Write for continuity, not a journal or a new scene.
Previous chapter recap: ${payload.previousChapterRecap ?? 'None.'}
Chapter events:
${formatEvents(payload.events)}
Player decisions:
${formatDecisions(payload.decisions)}
Where it stopped: ${payload.currentLocation ?? 'Not recorded.'}
${payload.previousSegments?.at(-1) ?? ''}
Cast: ${payload.cast?.join('; ') || payload.characterName || 'Not recorded.'}
Holding: ${payload.holding?.join('; ') || 'None recorded.'}
Open threads: ${payload.openThreads?.join('; ') || 'None recorded.'}`;
};
