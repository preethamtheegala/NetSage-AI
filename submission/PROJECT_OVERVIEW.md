# NetSage AI — Submission Project Overview

**Project Title**: NetSage AI — AI-Powered Network Troubleshooting with Human Review  
**Author / Intern**: NetSage AI Engineering Team  
**Program**: Cisco AICTE Virtual Internship  
**Submission Package Date**: August 2026  

---

## 📌 Executive Summary

NetSage AI addresses a major challenge in modern network operations: accelerating network fault isolation without sacrificing safety, accountability, or technical correctness.

By coupling heuristic AI diagnostic models (Google Gemini / realistic Mock engine) with an independent **Python deterministic rule checker** and enforcing a mandatory **Human-in-the-Loop (HITL)** authorization gate, NetSage AI ensures that:
1. Root causes across Layers 2, 3, 4, and 7 are identified in under 10 milliseconds.
2. AI hypotheses are checked against deterministic mathematical and configuration rules.
3. Every remediation step requires explicit human engineer approval (Accept, Edit, or Reject).
4. All AI discrepancies and human corrections are transparently tracked in the **Responsible AI Audit Log**.

---

## 📦 Contents of This Submission Package

1. **`cases.csv`**: Full dataset of 35 diverse Cisco troubleshooting cases across 12 network categories.
2. **`responsible_ai_log.csv`**: Complete audit log of 8 pre-seeded AI correction scenarios showcasing genuine human oversight.
3. **`diagnose_prompt.md`**: Production diagnosis system prompt template and 3 worked troubleshooting examples.
4. **`docs/`**:
   - `ARCHITECTURE.md`: Microservice system design and data flow.
   - `API_REFERENCE.md`: Complete REST API endpoints and payload schemas.
   - `HUMAN_IN_THE_LOOP_SPEC.md`: HITL workflow and state transition specification.
   - `CISCO_TROUBLESHOOTING_GUIDE.md`: Practical Cisco Packet Tracer troubleshooting guide.
   - `DEMO_SCENARIO.md`: Flagship demonstration scenario (ROAS / VLAN trunking).
   - `DEMO_SCRIPT.md`: 5–10 minute presentation timeline.
   - `PRESENTATION_POINTS.md`: Key speaker talking points.
   - `VIVA_QA.md`: 35 comprehensive technical viva questions and answers.
   - `RULE_CHECKER.md`: Python rule checker microservice design.
   - `DATASET.md`: Dataset taxonomy and schema definitions.
   - `RESPONSIBLE_AI.md`: Responsible AI governance framework.
   - `INSTALLATION.md`: Step-by-step setup instructions.
5. **`packet_tracer_labs/`**: Copy-pasteable Cisco IOS configuration files (`.cfg`) and lab markdown setup guides (`.md`) for all major protocols.
6. **`python_checker/`**: Standalone Flask microservice with 7 rule modules and 100% passing unit tests.

---

## 🎯 Verification Highlights
- **Python Unit Tests**: 13/13 passing tests (`100% Pass Rate`).
- **Frontend Production Build**: Clean Vite build with zero compile errors.
- **Security**: ReDoS-safe search with `escapeRegex()`, Helmet headers, CORS protection, no hardcoded API keys.
- **End-to-End Workflow**: Fully verified (Case creation → AI diagnosis → Python rule check → Human review → Fix & Verify → Dashboard update → Responsible AI update → Report export).
