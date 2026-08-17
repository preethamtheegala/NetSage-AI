# NetSage AI — Complete Setup & Installation Guide

## 📋 Prerequisites
- **Node.js**: >= 18.x
- **Python**: >= 3.9
- **MongoDB**: 7.x

---

## ⚡ 1. One-Command Setup & Launch (Recommended)

From the project root:
```bash
# 1. Install all dependencies
npm install

# 2. Seed 35 sample cases (optional - auto-seeds if database is empty)
npm run seed

# 3. Launch everything concurrently:
npm run dev
```

The orchestrator will:
1. Validate Node.js, Python 3, and MongoDB connectivity.
2. Auto-seed 35 sample cases if the database is empty (without overwriting existing data).
3. Concurrently start:
   - **Python Rule Checker** (`http://localhost:5002`)
   - **Express Backend API** (`http://localhost:5001`)
   - **React / Vite Frontend** (`http://localhost:5173`)
4. Output a clean readiness banner with active URLs.

---

## 🧪 2. Run All Tests
```bash
npm test
```
Executes:
- Python deterministic rule checker unit tests (`13/13 passing`).
- Frontend production Vite build (`Zero errors`).
- Backend search regex security tests.
- Dataset integrity checks.

---

## 🔧 3. Manual Multi-Terminal Startup (Alternative)

If you prefer running services in separate terminals:

### Terminal 1 — Python Rule Checker:
```bash
cd python_checker
python3 app.py
# Runs on http://localhost:5002
```

### Terminal 2 — Express Backend:
```bash
cd backend
node server.js
# Runs on http://localhost:5001
```

### Terminal 3 — React Frontend:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```
