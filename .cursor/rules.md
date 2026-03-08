# Cursor Coding Rules for AI Pilot Tutor

These rules guide how code should be generated for this project.

---

## General Rules

Never delete existing code unless explicitly requested.

Prefer extending existing architecture instead of rewriting components.

Keep files organized according to the current project structure.

---

## Backend Rules

Backend framework is FastAPI.

Routes should live in:

app/routes/

Services should live in:

app/services/

Database logic should live in:

app/database.py

Vector search should always query FAA aviation datasets.

All AI responses must be grounded in FAA documentation when possible.

---

## Frontend Rules

Frontend should use a modern UI design suitable for aviation training.

Design principles:

clean
futuristic
minimal
dark theme preferred

Interface should resemble:

flight training software
cockpit instrumentation
aviation dashboards

---

## Visual Features

Aircraft visualization is important.

Allow users to:

select aircraft type
explore cockpit instruments
view checklists
learn aircraft systems

Use 3D rendering if possible (Three.js / React Three Fiber).

---

## Code Style

Prefer readable production-quality code.

Avoid overly simplified demo code.

Organize components cleanly.

Use modular architecture.

---

## Project Goal

The goal is to build a realistic AI aviation training platform, not just a chatbot.

Every feature should move the system closer to a real training environment.
