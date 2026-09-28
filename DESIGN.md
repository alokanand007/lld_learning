# Design Note: Architecture & Technical Specifications

This document outlines the architectural blueprint, domain models, evaluation strategy, and engineering trade-offs of the **LLD Practice Platform**.

---

## 1. MVP Scope

The MVP is engineered as a focused, high-leverage application delivering a complete end-to-end learning workflow without extraneous bloat:

- **Included**:
  - Four curated, realistic LLD problem specifications (Parking Lot, Vending Machine, Elevator System, Library Management).
  - Clean, responsive UI built with React, React Router, and Tailwind CSS.
  - Dedicated Practice Studio featuring structured inputs for Classes, Responsibilities, Relationships, and Code.
  - Pluggable Evaluator Engine (Strategy Pattern) with `AIEvaluator` and `RuleBasedEvaluator`.
  - Structured, explainable feedback cards featuring "Why It Matters" explanations.
  - Attempt lifecycle tracking (`draft`, `submitted`, `evaluating`, `completed`, `failed`).
  - Persistent attempt history and "Try Again" iterative retry loop.
  - Automated test suite with 100% pass rate across domain and evaluation flows.
- **Excluded (Avoided Overengineering)**:
  - Multi-region distributed clusters, Kafka, Kubernetes, or microservices.
  - Complicated online code compilers with language execution runtimes.
  - Social network feeds, leaderboards, or arbitrary scalar scoring algorithms.

---

## 2. User Journey

```text
┌──────────────┐     ┌────────────────┐     ┌────────────────┐
│  Dashboard   │ ──> │ Choose Problem │ ──> │  Requirements  │
└──────────────┘     └────────────────┘     └───────┬────────┘
                                                    │
                                                    ▼
┌──────────────┐     ┌────────────────┐     ┌────────────────┐
│  Try Again   │ <── │ Review History │ <── │  Practice &    │
│ (Iterate)    │     │ & Feedback     │     │  Submit        │
└──────────────┘     └────────────────┘     └────────────────┘
```

1. **Dashboard (`/`)**: Displays platform overview, quick progress summary, curated problem cards, and recent attempts.
2. **Problems Catalog (`/problems`)**: Filter problems by difficulty (Beginner, Intermediate) and search by keywords or tags.
3. **Problem Details (`/problems/:problemId`)**: Comprehensive system requirements, architectural guidance (key classes, recommended patterns, extensibility points), and personal past attempts.
4. **Practice Studio (`/practice/:problemId`)**: Dual-pane workspace (desktop) or stacked view (mobile). Left pane provides sticky problem requirements; right pane provides structured inputs for Classes, Responsibilities, Relationships, and Code.
5. **Evaluation Flow**: Submitting validates input deterministically, marks the attempt as `evaluating`, and dispatches to the chosen evaluator strategy.
6. **Feedback Screen (`/attempts/:attemptId`)**: Displays transparent, explainable feedback (Summary, Strengths, Needs Improvement with "Why this matters", Concrete Suggestions, Applied Design Concepts) and provides an immediate "Try Again" action to refine the design.

---

## 3. Domain Model

The platform strictly adheres to object-oriented domain modeling principles:

```text
Problem (1) ──has many──> Attempt (*)
                            │ (1)
                            ├──has one──> Submission (1)
                            │               │
                            │               └── [classes, responsibilities, relationships, code]
                            │
                            └──has one──> Evaluation (1)
                                            │
                                            └──has one──> Feedback (1)
                                                            │
                                                            └── [summary, strengths, needsImprovement, suggestions]
```

### Domain Responsibilities:
- **`Problem`**: Holds system context, business requirements, estimated completion time, difficulty rating, design patterns, and starter scaffolds.
- **`Attempt` (`src/domain/Attempt.js`)**: Coordinates the lifecycle of a single learner session. Manages state transitions (`draft` ➔ `submitted` ➔ `evaluating` ➔ `completed` / `failed`), tracks attempt numbering, and maintains ISO timestamps.
- **`Submission` (`src/domain/Submission.js`)**: Encapsulates the learner's design artifacts (Classes, Responsibilities, Relationships, Code) and enforces deterministic validation rules.
- **`Evaluation` (`src/domain/Evaluation.js`)**: Manages the evaluation process state, links the evaluator strategy employed (`AIEvaluator` vs. `RuleBasedEvaluator`), and captures any diagnostic error messages if evaluation fails.
- **`Feedback` (`src/domain/Feedback.js`)**: Structures explainable feedback elements into digestible categories (Summary, Strengths, Needs Improvement with "Why It Matters", Actionable Suggestions, and Core Design Concepts).

---

## 4. Evaluation Architecture: Deterministic vs. AI Evaluation

A core architectural principle is separating deterministic validation from qualitative reasoning:

```text
                                Learner Submission
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │    Deterministic Checks       │
                        │    (Submission.validate)      │
                        └───────────────┬───────────────┘
                                        │ (Valid)
                                        ▼
                        ┌───────────────────────────────┐
                        │      Evaluator Strategy       │
                        │     (EvaluatorFactory)        │
                        └───────┬───────────────┬───────┘
                                │               │
                ┌───────────────┘               └───────────────┐
                ▼                                               ▼
┌──────────────────────────────┐                ┌──────────────────────────────┐
│     RuleBasedEvaluator       │                │         AIEvaluator          │
├──────────────────────────────┤                ├──────────────────────────────┤
│ • Minimum class counts       │                │ • Qualitative coupling       │
│ • Interface presence         │                │ • Single Responsibility (SRP)│
│ • Basic naming conventions   │                │ • Modularity trade-offs      │
│ • Regex pattern boundaries   │                │ • Educational explanations   │
└──────────────────────────────┘                └──────────────────────────────┘
```

1. **Deterministic Layer**:
   - Enforces non-empty submissions, required sections, valid problem IDs, and basic structure before consuming evaluator resources.
   - Prevents empty or malformed submissions from reaching expensive evaluation engines.
2. **AI Reasoning Layer**:
   - Analyzes qualitative architectural nuances that static rules cannot assess:
     - Is `ParkingLot` acting as a God Object by handling payment algorithms directly?
     - Does the vending machine state pattern correctly delegate state transitions back to the context?
     - Are elevator requests decoupled from physical cabin movement?
   - Formulates explainable "Why This Matters" rationales rather than arbitrary numerical scores.

---

## 5. Extensibility

The platform is designed around the **Open-Closed Principle (OCP)**:

### 1. Adding New Problems
New problems can be registered directly in `src/data/problems.js` with functional requirements and starter scaffolds without modifying any component or evaluator logic.

### 2. Adding New Evaluator Strategies
To introduce a new evaluator (e.g., `GeminiEvaluator`, `OpenAIEvaluator`, or `HumanReviewEvaluator`):
1. Subclass `Evaluator` and implement `async evaluate(submission, problem)`.
2. Register the new evaluator in `src/evaluators/index.js` via `evaluatorFactory.registerEvaluator('gemini', new GeminiEvaluator())`.
3. The UI automatically supports the new evaluator without altering existing page components.

### 3. Adding New Submission Formats
If a future version introduces visual diagramming (e.g. Mermaid.js or drag-and-drop canvas):
- Extend `Submission` with a `diagram` attribute.
- The evaluation interface accepts the updated submission instance seamlessly.

---

## 6. Architectural Trade-offs & Monolith Rationale

For a 2-day engineering assignment and focused MVP, an overengineered microservice or multi-tier deployment would introduce unnecessary failure points, serialization overhead, and deployment friction. 

Choosing a **clean, modular, client-first architecture** with an isolated API service layer provides:
- **Zero-Setup Friction**: Reviewers and learners can clone the repository, run `npm install && npm run dev`, and immediately experience the entire product without spinning up external databases, Docker daemons, or redis queues.
- **Pluggable Backend Readiness**: The frontend API clients (`src/api/problems.js`, `src/api/attempts.js`, `src/api/evaluation.js`) are decoupled from UI components. Connecting a Python FastAPI backend requires toggling `USE_REMOTE_BACKEND = true` without modifying a single JSX component.
- **Maintainability & Comprehensibility**: All code is readable, self-contained, typed via JSDoc, and verified by an automated test suite.
