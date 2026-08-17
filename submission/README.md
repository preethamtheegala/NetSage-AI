# NetSage AI — AI-Powered Network Troubleshooting with Human Review

> **Cisco AICTE Virtual Internship 2024 — Applied AI + Network Troubleshooting**

NetSage AI is a full-stack application that assists network engineers in diagnosing Cisco/Packet Tracer network problems using AI analysis, deterministic rule checking, and mandatory human review before any diagnosis is accepted.

---

## ⚡ QUICK START (ONE-COMMAND LAUNCH)

### Prerequisites:
1. **Node.js** (>= 18.x) & **npm**
2. **Python 3** (>= 3.9) with `pip install -r python_checker/requirements.txt`
3. **MongoDB** (running locally on port 27017)

### Single Command Setup & Launch:
```bash
# 1. Clone or open repository
cd netsage-ai

# 2. Install dependencies
npm install

# 3. Seed 35 sample cases (auto-seeds if database is empty)
npm run seed

# 4. Start the ENTIRE system with ONE command:
npm run dev
```

Then open your browser to **`http://localhost:5173`**

---

### 🌐 System Endpoints
| Component | Localhost URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | `http://localhost:5173` | React 18 + Vite dashboard |
| **Express Backend** | `http://localhost:5001` | REST API & AI diagnosis service |
| **Python Rule Checker** | `http://localhost:5002` | Deterministic validation microservice |
| **MongoDB** | `mongodb://localhost:27017/netsage-ai` | Case storage & audit logs |

---

## ✨ Features

- **AI Diagnosis** — Analyzes symptoms, topology notes, and show command outputs
- **Deterministic Rule Checking** — Python-based rule engine (NOT AI) validates network config
- **Human Review** — Accept / Edit / Reject workflow before any diagnosis is final
- **Responsible AI** — Dashboard showing all AI corrections and why AI was wrong
- **Case Management** — Search, filter, paginate troubleshooting cases
- **Diagnosis History** — All reviewed cases with decision audit trail
- **Dashboard Analytics** — Recharts visualizations of case statistics
- **Mock Mode** — Fully functional without an AI API key (for demo)

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   React + Vite  │───▶│  Express API     │───▶│    MongoDB       │
│   (port 5173)   │    │  (port 5001)     │    │  (port 27017)    │
└─────────────────┘    └──────┬───────────┘    └──────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Python Flask      │
                    │  Rule Checker      │
                    │  (port 5002)       │
                    └────────────────────┘
```

**Workflow:**
```
Symptoms → New Diagnosis → AI Service → Rule Checker → Awaiting Human Review
→ Human Accept/Edit/Reject → Final Diagnosis → Case Closed
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Python Service | Python 3, Flask, flask-cors |
| AI Provider | Mock (default), Gemini (configurable) |

---

## 📁 Project Structure

```
netsage-ai/
├── frontend/               # React + Vite application
│   └── src/
│       ├── pages/          # Route components
│       ├── layouts/        # AppLayout (sidebar)
│       ├── services/       # Axios API service
│       └── utils/          # Constants and helpers
├── backend/                # Express.js API server
│   ├── config/             # MongoDB connection
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── services/           # AI + Python checker services
│   └── utils/              # Seed script
├── python_checker/         # Flask rule checker microservice
│   ├── app.py              # Flask entry point
│   └── rules/              # Modular rule files
├── data/                   # Sample data and seeds
└── docs/                   # Architecture and API docs
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js >= 18
- Python 3.9+
- MongoDB 7.x

### 1. Install MongoDB
```bash
brew tap mongodb/brew
brew trust mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb/brew/mongodb-community@7.0
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Python Checker Setup
```bash
cd python_checker
pip3 install flask flask-cors
```

---

## 🔧 Environment Variables

`backend/.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/netsage-ai
NODE_ENV=development

# AI Provider: mock | gemini
AI_PROVIDER=mock
GEMINI_API_KEY=your-gemini-api-key-here

# Python Rule Checker
PYTHON_CHECKER_URL=http://localhost:5002

FRONTEND_URL=http://localhost:5173
```

---

## ▶️ Running the Application

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
# Runs on http://localhost:5001
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
# Runs on http://localhost:5173
```

**Terminal 3 — Python Rule Checker:**
```bash
cd python_checker && python3 app.py
# Runs on http://localhost:5002
```

**Seed Database:**
```bash
cd backend && npm run seed
```

---

## 🤖 AI API Configuration

### Mock Mode (Default)
Leave `AI_PROVIDER=mock` in `.env`. The application generates realistic diagnostic responses for all 8 network categories without requiring any API key.

### Google Gemini
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-api-key
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases` | List all cases (with filters) |
| POST | `/api/cases` | Create a new case |
| GET | `/api/cases/:id` | Get case by ID |
| PUT | `/api/cases/:id` | Update case |
| DELETE | `/api/cases/:id` | Delete case |
| POST | `/api/diagnosis` | Run AI + Rule diagnosis |
| POST | `/api/rule-checker` | Run rule check only |
| POST | `/api/reviews` | Submit human review |
| GET | `/api/reviews/pending` | Get pending reviews |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/analytics` | Analytics data |
| GET | `/api/responsible-ai` | AI correction cases |

---

## 🎬 Demo Workflow (5-10 minutes)

1. **Dashboard** → See 10 pre-seeded cases with statistics
2. **New Diagnosis** → Enter "PC can't reach VLAN 30" scenario
3. **Run Diagnosis** → AI analyzes the case, rule checker validates
4. **Case Detail** → See root cause, evidence, fix steps, rule check results
5. **Human Review** → Accept / Edit / Reject the AI diagnosis
6. **Dashboard** → Statistics update showing the review decision
7. **Responsible AI** → See cases where AI was corrected

---

## 📋 Navigation

| Page | Description |
|------|-------------|
| Dashboard | Statistics and overview charts |
| New Diagnosis | Input form for new cases |
| Cases | Case list with search and filters |
| History | Completed diagnoses audit trail |
| Human Review | Review queue (pending & completed) |
| Rule Checker | Standalone deterministic validation |
| Responsible AI | AI correction transparency |
| Analytics | Charts and trends |
| Settings | Configuration display |

---

## 🏷️ Sample Cases Included

The seed script creates 10 sample cases:
1. PC in VLAN 10 cannot reach server in VLAN 30
2. DHCP clients not receiving IP addresses
3. ACL blocking SSH access to router
4. Static route missing (branch cannot reach HQ)
5. NAT not translating inside to outside
6. DNS resolution failing
7. Gateway unreachable
8. Wireless client cannot obtain IP
9. Port security violation (err-disabled)
10. OSPF neighbor not forming (area mismatch)

---

## ⚠️ Important Notes

- **AI API Key**: Not required for demo — mock mode generates realistic responses
- **Python Checker**: Falls back to Node.js built-in rules if Python checker unavailable
- **No secrets in code**: All credentials via `.env` files
- **Human Review is mandatory**: AI can never self-approve diagnoses
