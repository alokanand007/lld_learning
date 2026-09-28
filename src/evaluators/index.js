import { RuleBasedEvaluator } from './RuleBasedEvaluator.js';
import { AIEvaluator } from './AIEvaluator.js';

export { Evaluator } from './Evaluator.js';
export { RuleBasedEvaluator } from './RuleBasedEvaluator.js';
export { AIEvaluator } from './AIEvaluator.js';

/**
 * Factory for creating evaluation strategy instances.
 */
class EvaluatorFactory {
  constructor() {
    this.evaluators = {
      'ai': new AIEvaluator(),
      'rule-based': new RuleBasedEvaluator()
    };
    this.activeEvaluatorType = 'ai';
  }

  getEvaluator(type = this.activeEvaluatorType) {
    const evaluator = this.evaluators[type.toLowerCase()];
    if (!evaluator) {
      console.warn(`Evaluator '${type}' not found, falling back to AI Evaluator.`);
      return this.evaluators['ai'];
    }
    return evaluator;
  }

  registerEvaluator(key, instance) {
    this.evaluators[key.toLowerCase()] = instance;
  }

  setActiveEvaluator(type) {
    if (this.evaluators[type.toLowerCase()]) {
      this.activeEvaluatorType = type.toLowerCase();
    }
  }

  getActiveEvaluator() {
    return this.getEvaluator(this.activeEvaluatorType);
  }
}

export const evaluatorFactory = new EvaluatorFactory();
