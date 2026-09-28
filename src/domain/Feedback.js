/**
 * Feedback Domain Entity
 * Captures explainable, educational guidance for the learner's design.
 */
export class Feedback {
  constructor({
    summary = '',
    strengths = [],
    needsImprovement = [],
    suggestions = [],
    designConcepts = []
  } = {}) {
    this.summary = summary;
    this.strengths = strengths; // Array of strings or { title, description }
    this.needsImprovement = needsImprovement; // Array of { point, whyItMatters }
    this.suggestions = suggestions; // Array of strings or structured code/refactoring tips
    this.designConcepts = designConcepts; // Array of concept names e.g. "Single Responsibility", "Strategy Pattern"
  }

  toJSON() {
    return {
      summary: this.summary,
      strengths: this.strengths,
      needsImprovement: this.needsImprovement,
      suggestions: this.suggestions,
      designConcepts: this.designConcepts
    };
  }
}
