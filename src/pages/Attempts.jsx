import React, { useState, useEffect, useMemo } from 'react';
import { History, Filter, Search, BookOpen } from 'lucide-react';
import { getAttempts } from '../api/attempts.js';
import { getProblems } from '../api/problems.js';
import { AttemptCard } from '../components/AttemptCard.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ATTEMPT_STATUS } from '../domain/Attempt.js';

export function Attempts() {
  const [attempts, setAttempts] = useState([]);
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProblemId, setSelectedProblemId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [attemptsList, problemsList] = await Promise.all([
          getAttempts(),
          getProblems({ delay: 30 })
        ]);
        setAttempts(attemptsList);
        setProblems(problemsList);
      } catch (err) {
        console.error('Failed to load attempts history:', err);
        setError('Failed to load attempts history. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredAttempts = useMemo(() => {
    return attempts.filter(att => {
      const matchProblem =
        selectedProblemId === 'ALL' || att.problemId === selectedProblemId;
      const matchStatus =
        selectedStatus === 'ALL' ||
        att.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchProblem && matchStatus;
    });
  }, [attempts, selectedProblemId, selectedStatus]);

  if (isLoading) {
    return <LoadingState title="Loading attempts history..." description="Retrieving your previous design submissions." />;
  }

  if (error) {
    return <ErrorState title="History Load Error" message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Practice Attempts
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Review your previous submissions, track how your architectural decisions evolved across attempts, and revisit evaluation feedback.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Problem Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Problem:</span>
          <select
            value={selectedProblemId}
            onChange={(e) => setSelectedProblemId(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          >
            <option value="ALL">All Problems ({problems.length})</option>
            {problems.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider hidden md:inline">
            Status:
          </span>
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Completed', value: ATTEMPT_STATUS.COMPLETED },
            { label: 'Evaluating', value: ATTEMPT_STATUS.EVALUATING },
            { label: 'Failed', value: ATTEMPT_STATUS.FAILED },
            { label: 'Draft', value: ATTEMPT_STATUS.DRAFT }
          ].map(opt => {
            const isActive = selectedStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Attempts List */}
      {filteredAttempts.length > 0 ? (
        <div className="space-y-3.5">
          {filteredAttempts.map(attempt => (
            <AttemptCard key={attempt.id} attempt={attempt} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No attempts found"
          description={
            selectedProblemId !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No attempts match your selected problem or status filter.'
              : 'You have not submitted any practice attempts yet.'
          }
          actionLabel={selectedProblemId !== 'ALL' || selectedStatus !== 'ALL' ? 'Clear Filters' : 'Explore Problems'}
          onAction={
            selectedProblemId !== 'ALL' || selectedStatus !== 'ALL'
              ? () => {
                  setSelectedProblemId('ALL');
                  setSelectedStatus('ALL');
                }
              : undefined
          }
          actionLink={selectedProblemId === 'ALL' && selectedStatus === 'ALL' ? '/problems' : undefined}
        />
      )}
    </div>
  );
}
