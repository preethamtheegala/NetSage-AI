import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { reviewsApi } from '../services/api';
import { formatDate, truncate } from '../utils/constants';

export default function ReviewQueue() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const load = async () => {
    setLoading(true);
    try {
      const [pendRes, compRes] = await Promise.all([
        reviewsApi.getPending(),
        reviewsApi.getAll({ limit: 20 }),
      ]);
      setPending(pendRes.data);
      setCompleted(compRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const TabBtn = ({ value, label, count }) => (
    <button onClick={() => setTab(value)} style={{
      padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
      background: tab === value ? 'rgba(59,130,246,0.15)' : 'transparent',
      color: tab === value ? '#60a5fa' : 'var(--color-text-muted)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {label}
      {count !== undefined && (
        <span style={{ background: tab === value ? '#3b82f6' : 'var(--color-bg-elevated)', color: tab === value ? 'white' : 'var(--color-text-muted)', borderRadius: 999, padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{count}</span>
      )}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
              <ShieldCheck size={22} style={{ display: 'inline', marginRight: 8, color: '#8b5cf6' }} />Human Review Queue
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              AI diagnoses require human approval before becoming final
            </p>
          </div>
          <button className="btn btn-outline" onClick={load}><RefreshCw size={15} />Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--color-bg-secondary)', padding: 6, borderRadius: 10, border: '1px solid var(--color-border)', width: 'fit-content' }}>
        <TabBtn value="pending" label="Pending Review" count={pending.length} />
        <TabBtn value="completed" label="Completed Reviews" count={completed.length} />
      </div>

      {loading ? (
        [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12, marginBottom: 12 }} />)
      ) : tab === 'pending' ? (
        pending.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <Clock size={40} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 600, marginBottom: 8 }}>No pending reviews</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>All diagnoses have been reviewed.</div>
            <button className="btn btn-primary" onClick={() => navigate('/new-diagnosis')}>Create New Diagnosis</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map(c => (
              <div key={c._id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <AlertTriangle size={16} color="#f59e0b" />
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.title}</span>
                      <span className="badge badge-yellow">Awaiting Review</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Category: <strong style={{ color: 'var(--color-text-secondary)' }}>{c.category}</strong> ·
                      Severity: <strong style={{ color: 'var(--color-text-secondary)' }}>{c.severity}</strong> ·
                      Created: {formatDate(c.createdAt)}
                    </div>
                    {c.ai_diagnosis?.root_cause && (
                      <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        AI: "{truncate(c.ai_diagnosis.root_cause, 100)}"
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => navigate(`/cases/${c._id}`)}>
                      <Eye size={14} />View
                    </button>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => navigate(`/review/${c._id}`)}>
                      <ShieldCheck size={14} />Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {completed.length === 0 ? (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>No completed reviews yet.</div>
          ) : completed.map(c => {
            const dec = c.human_review?.decision;
            const decColors = { accepted: '#10b981', edited: '#f59e0b', rejected: '#ef4444' };
            return (
              <div key={c._id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.title}</span>
                      <span className={`badge ${dec === 'accepted' ? 'badge-green' : dec === 'edited' ? 'badge-yellow' : 'badge-red'}`}>{dec?.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      By <strong style={{ color: 'var(--color-text-secondary)' }}>{c.human_review?.reviewer}</strong> · {formatDate(c.human_review?.reviewed_at)}
                    </div>
                    {c.human_review?.explanation && (
                      <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        "{truncate(c.human_review.explanation, 120)}"
                      </div>
                    )}
                  </div>
                  <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px', marginLeft: 16 }} onClick={() => navigate(`/cases/${c._id}`)}>
                    <Eye size={14} />View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
