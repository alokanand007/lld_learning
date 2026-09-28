import { Evaluator } from './Evaluator.js';
import { Feedback } from '../domain/Feedback.js';

/**
 * AIEvaluator
 * 
 * Simulates intelligent architectural evaluation of LLD designs.
 * Analyzes the user's classes, responsibilities, relationships, and code
 * against problem constraints, identifying OOP trade-offs, coupling issues,
 * and design patterns.
 * 
 * NOTE: For this 2-day engineering MVP, this uses an isolated heuristic-backed
 * AI engine that produces structured, explainable feedback. It can be directly
 * swapped with an OpenAI/Gemini/Anthropic API integration by updating the `callLLM()` hook.
 */
export class AIEvaluator extends Evaluator {
  constructor({ simulateFailure = false, delayMs = 1200 } = {}) {
    super('AI Evaluator (Simulated LLM)');
    this.simulateFailure = simulateFailure;
    this.delayMs = delayMs;
    this.isSimulatedAI = true;
  }

  /**
   * Set failure simulation for testing retry flows
   */
  setSimulateFailure(value) {
    this.simulateFailure = Boolean(value);
  }

  async evaluate(submission, problem) {
    // Simulate real-world network & LLM reasoning latency
    if (this.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }

    if (this.simulateFailure) {
      throw new Error('AI evaluation engine timed out while analyzing design dependencies. Please try again.');
    }

    const { classes, responsibilities, relationships, code } = submission;
    const lowerClasses = classes.toLowerCase();
    const lowerResp = responsibilities.toLowerCase();
    const lowerRel = relationships.toLowerCase();
    const lowerCode = code.toLowerCase();

    // Problem-specific evaluation intelligence
    const strengths = [];
    const needsImprovement = [];
    const suggestions = [];
    const designConcepts = ['Low Coupling', 'High Cohesion'];

    let summary = '';

    if (problem.id === 'parking-lot') {
      designConcepts.push('Single Responsibility', 'Strategy Pattern', 'Composition');
      
      // Analyze strengths
      if (lowerClasses.includes('spot') && (lowerClasses.includes('floor') || lowerClasses.includes('lot'))) {
        strengths.push('Clean hierarchical containment: The relationship between ParkingFloor and ParkingSpot is properly structured.');
      }
      if (lowerClasses.includes('ticket') || lowerResp.includes('ticket')) {
        strengths.push('Dedicated Ticket abstraction decouples entrance logging from vehicle state.');
      }
      if (lowerCode.includes('pricingstrategy') || lowerCode.includes('paymentstrategy') || lowerClasses.includes('strategy')) {
        strengths.push('Excellent use of the Strategy Pattern for pricing calculation, enabling flexible tariff rules without modifying core parking classes.');
      } else {
        strengths.push('Separation between vehicle identity (Vehicle) and spatial allocation (ParkingSpot).');
      }

      // Analyze improvement opportunities
      if (lowerResp.includes('payment') && lowerResp.includes('parkinglot')) {
        needsImprovement.push({
          point: 'ParkingLot handles both vehicle coordination and direct payment processing.',
          whyItMatters: 'If payment logic remains inside ParkingLot, adding alternative payment methods (Credit Card, Cash, UPI) or dynamic surcharge algorithms forces alterations to the core parking lot coordinator class.'
        });
        suggestions.push('Introduce a dedicated PaymentService or PricingStrategy interface injected into the exit flow.');
      } else {
        needsImprovement.push({
          point: 'Concurrency control for simultaneous entry/exit gates is not explicitly addressed.',
          whyItMatters: 'In peak hours, two cars entering different gates might be allocated the exact same vacant spot if spot allocation is not thread-safe.'
        });
        suggestions.push('Consider adding synchronization locks or an atomic spot reservation queue within ParkingFloor.');
      }

      if (!lowerClasses.includes('display') && !lowerResp.includes('display') && !lowerClasses.includes('board')) {
        needsImprovement.push({
          point: 'Missing real-time display board component required by requirements.',
          whyItMatters: 'Drivers at the gate cannot see vacancy status without querying the central database directly, causing unnecessary read pressure.'
        });
        suggestions.push('Add an entrance DisplayBoard that observes spot status changes using the Observer Pattern.');
      }

      summary = 'Your design demonstrates a solid grasp of hierarchical decomposition. The core entities (ParkingLot, Floor, Spot, Vehicle) reflect real-world boundaries well. Refining concurrency handling and isolating billing logic will make it production-ready.';

    } else if (problem.id === 'vending-machine') {
      designConcepts.push('State Pattern', 'Encapsulation', 'Open-Closed Principle');

      if (lowerClasses.includes('state') || lowerCode.includes('state')) {
        strengths.push('Leveraged the State Pattern to represent operational modes (Idle, HasMoney, Dispensing, SoldOut) cleanly.');
      } else {
        strengths.push('Identified fundamental business entities including product inventory, balance, and transaction tracking.');
      }

      if (lowerClasses.includes('inventory') || lowerResp.includes('inventory')) {
        strengths.push('Inventory management is cleanly abstracted away from user interaction controls.');
      }

      if (!lowerClasses.includes('state') && !lowerCode.includes('state')) {
        needsImprovement.push({
          point: 'Transitions rely on state flags rather than polymorphic state objects.',
          whyItMatters: 'Hardcoding transitions via if/else branches makes adding new states (e.g. MaintenanceState, CardPaymentState) risky and violates the Open-Closed Principle.'
        });
        suggestions.push('Refactor operational modes into distinct classes implementing a common VendingMachineState interface.');
      } else {
        needsImprovement.push({
          point: 'Change return logic does not address currency denomination exhaustion.',
          whyItMatters: 'If the machine runs out of small coins, it may fail to dispense change even if total physical balance is sufficient, trapping user funds.'
        });
        suggestions.push('Implement a ChangeDispenser strategy that verifies denomination availability before accepting cash.');
      }

      summary = 'The solution clearly delineates inventory operations and user balance. Moving from procedural status flags to polymorphic states significantly enhances extensibility and resilience.';

    } else if (problem.id === 'elevator-system') {
      designConcepts.push('Dispatcher Pattern', 'Strategy Pattern', 'Scheduling Algorithms');

      if (lowerClasses.includes('dispatcher') || lowerClasses.includes('controller') || lowerClasses.includes('strategy')) {
        strengths.push('Elevator dispatching algorithm is isolated from physical car hardware operations.');
      }
      if (lowerClasses.includes('request') || lowerClasses.includes('hallrequest') || lowerClasses.includes('cabinrequest')) {
        strengths.push('Request segregation: Differentiates between internal cabin requests and external hall calls.');
      } else {
        strengths.push('Represents multi-car state and floor tracking accurately.');
      }

      if (!lowerClasses.includes('strategy') && !lowerCode.includes('strategy')) {
        needsImprovement.push({
          point: 'Scheduling logic is tightly embedded inside the main ElevatorController.',
          whyItMatters: 'Benchmarking different scheduling heuristics (e.g. SCAN/LOOK vs FCFS vs Energy-Optimized) requires modifying the controller rather than swapping algorithms.'
        });
        suggestions.push('Extract car selection into an ElevatorDispatchStrategy interface.');
      }

      needsImprovement.push({
        point: 'Emergency override protocol and maximum weight limits are not modeled.',
        whyItMatters: 'Safety protocols like fire alarms must preempt ordinary scheduling queues to route all cars to safety immediately.'
      });
      suggestions.push('Add an EmergencyService interface and weight sensor triggers on ElevatorCar.');

      summary = 'Good foundation for a multi-car system. The division between controller and car mechanics is logical. Abstracting the scheduling strategy and adding safety overrides will elevate the architectural rigor.';

    } else if (problem.id === 'library-management') {
      designConcepts.push('Catalog Pattern', 'Separation of Concerns', 'Domain Modeling');

      if (lowerClasses.includes('bookitem') || lowerClasses.includes('item') || lowerResp.includes('copy')) {
        strengths.push('Distinguished between conceptual Book (metadata, ISBN) and physical BookItem (barcode, loan status).');
      } else {
        strengths.push('Clear data modeling for books, members, and checkout transactions.');
      }

      if (lowerClasses.includes('lending') || lowerClasses.includes('loan') || lowerClasses.includes('ticket')) {
        strengths.push('Book checkout lifecycle is tracked via a first-class loan record with timestamps and due dates.');
      }

      if (!lowerClasses.includes('bookitem')) {
        needsImprovement.push({
          point: 'Book title metadata and physical library copies are merged into one class.',
          whyItMatters: 'A library often owns 5 physical copies of a single popular title. Merging them prevents individual barcode tracking, wear assessment, and multi-copy loans.'
        });
        suggestions.push('Split Book into Book (ISBN, Title, Authors) and BookItem (Barcode, Status, RackLocation).');
      }

      if (lowerResp.includes('fine') && !lowerClasses.includes('finepolicy')) {
        needsImprovement.push({
          point: 'Fine calculation is hardcoded into member or loan management.',
          whyItMatters: 'Different lending tiers (e.g., student vs faculty, or rare manuscripts vs paperbacks) require distinct overdue calculation rules.'
        });
        suggestions.push('Encapsulate fine computation within a configurable FinePolicy strategy.');
      }

      summary = 'A very readable and sensible design for cataloging and user borrowing. Introducing explicit physical item separation and flexible fine policies will make the domain model robust.';
    } else {
      // Generic fallback for any future custom problem
      strengths.push('Core entities and domain boundaries are clearly defined.');
      strengths.push('Clear pseudocode illustrating key interactions.');
      needsImprovement.push({
        point: 'Ensure classes adhere strictly to Single Responsibility Principle.',
        whyItMatters: 'Classes with too many responsibilities become bottlenecks for future changes.'
      });
      suggestions.push('Review class coupling and inject dependencies via interfaces.');
      summary = `Your proposed design provides a functional framework for ${problem.title}. Focus on refining interface contracts and decoupling high-level coordinators from concrete business rules.`;
    }

    return new Feedback({
      summary,
      strengths,
      needsImprovement,
      suggestions,
      designConcepts: Array.from(new Set(designConcepts))
    });
  }
}
