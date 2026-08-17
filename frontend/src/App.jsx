import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import NewDiagnosis from './pages/NewDiagnosis';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import DiagnosisHistory from './pages/DiagnosisHistory';
import ReviewQueue from './pages/ReviewQueue';
import HumanReview from './pages/HumanReview';
import RuleChecker from './pages/RuleChecker';
import ResponsibleAI from './pages/ResponsibleAI';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-diagnosis" element={<NewDiagnosis />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/history" element={<DiagnosisHistory />} />
          <Route path="/review" element={<ReviewQueue />} />
          <Route path="/review/:id" element={<HumanReview />} />
          <Route path="/rule-checker" element={<RuleChecker />} />
          <Route path="/responsible-ai" element={<ResponsibleAI />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
