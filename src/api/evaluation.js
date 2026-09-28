import { getAttemptById, saveAttempt } from './attempts.js';
import { getProblem } from './problems.js';
import { evaluatorFactory } from '../evaluators/index.js';
import { Submission } from '../domain/Submission.js';
import { ATTEMPT_STATUS } from '../domain/Attempt.js';

const USE_REMOTE_BACKEND = false;
const BACKEND_BASE_URL = 'http://localhost:8000';

/**
 * Submit an attempt's solution and trigger evaluation.
 */
export async function submitAndEvaluate({
  attemptId,
  submissionData,
  evaluatorType = 'ai',
  simulateFailure = false
}) {
  // Step 1: Fetch Attempt
  const attempt = await getAttemptById(attemptId);
  if (!attempt) {
    throw new Error(`Attempt with ID "${attemptId}" does not exist.`);
  }

  // Step 2: Fetch Problem
  const problem = await getProblem(attempt.problemId);
  if (!problem) {
    throw new Error(`Problem with ID "${attempt.problemId}" does not exist.`);
  }

  // Step 3: Validate Submission
  const submission = new Submission(submissionData);
  const validation = submission.validate();
  if (!validation.isValid) {
    const err = new Error(validation.errors[0]);
    err.validationErrors = validation.errors;
    throw err;
  }

  // Step 4: Mark Attempt as Submitted and Evaluating
  attempt.submit(submission.toJSON());
  attempt.startEvaluation(evaluatorType);
  await saveAttempt(attempt);

  if (USE_REMOTE_BACKEND) {
    const res = await fetch(`${BACKEND_BASE_URL}/attempts/${attemptId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluatorType, submission: submission.toJSON() })
    });
    if (!res.ok) {
      attempt.failEvaluation(`Backend error: ${res.statusText}`);
      await saveAttempt(attempt);
      throw new Error(`Evaluation failed on server.`);
    }
    const result = await res.json();
    attempt.completeEvaluation(result.feedback);
    await saveAttempt(attempt);
    return attempt;
  }

  // Local Evaluator pipeline
  try {
    const evaluator = evaluatorFactory.getEvaluator(evaluatorType);

    // Support failure simulation toggle if configured
    if (typeof evaluator.setSimulateFailure === 'function') {
      evaluator.setSimulateFailure(simulateFailure);
    }

    const feedback = await evaluator.evaluate(submission, problem);
    attempt.completeEvaluation(feedback.toJSON());
    await saveAttempt(attempt);
    return attempt;
  } catch (error) {
    console.error('Evaluation execution failure:', error);
    attempt.failEvaluation(error.message || 'We could not evaluate this attempt.');
    await saveAttempt(attempt);
    throw error;
  }
}

/**
 * Retry evaluation for an attempt (e.g. from failed state)
 */
export async function retryEvaluation({ attemptId, evaluatorType = 'ai', simulateFailure = false }) {
  const attempt = await getAttemptById(attemptId);
  if (!attempt) {
    throw new Error(`Attempt with ID "${attemptId}" not found.`);
  }

  if (!attempt.submission) {
    throw new Error('Cannot evaluate an attempt without an existing submission.');
  }

  return submitAndEvaluate({
    attemptId,
    submissionData: attempt.submission,
    evaluatorType,
    simulateFailure
  });
}
