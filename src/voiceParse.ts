import type { Mood } from './types';
import { GOAL_CATEGORIES } from './utils';

export type ParsedType = 'goal' | 'habit' | 'journal';

export interface ParsedResult {
  type: ParsedType;
  raw: string;
  goal: { title: string; category: string; description: string };
  habit: { name: string; frequency: 'daily' | 'weekly' };
  journal: { content: string; mood: Mood; gratitude: string };
}

const LEAD_IN =
  /^(please\s+)?(can you\s+)?(add|create|new|remind me to|set|log|i want to add|i'd like to add)\s+/i;
const ARTICLE = /^(a\s+|an\s+|the\s+)/i;
const KIND_WORD = /^(habit|goal|task|journal entry|journal)\s*(to|that|:|is)?\s*/i;

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stripLeadIn(text: string): string {
  return text.replace(LEAD_IN, '').replace(ARTICLE, '').replace(KIND_WORD, '').trim();
}

function detectMood(lower: string): Mood {
  if (/\b(great|amazing|fantastic|excellent|happy|excited|wonderful|awesome)\b/.test(lower)) return 5;
  if (/\b(good|fine|okay|ok|content|pretty good)\b/.test(lower)) return 4;
  if (/\b(meh|tired|neutral|alright|so-so)\b/.test(lower)) return 3;
  if (/\b(sad|down|stressed|anxious|upset|frustrated|worried)\b/.test(lower)) return 2;
  if (/\b(terrible|awful|depressed|horrible|exhausted|miserable)\b/.test(lower)) return 1;
  return 3;
}

const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/\b(career|job|work|promotion|interview)\b/, 'Career'],
  [/\b(health|fitness|exercise|gym|run|workout|diet)\b/, 'Health'],
  [/\b(learn|study|course|read|book|skill)\b/, 'Learning'],
  [/\b(money|finance|save|budget|invest)\b/, 'Finance'],
  [/\b(relationship|family|friend|partner)\b/, 'Relationships'],
  [/\b(meditat|mindful|breathe|calm)\b/, 'Mindfulness'],
];

function detectCategory(lower: string): string {
  for (const [re, category] of CATEGORY_KEYWORDS) {
    if (re.test(lower)) return category;
  }
  return GOAL_CATEGORIES[GOAL_CATEGORIES.length - 1];
}

/** Best-effort intent + field guess from a raw speech transcript. Always returns
 * all three shapes populated so the confirmation UI can switch type freely. */
export function parseTranscript(text: string): ParsedResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const stripped = stripLeadIn(trimmed);
  const title = capitalize(stripped || trimmed);

  let type: ParsedType = 'goal';
  if (/\bhabit\b|\bevery day\b|\bdaily\b|\bweekly\b|\bevery week\b/.test(lower)) {
    type = 'habit';
  }
  if (/\bjournal\b|\bfeel(ing)?\b|\bmood\b|\bgrateful\b|\breflect|\btoday was\b/.test(lower)) {
    type = 'journal';
  }
  if (/\bgoal\b|\btask\b|\bto-?do\b/.test(lower)) {
    type = 'goal';
  }

  const habitName = title.replace(/\s*(daily|every day|weekly|every week)\s*$/i, '').trim() || title;

  return {
    type,
    raw: trimmed,
    goal: { title, category: detectCategory(lower), description: '' },
    habit: { name: habitName, frequency: /\bweekly\b|\bevery week\b/.test(lower) ? 'weekly' : 'daily' },
    journal: { content: trimmed, mood: detectMood(lower), gratitude: '' },
  };
}
