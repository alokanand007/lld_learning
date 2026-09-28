import { Evaluator } from './Evaluator.js';
import { Feedback } from '../domain/Feedback.js';

/**
 * RuleBasedEvaluator
 * 
 * Executes deterministic heuristic checks on the submission text:
 * - Minimum class counts
 * - Identification of domain boundaries
 * - Presence of abstractions / interfaces
 * - Separation between data models and operational controllers
 */
export class RuleBasedEvaluator extends Evaluator {
  constructor() {
    super('Rule-Based Evaluator');
  }

  async evaluate(submission, problem) {
    // Basic deterministic checks
    const validation = submission.validate ? submission.validate() : { isValid: true, errors: [] };
    if (!validation.isValid) {
      throw new Error(`Deterministic validation failed: ${validation.errors.join('; ')}`);
    }

    const classesText = submission.classes.toLowerCase();
    const responsibilitiesText = submission.responsibilities.toLowerCase();
    const relationshipsText = submission.relationships.toLowerCase();
    const codeText = submission.code.toLowerCase();

    const strengths = [];
    const needsImprovement = [];
    const suggestions = [];
    const designConcepts = ['Object-Oriented Design'];

    // 1. Check classes count
    const classLines = submission.classes.split('\n').filter(line => line.trim().length > 0);
    if (classLines.length >= 4) {
      strengths.push(`Identified ${classLines.length} granular domain entities, showing good decomposition.`);
    } else {
      needsImprovement.push({
        point: 'Low class granularity detected (fewer than 4 classes specified).',
        whyItMatters: 'Compressing multiple distinct real-world responsibilities into too few classes often creates monolithic "God Objects" that are difficult to unit-test and maintain.'
      });
      suggestions.push('Consider breaking down large coordinating entities into dedicated helper/sub-entities.');
    }

    // 2. Check for abstractions / interfaces
    const hasInterface = codeText.includes('interface') || codeText.includes('abstract') || classesText.includes('interface');
    if (hasInterface) {
      strengths.push('Included interfaces or abstract classes to decouple callers from concrete implementations.');
      designConcepts.push('Abstraction', 'Dependency Inversion');
    } else {
      needsImprovement.push({
        point: 'Direct concrete dependency usage with no interfaces or abstract base classes.',
        whyItMatters: 'Tight coupling to concrete classes makes the system rigid and prevents mocking during testing or swapping algorithms.'
      });
      suggestions.push('Introduce interfaces for dynamic behaviors (e.g., pricing, strategy, or state controllers).');
    }

    // 3. Problem-specific rule heuristic checks
    if (problem.id === 'parking-lot') {
      designConcepts.push('Single Responsibility');
      if (classesText.includes('spot') && classesText.includes('vehicle')) {
        strengths.push('Clear separation between the physical ParkingSpot resource and the incoming Vehicle.');
      }
      if (responsibilitiesText.includes('pay') && responsibilitiesText.includes('parkinglot')) {
        needsImprovement.push({
          point: 'ParkingLot coordinator appears to be directly executing payment calculations.',
          whyItMatters: 'Violates the Single Responsibility Principle. Changes to billing rules or adding third-party payment gateways should not touch parking lot floor coordination.'
        });
        suggestions.push('Extract fee calculation into a separate PaymentStrategy or FeeCalculator interface.');
        designConcepts.push('Strategy Pattern');
      } else {
        strengths.push('Payment responsibilities appear decoupled from core parking occupancy logic.');
      }
    } else if (problem.id === 'vending-machine') {
      designConcepts.push('State Pattern');
      if (classesText.includes('state') || codeText.includes('state')) {
        strengths.push('Employed the State Pattern to represent machine transitions cleanly.');
      } else {
        needsImprovement.push({
          point: 'State transitions managed without explicit State Pattern.',
          whyItMatters: 'Using nested conditional statements (if-else or switch) for state logic becomes brittle and error-prone as new states are introduced.'
        });
        suggestions.push('Encapsulate states (Idle, HasMoney, Dispensing, SoldOut) into polymorphic classes implementing a VendingMachineState interface.');
      }
    } else if (problem.id === 'elevator-system') {
      designConcepts.push('Dispatcher Pattern');
      if (classesText.includes('dispatch') || classesText.includes('strategy') || responsibilitiesText.includes('dispatch')) {
        strengths.push('Elevator dispatching algorithms are segregated from physical elevator car operations.');
        designConcepts.push('Strategy Pattern');
      } else {
        needsImprovement.push({
          point: 'Car movement logic coupled directly with global scheduling decisions.',
          whyItMatters: 'Without a decoupled Dispatcher/Strategy, tuning scheduling algorithms (e.g. SCAN vs FCFS) requires editing physical elevator car controls.'
        });
        suggestions.push('Separate the ElevatorController/Dispatcher from the individual ElevatorCar logic.');
      }
    } else if (problem.id === 'library-management') {
      designConcepts.push('Separation of Concerns');
      if (classesText.includes('bookitem') || classesText.includes('copy')) {
        strengths.push('Correctly distinguished between abstract Book metadata and physical BookItem copies.');
      } else {
        needsImprovement.push({
          point: 'Book concept not differentiated into metadata vs physical copy (BookItem).',
          whyItMatters: 'A library holds multiple physical copies of the same ISBN with different barcodes, rack locations, and wear status.'
        });
        suggestions.push('Split Book (title, ISBN, author) from BookItem (barcode, rackLocation, isLent).');
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Ensure public class APIs expose minimal necessary surface area (Principle of Least Privilege).');
    }

    return new Feedback({
      summary: `Rule-based deterministic analysis checked your submission against standard OOP heuristics for ${problem.title}. Found ${strengths.length} strong architectural patterns and ${needsImprovement.length} potential design risks.`,
      strengths,
      needsImprovement,
      suggestions,
      designConcepts: Array.from(new Set(designConcepts))
    });
  }
}
