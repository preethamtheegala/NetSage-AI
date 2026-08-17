# NetSage AI — API Reference

Base URL: `http://localhost:5001/api`

---

## 1. System Health
- **`GET /health`**
  - **Response**: `{ status: "ok", service: "NetSage AI Backend", version: "1.0.0", ai_provider: "mock" }`

---

## 2. Cases Management

### `GET /api/cases`
Query parameters:
- `search`: Search term matching title, symptoms, or case number
- `category`: Filter by category (`VLAN`, `Routing`, `DHCP`, `ACL`, `NAT`, `DNS`, `Gateway`, `Wireless`, `Port Security`, `OSPF`)
- `status`: Filter by status (`awaiting_review`, `approved`, `modified`, `rejected`, `closed`)
- `severity`: Filter by severity (`low`, `medium`, `high`, `critical`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### `GET /api/cases/:id`
Retrieves full case details including AI diagnosis, Python rule check results, and human review history.

### `POST /api/cases`
Creates a new troubleshooting case without immediate diagnosis.

### `PUT /api/cases/:id`
Updates an existing case.

### `DELETE /api/cases/:id`
Deletes a troubleshooting case.

---

## 3. Diagnostic Engine

### `POST /api/diagnosis`
Executes AI analysis and deterministic rule checking on a new or existing scenario.
- **Request Body**:
```json
{
  "category": "VLAN",
  "severity": "high",
  "device_type": "Router + Switch",
  "source_device": "PC1",
  "destination_device": "Server1",
  "symptoms": "PC in VLAN 10 cannot ping server in VLAN 30",
  "topology_notes": "Switch connected to router via trunk link Gi0/0",
  "show_commands": [
    {
      "command": "show interfaces trunk",
      "output": "Port Gi0/0 mode on encapsulation 802.1q trunking 1\nVlans allowed on trunk 1-29,31-4094"
    }
  ]
}
```
- **Response**: Returns the complete created `TroubleshootingCase` with `ai_diagnosis` and `rule_checker_result`.

---

## 4. Deterministic Rule Checker

### `POST /api/rule-checker`
Executes rule verification without generating an AI diagnosis or saving a case.
- **Request Body**: Same schema as `/api/diagnosis`.
- **Response**:
```json
{
  "checks": [
    { "rule": "Trunk VLAN 30", "status": "FAIL", "message": "VLAN 30 excluded from trunk" }
  ],
  "errors": ["VLAN 30 NOT in trunk allowed list"],
  "warnings": [],
  "passed": ["Trunk link operational"],
  "overall_status": "fail",
  "source": "python-rule-checker"
}
```

---

## 5. Human Review Workflow

### `GET /api/reviews/pending`
Lists all cases awaiting human review (`status: "awaiting_review"`).

### `POST /api/reviews`
Submits a human review decision.
- **Request Body**:
```json
{
  "case_id": "66c0d8f...",
  "decision": "accepted", // "accepted" | "edited" | "rejected"
  "reviewer": "Network Engineer",
  "explanation": "AI diagnosis verified against router config.",
  "edited_diagnosis": {
    "root_cause": "Optional edited root cause",
    "fix_steps": ["Updated step 1", "Updated step 2"]
  }
}
```

---

## 6. Analytics & Responsible AI

### `GET /api/dashboard/stats`
Returns summary statistics: total cases, pending reviews, approval rate, AI accuracy rate, category distribution, severity breakdown.

### `GET /api/analytics`
Returns historical resolution time, category performance, and confidence vs accuracy scatter data.

### `GET /api/responsible-ai`
Returns detailed case audit data where AI suggestions were modified or rejected by human reviewers, including discrepancy analysis.
