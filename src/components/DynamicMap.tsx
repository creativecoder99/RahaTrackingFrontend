'use client';

import dynamic from 'next/dynamic';
import React from 'react';

export const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] md:h-[450px] rounded-2xl border border-slate-700 bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="text-sm text-slate-400 font-medium animate-pulse">Loading Interactive Map...</p>
    </div>
  )
});

export default DynamicMap;
