# LLD Practice Platform — Master Object-Oriented & Low-Level Design

A modern, responsive, developer-focused web platform designed to help software engineers practice Low-Level Design (LLD) problems, submit object-oriented architectures, receive explainable AI feedback, and improve through continuous practice.

---

## 1. Project Overview

Low-Level Design (LLD) interviews and engineering tasks require decomposing messy real-world domains into clear classes, single-responsibility contracts, decoupled abstractions, and extensible patterns. Most existing platforms either only grade algorithmic code execution (pass/fail unit tests) or offer static reading material without an active practice-and-critique loop.

The **LLD Practice Platform** bridges this gap with an end-to-end feedback loop:

```text
Choose Problem ──> Understand Requirements ──> Design Solution ──> Submit ──> Explainable Feedback ──> Review History ──> Try Again
```

---

## 2. Core Features

- **Curated Real-World LLD Problems**:
  - **Parking Lot System** (Intermediate — Resource allocation, dynamic pricing strategies, floor spot management)
  - **Vending Machine System** (Beginner — Finite State Machine, balance management, denomination change)
  - **Elevator Control System** (Intermediate — Dispatching heuristics, state transitions, concurrent requests)
  - **Library Management System** (Beginner — Book vs physical copy separation, catalog search, fine calculation)
- **Structured Solution Studio**:
  - Dedicated inputs for **Core Classes**, **Responsibilities (SRP)**, **Relationships (UML-like multiplicity)**, and **Code/Pseudocode Interface Skeletons**.
  - One-click starter architectural scaffolds to kickstart design exploration.
- **Explainable Architectural Feedback**:
  - Rather than arbitrary scores (e.g. `Score: 72`), the platform provides structured educational insights:
    - **Overall Summary**: High-level design health.
    - **Strengths**: Concrete good practices observed (e.g., composition, clear boundaries).
    - **Needs Improvement with "Why It Matters"**: Educational explanations of coupling, god objects, or SRP violations.
    - **Actionable Suggestions**: Interface extractions, design pattern opportunities, and refactoring tips.
    - **Design Concept Badges**: Highlights applied OOP principles (Single Responsibility, Strategy Pattern, State Pattern).
- **Pluggable Evaluator Architecture**:
  - **AIEvaluator**: Simulates deep architectural reasoning over dependencies, modularity, and trade-offs.
  - **RuleBasedEvaluator**: Deterministic heuristic checks for minimum class granularity, presence of abstractions, and problem-specific boundaries.
  - Extensible strategy pattern ready for OpenAI, Google Gemini, Anthropic, or human reviewer backends.
- **Full Attempt Lifecycle & History**:
  - Tracks states: `draft` ➔ `submitted` ➔ `evaluating` ➔ `completed` / `failed`.
  - Preserves prior attempts to demonstrate design evolution over time.
  - One-click **"Try Again"** initiates a new iteration preserving previous history.
- **Fault-Tolerant Resilience**:
  - Built-in failure recovery allowing learners to retry evaluations on error without losing submission drafts.

---

## 3. Technology Stack

- **Frontend**:
  - React 18
  - React Router v6
  - Tailwind CSS v3
  - Lucide React (Clean developer iconography)
  - JetBrains Mono & Inter typography
- **State & Storage**:
  - Defensive storage service with automatic fallback between `localStorage` and in-memory storage for maximum compatibility across browsers, private browsing, and test environments.
- **Architecture & Evaluators**:
  - Object-Oriented Domain Entities (`Attempt`, `Submission`, `Evaluation`, `Feedback`).
  - Evaluator Strategy Pattern (`Evaluator` base class, `AIEvaluator`, `RuleBasedEvaluator`, `EvaluatorFactory`).
- **Testing & Tooling**:
  - Vite v5
  - Vitest v2 + Happy-DOM

---

## 4. Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Startup

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# Navigate to http://localhost:3000
```

### Running Tests

```bash
# Run Vitest test suite
npm test
```

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 5. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React UI Layer                           │
│  (Dashboard, Problems, Details, Practice Studio, Attempts)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API & Service Facade                      │
│   src/api/problems.js   src/api/attempts.js   evaluation.js │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Entities                        │
│       Problem ──> Attempt ──> Submission ──> Evaluation     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌──────────────────────────────┐ ┌───────────────────────────┐
│     Evaluator Strategy       │ │     Storage / Database    │
│  ├── AIEvaluator             │ │  ├── LocalStorage / Cache │
│  └── RuleBasedEvaluator      │ │  └── (Optional FastAPI)   │
└──────────────────────────────┘ └───────────────────────────┘
```

---

## 6. Key Design Decisions

1. **Structured Input over Monolithic Free-form Text**:
   - Instead of a single markdown box, the Practice Studio separates Classes, Responsibilities, Relationships, and Code. This guides learners to think structurally before writing implementation details.
2. **Pluggable Evaluator Abstraction (Strategy Pattern)**:
   - UI components interact strictly with `submitAndEvaluate()`, which delegates to `evaluatorFactory.getEvaluator(type)`. Swapping between Rule-Based analysis, simulated LLM, and cloud API endpoints requires zero component refactoring.
3. **Preserving Attempt History**:
   - "Try Again" increments attempt numbering rather than mutating old attempts in place. This preserves the educational narrative of how a candidate's design matured.
4. **Deterministic Validation First**:
   - Basic constraints (empty fields, minimum sections) are caught deterministically prior to invoking evaluation engines, saving latency and token costs.

---

## 7. Limitations & Future Roadmap

- **Current Limitations**:
  - The client operates as a client-first application with isolated service layers. A Python FastAPI backend can be connected by switching `USE_REMOTE_BACKEND = true` in `src/api/`.
  - Diagramming is currently represented via text relationships rather than a live drag-and-drop UML canvas.
- **Future Improvements**:
  - Interactive Mermaid.js class diagram live renderer in the Practice Studio.
  - Multi-user authentication and peer review workflows.
  - Cloud LLM integration with real-time token streaming during evaluation.
