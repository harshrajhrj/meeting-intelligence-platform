// app/api/analyze/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from 'assemblyai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});
const ALLOWED_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro"];

// ---- NEW: Simulate a Transcription & Diarization Service ----
// In a real application, you would upload an audio file to a service like AssemblyAI.
// Here, we simulate the result it would give back after processing.
const mockTranscriptionService = async () => {
  // Simulate network delay and processing time
  await new Promise(resolve => setTimeout(resolve, 3000));

  // This is a realistic-looking response from a diarization service
  const labeledTranscript = {
    // Unique speakers identified in the audio
    speakers: ["Speaker A", "Speaker B", "Speaker C", "Speaker D"],
    // The transcript, with each sentence tagged by speaker
    transcript: [
      { speaker: "Speaker A", text: "Okay team, let's kick off the Q3 project sync. Mark, can you start with the latest on the user authentication module?" },
      { speaker: "Speaker B", text: "Sure, Sarah. We've completed the primary UI and are now working on the back-end integration. I think we're about 70% done, but we hit a snag with the database schema which might push our timeline back a bit." },
      { speaker: "Speaker C", text: "A snag? Mark, we can't afford delays. I told you last week that the schema needed to be finalized. We need to have this ready for the client demo on the 15th." },
      { speaker: "Speaker B", text: "I understand the urgency, David, but this was an unforeseen complexity with the new encryption library we had to..." },
      { speaker: "Speaker C", text: "Look, I don't need the technical details, just get it done. Sarah, we need to ensure this doesn't slip." },
      { speaker: "Speaker A", text: "Alright, David, let's keep this constructive. Mark, what specific support do you need to resolve the schema issue? Let's focus on solutions." },
      { speaker: "Speaker B", text: "Thanks, Sarah. If I could get 2 hours of Lena's time, her expertise in database architecture would be a massive help. We could probably solve it by end of day tomorrow." },
      { speaker: "Speaker A", text: "Great. Lena, can you support Mark on this? Lena, please connect with Mark after this call to sync up." },
      { speaker: "Speaker D", text: "Of course, happy to help. Mark, I'll send you a calendar invite." },
      { speaker: "Speaker C", text: "Fine. Let's move on. The client is expecting a flawless demo." }
    ],
  };
  return labeledTranscript;
};

// This function formats our labeled transcript into a simple string for Gemini
const formatTranscriptForAnalysis = (transcriptData: { transcript: { speaker: string, text: string }[] }) => {
  return transcriptData.transcript.map(item => `${item.speaker}: ${item.text}`).join('\n');
};

const systemPrompt = `
You are an expert communication analyst specializing in corporate meeting dynamics and inclusivity.
Your task is to analyze the following meeting transcript and provide a detailed, unbiased analysis of the conversation flow.

Analyze the provided transcript and identify each speaker. Your response MUST be a valid JSON object.
Do not include any text, explanation, or markdown formatting before or after the JSON object.

The JSON object must have the following structure:
{
  "summary": "A brief, neutral summary of the meeting's purpose and outcome in 2-3 sentences.",
  "speaker_dominance": [
    { "speaker": "SpeakerName", "percentage": 45 }
  ],
  "key_sentiments": [
    { "speaker": "SpeakerName", "sentiment": "Positive" | "Negative" | "Neutral", "quote": "The exact quote that reflects this sentiment." }
  ],
  "interruptions": [
    { "interrupter": "SpeakerName1", "interrupted": "SpeakerName2", "context": "The phrase where the interruption likely occurred." }
  ],
  "action_items": [
    { "task": "The specific action item.", "assigned_to": "SpeakerName or 'Unassigned'", "due_date": "Mentioned due date or 'Not specified'" }
  ]
}

- Calculate speaker dominance based on approximate word count. The total must add up to 100.
- Identify clear moments of strong positive or negative sentiment.
- Identify interruptions where one speaker's sentence is clearly cut off by another.
- Extract clear, actionable tasks assigned to individuals.
`;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // --- PATH 1: Handle Audio/Video File Upload ---
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const selectedModel = formData.get('model') as string;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }

      // 1. Send the file to AssemblyAI for transcription and diarization
      // The SDK handles polling for completion under the hood.
      const transcript = await assemblyClient.transcripts.transcribe({
        audio: file,
        speaker_labels: true, // This is the magic for speaker diarization
      });

      if (transcript.status !== 'completed' || !transcript.utterances) {
        throw new Error(`Transcription failed: ${transcript.status}`);
      }

      // 2. Format the result for our application and for Gemini
      const labeledTranscript = {
        speakers: [...new Set(transcript.utterances.map(u => `Speaker ${u.speaker}`))],
        transcript: transcript.utterances.map(u => ({
          speaker: `Speaker ${u.speaker}`,
          text: u.text,
        })),
      };
      const formattedTranscript = labeledTranscript.transcript.map(item => `${item.speaker}: ${item.text}`).join('\n');

      // 3. Send to Gemini for analysis
      const model = genAI.getGenerativeModel({ model: selectedModel });
      const chat = model.startChat({ history: [{ role: "user", parts: [{ text: systemPrompt }] }], generationConfig: { responseMimeType: "application/json" } });
      const result = await chat.sendMessage(formattedTranscript);
      const analysis = JSON.parse(result.response.text());

      // 4. Return the combined result
      return NextResponse.json({ analysis, labeledTranscript });

    }
    // --- PATH 2: Handle Text Input ---
    else if (contentType.includes('application/json')) {
      const { transcript, model: selectedModel } = await req.json();
      if (!transcript) {
        return NextResponse.json({ error: "No transcript provided." }, { status: 400 });
      }

      const model = genAI.getGenerativeModel({ model: selectedModel });
      const chat = model.startChat({ history: [{ role: "user", parts: [{ text: systemPrompt }] }], generationConfig: { responseMimeType: "application/json" } });
      const result = await chat.sendMessage(transcript);
      const analysis = JSON.parse(result.response.text());

      return NextResponse.json({ analysis });

    } else {
      return NextResponse.json({ error: `Unsupported content-type: ${contentType}` }, { status: 415 });
    }

  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: `Failed to process request: ${errorMessage}` }, { status: 500 });
  }
}