// app/components/AnalysisResults.tsx

import { Analysis } from '../lib/types';
import { InfoCard } from './InfoCard';

interface AnalysisResultsProps {
  analysis: Analysis | null;
}

export const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
  if (!analysis) return null;

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      <InfoCard title="📝 Meeting Summary">
        <p>{analysis.summary}</p>
      </InfoCard>

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
  );
};