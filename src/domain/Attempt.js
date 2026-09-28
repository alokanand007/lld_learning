import { Submission } from './Submission.js';
import { Evaluation, EVALUATION_STATUS } from './Evaluation.js';

export const ATTEMPT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  EVALUATING: 'evaluating',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Attempt Domain Entity
 * Tracks the complete lifecycle of a single learner attempt on a problem.
 */
export class Attempt {
  constructor({
    id = `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    problemId,
    problemTitle,
    attemptNumber = 1,
    status = ATTEMPT_STATUS.DRAFT,
    submission = null,
    evaluation = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.problemId = problemId;
    this.problemTitle = problemTitle;
    this.attemptNumber = attemptNumber;
    this.status = status;
    this.submission = submission ? (submission instanceof Submission ? submission : new Submission(submission)) : null;
    this.evaluation = evaluation ? (evaluation instanceof Evaluation ? evaluation : new Evaluation(evaluation)) : null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  submit(submissionData) {
    this.submission = new Submission(submissionData);
    this.status = ATTEMPT_STATUS.SUBMITTED;
    this.updatedAt = new Date().toISOString();
  }

  startEvaluation(evaluatorType = 'AIEvaluator') {
    this.status = ATTEMPT_STATUS.EVALUATING;
    this.evaluation = new Evaluation({ evaluatorType, status: EVALUATION_STATUS.EVALUATING });
    this.updatedAt = new Date().toISOString();
  }

  completeEvaluation(feedbackData) {
    if (!this.evaluation) {
      this.evaluation = new Evaluation();
    }
    this.evaluation.complete(feedbackData);
    this.status = ATTEMPT_STATUS.COMPLETED;
    this.updatedAt = new Date().toISOString();
  }

  failEvaluation(errorMessage) {
    if (!this.evaluation) {
      this.evaluation = new Evaluation();
    }
    this.evaluation.fail(errorMessage);
    this.status = ATTEMPT_STATUS.FAILED;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      problemId: this.problemId,
      problemTitle: this.problemTitle,
      attemptNumber: this.attemptNumber,
      status: this.status,
      submission: this.submission ? this.submission.toJSON() : null,
      evaluation: this.evaluation ? this.evaluation.toJSON() : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
