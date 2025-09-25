// app/components/Header.tsx

export const Header = () => (
  <header className="text-center mb-12">
    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-600">
      Meeting Bias Analyzer
    </h1>
    <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
      Paste your meeting transcript below to get an AI-powered analysis of communication dynamics, sentiment, and actionable insights.
    </p>
  </header>
);