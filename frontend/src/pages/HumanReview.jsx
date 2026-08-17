import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Edit3, XCircle, AlertTriangle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { casesApi, reviewsApi } from '../services/api';
import { getConfidenceColor, formatDate } from '../utils/constants';

export default function HumanReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [decision, setDecision] = useState('');
  const [reviewer, setReviewer] = useState('Human Reviewer');
  const [explanation, setExplanation] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [corrected, setCorrected] = useState({
    root_cause: '',
    osi_layer: '',
    confidence: 'medium',
    next_command: '',
    fix_steps: '',
    evidence: '',
  });

  useEffect(() => {
    casesApi.getById(id).then(res => {
      setCaseData(res.data);
      const diag = res.data.ai_diagnosis;
      if (diag) {
        setCorrected({
          root_cause: diag.root_cause || '',
          osi_layer: diag.osi_layer || '',
          confidence: diag.confidence || 'medium',
          next_command: diag.next_command || '',
          fix_steps: (diag.fix_steps || []).join('\n'),
          evidence: (diag.evidence || []).join('\n'),
        });
      }
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  const handleSubmit = async () => {
    if (!decision) { setError('Please select a decision.'); return; }
    if ((decision === 'edited' || decision === 'rejected') && !explanation.trim()) {
      setError('Please provide an explanation for editing or rejecting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        case_id: id,
        decision,
        reviewer,
        explanation,
      };
      if (decision === 'edited') {
        payload.corrected_response = {
          root_cause: corrected.root_cause,
          osi_layer: corrected.osi_layer,
          confidence: corrected.confidence,
          next_command: corrected.next_command,
          fix_steps: corrected.fix_steps.split('\n').filter(Boolean),
          evidence: corrected.evidence.split('\n').filter(Boolean),
        };
      }
      await reviewsApi.submit(payload);
      navigate(`/cases/${id}`);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: 16 }} />)}</div>
  );

  if (!caseData) return (
    <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
      <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 16px' }} />
      <div>{error || 'Case not found'}</div>
    </div>
  );

  const diag = caseData.ai_diagnosis;

  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
              <ShieldCheck size={22} style={{ display: 'inline', marginRight: 8, color: '#8b5cf6' }} />
              Human Review
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{caseData.title}</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate(`/cases/${id}`)}>
            <ArrowLeft size={15} />Back to Case
          </button>
        </div>
      </div>

      {/* Workflow banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '12px 24px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Step 1</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#60a5fa' }}>AI Recommendation</div>
        </div>
        <ArrowRight size={18} color="var(--color-text-muted)" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#8b5cf6', textTransform: 'uppercase' }}>Step 2 (You are here)</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#a78bfa' }}>Human Review</div>
        </div>
        <ArrowRight size={18} color="var(--color-text-muted)" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Step 3</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#10b981' }}>Final Diagnosis</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* AI Diagnosis Summary */}
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 AI Recommendation
            </div>
            <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>Root Cause</div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{diag?.root_cause || '—'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Confidence</div>
                <div style={{ fontWeight: 700, color: getConfidenceColor(diag?.confidence), textTransform: 'uppercase' }}>
                  {diag?.confidence} ({diag?.confidence_score}%)
                </div>
              </div>
              <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>OSI Layer</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{diag?.osi_layer || '—'}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Next Command</div>
              <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#4ade80', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 6 }}>
                {diag?.next_command || '—'}
              </code>
            </div>
            {diag?.evidence?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>Evidence</div>
                {diag.evidence.map((e, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--color-border)' }}>→ {e}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review Decision */}
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16, color: '#a78bfa' }}>Your Review Decision</div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} />{error}
              </div>
            )}

            {/* Decision Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { value: 'accepted', label: 'Accept AI Diagnosis', sub: 'AI diagnosis is correct — approve as final', icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
                { value: 'edited', label: 'Edit & Correct', sub: 'AI diagnosis needs correction — modify below', icon: Edit3, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
                { value: 'rejected', label: 'Reject AI Diagnosis', sub: 'AI diagnosis is fundamentally wrong', icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => { setDecision(opt.value); setEditMode(opt.value === 'edited'); }}
                  style={{
                    background: decision === opt.value ? opt.bg : 'var(--color-bg-secondary)',
                    border: `2px solid ${decision === opt.value ? opt.border : 'var(--color-border)'}`,
                    borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                  }}
                >
                  <opt.icon size={20} color={opt.color} />
                  <div>
                    <div style={{ fontWeight: 600, color: decision === opt.value ? opt.color : 'var(--color-text-primary)', fontSize: '0.9rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{opt.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Reviewer Name */}
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Reviewer Name</label>
              <input className="form-input" value={reviewer} onChange={e => setReviewer(e.target.value)} placeholder="Your name" />
            </div>

            {/* Explanation */}
            {(decision === 'edited' || decision === 'rejected') && (
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">{decision === 'edited' ? 'Correction Notes' : 'Rejection Reason'} *</label>
                <textarea className="form-input" rows={3} value={explanation} onChange={e => setExplanation(e.target.value)}
                  placeholder="Explain why you are correcting/rejecting the AI diagnosis..." style={{ resize: 'vertical' }} />
              </div>
            )}

            {decision === 'accepted' && (
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-input" rows={2} value={explanation} onChange={e => setExplanation(e.target.value)}
                  placeholder="Any additional notes about this decision..." style={{ resize: 'vertical' }} />
              </div>
            )}

            <button
              className={`btn ${decision === 'accepted' ? 'btn-success' : decision === 'edited' ? 'btn-warning' : decision === 'rejected' ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleSubmit}
              disabled={!decision || submitting}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={16} />}
              {submitting ? 'Submitting...' : `Submit ${decision ? decision.charAt(0).toUpperCase() + decision.slice(1) : 'Review'}`}
            </button>
          </div>
        </div>
      </div>

      {/* Edit fields */}
      {editMode && (
        <div className="glass-card animate-fade-in" style={{ padding: 24, marginTop: 4 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16, color: '#f59e0b' }}>
            <Edit3 size={16} style={{ display: 'inline', marginRight: 8 }} />
            Edit AI Diagnosis
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Corrected Root Cause</label>
              <textarea className="form-input" rows={3} value={corrected.root_cause}
                onChange={e => setCorrected(c => ({ ...c, root_cause: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="form-label">Corrected OSI Layer</label>
              <input className="form-input" value={corrected.osi_layer}
                onChange={e => setCorrected(c => ({ ...c, osi_layer: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Confidence</label>
              <select className="form-input" value={corrected.confidence}
                onChange={e => setCorrected(c => ({ ...c, confidence: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="form-label">Corrected Next Command</label>
              <input className="form-input" value={corrected.next_command}
                onChange={e => setCorrected(c => ({ ...c, next_command: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
            </div>
            <div>
              <label className="form-label">Corrected Evidence (one per line)</label>
              <textarea className="form-input" rows={4} value={corrected.evidence}
                onChange={e => setCorrected(c => ({ ...c, evidence: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Corrected Fix Steps (one per line)</label>
              <textarea className="form-input" rows={5} value={corrected.fix_steps}
                onChange={e => setCorrected(c => ({ ...c, fix_steps: e.target.value }))} style={{ resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
