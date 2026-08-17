import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, TrendingUp, RefreshCw, Eye, Download, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { formatDate, truncate } from '../utils/constants';

export default function ResponsibleAI() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getResponsibleAI().then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data || !data.corrected_cases) return;
    const headers = [
      'Case_ID', 'Title', 'Category', 'Severity', 'Human_Decision',
      'AI_Root_Cause', 'AI_Confidence', 'AI_OSI_Layer',
      'Corrected_Root_Cause', 'Reviewer', 'Explanation', 'Reviewed_At'
    ];
    const rows = data.corrected_cases.map(c => [
      c._id,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      c.severity,
      c.human_review?.decision || 'edited',
      `"${(c.ai_diagnosis?.root_cause || '').replace(/"/g, '""')}"`,
      c.ai_diagnosis?.confidence_score || 0,
      `"${c.ai_diagnosis?.osi_layer || ''}"`,
      `"${(c.human_review?.corrected_response?.root_cause || c.final_diagnosis?.root_cause || '').replace(/"/g, '""')}"`,
      `"${(c.human_review?.reviewer || '').replace(/"/g, '""')}"`,
      `"${(c.human_review?.explanation || '').replace(/"/g, '""')}"`,
      c.human_review?.reviewed_at || c.createdAt
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NetSage_Responsible_AI_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 14 }} />)}</div>;

  const stats = data?.stats || {};
  const cases = data?.corrected_cases || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
            <Brain size={22} style={{ display: 'inline', marginRight: 8, color: '#8b5cf6' }} />Responsible AI
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Cases where AI required human correction — AI transparency, auditability, and oversight
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={exportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: 8, borderColor: 'var(--color-border)' }}
        >
          <FileSpreadsheet size={15} color="#10b981" />
          Export Log (CSV)
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Reviewed', value: stats.total_reviewed ?? 0, color: '#3b82f6' },
          { label: 'AI Accepted', value: stats.accepted ?? 0, color: '#10b981' },
          { label: 'AI Edited', value: stats.edited ?? 0, color: '#f59e0b' },
          { label: 'AI Rejected', value: stats.rejected ?? 0, color: '#ef4444' },
          { label: 'Correction Rate', value: `${stats.correction_rate ?? 0}%`, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Agreement indicator */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>AI-Human Agreement Rate</div>
          <div style={{ fontWeight: 700, fontSize: '1.4rem', color: stats.agreement_rate >= 70 ? '#10b981' : stats.agreement_rate >= 50 ? '#f59e0b' : '#ef4444' }}>
            {stats.agreement_rate ?? 0}%
          </div>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${stats.agreement_rate ?? 0}%`, background: stats.agreement_rate >= 70 ? '#10b981' : stats.agreement_rate >= 50 ? '#f59e0b' : '#ef4444' }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
          Human reviewers agreed with AI on {stats.accepted ?? 0} out of {stats.total_reviewed ?? 0} reviewed cases.
          The remaining {(stats.edited ?? 0) + (stats.rejected ?? 0)} cases required human correction — demonstrating why human oversight is mandatory.
        </div>
      </div>

      {/* Corrected cases */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 20, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} color="#f59e0b" />Cases Requiring AI Correction
        </div>

        {cases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <TrendingUp size={36} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>No AI Corrections Yet</div>
            <div style={{ fontSize: '0.875rem' }}>As cases are reviewed and corrected, they will appear here showing where AI needs improvement.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cases.map(c => {
              const dec = c.human_review?.decision;
              return (
                <div key={c._id} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{c.category}</span>
                        <span className={`badge ${dec === 'edited' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                          {dec === 'edited' ? 'AI EDITED' : 'AI REJECTED'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatDate(c.human_review?.reviewed_at)}</span>
                      </div>
                    </div>
                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '5px 12px', flexShrink: 0 }} onClick={() => navigate(`/cases/${c._id}`)}>
                      <Eye size={13} />View
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ef4444', marginBottom: 6, textTransform: 'uppercase' }}>🤖 AI Diagnosis</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {truncate(c.ai_diagnosis?.root_cause, 150) || '—'}
                      </p>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981', marginBottom: 6, textTransform: 'uppercase' }}>✅ Human Correction</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {c.human_review?.explanation || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
