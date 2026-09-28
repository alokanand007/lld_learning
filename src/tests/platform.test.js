import { describe, it, expect, beforeEach } from 'vitest';
import { PROBLEMS, getProblemById } from '../data/problems.js';
import { getProblems, getProblem } from '../api/problems.js';
import {
  createAttempt,
  getAttempts,
  getAttemptById,
  getAttemptsByProblemId,
  saveAttempt
} from '../api/attempts.js';
import { submitAndEvaluate, retryEvaluation } from '../api/evaluation.js';
import { Submission } from '../domain/Submission.js';
import { Attempt, ATTEMPT_STATUS } from '../domain/Attempt.js';
import { Evaluator, RuleBasedEvaluator, AIEvaluator, evaluatorFactory } from '../evaluators/index.js';
import { Storage } from '../utils/storage.js';

describe('LLD Practice Platform — Core Domain & Services', () => {
  beforeEach(() => {
    // Reset test storage
    Storage.remove(Storage.KEYS.ATTEMPTS);
  });

  describe('1. Problem Retrieval', () => {
    it('retrieves all initial LLD problems', async () => {
      const problems = await getProblems({ delay: 0 });
      expect(problems.length).toBeGreaterThanOrEqual(4);

      const ids = problems.map(p => p.id);
      expect(ids).toContain('parking-lot');
      expect(ids).toContain('vending-machine');
      expect(ids).toContain('elevator-system');
      expect(ids).toContain('library-management');
    });

    it('retrieves problem by ID with complete specifications', async () => {
      const problem = await getProblem('parking-lot', { delay: 0 });
      expect(problem).not.toBeNull();
      expect(problem.id).toBe('parking-lot');
      expect(problem.title).toBe('Parking Lot System');
      expect(problem.difficulty).toBe('Intermediate');
      expect(problem.requirements.length).toBeGreaterThan(0);
      expect(problem.designGuidance).toBeDefined();
      expect(problem.designGuidance.keyClasses.length).toBeGreaterThan(0);
    });

    it('filters problems by difficulty and search query', async () => {
      const beginnerProblems = await getProblems({ difficulty: 'Beginner', delay: 0 });
      expect(beginnerProblems.every(p => p.difficulty === 'Beginner')).toBe(true);

      const searched = await getProblems({ search: 'elevator', delay: 0 });
      expect(searched.length).toBe(1);
      expect(searched[0].id).toBe('elevator-system');
    });

    it('handles non-existent problem ID gracefully', async () => {
      const problem = await getProblem('non-existent-problem-id', { delay: 0 });
      expect(problem).toBeNull();
    });
  });

  describe('2. Submission Validation', () => {
    it('flags empty classes, responsibilities, and code sections', () => {
      const emptySub = new Submission({ classes: '', responsibilities: '', relationships: '', code: '' });
      const validation = emptySub.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBe(3);
      expect(validation.errors.some(e => e.includes('Classes'))).toBe(true);
      expect(validation.errors.some(e => e.includes('Responsibilities'))).toBe(true);
      expect(validation.errors.some(e => e.includes('Code'))).toBe(true);
    });

    it('passes validation when required fields are filled', () => {
      const validSub = new Submission({
        classes: 'ParkingLot\nParkingSpot\nVehicle',
        responsibilities: 'ParkingLot coordinates spots and vehicles',
        relationships: 'ParkingLot has many ParkingSpot',
        code: 'class ParkingLot { List<ParkingSpot> spots; }'
      });
      const validation = validSub.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });

  describe('3. Attempt Creation & Lifecycle Tracking', () => {
    it('creates an attempt in draft status and increments attempt numbering', async () => {
      const attempt1 = await createAttempt({
        problemId: 'parking-lot',
        problemTitle: 'Parking Lot System'
      });

      expect(attempt1.id).toBeDefined();
      expect(attempt1.problemId).toBe('parking-lot');
      expect(attempt1.attemptNumber).toBe(1);
      expect(attempt1.status).toBe(ATTEMPT_STATUS.DRAFT);

      const attempt2 = await createAttempt({
        problemId: 'parking-lot',
        problemTitle: 'Parking Lot System'
      });

      expect(attempt2.attemptNumber).toBe(2);
      expect(attempt2.id).not.toBe(attempt1.id);
    });

    it('preserves attempt history across multiple creations', async () => {
      await createAttempt({ problemId: 'parking-lot', problemTitle: 'Parking Lot' });
      await createAttempt({ problemId: 'vending-machine', problemTitle: 'Vending Machine' });

      const all = await getAttempts();
      expect(all.length).toBeGreaterThanOrEqual(2);

      const parkingAttempts = await getAttemptsByProblemId('parking-lot');
      expect(parkingAttempts.length).toBe(1);
    });
  });

  describe('4. Evaluation Execution & Explainable Feedback', () => {
    it('successfully evaluates a valid submission with AI evaluator', async () => {
      const attempt = await createAttempt({
        problemId: 'parking-lot',
        problemTitle: 'Parking Lot System'
      });

      const submissionData = {
        classes: `ParkingLot\nParkingFloor\nParkingSpot\nVehicle\nTicket\nPricingStrategy`,
        responsibilities: `ParkingLot coordinates floors.\nParkingSpot tracks occupancy.\nPricingStrategy computes dynamic fees.`,
        relationships: `ParkingLot 1 --> * ParkingFloor\nParkingFloor 1 --> * ParkingSpot`,
        code: `interface PricingStrategy { double calc(Ticket t); }\nclass ParkingLot { List<ParkingFloor> floors; }`
      };

      // Set zero latency for fast test execution
      const aiEval = evaluatorFactory.getEvaluator('ai');
      aiEval.delayMs = 0;

      const evaluatedAttempt = await submitAndEvaluate({
        attemptId: attempt.id,
        submissionData,
        evaluatorType: 'ai'
      });

      expect(evaluatedAttempt.status).toBe(ATTEMPT_STATUS.COMPLETED);
      expect(evaluatedAttempt.evaluation).toBeDefined();
      expect(evaluatedAttempt.evaluation.feedback).toBeDefined();

      const feedback = evaluatedAttempt.evaluation.feedback;
      expect(feedback.summary.length).toBeGreaterThan(0);
      expect(feedback.strengths.length).toBeGreaterThan(0);
      expect(feedback.needsImprovement.length).toBeGreaterThan(0);
      expect(feedback.suggestions.length).toBeGreaterThan(0);

      // Verify "why it matters" explanation format
      const issue = feedback.needsImprovement[0];
      expect(issue.point).toBeDefined();
      expect(issue.whyItMatters).toBeDefined();
      expect(issue.whyItMatters.length).toBeGreaterThan(10);
    });

    it('successfully evaluates a submission with RuleBasedEvaluator', async () => {
      const attempt = await createAttempt({
        problemId: 'vending-machine',
        problemTitle: 'Vending Machine System'
      });

      const submissionData = {
        classes: `VendingMachine\nVendingState\nIdleState\nHasMoneyState\nProduct\nInventory`,
        responsibilities: `VendingMachine holds context.\nVendingState delegates operations.\nInventory stores products.`,
        relationships: `VendingMachine has-a VendingState`,
        code: `interface VendingState { void insertCoin(); }\nclass IdleState implements VendingState { public void insertCoin(){} }`
      };

      const evaluatedAttempt = await submitAndEvaluate({
        attemptId: attempt.id,
        submissionData,
        evaluatorType: 'rule-based'
      });

      expect(evaluatedAttempt.status).toBe(ATTEMPT_STATUS.COMPLETED);
      expect(evaluatedAttempt.evaluation.evaluatorType).toBe('rule-based');
      expect(evaluatedAttempt.evaluation.feedback.strengths.length).toBeGreaterThan(0);
    });

    it('handles simulated evaluation failure and preserves FAILED status', async () => {
      const attempt = await createAttempt({
        problemId: 'parking-lot',
        problemTitle: 'Parking Lot System'
      });

      const submissionData = {
        classes: `ParkingLot\nParkingSpot`,
        responsibilities: `Manages spots`,
        relationships: `Contains spots`,
        code: `class ParkingLot {}`
      };

      const aiEval = evaluatorFactory.getEvaluator('ai');
      aiEval.delayMs = 0;

      await expect(
        submitAndEvaluate({
          attemptId: attempt.id,
          submissionData,
          evaluatorType: 'ai',
          simulateFailure: true
        })
      ).rejects.toThrow();

      // Verify attempt is in FAILED state in storage
      const storedAttempt = await getAttemptById(attempt.id);
      expect(storedAttempt.status).toBe(ATTEMPT_STATUS.FAILED);
      expect(storedAttempt.evaluation.errorMessage).toBeDefined();
    });

    it('allows retrying evaluation from a failed attempt', async () => {
      const attempt = await createAttempt({
        problemId: 'parking-lot',
        problemTitle: 'Parking Lot System'
      });

      const submissionData = {
        classes: `ParkingLot\nParkingFloor\nParkingSpot\nVehicle`,
        responsibilities: `Coordinates spots`,
        relationships: `1 to many`,
        code: `class ParkingLot {}`
      };

      const aiEval = evaluatorFactory.getEvaluator('ai');
      aiEval.delayMs = 0;

      // First run: simulate failure
      try {
        await submitAndEvaluate({
          attemptId: attempt.id,
          submissionData,
          evaluatorType: 'ai',
          simulateFailure: true
        });
      } catch (err) {
        // Expected failure
      }

      const failedAttempt = await getAttemptById(attempt.id);
      expect(failedAttempt.status).toBe(ATTEMPT_STATUS.FAILED);

      // Second run: retry evaluation
      const retriedAttempt = await retryEvaluation({
        attemptId: attempt.id,
        evaluatorType: 'ai',
        simulateFailure: false
      });

      expect(retriedAttempt.status).toBe(ATTEMPT_STATUS.COMPLETED);
      expect(retriedAttempt.evaluation.feedback).toBeDefined();
    });

    it('rejects submission with empty or invalid problem ID', async () => {
      await expect(
        submitAndEvaluate({
          attemptId: 'non-existent-attempt',
          submissionData: { classes: 'A', responsibilities: 'B', code: 'C' }
        })
      ).rejects.toThrow('does not exist');
    });

    it('rejects evaluation when submission fails domain validation', async () => {
      const attempt = await createAttempt({
        problemId: 'parking-lot',
        problemTitle: 'Parking Lot'
      });

      await expect(
        submitAndEvaluate({
          attemptId: attempt.id,
          submissionData: { classes: '', responsibilities: '', code: '' }
        })
      ).rejects.toThrow('Classes section cannot be empty');
    });
  });
});
