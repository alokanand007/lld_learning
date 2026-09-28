import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function LoadingState({
  title = 'Loading...',
  description = 'Please wait while we fetch the latest data.',
  isEvaluating = false
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xs shadow-xs my-8 max-w-lg mx-auto">
      <div className="relative mb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        </div>
        {isEvaluating && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow">
            <Sparkles className="h-3 w-3 animate-pulse" />
          </div>
        )}
      </div>

      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>

      {isEvaluating && (
        <div className="mt-6 w-full max-w-xs space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Analyzing class responsibilities</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Evaluating abstraction & coupling</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Formulating explainable feedback</span>
          </div>
        </div>
      )}
    </div>
  );
}
