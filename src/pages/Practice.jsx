import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, BookOpen, Layers, GitBranch, Terminal, AlertTriangle, FileCode2, RotateCcw } from 'lucide-react';
import { getProblem } from '../api/problems.js';
import { createAttempt } from '../api/attempts.js';
import { submitAndEvaluate } from '../api/evaluation.js';
import { Button } from '../components/Button.jsx';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { Submission } from '../domain/Submission.js';

export function Practice() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    classes: '',
    responsibilities: '',
    relationships: '',
    code: ''
  });

  // Evaluator selection & options
  const [evaluatorType, setEvaluatorType] = useState('ai');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    async function loadProblem() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProblem(problemId, { delay: 40 });
        if (!data) {
          setError(`Problem "${problemId}" not found.`);
        } else {
          setProblem(data);
          // Default empty or check if starter template available
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
        setError('Failed to load problem workspace.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProblem();
  }, [problemId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user types
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleLoadStarterTemplate = () => {
    if (!problem?.starterTemplate) return;
    if (
      formData.classes.trim() ||
      formData.responsibilities.trim() ||
      formData.code.trim()
    ) {
      const confirmReplace = window.confirm(
        'Loading the starter template will overwrite your current draft. Do you want to continue?'
      );
      if (!confirmReplace) return;
    }
    setFormData({
      classes: problem.starterTemplate.classes || '',
      responsibilities: problem.starterTemplate.responsibilities || '',
      relationships: problem.starterTemplate.relationships || '',
      code: problem.starterTemplate.code || ''
    });
    setValidationErrors([]);
  };

  const handleClearForm = () => {
    if (window.confirm('Clear all solution fields?')) {
      setFormData({ classes: '', responsibilities: '', relationships: '', code: '' });
      setValidationErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side Domain Validation
    const submission = new Submission(formData);
    const validation = submission.validate();

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationErrors([]);

      // 2. Create new attempt
      const attempt = await createAttempt({
        problemId: problem.id,
        problemTitle: problem.title,
        initialSolution: formData
      });

      // 3. Trigger evaluation
      try {
        await submitAndEvaluate({
          attemptId: attempt.id,
          submissionData: formData,
          evaluatorType,
          simulateFailure
        });
      } catch (evalErr) {
        console.warn('Evaluation failed or simulated error:', evalErr);
        // We still navigate to the attempt page so the user sees the failed status
        // and the "Try Evaluation Again" retry flow!
      }

      // 4. Navigate to Attempt Feedback page
      navigate(`/attempts/${attempt.id}`);
    } catch (err) {
      console.error('Failed to submit attempt:', err);
      setValidationErrors([err.message || 'Submission failed. Please try again.']);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState title="Loading practice studio..." description="Setting up problem workspace." />;
  }

  if (error || !problem) {
    return <ErrorState title="Problem Not Found" message={error} onRetry={() => navigate('/problems')} />;
  }

  if (isSubmitting) {
    return (
      <LoadingState
        title="Evaluating Your Design..."
        description="The evaluation engine is examining your class hierarchy, coupling, cohesion, and extensible patterns."
        isEvaluating={true}
      />
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to={`/problems/${problem.id}`}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Back to Problem Details"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Practice Studio</span>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {problem.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {problem.starterTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadStarterTemplate}
              leftIcon={<FileCode2 className="h-3.5 w-3.5 text-indigo-600" />}
              title="Pre-fill with recommended starter architecture skeleton"
            >
              Load Starter Scaffold
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearForm}
            leftIcon={<RotateCcw className="h-3.5 w-3.5 text-slate-400" />}
            title="Reset form"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Validation Errors Alert Banner */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>Please complete all required design sections before submitting:</span>
          </div>
          <ul className="list-disc list-inside text-xs pl-6 space-y-0.5 text-rose-700">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Responsive Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Requirements & Problem Context (5 Cols on LG) */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          {/* Problem Statement Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>Problem Statement</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {problem.description}
            </p>
          </div>

          {/* Requirements Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>System Requirements</span>
            </h3>
            <ol className="space-y-2.5 text-xs text-slate-700">
              {problem.requirements?.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{req}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Key Design Guidance Tips */}
          {problem.designGuidance && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Recommended Patterns & Hints</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-indigo-900/90">
                {problem.designGuidance.recommendedPatterns?.map((pat, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{pat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Solution Design Form (7 Cols on LG) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          {/* Section 1: Classes */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="classes" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>1. Core Classes & Interfaces</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">One class per line</span>
            </div>
            <p className="text-xs text-slate-500">
              List the primary domain models, controllers, and interfaces.
            </p>
            <textarea
              id="classes"
              rows={4}
              value={formData.classes}
              onChange={(e) => handleInputChange('classes', e.target.value)}
              placeholder="e.g.&#10;ParkingLot&#10;ParkingFloor&#10;ParkingSpot (abstract)&#10;Vehicle&#10;Ticket&#10;PricingStrategy (interface)"
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* Section 2: Responsibilities */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="responsibilities" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-600" />
                <span>2. Class Responsibilities</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Single Responsibility Principle</span>
            </div>
            <p className="text-xs text-slate-500">
              Define what each class is responsible for doing and what state it manages.
            </p>
            <textarea
              id="responsibilities"
              rows={5}
              value={formData.responsibilities}
              onChange={(e) => handleInputChange('responsibilities', e.target.value)}
              placeholder="e.g.&#10;ParkingLot:&#10;- Coordinates parking floors and entry/exit gates&#10;- Delegates spot search to appropriate floor&#10;&#10;PricingStrategy:&#10;- Computes hourly parking fee independently from ticket storage"
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* Section 3: Relationships */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="relationships" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-amber-600" />
                <span>3. Relationships & Multiplicity</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Composition, Inheritance, Associations</span>
            </div>
            <p className="text-xs text-slate-500">
              Specify how classes connect (e.g., 1-to-many composition, interface implementation).
            </p>
            <textarea
              id="relationships"
              rows={4}
              value={formData.relationships}
              onChange={(e) => handleInputChange('relationships', e.target.value)}
              placeholder="e.g.&#10;ParkingLot 1 --> * ParkingFloor (Composition)&#10;ParkingFloor 1 --> * ParkingSpot (Composition)&#10;ParkingSpot 1 --> 0..1 Vehicle (Association)&#10;ParkingLot --> PricingStrategy (Strategy Pattern)"
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* Section 4: Code / Pseudocode */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="code" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-indigo-600" />
                <span>4. Code / Pseudocode Skeleton</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Method signatures & interfaces</span>
            </div>
            <p className="text-xs text-slate-500">
              Provide interface definitions, class contracts, or pseudocode showing how the system functions.
            </p>
            <textarea
              id="code"
              rows={10}
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder={`// Write your class and interface outlines (Java / Python / TypeScript / Pseudocode)\ninterface PricingStrategy {\n  double calculateFee(Ticket ticket, Instant exitTime);\n}\n\nclass ParkingLot {\n  private List<ParkingFloor> floors;\n  private PricingStrategy pricingStrategy;\n  \n  public Ticket parkVehicle(Vehicle vehicle) {\n    // find spot and generate ticket\n  }\n}`}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors placeholder:text-slate-500 leading-relaxed selection:bg-indigo-500/40"
            />
          </div>

          {/* Evaluator Engine Selection & Resilience Options */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Evaluation Strategy Engine
              </span>
              <span className="text-[11px] text-slate-500">Pluggable architectural review</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                evaluatorType === 'ai'
                  ? 'border-indigo-500 bg-white shadow-xs'
                  : 'border-slate-200 bg-slate-100/60 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="evaluator"
                  value="ai"
                  checked={evaluatorType === 'ai'}
                  onChange={() => setEvaluatorType('ai')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">AI Architectural Evaluator</span>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    Heuristic LLM reasoning analyzing coupling, cohesion, and explainable suggestions.
                  </span>
                </div>
              </label>

              <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                evaluatorType === 'rule-based'
                  ? 'border-indigo-500 bg-white shadow-xs'
                  : 'border-slate-200 bg-slate-100/60 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="evaluator"
                  value="rule-based"
                  checked={evaluatorType === 'rule-based'}
                  onChange={() => setEvaluatorType('rule-based')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Rule-Based Evaluator</span>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    Deterministic checks for entity boundaries, interface presence, and SRP rules.
                  </span>
                </div>
              </label>
            </div>

            {/* Test Simulation Toggle */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <label htmlFor="simulateFailure" className="text-xs text-slate-600 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="simulateFailure"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Simulate evaluation failure (for testing error handling & retry loop)</span>
              </label>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              * Required fields: Classes, Responsibilities, Code
            </span>

            <Button
              type="submit"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20"
              rightIcon={<Send className="h-4 w-4" />}
            >
              Submit Solution
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
