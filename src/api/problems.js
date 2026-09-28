import { PROBLEMS, getProblemById } from '../data/problems.js';

/**
 * Problems API Client
 * 
 * Interacts with problems data. Can be pointed to a FastAPI backend
 * by changing internal fetch endpoints without changing UI components.
 */

const USE_REMOTE_BACKEND = false; // When true, delegates to FastAPI
const BACKEND_BASE_URL = 'http://localhost:8000';

export async function getProblems(options = {}) {
  const { difficulty, search, delay = 100 } = options;

  if (USE_REMOTE_BACKEND) {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (search) params.append('search', search);
    const res = await fetch(`${BACKEND_BASE_URL}/problems?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch problems: ${res.statusText}`);
    return await res.json();
  }

  // Local Mock / Service Layer
  if (delay > 0) {
    await new Promise(r => setTimeout(r, delay));
  }

  let list = [...PROBLEMS];
  if (difficulty && difficulty !== 'All') {
    list = list.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getProblem(id, options = {}) {
  const { delay = 80 } = options;

  if (USE_REMOTE_BACKEND) {
    const res = await fetch(`${BACKEND_BASE_URL}/problems/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch problem ${id}: ${res.statusText}`);
    }
    return await res.json();
  }

  if (delay > 0) {
    await new Promise(r => setTimeout(r, delay));
  }

  const problem = getProblemById(id);
  return problem || null;
}
