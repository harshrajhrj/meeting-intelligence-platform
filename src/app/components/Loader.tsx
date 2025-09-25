// app/components/Loader.tsx

export const Loader = () => (
  <div className="text-center mt-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
    <p className="mt-4 text-slate-400">AI is analyzing the dynamics... Please wait.</p>
  </div>
);