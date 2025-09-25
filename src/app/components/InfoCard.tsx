// app/components/InfoCard.tsx

import React from 'react';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export const InfoCard = ({ title, children }: InfoCardProps) => (
  <div className="bg-slate-800 rounded-lg shadow-md p-6">
    <h3 className="text-xl font-semibold text-cyan-400 mb-4">{title}</h3>
    <div className="text-slate-300 space-y-3">{children}</div>
  </div>
);