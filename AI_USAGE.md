# AI Usage & Engineering Decisions

This document records key design and architectural decisions made during the development of the **LLD Practice Platform**, reflecting the collaborative use of AI assistance alongside active engineering judgment.

---

## Decision 1: Structured Multi-Section Solution Studio vs. Free-form Markdown Editor

### AI Suggestion
The AI initially proposed providing a single large markdown/monaco code editor where learners could freely draft their classes, diagrams, and explanations in one unified text block, mimicking a raw Google Doc or scratchpad.

### What I Accepted
I accepted the idea of giving learners freedom to write pseudocode or class definitions in whatever syntax they prefer (Java, Python, C++, TypeScript, or pseudo-UML) without imposing a rigid online compiler.

### What I Rejected
I rejected the single unformatted text area / free-form markdown document.

### Why
Low-Level Design is fundamentally about structured thinking. Beginners often jump straight into writing implementation code while neglecting domain decomposition and interface responsibilities. By providing four distinct, dedicated sections (**Core Classes**, **Responsibilities (SRP)**, **Relationships**, and **Code Skeleton**), the UI guides the user's mental model into the exact methodology expected in LLD interviews:
1. Define entities.
2. Assign single responsibilities.
3. Establish relationships and multiplicities.
4. Draft extensible contracts.

Furthermore, structured inputs allow the evaluation engines (both AI and Rule-Based) to parse and evaluate domain boundaries with much higher precision than ambiguous free-form prose.

---

## Decision 2: Evaluator Abstraction (Strategy Pattern) vs. Direct Provider SDK Coupling

### AI Suggestion
The AI suggested installing the `@google/genai` or `openai` client library directly in UI components (such as `Practice.jsx`) and making direct chat completion API calls when the user submits their design.

### What I Accepted
I accepted the need for AI-driven semantic evaluation to analyze qualitative concepts like coupling, cohesion, and Open-Closed Principle adherence that regular linters cannot detect.

### What I Rejected
I rejected binding the UI directly to any specific AI SDK or hardcoding API keys and calls inside React components.

### Why
Tightly coupling frontend components to a specific third-party AI provider violates the Dependency Inversion Principle. If an engineering team switches from OpenAI to Google Gemini, Anthropic, or an internal self-hosted model, every UI component would break.

Instead, I implemented the **Strategy Pattern**:
- An abstract `Evaluator` base class defining `evaluate(submission, problem)`.
- Concrete implementations: `AIEvaluator` and `RuleBasedEvaluator`.
- An `EvaluatorFactory` to register and switch evaluation strategies at runtime.
- An isolated API service layer (`src/api/evaluation.js`) that sits between the UI and the evaluator engines.

This makes the platform completely extensible for future evaluators (such as human peer review or automated unit-test harnesses) without modifying existing UI code.

---

## Decision 3: Educational Explainable Feedback vs. Scalar Scoring / Percentage Grades

### AI Suggestion
The AI suggested computing a numeric rubric (e.g., `82/100`, `Grade: B+`, with category percentages for Responsibilities: 80%, Coupling: 70%, Extensibility: 90%).

### What I Accepted
I accepted the concept of organizing feedback into clear architectural dimensions (Responsibilities, Coupling, Cohesion, Extensibility, Design Patterns).

### What I Rejected
I rejected displaying arbitrary scalar scores or letter grades.

### Why
In Low-Level Design, there is rarely a single "correct" solution. A design that chooses a simple Switch/Enum over a Strategy Pattern might be entirely appropriate for a simple MVP, whereas an enterprise scale system requires pluggable abstractions. Assigning an arbitrary numeric score like "74/100" creates a false sense of precision, discourages exploration, and provides zero educational value on *how* to improve.

Instead, the platform emphasizes **explainable feedback**:
- **Design Strengths**: Explicitly acknowledging what was modeled well.
- **Areas for Improvement with "Why It Matters"**: Educational explanations of why a particular coupling choice hurts maintainability.
- **Actionable Suggestions**: Concrete code or interface refactoring examples.
- **Design Concept Tags**: Teaching learners the formal OOP principles behind each critique.

---

## Decision 4: Iterative Attempt History vs. Overwriting In-Place Solution Records

### AI Suggestion
The AI proposed a standard CRUD pattern where each problem has a single persistent "user solution" record that is overwritten via `PUT /problems/:id/solution` every time the learner hits submit.

### What I Accepted
I accepted auto-saving solution drafts into browser storage to prevent accidental loss of learner input.

### What I Rejected
I rejected overwriting prior submissions with the latest submission.

### Why
Learning LLD is fundamentally an iterative loop:
```text
Attempt 1 ──> Feedback ──> Refine Understanding ──> Attempt 2 ──> Feedback
```
If an attempt overwrites previous submissions, learners lose the ability to compare their earlier designs with their improved architectures, destroying their historical learning trajectory. 

By designing `Attempt` as an immutable snapshot with an incrementing `attemptNumber` and a dedicated `createdAt` timestamp, learners can review previous attempts, observe their design maturity, and use the "Try Again" flow to practice deliberate architectural improvement.

---

## Decision 5: Graceful In-Memory Storage Fallback vs. Strict LocalStorage Dependency

### AI Suggestion
The AI initially wrote a basic `localStorage.getItem` / `localStorage.setItem` utility assuming that `window.localStorage` is always present, functional, and unrestricted in all JavaScript runtimes.

### What I Accepted
I accepted using local client-side storage as a zero-setup persistence mechanism so learners can practice immediately without needing a database server running.

### What I Rejected
I rejected bare, unchecked calls to `window.localStorage`.

### Why
In modern test environments (such as Node.js 22 with experimental localStorage flags, happy-dom, or jsdom) and security-restricted browser contexts (such as Safari Private Browsing mode, sandboxed iframes, or disabled third-party cookies), accessing or writing to `window.localStorage` throws runtime exceptions (`SecurityError` or `ERR_NO_LOCALSTORAGE_FILE`).

To ensure zero crashes and 100% test reliability, I engineered a self-healing fallback mechanism in `src/utils/storage.js`: the storage engine tests whether `setItem` succeeds; if an exception is thrown, it silently and gracefully falls back to an in-memory `Map` data store. This allows both the automated test suites and learners in locked-down environments to use the app seamlessly.
