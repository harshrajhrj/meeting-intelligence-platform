// app/lib/types.ts

// Define and export the type for each object in our arrays
export type SpeakerDominance = { speaker: string; percentage: number };
export type KeySentiment = { speaker: string; sentiment: string; quote: string };
export type Interruption = { interrupter: string; interrupted: string; context: string };
export type ActionItem = { task: string; assigned_to: string; due_date: string };

// The main Analysis type now uses the specific types above
export type Analysis = {
  summary: string;
  speaker_dominance: SpeakerDominance[];
  key_sentiments: KeySentiment[];
  interruptions: Interruption[];
  action_items: ActionItem[];
};