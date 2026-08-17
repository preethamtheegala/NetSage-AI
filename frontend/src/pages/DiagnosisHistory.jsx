import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Eye, ArrowLeft } from 'lucide-react';
import { reviewsApi } from '../services/api';
import { formatDate, getDecisionColor, truncate } from '../utils/constants';

export default function DiagnosisHistory() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi.getAll({ limit: 50 }).then(res => {
      setCases(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          <History size={22} style={{ display: 'inline', marginRight: 8, color: '#3b82f6' }} />Diagnosis History
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>All completed diagnoses with human review decisions</p>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
              {['Case', 'Category', 'Severity', 'AI Diagnosis (Summary)', 'Decision', 'Reviewer', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}>{[...Array(8)].map((_, j) => <td key={j} style={{ padding: 14 }}><div className="skeleton" style={{ height: 14, width: '80%' }} /></td>)}</tr>
            )) : cases.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No reviewed cases yet. Complete diagnoses will appear here.
              </td></tr>
            ) : cases.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 14px', fontSize: '0.875rem', fontWeight: 500, maxWidth: 180 }}>{truncate(c.title, 35)}</td>
                <td style={{ padding: '12px 14px' }}><span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{c.category}</span></td>
                <td style={{ padding: '12px 14px' }}><span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>{c.severity}</span></td>
                <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: 200 }}>
                  {truncate(c.ai_diagnosis?.root_cause, 70) || '—'}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className={`badge ${getDecisionColor(c.human_review?.decision)}`} style={{ fontSize: '0.7rem' }}>
                    {c.human_review?.decision || '—'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.human_review?.reviewer || '—'}</td>
                <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{formatDate(c.human_review?.reviewed_at)}</td>
                <td style={{ padding: '12px 14px' }}>
                  <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '5px 10px' }} onClick={() => navigate(`/cases/${c._id}`)}>
                    <Eye size={13} />View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
