/**
 * Base Evaluator Interface / Abstract Class
 * 
 * Defines the contract that all evaluation strategies (Rule-Based, AI, Human) must satisfy.
 * Ensures the platform is open for extension without modifying client code.
 */
export class Evaluator {
  /**
   * @param {string} name - Human-readable name of the evaluator strategy
   */
  constructor(name = 'BaseEvaluator') {
    if (new.target === Evaluator) {
      throw new TypeError('Cannot construct Evaluator instances directly. Use a concrete subclass.');
    }
    this.name = name;
  }

  /**
   * Evaluate a submission against a problem
   * @param {import('../domain/Submission.js').Submission} submission 
   * @param {object} problem 
   * @returns {Promise<import('../domain/Feedback.js').Feedback>}
   */
  async evaluate(submission, problem) {
    throw new Error('evaluate() method must be implemented by subclass.');
  }
}
