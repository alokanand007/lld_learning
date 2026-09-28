import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { getProblems } from '../api/problems.js';
import { getAttempts } from '../api/attempts.js';
import { ProblemCard } from '../components/ProblemCard.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function Problems() {
  const [problems, setProblems] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [problemsList, attemptsList] = await Promise.all([
          getProblems({ delay: 40 }),
          getAttempts()
        ]);
        setProblems(problemsList);
        setAttempts(attemptsList);
      } catch (err) {
        console.error('Failed to load problems:', err);
        setError('Unable to load practice problems. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesDifficulty =
        selectedDifficulty === 'All' ||
        problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        problem.title.toLowerCase().includes(q) ||
        problem.description.toLowerCase().includes(q) ||
        (problem.tags && problem.tags.some(t => t.toLowerCase().includes(q)));

      return matchesDifficulty && matchesSearch;
    });
  }, [problems, selectedDifficulty, searchQuery]);

  if (isLoading) {
    return <LoadingState title="Loading problems..." description="Fetching standard LLD practice scenarios." />;
  }

  if (error) {
    return <ErrorState title="Error Loading Problems" message={error} onRetry={() => window.location.reload()} />;
  }

  const difficulties = ['All', 'Beginner', 'Intermediate'];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          LLD Practice Problems
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Select a realistic system architecture problem. Work through requirements, decompose domain entities, establish relationships, and validate your design.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems, patterns, or tags..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider hidden md:inline">
            Difficulty:
          </span>
          {difficulties.map(level => {
            const isActive = selectedDifficulty.toLowerCase() === level.toLowerCase();
            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedDifficulty(level)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problems Grid */}
      {filteredProblems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProblems.map(problem => {
            const count = attempts.filter(a => a.problemId === problem.id).length;
            return (
              <ProblemCard key={problem.id} problem={problem} attemptCount={count} />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No problems found"
          description={
            searchQuery || selectedDifficulty !== 'All'
              ? 'No practice problems match your current search and filter criteria.'
              : 'No practice problems are currently available.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedDifficulty('All');
          }}
        />
      )}
    </div>
  );
}
