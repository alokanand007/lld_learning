/**
 * Submission Domain Entity
 * Represents the learner's submitted low-level design artifact.
 */
export class Submission {
  constructor({
    classes = '',
    responsibilities = '',
    relationships = '',
    code = '',
    submittedAt = new Date().toISOString()
  } = {}) {
    this.classes = classes.trim();
    this.responsibilities = responsibilities.trim();
    this.relationships = relationships.trim();
    this.code = code.trim();
    this.submittedAt = submittedAt;
  }

  /**
   * Validate submission format and required fields
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  validate() {
    const errors = [];
    if (!this.classes) {
      errors.push('Classes section cannot be empty. Please identify at least one core class or interface.');
    }
    if (!this.responsibilities) {
      errors.push('Responsibilities section cannot be empty. Outline what each class does.');
    }
    if (!this.code) {
      errors.push('Code or pseudocode section cannot be empty. Provide the interface/class skeleton.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      classes: this.classes,
      responsibilities: this.responsibilities,
      relationships: this.relationships,
      code: this.code,
      submittedAt: this.submittedAt
    };
  }
}
