// app/components/AnalysisForm.tsx

interface AnalysisFormProps {
  transcript: string;
  setTranscript: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  handleAnalyze: () => void;
  isLoading: boolean;
}

const availableModels = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Advanced)' },
];

export const AnalysisForm = ({
  transcript,
  setTranscript,
  selectedModel,
  setSelectedModel,
  handleAnalyze,
  isLoading,
}: AnalysisFormProps) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 shadow-xl border border-slate-700">
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste your meeting transcript here..."
        className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-300 resize-none"
      />
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div>
          <label htmlFor="model-select" className="text-slate-400 mr-2">AI Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Transcript'}
        </button>
      </div>
    </div>
  );
};