import { Feedback } from './Feedback.js';

export const EVALUATION_STATUS = {
  PENDING: 'pending',
  EVALUATING: 'evaluating',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Evaluation Domain Entity
 * Encapsulates the analysis process, evaluation result, and resulting feedback.
 */
export class Evaluation {
  constructor({
    id = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    evaluatorType = 'AIEvaluator',
    status = EVALUATION_STATUS.PENDING,
    evaluatedAt = null,
    feedback = null,
    errorMessage = null
  } = {}) {
    this.id = id;
    this.evaluatorType = evaluatorType;
    this.status = status;
    this.evaluatedAt = evaluatedAt;
    this.feedback = feedback ? (feedback instanceof Feedback ? feedback : new Feedback(feedback)) : null;
    this.errorMessage = errorMessage;
  }

  markEvaluating() {
    this.status = EVALUATION_STATUS.EVALUATING;
  }

  complete(feedbackData) {
    this.status = EVALUATION_STATUS.COMPLETED;
    this.evaluatedAt = new Date().toISOString();
    this.feedback = new Feedback(feedbackData);
    this.errorMessage = null;
  }

  fail(errorMessage) {
    this.status = EVALUATION_STATUS.FAILED;
    this.evaluatedAt = new Date().toISOString();
    this.errorMessage = errorMessage || 'Failed to complete evaluation.';
  }

  toJSON() {
    return {
      id: this.id,
      evaluatorType: this.evaluatorType,
      status: this.status,
      evaluatedAt: this.evaluatedAt,
      feedback: this.feedback ? this.feedback.toJSON() : null,
      errorMessage: this.errorMessage
    };
  }
}
