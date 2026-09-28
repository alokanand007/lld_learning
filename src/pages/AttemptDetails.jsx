import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle2, Calendar, FileText, Code2, Layers, GitBranch, Terminal, RefreshCw } from 'lucide-react';
import { getAttemptById } from '../api/attempts.js';
import { retryEvaluation } from '../api/evaluation.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { FeedbackSection } from '../components/FeedbackSection.jsx';
import { Button } from '../components/Button.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { ATTEMPT_STATUS } from '../domain/Attempt.js';

export function AttemptDetails() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retry evaluation state
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState(null);

  // Active tab for inspecting learner's submitted solution
  const [activeSolutionTab, setActiveSolutionTab] = useState('classes');

  useEffect(() => {
    async function loadAttempt() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAttemptById(attemptId);
        if (!data) {
          setError(`Attempt "${attemptId}" was not found.`);
        } else {
          setAttempt(data);
        }
      } catch (err) {
        console.error('Failed to load attempt:', err);
        setError('Failed to load attempt details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadAttempt();
  }, [attemptId]);

  const handleRetryEvaluation = async () => {
    try {
      setIsRetrying(true);
      setRetryError(null);
      const updated = await retryEvaluation({
        attemptId: attempt.id,
        evaluatorType: attempt.evaluation?.evaluatorType || 'ai',
        simulateFailure: false // Turn off failure simulation on explicit retry
      });
      setAttempt(updated);
    } catch (err) {
      console.error('Retry evaluation failed:', err);
      setRetryError(err.message || 'Evaluation retry failed. Please try again.');
      // Refresh attempt data to capture failed state
      const refreshed = await getAttemptById(attempt.id);
      if (refreshed) setAttempt(refreshed);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleTryAgain = () => {
    if (!attempt) return;
    // Navigate to practice page to create a new attempt
    navigate(`/practice/${attempt.problemId}`);
  };

  if (isLoading) {
    return <LoadingState title="Loading attempt..." description="Retrieving submission and evaluation report." />;
  }

  if (error || !attempt) {
    return (
      <ErrorState
        title="Attempt Not Found"
        message={error || 'The requested attempt could not be found.'}
        onRetry={() => navigate('/attempts')}
      />
    );
  }

  const isEvaluating = attempt.status === ATTEMPT_STATUS.EVALUATING;
  const isFailed = attempt.status === ATTEMPT_STATUS.FAILED;
  const isCompleted = attempt.status === ATTEMPT_STATUS.COMPLETED;

  const formattedDate = attempt.createdAt
    ? new Date(attempt.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown date';

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/attempts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Attempts</span>
        </Link>

        <Link
          to={`/problems/${attempt.problemId}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View Problem Details →
        </Link>
      </div>

      {/* Attempt Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                Attempt #{attempt.attemptNumber}
              </span>
              <StatusBadge status={attempt.status} size="md" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {attempt.problemTitle}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formattedDate}
              </span>
              {attempt.evaluation?.evaluatorType && (
                <span>
                  Evaluator: <strong className="text-slate-700 font-mono">{attempt.evaluation.evaluatorType}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Try Again CTA */}
          <div className="shrink-0 flex items-center gap-2">
            <Button
              onClick={handleTryAgain}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>

      {/* State-specific Body Sections */}

      {/* 1. Evaluating State */}
      {isEvaluating && (
        <LoadingState
          title="Evaluation in Progress"
          description="Your design is currently being evaluated for responsibility allocation, coupling, and modularity."
          isEvaluating={true}
        />
      )}

      {/* 2. Failed State with Recovery / Retry Option */}
      {isFailed && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-900">We couldn't evaluate this attempt.</h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                {attempt.evaluation?.errorMessage || 'An error occurred during design evaluation.'}
              </p>
            </div>
          </div>

          {retryError && (
            <div className="text-xs text-rose-700 bg-white p-3 rounded-lg border border-rose-200">
              {retryError}
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <Button
              variant="danger"
              isLoading={isRetrying}
              onClick={handleRetryEvaluation}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Try Evaluation Again
            </Button>
            <Button
              variant="outline"
              onClick={handleTryAgain}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Start New Attempt
            </Button>
          </div>
        </div>
      )}

      {/* 3. Completed State: Structured Explainable Feedback */}
      {isCompleted && attempt.evaluation?.feedback && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Design Feedback</span>
            </h2>
            <span className="text-xs text-slate-500">Explainable Architectural Review</span>
          </div>

          <FeedbackSection
            feedback={attempt.evaluation.feedback}
            evaluatorType={attempt.evaluation.evaluatorType}
          />
        </section>
      )}

      {/* Learner's Submitted Solution Section */}
      {attempt.submission && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span>Your Submitted Design</span>
              </h3>
              <p className="text-xs text-slate-500">Review the classes, responsibilities, and code from this attempt</p>
            </div>

            {/* Solution Sub-Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveSolutionTab('classes')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeSolutionTab === 'classes'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Classes
              </button>
              <button
                type="button"
                onClick={() => setActiveSolutionTab('responsibilities')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeSolutionTab === 'responsibilities'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Responsibilities
              </button>
              <button
                type="button"
                onClick={() => setActiveSolutionTab('relationships')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeSolutionTab === 'relationships'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Relationships
              </button>
              <button
                type="button"
                onClick={() => setActiveSolutionTab('code')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeSolutionTab === 'code'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Code Skeleton
              </button>
            </div>
          </div>

          {/* Active Tab Content Display */}
          <div className="pt-2">
            {activeSolutionTab === 'classes' && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Declared Classes & Interfaces
                </span>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {attempt.submission.classes || 'None specified'}
                </pre>
              </div>
            )}

            {activeSolutionTab === 'responsibilities' && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Class Responsibilities
                </span>
                <pre className="p-4 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {attempt.submission.responsibilities || 'None specified'}
                </pre>
              </div>
            )}

            {activeSolutionTab === 'relationships' && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Relationships & Composition
                </span>
                <pre className="p-4 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {attempt.submission.relationships || 'None specified'}
                </pre>
              </div>
            )}

            {activeSolutionTab === 'code' && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Code / Pseudocode
                </span>
                <pre className="p-4 rounded-xl bg-slate-900 text-indigo-100 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                  {attempt.submission.code || '// No code provided'}
                </pre>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Learning Loop Next Step Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold">Continuous Learning Loop</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Low-level design is an iterative craft. Apply the feedback suggestions and try a new attempt to refine your architecture.
          </p>
        </div>
        <Button
          onClick={handleTryAgain}
          size="md"
          className="shrink-0 w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white font-semibold"
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Try Again (New Attempt)
        </Button>
      </div>
    </div>
  );
}
