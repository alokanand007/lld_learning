# LLD Practice Platform — Agent Instructions

## 1. Project Overview

Build a modern, responsive web application called **LLD Practice Platform**.

The purpose of the application is to help learners practice Low-Level Design (LLD) problems, submit their designs, receive explainable feedback, review previous attempts, and improve through repeated practice.

The core learner journey is:

**Choose Problem → Understand Requirements → Design Solution → Submit → Get Feedback → Review → Try Again**

This is a focused MVP for a 2-day engineering assignment.

Do NOT build a large LMS, social network, enterprise dashboard, or complex distributed system.

---

# 2. Technology Stack

## Frontend

Use:

- React
- JavaScript
- Tailwind CSS
- React Router
- Modern functional components
- React Hooks

Do not introduce unnecessary frontend libraries.

Use reusable components instead of putting everything into one large component.

## Backend

The frontend should be designed so it can communicate with a future/current FastAPI backend.

Expected backend stack:

- FastAPI
- Python
- SQLite
- SQLAlchemy or equivalent ORM

The frontend should keep API calls separated from UI components.

Create an API/service layer such as:

```text
src/
├── api/
│   ├── problems.js
│   ├── attempts.js
│   └── evaluation.js
```

If the backend is not available during initial frontend development, use mock data/services.

Do NOT hard-code backend responses directly inside UI components.

---

# 3. Main Product Requirements

The application must demonstrate the following complete flow:

1. User opens the application.
2. User sees available LLD problems.
3. User selects a problem.
4. User reads the requirements.
5. User starts a practice attempt.
6. User enters their solution.
7. User submits the solution.
8. The submission gets a status.
9. The system evaluates the solution.
10. The user receives explainable feedback.
11. The user can review the attempt.
12. The user can see previous attempts.
13. The user can try the problem again.

---

# 4. Pages

Create these main pages.

## 4.1 Dashboard

Route:

```text
/
```

Purpose:

Give the learner an overview and allow them to start practicing quickly.

Include:

- Header/navigation
- Welcome section
- "Start Practicing" CTA
- Available LLD problems
- Recent attempts
- Small progress/attempt summary

Example:

```text
LLD Practice

Improve your system design thinking
one problem at a time.

[ Start Practicing ]

Practice Problems

┌─────────────────────┐
│ Parking Lot         │
│ Intermediate        │
│ Practice →          │
└─────────────────────┘

┌─────────────────────┐
│ Vending Machine     │
│ Beginner            │
│ Practice →          │
└─────────────────────┘
```

Keep the dashboard focused.

Do not add unnecessary analytics.

---

# 5. Problems Page

Route:

```text
/problems
```

Display available LLD problems.

Initial problems:

1. Parking Lot
2. Vending Machine
3. Elevator System
4. Library Management System

Each problem should contain:

```text
id
title
description
difficulty
estimatedTime
tags
requirements
```

Example:

```javascript
{
  id: "parking-lot",
  title: "Parking Lot",
  difficulty: "Intermediate",
  estimatedTime: "30 min",
  tags: ["OOP", "Strategy Pattern"],
  description: "...",
  requirements: [...]
}
```

Use cards with:

- Problem title
- Short description
- Difficulty
- Estimated time
- Tags
- Practice button

---

# 6. Problem Details Page

Route:

```text
/problems/:problemId
```

This page shows the complete problem before the learner starts.

Sections:

## Problem Statement

Explain the problem clearly.

## Requirements

Use a numbered or bulleted list.

Example:

```text
Requirements

1. The parking lot can have multiple floors.
2. Each floor can contain different parking spots.
3. Vehicles can have different types.
4. The system should assign an appropriate parking spot.
5. A ticket should be generated when a vehicle enters.
6. Payment should be calculated when a vehicle exits.
```

## What You Need To Design

Explain what the learner should think about:

- Classes
- Responsibilities
- Relationships
- Interfaces
- Extensibility
- Design patterns where appropriate

Add:

```text
[ Start Practice ]
```

---

# 7. Practice Page

Route:

```text
/practice/:problemId
```

This is one of the most important screens.

The learner should be able to create their LLD solution.

Layout:

```text
┌──────────────────────────────────────────────┐
│ Problem: Parking Lot                         │
├──────────────────────┬───────────────────────┤
│ Problem Requirements │ Your Solution         │
│                      │                       │
│ Requirements...      │ Classes               │
│                      │ [ text area ]          │
│                      │                       │
│                      │ Responsibilities       │
│                      │ [ text area ]          │
│                      │                       │
│                      │ Relationships          │
│                      │ [ text area ]          │
│                      │                       │
│                      │ Code / Pseudocode      │
│                      │ [ editor/text area ]   │
│                      │                       │
│                      │ [ Submit Solution ]    │
└──────────────────────┴───────────────────────┘
```

The learner should be able to provide:

### Classes

Example:

```text
ParkingLot
ParkingFloor
ParkingSpot
Vehicle
Ticket
Payment
```

### Responsibilities

Example:

```text
ParkingLot:
- manages parking floors
- finds available spots

Vehicle:
- contains vehicle information
```

### Relationships

Example:

```text
ParkingLot contains ParkingFloor
ParkingFloor contains ParkingSpot
Vehicle receives Ticket
```

### Code / Pseudocode

Allow the learner to enter code or pseudocode.

Do not require a complicated online compiler.

A simple code textarea/editor is sufficient for the MVP.

---

# 8. Submission

When the learner clicks:

```text
Submit Solution
```

perform validation.

At minimum:

- Problem must exist
- Classes/design section cannot be empty
- Responsibilities cannot be empty
- Solution/code section cannot be empty

Show useful validation messages.

Example:

```text
Please describe at least one class before submitting.
```

After successful submission:

```text
Submission received.

Status: Evaluating...
```

Then navigate to the feedback/attempt page.

---

# 9. Submission Status

Support these states:

```text
draft
submitted
evaluating
completed
failed
```

The UI should display the current status clearly.

Examples:

```text
Submitted
```

```text
Evaluating...
```

```text
Evaluation Complete
```

```text
Evaluation Failed
```

If evaluation fails, show:

```text
We couldn't evaluate this attempt.

[ Try Evaluation Again ]
```

Do not crash the page.

---

# 10. Feedback Page

Route:

```text
/attempts/:attemptId
```

This is the most important product screen.

Feedback must be explainable.

Do NOT simply display:

```text
Score: 72
```

Instead show structured feedback.

Example:

```text
Your Design Feedback

Overall Summary

Your design has a reasonable separation between
vehicles and parking spots, but the parking lot
class currently handles too many responsibilities.


Strengths

✓ Vehicle and ParkingSpot are separated.
✓ Ticket creation is represented separately.
✓ The design supports multiple parking floors.


Needs Improvement

⚠ ParkingLot is responsible for payment logic.

Why this matters:

If payment logic remains inside ParkingLot,
adding another payment method can require modifying
the ParkingLot class.


Suggestion

Consider introducing a Payment interface.

Payment
├── CashPayment
├── CardPayment
└── UpiPayment
```

Feedback categories:

- Responsibilities
- Abstraction
- Coupling
- Cohesion
- Extensibility
- Relationships
- Design patterns
- Code/design quality

Do not force a single "correct" solution.

LLD problems can have multiple valid designs.

---

# 11. AI Evaluation

The architecture should allow AI-based evaluation.

Do NOT tightly couple the entire application directly to one AI provider.

Use an abstraction.

Conceptually:

```text
Evaluator
    |
    ├── RuleBasedEvaluator
    |
    └── AIEvaluator
```

The application should depend on the evaluator abstraction rather than directly depending on a specific AI provider.

Example conceptual interface:

```text
Evaluator
    evaluate(submission, problem)
```

Possible implementations:

```text
AIEvaluator
RuleBasedEvaluator
```

This allows another evaluation method to be added later.

---

# 12. Deterministic vs AI Evaluation

Use normal application code for deterministic checks.

Examples:

- Required fields
- Empty submission
- Invalid problem
- Submission format
- Required sections

Use AI reasoning for:

- Responsibility quality
- Abstraction quality
- Coupling
- Cohesion
- Extensibility
- Possible design patterns
- Design trade-offs
- Explainable suggestions

The UI should make it clear that AI feedback is an evaluation aid, not an absolute truth.

---

# 13. Attempt History

Route:

```text
/attempts
```

Show previous attempts.

Example:

```text
My Attempts

Parking Lot

Attempt #3
September 28
Completed
[ View Feedback ]

Attempt #2
September 27
Completed
[ View Feedback ]

Attempt #1
September 26
Completed
[ View Feedback ]
```

Each attempt should contain:

```text
attemptId
problemId
problemTitle
createdAt
status
```

The learner should be able to open an attempt and review:

- Their submitted solution
- Feedback
- Suggestions
- Status

---

# 14. Try Again

From feedback page, provide:

```text
[ Try Again ]
```

This should create a new attempt rather than overwrite the previous attempt.

The history should preserve previous attempts.

This supports the learning loop:

```text
Attempt 1
   ↓
Feedback
   ↓
Improve
   ↓
Attempt 2
   ↓
Feedback
```

---

# 15. Domain Model

The application should have clear domain entities.

Important entities:

```text
Problem
Attempt
Submission
Evaluation
Feedback
```

Conceptual relationships:

```text
Problem
   |
   └── has many Attempts
                |
                └── has one Submission
                              |
                              └── has one Evaluation
                                            |
                                            └── has Feedback
```

Do not create unnecessary classes.

Every important class should have a clear responsibility.

---

# 16. Suggested Domain Responsibilities

## Problem

Responsible for:

- Problem information
- Requirements
- Difficulty
- Tags

## Attempt

Responsible for:

- Starting an attempt
- Tracking attempt status
- Linking learner and problem
- Linking submission

## Submission

Responsible for:

- Storing learner's solution
- Classes/design
- Responsibilities
- Relationships
- Code/pseudocode

## Evaluation

Responsible for:

- Evaluation status
- Evaluation result
- Evaluation metadata

## Feedback

Responsible for:

- Strengths
- Issues
- Suggestions
- Explanation

---

# 17. Extensibility

The design should make it easy to add:

### New problems

```text
Parking Lot
Vending Machine
Elevator
Library
Movie Ticket Booking
```

### New evaluators

```text
AI Evaluator
Rule-Based Evaluator
Human Evaluator
```

### New submission formats

```text
Text
Code
Diagram
```

Do not rewrite existing core logic when adding these.

---

# 18. UI Design

The UI should look like a modern developer/education product.

Design principles:

- Clean
- Minimal
- Professional
- Modern
- Easy to scan
- Good spacing
- Strong typography
- Clear hierarchy
- Responsive
- Accessible

Avoid:

- Excessive gradients
- Excessive animations
- Huge decorative elements
- Unnecessary dashboards
- Fake statistics
- Overly colorful UI

The application should feel like a serious developer practice platform.

---

# 19. Color and Visual Style

Use a neutral professional color palette.

Suggested:

- Background: light neutral
- Cards: white
- Primary: dark blue/indigo
- Success: green
- Warning: amber
- Error: red
- Text: dark neutral
- Secondary text: gray

Use Tailwind classes.

Do not hardcode CSS everywhere.

Prefer reusable Tailwind-based components.

---

# 20. Reusable Components

Create reusable components such as:

```text
Navbar
Button
ProblemCard
DifficultyBadge
Tag
ProblemRequirements
AttemptCard
StatusBadge
FeedbackSection
FeedbackCard
EmptyState
LoadingState
ErrorState
```

Avoid repeating the same markup across pages.

---

# 21. Suggested Frontend Structure

Use a structure similar to:

```text
src/
│
├── components/
│   ├── Navbar.jsx
│   ├── Button.jsx
│   ├── ProblemCard.jsx
│   ├── StatusBadge.jsx
│   ├── FeedbackSection.jsx
│   └── AttemptCard.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Problems.jsx
│   ├── ProblemDetails.jsx
│   ├── Practice.jsx
│   ├── AttemptDetails.jsx
│   └── Attempts.jsx
│
├── data/
│   └── problems.js
│
├── api/
│   ├── problems.js
│   ├── attempts.js
│   └── evaluation.js
│
├── hooks/
│
├── utils/
│
├── App.jsx
├── main.jsx
└── index.css
```

Adjust this structure if the existing project already has a good structure.

Do NOT unnecessarily rewrite working project files.

---

# 22. State Management

For the MVP, prefer simple React state:

```text
useState
useEffect
```

Use Context only where genuinely useful.

Do not introduce Redux or another state-management library unless the project actually requires it.

---

# 23. API Design

Design frontend API calls around endpoints such as:

```text
GET    /problems
GET    /problems/{id}

POST   /attempts
GET    /attempts
GET    /attempts/{id}

POST   /attempts/{id}/submit
POST   /attempts/{id}/evaluate
```

The exact backend implementation can evolve later.

The frontend should not assume that evaluation is instantaneous.

---

# 24. Loading States

Every API-driven screen should have a loading state.

Example:

```text
Loading problems...
```

For evaluation:

```text
Analyzing your design...

Checking responsibilities
Checking abstractions
Reviewing extensibility

This may take a few seconds.
```

Do not freeze the UI.

---

# 25. Error Handling

Handle:

- API failure
- Invalid problem
- Failed submission
- Evaluation failure
- Empty data
- Network error

Use user-friendly messages.

Never show raw stack traces to the user.

---

# 26. Responsive Design

The application must work on:

- Desktop
- Tablet
- Mobile

The practice page can change from:

```text
Desktop:
Requirements | Solution
```

to:

```text
Mobile:
Requirements

Solution
```

Use Tailwind responsive utilities.

---

# 27. Accessibility

Use:

- Semantic HTML
- Proper labels
- Keyboard-accessible buttons
- Good contrast
- Focus states
- Meaningful error messages

Do not rely only on color to communicate status.

For example:

```text
✓ Completed
⚠ Evaluating
✕ Failed
```

---

# 28. Mock Data

Until the backend is available, create realistic mock problems.

At minimum include:

### Parking Lot

Difficulty:

```text
Intermediate
```

### Vending Machine

Difficulty:

```text
Beginner
```

### Elevator System

Difficulty:

```text
Intermediate
```

### Library Management System

Difficulty:

```text
Beginner
```

Each should have meaningful requirements.

Do not use lorem ipsum.

---

# 29. Important UX Principle

Do not make the learner guess what to do.

Every page should have a clear next action.

Example:

Problem page:

```text
Read Requirements
       ↓
Start Practice
```

Practice page:

```text
Create Solution
       ↓
Submit
```

Feedback page:

```text
Review Feedback
       ↓
Try Again
```

---

# 30. Avoid Overengineering

This is a 2-day engineering assignment.

Do NOT implement:

- Kubernetes
- Microservices
- Redis
- Kafka
- Event sourcing
- Multi-region deployment
- Complex authentication
- Payment systems
- Real-time collaboration
- Social features
- Complex analytics
- Admin panel unless absolutely necessary

A simple monolithic architecture is acceptable.

Focus on:

**LLD + product experience + explainable evaluation.**

---

# 31. Testing

Add tests for important behavior.

At minimum test:

```text
Problem retrieval
Attempt creation
Submission validation
Attempt history
Evaluation success
Evaluation failure
Invalid problem
Empty submission
```

The frontend should also have basic interaction tests where practical.

---

# 32. README

Create a clear README containing:

## Project Overview

What the platform does.

## Features

List the main features.

## Tech Stack

```text
React
Tailwind CSS
FastAPI
SQLite
AI evaluation
```

## Running Locally

Explain how to install and run the project.

## Architecture

Include a simple architecture diagram.

Example:

```text
React
  ↓
FastAPI
  ↓
Database
  ↓
Evaluation Service
  ↓
AI
```

## Design Decisions

Explain important choices.

## Limitations

Be honest about what is not implemented.

## Future Improvements

Mention realistic future features.

---

# 33. AI_USAGE.md

Create:

```text
AI_USAGE.md
```

Document 3–5 meaningful AI-assisted decisions.

Use this format:

```text
## Decision 1

### AI Suggestion
...

### What I Accepted
...

### What I Rejected
...

### Why
...
```

Important:

Do not claim AI-generated decisions were your own.

The goal is to demonstrate engineering judgment while using AI.

---

# 34. Research Note

Create:

```text
RESEARCH.md
```

Keep it around 1–2 pages.

Include:

## Learner Problem

What makes LLD practice difficult to evaluate?

## Existing Approaches

Research a few existing learning/interview/design platforms.

## Observed Gaps

Explain what could be improved.

## Product Direction

Explain why this MVP focuses on:

```text
Practice
Submission
Explainable Feedback
History
Retry
```

Do not make unsupported claims.

---

# 35. Design Note

Create:

```text
DESIGN.md
```

Include:

## MVP

What is included.

## User Journey

```text
Choose
→ Practice
→ Submit
→ Evaluate
→ Feedback
→ Retry
```

## Domain Model

Explain:

```text
Problem
Attempt
Submission
Evaluation
Feedback
```

## Evaluation Architecture

Explain deterministic checks vs AI evaluation.

## Extensibility

Explain how another evaluator or submission format can be added.

## Trade-offs

Explain why a simple monolith was chosen.

---

# 36. Important Engineering Rule

Do not optimize for the number of features.

Optimize for:

```text
Complete user journey
+
Clear domain model
+
Good explainable feedback
+
Clean code
+
Reasonable extensibility
```

A smaller complete MVP is better than a huge incomplete system.

---

# 37. Development Order

Build the project in this order:

### Phase 1

Set up:

```text
React
Tailwind
React Router
```

### Phase 2

Build:

```text
Navbar
Dashboard
Problems
Problem Details
```

### Phase 3

Build:

```text
Practice page
Submission flow
```

### Phase 4

Build:

```text
Feedback page
Attempt history
Try Again
```

### Phase 5

Connect:

```text
FastAPI
Database
```

### Phase 6

Add:

```text
AI Evaluation
```

### Phase 7

Add:

```text
Loading
Errors
Edge cases
Tests
```

### Phase 8

Complete:

```text
README.md
RESEARCH.md
DESIGN.md
AI_USAGE.md
```

---

# 38. Final Quality Checklist

Before considering the project complete, verify:

- [ ] User can see LLD problems
- [ ] User can open a problem
- [ ] User can read requirements
- [ ] User can start an attempt
- [ ] User can enter a solution
- [ ] User can submit
- [ ] Submission status is visible
- [ ] Evaluation feedback is displayed
- [ ] Feedback explains WHY
- [ ] Previous attempts are visible
- [ ] User can retry
- [ ] Failed evaluation is handled
- [ ] Empty submission is handled
- [ ] UI is responsive
- [ ] Components are reusable
- [ ] Domain responsibilities are clear
- [ ] Evaluator can be extended
- [ ] Tests exist
- [ ] README exists
- [ ] RESEARCH.md exists
- [ ] DESIGN.md exists
- [ ] AI_USAGE.md exists

---

# 39. Agent Behavior

When implementing this project:

1. First inspect the existing project structure.
2. Do not delete working code without a reason.
3. Reuse existing components where appropriate.
4. Keep the implementation simple.
5. Do not add unnecessary dependencies.
6. Follow the requirements in this document.
7. Build the complete user journey before adding extra features.
8. Keep business logic separate from UI.
9. Keep API calls separate from components.
10. Use clear names for components, functions, and variables.
11. Add comments only where they improve understanding.
12. Do not create fake backend functionality and present it as real.
13. If backend integration is unavailable, clearly isolate mock services so they can later be replaced.
14. Do not overengineer the architecture.
15. Prioritize LLD/domain quality over visual complexity.

The final prototype should feel like a **real, focused LLD learning product**, not a generic CRUD dashboard.

# Final User Journey

The final application should demonstrate this flow end-to-end:

```text
                ┌───────────────┐
                │   Dashboard   │
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │ Choose Problem│
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │ Requirements  │
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │    Practice   │
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │    Submit     │
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │   Evaluating  │
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │    Feedback   │
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │ Review History│
                └───────┬───────┘
                        ↓
                ┌───────────────┐
                │    Try Again  │
                └───────────────┘
```

Build the MVP around this loop.