// app/api/analyze/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google Generative AI client with the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// The main prompt for the AI model
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
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        // Ensure the output is JSON
        responseMimeType: "application/json",
      },
    });

    const result = await chat.sendMessage(transcript);
    const response = result.response;
    const jsonResponse = response.text();
    
    // Parse the JSON string into an object to send to the client
    const data = JSON.parse(jsonResponse);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error analyzing transcript:", error);
    return NextResponse.json(
      { error: "Failed to analyze transcript." },
      { status: 500 }
    );
  }
}