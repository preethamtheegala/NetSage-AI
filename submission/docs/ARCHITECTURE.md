# NetSage AI — Architecture & System Design

## Overview

NetSage AI is a full-stack, microservice-based network troubleshooting system tailored for Cisco/Packet Tracer network architectures. It couples AI-driven heuristic root cause analysis with deterministic rule verification and enforces a strict **Human-in-the-Loop (HITL)** decision gate before any diagnosis or remediation command is approved.

---

## 🏗️ System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│                     Port 5173 | Tailwind CSS                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Express.js)                  │
│                          Port 5001                          │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ AI Diagnosis Service  │       │ Python Checker Bridge │  │
│  │ (Mock / Gemini Flash) │       │ (HTTP Client)         │  │
│  └───────────────────────┘       └───────────┬───────────┘  │
└──────────────┬───────────────────────────────┼──────────────┘
               │ Mongoose                      │ HTTP POST /check
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MongoDB Database        │ │    Python Rule Checker     │
│          Port 27017          │ │         (Flask)            │
│                              │ │        Port 5002           │
│  - Troubleshooting Cases     │ │                            │
│  - Diagnosis Audit History   │ │ - VLAN & Trunk Rules       │
│  - Responsible AI Log        │ │ - Routing & Default Route  │
└──────────────────────────────┘ │ - ACL & Permit/Deny        │
                                 │ - DHCP Relay & Pools       │
                                 │ - IP Duplication & Subnet  │
                                 │ - NAT Overload/Inside-Out  │
                                 └────────────────────────────┘
```

---

## 🔄 Diagnostic Workflow

1. **Case Submission**: An engineer submits symptoms, topology notes, and CLI `show` commands via the New Diagnosis form.
2. **AI Diagnosis Generation**:
   - The backend `aiDiagnosisService` queries the configured AI provider (`mock` or `gemini`).
   - The AI identifies probable root cause, OSI layer, confidence score, supporting evidence, next commands, and fix steps.
3. **Deterministic Rule Verification**:
   - Concurrently, the backend invokes the `python_checker` microservice at `http://localhost:5002/check`.
   - The Python rule engine executes strict regex and logic checks on the provided configs (e.g. VLAN database presence, trunk allowed lists, duplicate IPs, ACL deny hits).
   - If Python checker is temporarily offline, the backend gracefully falls back to built-in JavaScript validation rules.
4. **Case Creation in `awaiting_review` State**:
   - Both AI and deterministic rule outputs are merged and stored in MongoDB under `TroubleshootingCase`.
   - Case status is set to `awaiting_review`. AI diagnosis is **never** auto-applied.
5. **Human Review Gate**:
   - A human engineer inspects the case in the Human Review interface.
   - Engineer chooses **Accept**, **Edit** (modify root cause or fix steps), or **Reject** (flag AI hallucination/error).
   - Reviewer notes and rationale are logged to `DiagnosisHistory`.
6. **Responsible AI Auditing**:
   - Any edit or rejection is indexed under Responsible AI metrics to measure model accuracy, error categories, and human correction trends.

---

## 🗄️ Data Model

### `TroubleshootingCase`
- `case_number`: Unique sequential string (e.g., `CASE-001`)
- `title`, `category`, `severity`, `status` (`awaiting_review`, `approved`, `modified`, `rejected`, `closed`)
- `device_type`, `source_device`, `destination_device`
- `symptoms`, `topology_notes`
- `show_commands`: Array of `{ command: String, output: String }`
- `ai_diagnosis`:
  - `root_cause`: String
  - `confidence`: `'low' | 'medium' | 'high'`
  - `confidence_score`: Number (0-100)
  - `osi_layer`: String
  - `evidence`: `[String]`
  - `next_command`: String
  - `fix_steps`: `[String]`
  - `alternative_causes`: `[String]`
  - `provider`: String
- `rule_checker_result`:
  - `checks`: Array of `{ rule: String, status: 'PASS' | 'FAIL' | 'WARNING', message: String }`
  - `errors`: `[String]`, `warnings`: `[String]`, `passed`: `[String]`
  - `overall_status`: `'pass' | 'warning' | 'fail'`
- `human_review`:
  - `decision`: `'accepted' | 'edited' | 'rejected'`
  - `reviewer`: String
  - `explanation`: String
  - `reviewed_at`: Date
- `created_at`, `updated_at`

### `DiagnosisHistory`
- `case_id`: Reference to `TroubleshootingCase`
- `case_number`: String
- `action`: `'created' | 'ai_diagnosed' | 'rule_checked' | 'human_reviewed' | 'status_changed'`
- `details`: Object containing snapshot of changes, reviewer comments, and AI vs human diffs
- `performed_by`: String
- `timestamp`: Date
