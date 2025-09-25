// app/page.tsx

"use client";

import { useState } from "react";
import { Analysis } from './lib/types';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisForm } from './components/AnalysisForm';
import { InteractiveResults } from './components/InteractiveResults';
import { StaticResults } from './components/StaticResults';
import { ErrorMessage } from './components/ErrorMessage';
import { Loader } from './components/Loader';

type AppState = 'idle' | 'processing' | 'success' | 'error';
type InputType = 'file' | 'text';

interface LabeledTranscript {
  speakers: string[];
  transcript: { speaker: string; text: string }[];
}

interface FullResult {
  analysis: Analysis;
  labeledTranscript?: LabeledTranscript; // This is now optional
}

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
  const [appState, setAppState] = useState<AppState>('idle');
  const [inputType, setInputType] = useState<InputType>('file');
  const [result, setResult] = useState<FullResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for the text form
  const [transcript, setTranscript] = useState<string>(sampleTranscript);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');

  const startAnalysis = async () => {
    setAppState('processing');
    setError(null);

    const requestBody = inputType === 'text'
      ? { transcript, model: selectedModel }
      : { model: selectedModel };

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

      const data: FullResult = await response.json();
      setResult(data);
      setAppState('success');

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
      setAppState('error');
    }
  };
  
  const handleReset = () => {
    setAppState('idle');
    setResult(null);
    setError(null);
  };

  const renderInputComponent = () => {
    if (inputType === 'file') {
      return <FileUpload onFileUpload={startAnalysis} isLoading={appState === 'processing'} />;
    }
    return (
      <AnalysisForm 
        transcript={transcript}
        setTranscript={setTranscript}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        handleAnalyze={startAnalysis}
        isLoading={appState === 'processing'}
      />
    );
  };

  const renderResultsComponent = () => {
    if (!result) return null;
    // If we have a labeledTranscript, show the interactive results
    if (result.labeledTranscript) {
      return <InteractiveResults analysis={result.analysis} labeledTranscript={result.labeledTranscript} />;
    }
    // Otherwise, show the simpler static results
    return <StaticResults analysis={result.analysis} />;
  };

  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <Header />

        {appState === 'idle' && (
          <div>
            {/* --- NEW: Input Type Switcher --- */}
            <div className="flex justify-center mb-6 border border-slate-700 rounded-lg p-1 max-w-sm mx-auto">
              <button onClick={() => setInputType('file')} className={`w-1/2 py-2 rounded-md transition-colors ${inputType === 'file' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>Upload Audio/Video</button>
              <button onClick={() => setInputType('text')} className={`w-1/2 py-2 rounded-md transition-colors ${inputType === 'text' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>Paste Transcript</button>
            </div>
            {renderInputComponent()}
          </div>
        )}

        {appState === 'processing' && <Loader />}
        <ErrorMessage message={error} />

        {appState === 'success' && (
          <div>
            {renderResultsComponent()}
            <div className="text-center mt-12">
              <button onClick={handleReset} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg">
                Analyze Another
              </button>
            </div>
          </div>
        )}

        {appState === 'error' && (
           <div className="text-center mt-8">
              <button onClick={handleReset} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg">
                Try Again
              </button>
            </div>
        )}
      </div>
    </main>
  );
}