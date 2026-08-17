import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, ArrowRight,
  Terminal, Layers, Lightbulb, ListChecks, ShieldCheck,
  Edit3, RefreshCw, ChevronRight, Loader2, CheckCheck,
  Download, FileText, Printer, FileSpreadsheet, Code
} from 'lucide-react';
import { casesApi, diagnosisApi } from '../services/api';
import { getConfidenceColor, formatDate, getCheckIcon, getSeverityColor, getStatusColor } from '../utils/constants';

const RuleCheckRow = ({ check }) => {
  const statusColors = { PASS: '#10b981', WARNING: '#f59e0b', FAIL: '#ef4444', INFO: '#3b82f6' };
  const color = statusColors[check.status] || '#94a3b8';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>{getCheckIcon(check.status)}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>{check.status}</span>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{check.rule}</span>
        </div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 2 }}>{check.message}</div>
      </div>
    </div>
  );
};

const VerificationStep = ({ num, label, done }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: done ? '#10b981' : 'var(--color-bg-elevated)',
      border: done ? 'none' : '2px solid var(--color-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {done ? <CheckCheck size={14} color="white" /> : <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{num}</span>}
    </div>
    <span style={{ color: done ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontSize: '0.875rem' }}>{label}</span>
  </div>
);

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reDiagnosing, setReDiagnosing] = useState(false);
  const [error, setError] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await casesApi.getById(id);
      setCaseData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const reDiagnose = async () => {
    setReDiagnosing(true);
    try {
      await diagnosisApi.run({
        case_id: id,
        category: caseData.category,
        severity: caseData.severity,
        device_type: caseData.device_type,
        source_device: caseData.source_device,
        destination_device: caseData.destination_device,
        symptoms: caseData.symptoms,
        topology_notes: caseData.topology_notes,
        show_commands: caseData.show_commands,
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setReDiagnosing(false);
    }
  };

  const exportMarkdown = () => {
    if (!caseData) return;
    const diag = caseData.ai_diagnosis;
    const rules = caseData.rule_checker_result;
    const review = caseData.human_review;

    const lines = [
      `# NetSage AI Case Report: ${caseData.title}`,
      ``,
      `**Case ID:** \`${caseData._id}\`  `,
      `**Category:** ${caseData.category}  `,
      `**Severity:** ${caseData.severity}  `,
      `**Status:** ${caseData.status}  `,
      `**Device Type:** ${caseData.device_type || 'N/A'}  `,
      `**Source Device:** ${caseData.source_device || 'N/A'}  `,
      `**Destination Device:** ${caseData.destination_device || 'N/A'}  `,
      `**Created At:** ${formatDate(caseData.createdAt)}  `,
      `**Exported At:** ${new Date().toISOString()}  `,
      ``,
      `---`,
      ``,
      `## 1. Problem Description & Symptoms`,
      `${caseData.symptoms}`,
      ``,
      `### Topology Notes`,
      `${caseData.topology_notes || 'None provided.'}`,
      ``,
      `---`,
      ``,
      `## 2. Cisco Show Command Evidence`,
      ...(caseData.show_commands || []).map(sc => `### \`${sc.command}\`\n\`\`\`cisco\n${sc.output}\n\`\`\`\n`),
      `---`,
      ``,
      `## 3. AI Diagnosis`,
      `**Provider:** ${diag?.provider || 'mock'}  `,
      `**Confidence:** ${diag?.confidence?.toUpperCase()} (${diag?.confidence_score || 0}%)  `,
      `**OSI Layer:** ${diag?.osi_layer || 'N/A'}  `,
      ``,
      `### Root Cause`,
      `${diag?.root_cause || 'No diagnosis generated yet.'}`,
      ``,
      `### Evidence Cited`,
      ...(diag?.evidence || []).map(e => `- ${e}`),
      ``,
      `### Recommended Next Command`,
      `\`${diag?.next_command || 'None'}\``,
      ``,
      `### Recommended Fix Steps`,
      ...(diag?.fix_steps || []).map((s, i) => `${i + 1}. ${s}`),
      ``,
      `---`,
      ``,
      `## 4. Deterministic Rule Checker Results`,
      `**Overall Status:** ${rules?.overall_status?.toUpperCase() || 'N/A'}  `,
      ...(rules?.checks || []).map(c => `- [${c.status}] **${c.rule}**: ${c.message}`),
      ``,
      `---`,
      ``,
      `## 5. Human-in-the-Loop Review & Final Authorization`,
      `**Decision:** ${review?.decision?.toUpperCase() || 'PENDING'}  `,
      `**Reviewer:** ${review?.reviewer || 'N/A'}  `,
      `**Review Date:** ${formatDate(review?.reviewed_at)}  `,
      `**Explanation:** ${review?.explanation || 'None provided'}  `,
      ``,
      `---`,
      `*Report generated by NetSage AI — Human-in-the-Loop Network Troubleshooting System*`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NetSage_Case_${caseData.category}_${caseData._id.slice(-6)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportJSON = () => {
    if (!caseData) return;
    const blob = new Blob([JSON.stringify(caseData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NetSage_Case_${caseData.category}_${caseData._id.slice(-6)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportCSV = () => {
    if (!caseData) return;
    const diag = caseData.ai_diagnosis;
    const review = caseData.human_review;
    const headers = ['Case_ID', 'Title', 'Category', 'Severity', 'Status', 'Root_Cause', 'Confidence', 'Review_Decision', 'Reviewer', 'Created_At'];
    const row = [
      caseData._id,
      `"${(caseData.title || '').replace(/"/g, '""')}"`,
      caseData.category,
      caseData.severity,
      caseData.status,
      `"${(diag?.root_cause || '').replace(/"/g, '""')}"`,
      diag?.confidence_score || 0,
      review?.decision || 'pending',
      `"${(review?.reviewer || '').replace(/"/g, '""')}"`,
      caseData.createdAt
    ];
    const csvContent = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NetSage_Case_${caseData.category}_${caseData._id.slice(-6)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const printReport = () => {
    setShowExportMenu(false);
    window.print();
  };

  if (loading) return (
    <div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: 16 }} />
      ))}
    </div>
  );

  if (error || !caseData) return (
    <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
      <AlertTriangle size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
      <div style={{ marginBottom: 16 }}>{error || 'Case not found'}</div>
      <button className="btn btn-primary" onClick={() => navigate('/cases')}>Back to Cases</button>
    </div>
  );

  const diag = caseData.ai_diagnosis;
  const rules = caseData.rule_checker_result;
  const review = caseData.human_review;
  const hasReview = review?.decision && review.decision !== 'pending';
  const hasDiagnosis = !!diag;

  const verificationSteps = [
    { label: 'Problem Identified', done: true },
    { label: 'Evidence Reviewed', done: hasDiagnosis },
    { label: 'Diagnosis Generated', done: hasDiagnosis },
    { label: 'Human Review Completed', done: hasReview },
    { label: 'Fix Applied', done: ['fixed', 'verified'].includes(caseData.status) },
    { label: 'Verification Performed', done: caseData.status === 'verified' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header-gradient" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button onClick={() => navigate('/cases')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                Cases
              </button>
              <ChevronRight size={14} color="var(--color-text-muted)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Case Detail</span>
            </div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 10 }}>{caseData.title}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className={`badge ${getSeverityColor(caseData.severity)}`}>{caseData.severity?.toUpperCase()}</span>
              <span className="badge badge-blue">{caseData.category}</span>
              <span className={`badge ${getStatusColor(caseData.status)}`}>{caseData.status?.replace(/_/g, ' ')}</span>
              {caseData.is_sample && <span className="badge badge-purple">Sample Case</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center', position: 'relative' }}>
            {hasDiagnosis && !hasReview && (
              <button className="btn btn-primary" onClick={() => navigate(`/review/${id}`)}>
                <ShieldCheck size={15} />Human Review
              </button>
            )}
            <button className="btn btn-outline" onClick={reDiagnose} disabled={reDiagnosing}>
              {reDiagnosing ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={15} />}
              Re-diagnose
            </button>

            {/* Export Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{ borderColor: 'var(--color-border)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={15} />
                Export
              </button>
              {showExportMenu && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    minWidth: 190,
                    zIndex: 100,
                    padding: 8,
                    borderRadius: 10,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <button
                    onClick={exportMarkdown}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '8px 12px', textAlign: 'left', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <FileText size={14} color="#3b82f6" /> Markdown (.md)
                  </button>
                  <button
                    onClick={exportJSON}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '8px 12px', textAlign: 'left', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Code size={14} color="#10b981" /> Raw JSON (.json)
                  </button>
                  <button
                    onClick={exportCSV}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '8px 12px', textAlign: 'left', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <FileSpreadsheet size={14} color="#f59e0b" /> Table CSV (.csv)
                  </button>
                  <button
                    onClick={printReport}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '8px 12px', textAlign: 'left', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Printer size={14} color="#8b5cf6" /> Print / Save PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Main column */}
        <div>
          {/* Symptoms */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <div className="section-header"><span className="section-title">🔴 Symptoms</span></div>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{caseData.symptoms}</p>
            {caseData.topology_notes && (
              <>
                <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Topology Notes</div>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.875rem' }}>{caseData.topology_notes}</p>
              </>
            )}
          </div>

          {/* Show Commands */}
          {caseData.show_commands?.length > 0 && (
            <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
              <div className="section-header"><Terminal size={16} color="#06b6d4" /><span className="section-title">Show Command Outputs</span></div>
              {caseData.show_commands.map((sc, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#06b6d4', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#4ade80' }}>$</span> {sc.command}
                  </div>
                  <pre className="code-output" style={{ maxHeight: 200, overflow: 'auto' }}>{sc.output}</pre>
                </div>
              ))}
            </div>
          )}

          {/* AI Diagnosis */}
          {hasDiagnosis ? (
            <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="section-title">🤖 AI Diagnosis</div>
                {diag.note && (
                  <div style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '3px 10px' }}>
                    Demo Mode
                  </div>
                )}
              </div>

              {/* Root Cause */}
              <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#60a5fa', marginBottom: 8 }}>Root Cause</div>
                <p style={{ lineHeight: 1.7, fontSize: '0.9rem' }}>{diag.root_cause}</p>
              </div>

              {/* Meta row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Confidence</div>
                  <div style={{ fontWeight: 700, color: getConfidenceColor(diag.confidence), fontSize: '1.1rem' }}>
                    {diag.confidence?.toUpperCase()}
                  </div>
                  <div className="confidence-bar" style={{ marginTop: 8 }}>
                    <div className="confidence-fill" style={{ width: `${diag.confidence_score || 50}%`, background: getConfidenceColor(diag.confidence) }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{diag.confidence_score}%</div>
                </div>
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>OSI Layer</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{diag.osi_layer}</div>
                </div>
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Next Command</div>
                  <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#4ade80' }}>{diag.next_command}</code>
                </div>
              </div>

              {/* Evidence */}
              {diag.evidence?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 10, color: 'var(--color-text-secondary)' }}>
                    <Lightbulb size={14} style={{ display: 'inline', marginRight: 6 }} />Evidence
                  </div>
                  {diag.evidence.map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <ArrowRight size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{e}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Fix Steps */}
              {diag.fix_steps?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 10, color: 'var(--color-text-secondary)' }}>
                    <ListChecks size={14} style={{ display: 'inline', marginRight: 6 }} />Fix Steps
                  </div>
                  {diag.fix_steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#a8d8a8', lineHeight: 1.6 }}>{step}</code>
                    </div>
                  ))}
                </div>
              )}

              {/* Alternative causes */}
              {diag.alternative_causes?.length > 0 && (
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#f59e0b', marginBottom: 8 }}>Alternative Causes to Consider</div>
                  {diag.alternative_causes.map((alt, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '3px 0' }}>• {alt}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 32, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ marginBottom: 16, color: 'var(--color-text-muted)' }}>No diagnosis yet</div>
              <button className="btn btn-primary" onClick={reDiagnose}><RefreshCw size={15} />Run Diagnosis</button>
            </div>
          )}

          {/* Rule Checker */}
          {rules && (
            <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="section-title">🔧 Rule Checker Results</div>
                <div style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 6, padding: '3px 10px' }}>
                  Deterministic Validation — NOT AI
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {['pass', 'warning', 'fail'].map(s => {
                  const count = s === 'pass' ? rules.passed?.length : s === 'warning' ? rules.warnings?.length : rules.errors?.length;
                  const colors = { pass: '#10b981', warning: '#f59e0b', fail: '#ef4444' };
                  return (
                    <div key={s} style={{ flex: 1, background: `${colors[s]}12`, border: `1px solid ${colors[s]}30`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.3rem', color: colors[s] }}>{count || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: colors[s], textTransform: 'uppercase' }}>{s}</div>
                    </div>
                  );
                })}
              </div>
              <div>
                {(rules.checks || []).map((c, i) => <RuleCheckRow key={i} check={c} />)}
              </div>
              {rules.note && (
                <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={12} />{rules.note}
                </div>
              )}
            </div>
          )}

          {/* Human Review */}
          {hasReview && (
            <div className="glass-card" style={{ padding: 24 }}>
              <div className="section-header"><ShieldCheck size={16} color="#8b5cf6" /><span className="section-title">Human Review</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span className={`badge ${review.decision === 'accepted' ? 'badge-green' : review.decision === 'edited' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '0.9rem', padding: '4px 14px' }}>
                  {review.decision?.toUpperCase()}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>by {review.reviewer}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{formatDate(review.reviewed_at)}</span>
              </div>
              {review.explanation && (
                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: 14, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {review.explanation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Case Info */}
          <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.9rem' }}>Case Details</div>
            {[
              ['Category', caseData.category],
              ['Severity', caseData.severity],
              ['Device Type', caseData.device_type || '—'],
              ['Source', caseData.source_device || '—'],
              ['Destination', caseData.destination_device || '—'],
              ['Created', formatDate(caseData.createdAt)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            {caseData.concept_tag?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {caseData.concept_tag.map(t => <span key={t} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Workflow Verification */}
          <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.9rem' }}>Workflow Progress</div>
            {verificationSteps.map((step, i) => (
              <VerificationStep key={i} num={i + 1} label={step.label} done={step.done} />
            ))}
          </div>

          {/* Actions */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.9rem' }}>Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hasDiagnosis && !hasReview && (
                <button className="btn btn-primary" onClick={() => navigate(`/review/${id}`)} style={{ justifyContent: 'center' }}>
                  <ShieldCheck size={15} />Start Human Review
                </button>
              )}
              <button className="btn btn-outline" onClick={reDiagnose} style={{ justifyContent: 'center' }} disabled={reDiagnosing}>
                {reDiagnosing ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={15} />}
                Re-run Diagnosis
              </button>
              {hasReview && ['approved', 'edited'].includes(caseData.status) && (
                <button className="btn btn-success" onClick={async () => {
                  await casesApi.update(id, { status: 'fixed' });
                  await load();
                }} style={{ justifyContent: 'center' }}>
                  <CheckCircle2 size={15} />Mark as Fixed
                </button>
              )}
              {caseData.status === 'fixed' && (
                <button className="btn btn-outline" onClick={async () => {
                  await casesApi.update(id, { status: 'verified' });
                  await load();
                }} style={{ justifyContent: 'center', borderColor: '#8b5cf6', color: '#a78bfa' }}>
                  <CheckCheck size={15} />Mark Verified
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
