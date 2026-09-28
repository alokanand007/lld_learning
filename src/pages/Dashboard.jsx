import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight, CheckCircle2, Clock, Sparkles, BookOpen, History } from 'lucide-react';
import { getProblems } from '../api/problems.js';
import { getAttempts } from '../api/attempts.js';
import { ProblemCard } from '../components/ProblemCard.jsx';
import { AttemptCard } from '../components/AttemptCard.jsx';
import { Button } from '../components/Button.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ATTEMPT_STATUS } from '../domain/Attempt.js';

export function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [problemsData, attemptsData] = await Promise.all([
          getProblems({ delay: 50 }),
          getAttempts()
        ]);
        setProblems(problemsData);
        setAttempts(attemptsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Unable to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <LoadingState title="Loading dashboard..." description="Preparing your low-level design practice environment." />;
  }

  if (error) {
    return <ErrorState title="Dashboard Error" message={error} onRetry={() => window.location.reload()} />;
  }

  // Calculate summary metrics
  const completedAttempts = attempts.filter(a => a.status === ATTEMPT_STATUS.COMPLETED);
  const attemptedProblemIds = new Set(attempts.map(a => a.problemId));
  const recentAttempts = attempts.slice(0, 3);
  const firstProblem = problems[0];

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-400/30 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>Object-Oriented Design & Architecture Practice</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Master Low-Level Design, <br className="hidden sm:inline" />
            <span className="text-indigo-300 font-bold">one problem at a time.</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Deconstruct real-world systems, model classes and responsibilities, write clean interface skeletons, and receive explainable architectural feedback.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {firstProblem ? (
              <Link to={`/problems/${firstProblem.id}`}>
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/25"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Start Practicing
                </Button>
              </Link>
            ) : (
              <Link to="/problems">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Browse Problems
                </Button>
              </Link>
            )}

            <Link to="/problems">
              <Button variant="outline" size="lg" className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-white">
                View All Problems
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative corner icon */}
        <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none select-none">
          <Code2 className="w-80 h-80 text-white" />
        </div>
      </section>

      {/* Progress / Attempt Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available Problems</span>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{problems.length}</span>
            <span className="text-xs text-slate-500">curated scenarios</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Problems Attempted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{attemptedProblemIds.size}</span>
            <span className="text-xs text-slate-500">of {problems.length} problems</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Attempts</span>
            <History className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{attempts.length}</span>
            <span className="text-xs text-slate-500">({completedAttempts.length} evaluated)</span>
          </div>
        </div>
      </section>

      {/* Practice Problems Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Practice Problems</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select an architectural challenge to start your design</p>
          </div>
          <Link
            to="/problems"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>Explore all</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {problems.map(problem => {
            const count = attempts.filter(a => a.problemId === problem.id).length;
            return (
              <ProblemCard key={problem.id} problem={problem} attemptCount={count} />
            );
          })}
        </div>
      </section>

      {/* Recent Attempts Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Attempts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest design submissions and reviews</p>
          </div>
          {attempts.length > 0 && (
            <Link
              to="/attempts"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              <span>View all attempts</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {recentAttempts.length > 0 ? (
          <div className="space-y-3">
            {recentAttempts.map(attempt => (
              <AttemptCard key={attempt.id} attempt={attempt} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No attempts recorded yet"
            description="Pick a problem above and submit your first object-oriented design to get explainable feedback."
            actionLabel="Choose a Problem"
            actionLink="/problems"
          />
        )}
      </section>
    </div>
  );
}