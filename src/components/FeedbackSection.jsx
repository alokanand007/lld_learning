import React from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, Compass, Award, Info } from 'lucide-react';

export function FeedbackSection({ feedback, evaluatorType }) {
  if (!feedback) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No evaluation feedback available for this attempt yet.</p>
      </div>
    );
  }

  const { summary, strengths = [], needsImprovement = [], suggestions = [], designConcepts = [] } = feedback;

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <span className="font-semibold block mb-0.5">Educational Architectural Review</span>
          LLD problems rarely have a single &ldquo;correct&rdquo; answer. This review highlights architectural trade-offs, Single Responsibility adherence, and modular decoupling rather than assigning arbitrary scores.
          {evaluatorType && (
            <span className="block mt-1 font-mono text-[11px] text-indigo-700">
              Evaluator Engine: {evaluatorType}
            </span>
          )}
        </div>
      </div>

      {/* 1. Overall Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Award className="h-4 w-4 text-indigo-600" />
          <span>Overall Architectural Summary</span>
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
          {summary || 'Your submission has been parsed and reviewed against standard object-oriented design principles.'}
        </p>
      </div>

      {/* 2. Strengths & Needs Improvement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="rounded-xl border border-emerald-200/80 bg-white p-6 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-100">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Design Strengths</h4>
              <p className="text-xs text-slate-500">Effective patterns and clean boundaries observed</p>
            </div>
          </div>

          <ul className="space-y-3 flex-1">
            {strengths.length > 0 ? (
              strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{typeof item === 'string' ? item : item.point || item.title}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">No specific strengths recorded.</li>
            )}
          </ul>
        </div>

        {/* Needs Improvement */}
        <div className="rounded-xl border border-amber-200/80 bg-white p-6 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-100">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Areas for Improvement</h4>
              <p className="text-xs text-slate-500">High coupling, missing abstractions, or SRP violations</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {needsImprovement.length > 0 ? (
              needsImprovement.map((item, idx) => {
                const point = typeof item === 'string' ? item : item.point;
                const whyItMatters = typeof item === 'object' ? item.whyItMatters : null;

                return (
                  <div key={idx} className="text-xs space-y-1 bg-amber-50/40 p-3 rounded-lg border border-amber-100/80">
                    <div className="flex items-start gap-2 font-medium text-slate-800">
                      <span className="text-amber-500 font-bold shrink-0">⚠</span>
                      <span>{point}</span>
                    </div>
                    {whyItMatters && (
                      <div className="pl-4 pt-1 text-slate-600 text-[11px] leading-relaxed">
                        <strong className="text-amber-900 font-semibold">Why this matters: </strong>
                        <span>{whyItMatters}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No critical design flaws identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Actionable Suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Actionable Refactoring Suggestions</span>
          </h3>
          <ul className="space-y-2.5">
            {suggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-mono text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-100 block w-full">
                  {sug}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Relevant Design Concepts */}
      {designConcepts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>Key Object-Oriented Concepts to Review</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {designConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>{concept}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
