import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { ATTEMPT_STATUS } from '../domain/Attempt.js';

export function AttemptCard({ attempt }) {
  if (!attempt) return null;

  const formattedDate = attempt.createdAt
    ? new Date(attempt.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown date';

  const isCompleted = attempt.status === ATTEMPT_STATUS.COMPLETED;
  const isFailed = attempt.status === ATTEMPT_STATUS.FAILED;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
            Attempt #{attempt.attemptNumber}
          </span>
          <h4 className="text-base font-semibold text-slate-900">
            {attempt.problemTitle}
          </h4>
          <StatusBadge status={attempt.status} size="sm" />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formattedDate}
          </span>
          {attempt.evaluation?.evaluatorType && (
            <span className="text-slate-400">
              Evaluator: <span className="text-slate-600 font-medium">{attempt.evaluation.evaluatorType}</span>
            </span>
          )}
        </div>

        {/* Short Summary snippet if completed */}
        {isCompleted && attempt.evaluation?.feedback?.summary && (
          <p className="text-xs text-slate-600 line-clamp-1 mt-1 pt-1 border-t border-slate-100">
            {attempt.evaluation.feedback.summary}
          </p>
        )}

        {/* Error message snippet if failed */}
        {isFailed && attempt.evaluation?.errorMessage && (
          <p className="text-xs text-rose-600 line-clamp-1 mt-1 pt-1 border-t border-rose-100 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{attempt.evaluation.errorMessage}</span>
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <Link
          to={`/attempts/${attempt.id}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow transition-colors"
        >
          <span>{isCompleted ? 'View Feedback' : 'Open Attempt'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
