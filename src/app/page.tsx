"use client";

import { useState } from "react";

// Define the structure of our analysis data
type Analysis = {
  summary: string;
  speaker_dominance: { speaker: string; percentage: number }[];
  key_sentiments: { speaker: string; sentiment: string; quote: string }[];
  interruptions: { interrupter: string; interrupted: string; context: string }[];
  action_items: { task: string; assigned_to: string; due_date: string }[];
};

const sampleTranscript = `Sarah: Okay team, let's kick off the Q3 project sync. Mark, can you start with the latest on the user authentication module?
Mark: Sure, Sarah. We've completed the primary UI and are now working on the back-end integration. I think we're about 70% done, but we hit a snag with the database schema which might push our timeline back a bit.
David: A snag? Mark, we can't afford delays. I told you last week that the schema needed to be finalized. We need to have this ready for the client demo on the 15th.
Mark: I understand the urgency, David, but this was an unforeseen complexity with the new encryption library we had to...
David: Look, I don't need the technical details, just get it done. Sarah, we need to ensure this doesn't slip.
Sarah: Alright, David, let's keep this constructive. Mark, what specific support do you need to resolve the schema issue? Let's focus on solutions.
Mark: Thanks, Sarah. If I could get 2 hours of Lena's time, her expertise in database architecture would be a massive help. We could probably solve it by end of day tomorrow.
Sarah: Great. Lena, can you support Mark on this? Lena, please connect with Mark after this call to sync up.
Lena: Of course, happy to help. Mark, I'll send you a calendar invite.
David: Fine. Let's move on. The client is expecting a flawless demo.`;

export default function HomePage() {
  const [transcript, setTranscript] = useState<string>(sampleTranscript);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError("Please enter a transcript to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data: Analysis = await response.json();
      setAnalysis(data);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // A simple component to render a card with a title and content
  const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-slate-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-cyan-400 mb-4">{title}</h3>
      <div className="text-slate-300 space-y-3">{children}</div>
    </div>
  );

  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-600">
            Meeting Bias Analyzer
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Paste your meeting transcript below to get an AI-powered analysis of communication dynamics, sentiment, and actionable insights.
          </p>
        </header>

        <div className="bg-slate-800/50 rounded-lg p-6 shadow-xl border border-slate-700">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-300 resize-none"
          />
          <div className="mt-4 text-center">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {isLoading ? "Analyzing..." : "Analyze Transcript"}
            </button>
          </div>
        </div>

        {error && <div className="mt-8 text-center text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}

        {isLoading && (
          <div className="text-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">AI is analyzing the dynamics... Please wait.</p>
          </div>
        )}

        {analysis && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Summary Card */}
            <InfoCard title="📝 Meeting Summary">
              <p>{analysis.summary}</p>
            </InfoCard>

            {/* Speaker Dominance Card */}
            <InfoCard title="🗣️ Speaker Dominance">
              <div className="space-y-4">
                {analysis.speaker_dominance.map((speaker, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-200">{speaker.speaker}</span>
                      <span className="text-cyan-400">{speaker.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2.5 rounded-full" style={{ width: `${speaker.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </InfoCard>

            {/* Action Items Card */}
            <InfoCard title="✅ Action Items">
              {analysis.action_items.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {analysis.action_items.map((item, index) => (
                    <li key={index}>
                      <span className="font-semibold">{item.task}</span> - (Assigned: {item.assigned_to}, Due: {item.due_date})
                    </li>
                  ))}
                </ul>
              ) : <p>No specific action items were identified.</p>}
            </InfoCard>

            {/* Key Sentiments Card */}
            <InfoCard title="🎭 Key Sentiments">
              {analysis.key_sentiments.length > 0 ? (
                analysis.key_sentiments.map((sentiment, index) => (
                  <div key={index} className="border-l-4 p-3 rounded-r-md bg-slate-700/50" style={{ borderColor: sentiment.sentiment === 'Negative' ? '#f87171' : sentiment.sentiment === 'Positive' ? '#4ade80' : '#60a5fa' }}>
                    <p className="italic">&quot;{sentiment.quote}&quot;</p>
                    <p className="text-right text-sm font-semibold mt-1"> - {sentiment.speaker} ({sentiment.sentiment})</p>
                  </div>
                ))
              ) : <p>No strong sentiments were identified.</p>}
            </InfoCard>

            {/* Interruptions Card */}
            <InfoCard title="🚫 Interruptions">
              {analysis.interruptions.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {analysis.interruptions.map((item, index) => (
                    <li key={index}>
                      <span className="font-semibold text-red-400">{item.interrupter}</span> interrupted <span className="font-semibold text-blue-300">{item.interrupted}</span>.
                      <p className="pl-4 text-slate-400 italic text-sm">Context: &quot;...{item.context}...&quot;</p>
                    </li>
                  ))}
                </ul>
              ) : <p>No clear interruptions were identified.</p>}
            </InfoCard>

          </div>
        )}
      </div>
    </main>
  );
}