import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Tag, CheckCircle2, AlertCircle, Sparkles, Layers, History, Code2 } from 'lucide-react';
import { getProblem } from '../api/problems.js';
import { getAttemptsByProblemId } from '../api/attempts.js';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { Button } from '../components/Button.jsx';
import { AttemptCard } from '../components/AttemptCard.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';

export function ProblemDetails() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [problemData, attemptsData] = await Promise.all([
          getProblem(problemId, { delay: 40 }),
          getAttemptsByProblemId(problemId)
        ]);

        if (!problemData) {
          setError(`Problem "${problemId}" was not found.`);
        } else {
          setProblem(problemData);
          setAttempts(attemptsData);
        }
      } catch (err) {
        console.error('Failed to load problem details:', err);
        setError('Failed to load problem. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [problemId]);

  if (isLoading) {
    return <LoadingState title="Loading problem specification..." description="Reading requirements and architectural guidelines." />;
  }

  if (error || !problem) {
    return (
      <ErrorState
        title="Problem Not Found"
        message={error || 'The requested problem does not exist.'}
        onRetry={() => navigate('/problems')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/problems"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to all problems</span>
      </Link>

      {/* Problem Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {problem.estimatedTime}
            </span>
            {problem.category && (
              <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200/60 font-medium px-2 py-0.5 rounded">
                {problem.category}
              </span>
            )}
          </div>

          <Link to={`/practice/${problem.id}`}>
            <Button
              size="md"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start Practice
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {problem.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {problem.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {problem.tags?.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Requirements Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <CheckCircle2 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Functional Requirements</h2>
        </div>

        <p className="text-xs text-slate-500">
          Your object-oriented design should satisfy and address the following system expectations:
        </p>

        <ol className="space-y-3 pt-1">
          {problem.requirements?.map((req, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200/80">
                {idx + 1}
              </span>
              <span className="pt-0.5">{req}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* What You Need To Design Guidance */}
      {problem.designGuidance && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">What You Need To Design</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Classes & Roles */}
            <div className="space-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>Key Classes & Entities</span>
              </h3>
              <ul className="space-y-1.5">
                {problem.designGuidance.keyClasses?.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Extensibility & Design Patterns */}
            <div className="space-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-emerald-600" />
                <span>Extensibility & Patterns</span>
              </h3>
              <ul className="space-y-1.5">
                {problem.designGuidance.recommendedPatterns?.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Architectural Considerations */}
          {problem.designGuidance.extensibilityPoints && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                Key Architectural Considerations
              </h4>
              <ul className="space-y-1.5 text-xs text-indigo-900/90">
                {problem.designGuidance.extensibilityPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Start Practice Floating / Bottom CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
        <div>
          <h3 className="text-lg font-bold">Ready to model this system?</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Step into the design studio to specify classes, responsibilities, relationships, and code.
          </p>
        </div>
        <Link to={`/practice/${problem.id}`} className="shrink-0 w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white font-semibold shadow-sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Start Practice
          </Button>
        </Link>
      </div>

      {/* Previous Attempts for this problem */}
      {attempts.length > 0 && (
        <section className="space-y-3 pt-4">
          <div className="flex items-center gap-2 pb-1">
            <History className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Your Previous Attempts on this Problem ({attempts.length})
            </h3>
          </div>
          <div className="space-y-3">
            {attempts.map(attempt => (
              <AttemptCard key={attempt.id} attempt={attempt} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
