// app/components/InteractiveResults.tsx

import { useState, useMemo } from 'react';
import { Analysis, SpeakerDominance, KeySentiment, Interruption, ActionItem } from '../lib/types';
import { InfoCard } from './InfoCard';

interface LabeledTranscript {
  speakers: string[];
  transcript: { speaker: string; text: string }[];
}

interface InteractiveResultsProps {
  analysis: Analysis;
  labeledTranscript: LabeledTranscript;
}

export const InteractiveResults = ({ analysis, labeledTranscript }: InteractiveResultsProps) => {
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    labeledTranscript.speakers.forEach(speakerId => {
      initialState[speakerId] = speakerId;
    });
    return initialState;
  });

  const handleNameChange = (speakerId: string, newName: string) => {
    setSpeakerNames(prev => ({ ...prev, [speakerId]: newName || speakerId }));
  };

  const updatedAnalysis = useMemo(() => {
    const updateText = (text: string) => {
      let updated = text;
      Object.entries(speakerNames).forEach(([id, name]) => {
        updated = updated.replace(new RegExp(`\\b${id}\\b`, 'g'), name);
      });
      return updated;
    };

    const newAnalysis: Analysis = JSON.parse(JSON.stringify(analysis));

    newAnalysis.speaker_dominance.forEach((item: SpeakerDominance) => item.speaker = updateText(item.speaker));
    newAnalysis.key_sentiments.forEach((item: KeySentiment) => item.speaker = updateText(item.speaker));
    newAnalysis.interruptions.forEach((item: Interruption) => {
      item.interrupter = updateText(item.interrupter);
      item.interrupted = updateText(item.interrupted);
    });
    newAnalysis.action_items.forEach((item: ActionItem) => item.assigned_to = updateText(item.assigned_to));

    return newAnalysis;
  }, [analysis, speakerNames]);

  return (
    <div className="mt-12 space-y-8">
      <InfoCard title="Identified Speakers">
        <p className="text-sm text-slate-400 mb-4">Assign names to the automatically detected speakers. The report will update in real-time.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {labeledTranscript.speakers.map(speakerId => (
            <div key={speakerId}>
              <label htmlFor={speakerId} className="block text-sm font-medium text-slate-300">{speakerId}</label>
              <input
                type="text"
                id={speakerId}
                placeholder={`Name for ${speakerId}`}
                onChange={(e) => handleNameChange(speakerId, e.target.value)}
                className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </InfoCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoCard title="Meeting Summary">
          <p>{updatedAnalysis.summary}</p>
        </InfoCard>

        <InfoCard title="Speaker Dominance">
          <div className="space-y-4">
            {/* ---- UPDATED: Use specific type instead of 'any' ---- */}
            {updatedAnalysis.speaker_dominance.map((speaker: SpeakerDominance, index: number) => (
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

        <InfoCard title="Action Items">
          {updatedAnalysis.action_items.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {/* ---- UPDATED: Use specific type instead of 'any' ---- */}
              {updatedAnalysis.action_items.map((item: ActionItem, index: number) => (
                <li key={index}>
                  <span className="font-semibold">{item.task}</span> - (Assigned: {item.assigned_to}, Due: {item.due_date})
                </li>
              ))}
            </ul>
          ) : <p>No specific action items were identified.</p>}
        </InfoCard>

        <InfoCard title="Key Sentiments">
          {updatedAnalysis.key_sentiments.length > 0 ? (
            // ---- UPDATED: Use specific type instead of 'any' ----
            updatedAnalysis.key_sentiments.map((sentiment: KeySentiment, index: number) => (
              <div key={index} className="border-l-4 p-3 rounded-r-md bg-slate-700/50" style={{ borderColor: sentiment.sentiment === 'Negative' ? '#f87171' : sentiment.sentiment === 'Positive' ? '#4ade80' : '#60a5fa' }}>
                <p className="italic">&quot;{sentiment.quote}&quot;</p>
                <p className="text-right text-sm font-semibold mt-1"> - {sentiment.speaker} ({sentiment.sentiment})</p>
              </div>
            ))
          ) : <p>No strong sentiments were identified.</p>}
        </InfoCard>

        <InfoCard title="Interruptions">
          {updatedAnalysis.interruptions.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {/* ---- UPDATED: Use specific type instead of 'any' ---- */}
              {updatedAnalysis.interruptions.map((item: Interruption, index: number) => (
                <li key={index}>
                  <span className="font-semibold text-red-400">{item.interrupter}</span> interrupted <span className="font-semibold text-blue-300">{item.interrupted}</span>.
                  <p className="pl-4 text-slate-400 italic text-sm">Context: &quot;...{item.context}...&quot;</p>
                </li>
              ))}
            </ul>
          ) : <p>No clear interruptions were identified.</p>}
        </InfoCard>
      </div>
    </div>
  );
};