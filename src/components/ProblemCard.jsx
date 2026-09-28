import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Layers } from 'lucide-react';
import { DifficultyBadge } from './DifficultyBadge.jsx';

export function ProblemCard({ problem, attemptCount = 0 }) {
  if (!problem) return null;

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <DifficultyBadge difficulty={problem.difficulty} />
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{problem.estimatedTime}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
          <Link to={`/problems/${problem.id}`} className="hover:underline focus:outline-none">
            {problem.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {problem.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {problem.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          <span>{attemptCount > 0 ? `${attemptCount} attempt${attemptCount === 1 ? '' : 's'}` : 'Not attempted yet'}</span>
        </div>

        <Link
          to={`/problems/${problem.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 rounded-md px-2 py-1 -mr-2"
        >
          <span>View Details</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
