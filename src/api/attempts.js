import { Storage } from '../utils/storage.js';
import { Attempt, ATTEMPT_STATUS } from '../domain/Attempt.js';
import { Submission } from '../domain/Submission.js';
import { Evaluation, EVALUATION_STATUS } from '../domain/Evaluation.js';
import { Feedback } from '../domain/Feedback.js';

const USE_REMOTE_BACKEND = false;
const BACKEND_BASE_URL = 'http://localhost:8000';

/**
 * Initialize sample attempt if storage is empty
 */
function ensureSeedData() {
  const existing = Storage.get(Storage.KEYS.ATTEMPTS, null);
  if (existing === null) {
    const seedAttempt = new Attempt({
      id: 'att_seed_sample_parking',
      problemId: 'parking-lot',
      problemTitle: 'Parking Lot System',
      attemptNumber: 1,
      status: ATTEMPT_STATUS.COMPLETED,
      submission: new Submission({
        classes: `ParkingLot\nParkingFloor\nParkingSpot\nVehicle\nCar\nTruck\nMotorcycle\nTicket\nPaymentService`,
        responsibilities: `ParkingLot: Coordinates floors and entry/exit gates\nParkingFloor: Manages spot states and finds free spots\nParkingSpot: Holds occupancy and size\nVehicle: License plate and size requirements\nTicket: Tracks arrival timestamp and assigned spot\nPaymentService: Calculates bill based on time elapsed`,
        relationships: `ParkingLot has many ParkingFloor\nParkingFloor has many ParkingSpot\nParkingSpot holds 0..1 Vehicle\nTicket links Vehicle to ParkingSpot`,
        code: `class ParkingLot {\n  List<ParkingFloor> floors;\n  public Ticket enter(Vehicle v) {\n    ParkingSpot spot = findSpot(v);\n    return new Ticket(v, spot, Instant.now());\n  }\n}`
      }),
      evaluation: new Evaluation({
        id: 'eval_seed_sample',
        evaluatorType: 'AIEvaluator',
        status: EVALUATION_STATUS.COMPLETED,
        evaluatedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        feedback: new Feedback({
          summary: 'Your initial design establishes clear domain hierarchies between ParkingLot, ParkingFloor, and ParkingSpot. Responsibilities are generally well divided.',
          strengths: [
            'Clean 1-to-many composition between ParkingLot, ParkingFloor, and ParkingSpot.',
            'Distinct PaymentService separates billing from physical parking space management.',
            'Effective Ticket value object capturing entry state.'
          ],
          needsImprovement: [
            {
              point: 'PaymentService is a concrete class rather than an interface with pluggable strategies.',
              whyItMatters: 'Hardcoding payment logic directly into a service prevents swapping surge pricing or multiple payment gateways easily.'
            },
            {
              point: 'Missing thread-safety considerations when multiple entrance gates request spots simultaneously.',
              whyItMatters: 'Two cars entering different gates at the same second may be assigned the exact same parking spot.'
            }
          ],
          suggestions: [
            'Extract PricingStrategy interface with implementations like HourlyRateStrategy and PeakSurgeStrategy.',
            'Add synchronization or atomic reservation locks to ParkingFloor.findSpot().'
          ],
          designConcepts: ['Single Responsibility', 'Composition', 'Strategy Pattern']
        })
      }),
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
    });

    Storage.set(Storage.KEYS.ATTEMPTS, [seedAttempt.toJSON()]);
  }
}

// Trigger initial check
ensureSeedData();

/**
 * Fetch all attempts, ordered newest first
 */
export async function getAttempts() {
  if (USE_REMOTE_BACKEND) {
    const res = await fetch(`${BACKEND_BASE_URL}/attempts`);
    if (!res.ok) throw new Error('Failed to fetch attempts');
    const data = await res.json();
    return data.map(item => new Attempt(item));
  }

  const rawList = Storage.get(Storage.KEYS.ATTEMPTS, []);
  return rawList
    .map(data => new Attempt(data))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Fetch a single attempt by ID
 */
export async function getAttemptById(attemptId) {
  if (USE_REMOTE_BACKEND) {
    const res = await fetch(`${BACKEND_BASE_URL}/attempts/${attemptId}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch attempt ${attemptId}`);
    }
    const data = await res.json();
    return new Attempt(data);
  }

  const rawList = Storage.get(Storage.KEYS.ATTEMPTS, []);
  const found = rawList.find(a => a.id === attemptId);
  return found ? new Attempt(found) : null;
}

/**
 * Fetch all attempts for a given problem
 */
export async function getAttemptsByProblemId(problemId) {
  const attempts = await getAttempts();
  return attempts.filter(a => a.problemId === problemId);
}

/**
 * Create a new attempt for a problem.
 * Preserves previous attempts and increments attemptNumber.
 */
export async function createAttempt({ problemId, problemTitle, initialSolution = null }) {
  if (USE_REMOTE_BACKEND) {
    const res = await fetch(`${BACKEND_BASE_URL}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, problemTitle, initialSolution })
    });
    if (!res.ok) throw new Error('Failed to create attempt');
    const data = await res.json();
    return new Attempt(data);
  }

  const allAttempts = Storage.get(Storage.KEYS.ATTEMPTS, []);
  const problemAttempts = allAttempts.filter(a => a.problemId === problemId);
  const nextAttemptNumber = problemAttempts.length + 1;

  const newAttempt = new Attempt({
    problemId,
    problemTitle,
    attemptNumber: nextAttemptNumber,
    status: ATTEMPT_STATUS.DRAFT,
    submission: initialSolution ? new Submission(initialSolution) : null
  });

  allAttempts.unshift(newAttempt.toJSON());
  Storage.set(Storage.KEYS.ATTEMPTS, allAttempts);

  return newAttempt;
}

/**
 * Save an updated attempt (e.g. after submission or evaluation)
 */
export async function saveAttempt(attempt) {
  const attemptObj = attempt instanceof Attempt ? attempt : new Attempt(attempt);
  
  if (USE_REMOTE_BACKEND) {
    const res = await fetch(`${BACKEND_BASE_URL}/attempts/${attemptObj.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attemptObj.toJSON())
    });
    if (!res.ok) throw new Error('Failed to update attempt');
    return new Attempt(await res.json());
  }

  const allAttempts = Storage.get(Storage.KEYS.ATTEMPTS, []);
  const index = allAttempts.findIndex(a => a.id === attemptObj.id);

  if (index >= 0) {
    allAttempts[index] = attemptObj.toJSON();
  } else {
    allAttempts.unshift(attemptObj.toJSON());
  }

  Storage.set(Storage.KEYS.ATTEMPTS, allAttempts);
  return attemptObj;
}
