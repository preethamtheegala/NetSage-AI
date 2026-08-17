# NetSage AI — Human-in-the-Loop (HITL) & Responsible AI Specification

## 🎯 The Core Philosophy

In network engineering, an incorrect configuration command can lead to network outages, security holes, or routing loops. Large Language Models (LLMs) and heuristic algorithms are powerful diagnostic assistants, but **they must never have autonomous execution authority in production networks**.

NetSage AI implements strict **Human-in-the-Loop (HITL)** governance:
1. **AI as Assistant, Human as Authority**: AI generates diagnostic hypotheses and suggests fix steps; human network engineers review, validate, and authorize all decisions.
2. **Deterministic Dual-Check**: AI reasoning is paired side-by-side with a deterministic Python rule checker to expose AI blindspots or hallucinations.
3. **Mandatory Audit Logging**: Every acceptance, edit, or rejection is recorded with reviewer identity, timestamp, and rationale.

---

## 🚦 Human Review Decisions

When inspecting a diagnosed case, the engineer has three choices:

### 1. Accept (`accepted`)
- **Condition**: The AI's root cause, evidence interpretation, and remediation steps are technically sound and accurate.
- **Result**: The diagnosis is finalized with status `approved`.

### 2. Edit (`edited`)
- **Condition**: The AI identified the general area of failure but missed nuanced details, suggested incomplete commands, or got the root cause partially wrong.
- **Action**: The reviewer enters corrected root cause text, amends fix steps, or adds missing command verifications.
- **Result**: The case status becomes `modified`. The system stores both the original AI output and the engineer's edited version for Responsible AI training and drift detection.

### 3. Reject (`rejected`)
- **Condition**: The AI produced a hallucinated root cause, attributed failure to the wrong OSI layer, or suggested destructive/incorrect CLI commands.
- **Action**: The reviewer specifies why the AI failed (e.g., misread show command output, ignored ACL deny counter).
- **Result**: The case status becomes `rejected`.

---

## 📊 Responsible AI Metrics

NetSage AI tracks the following metrics on the Responsible AI Dashboard:
- **AI Acceptance Rate**: Percentage of AI diagnoses accepted without modification.
- **AI Correction Rate**: Frequency of human intervention requiring edits.
- **AI Rejection Rate**: Rate of total diagnostic hallucinations.
- **Category Discrepancy Map**: Identifies which network protocols (e.g. NAT vs OSPF) trigger the most frequent AI mistakes.
- **Audit Diff View**: Side-by-side comparison of original AI proposal vs human-corrected solution.
