import { useState } from 'react';
import { Terminal, Play, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ruleCheckerApi } from '../services/api';
import { CATEGORIES, SHOW_COMMANDS, getCheckIcon } from '../utils/constants';

export default function RuleChecker() {
  const [form, setForm] = useState({ category: 'VLAN', symptoms: '', topology_notes: '', show_commands: [{ command: '', output: '' }] });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateCmd = (i, k, v) => {
    const cmds = [...form.show_commands];
    cmds[i] = { ...cmds[i], [k]: v };
    set('show_commands', cmds);
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const valid = form.show_commands.filter(c => c.command.trim());
      const res = await ruleCheckerApi.check({ ...form, show_commands: valid });
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = { PASS: '#10b981', WARNING: '#f59e0b', FAIL: '#ef4444' };

  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          <Terminal size={22} style={{ display: 'inline', marginRight: 8, color: '#06b6d4' }} />Rule Checker
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Deterministic Rule-Based Network Validation — NOT AI
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 6, padding: '4px 14px', fontSize: '0.75rem', color: '#a78bfa' }}>
          🔧 This module uses deterministic rules, not machine learning. Results are reproducible and explainable.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Input */}
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Issue Category</label>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Symptoms</label>
              <textarea className="form-input" rows={3} value={form.symptoms} onChange={e => set('symptoms', e.target.value)}
                placeholder="Describe the symptoms..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Topology Notes</label>
              <textarea className="form-input" rows={2} value={form.topology_notes} onChange={e => set('topology_notes', e.target.value)}
                placeholder="Topology context..." style={{ resize: 'vertical' }} />
            </div>
            {form.show_commands.map((cmd, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <input className="form-input" style={{ marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.825rem' }}
                  value={cmd.command} onChange={e => updateCmd(i, 'command', e.target.value)}
                  placeholder="show ip route" list={`rcmds-${i}`} />
                <datalist id={`rcmds-${i}`}>{SHOW_COMMANDS.map(c => <option key={c} value={c} />)}</datalist>
                <textarea className="form-input code-output" rows={4} value={cmd.output}
                  onChange={e => updateCmd(i, 'output', e.target.value)}
                  placeholder="Paste command output..." style={{ resize: 'vertical', background: 'rgba(0,0,0,0.4)' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" style={{ fontSize: '0.8rem' }}
                onClick={() => set('show_commands', [...form.show_commands, { command: '', output: '' }])}>
                + Add Command
              </button>
              <button className="btn btn-primary" onClick={run} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={15} />}
                Run Rule Check
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 20, marginBottom: 16, display: 'flex', gap: 10, color: '#ef4444' }}>
              <AlertTriangle size={18} /><span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 600 }}>Results</div>
                <span style={{
                  padding: '4px 14px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem',
                  background: result.overall_status === 'pass' ? 'rgba(16,185,129,0.15)' : result.overall_status === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                  color: result.overall_status === 'pass' ? '#10b981' : result.overall_status === 'warning' ? '#f59e0b' : '#ef4444',
                  border: `1px solid ${result.overall_status === 'pass' ? 'rgba(16,185,129,0.3)' : result.overall_status === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                  Overall: {result.overall_status?.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Passed', count: result.passed?.length || 0, color: '#10b981' },
                  { label: 'Warnings', count: result.warnings?.length || 0, color: '#f59e0b' },
                  { label: 'Errors', count: result.errors?.length || 0, color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}25`, borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.5rem', color: s.color }}>{s.count}</div>
                    <div style={{ fontSize: '0.75rem', color: s.color }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div>
                {(result.checks || []).map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>{getCheckIcon(c.status)}</span>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: statusColors[c.status], textTransform: 'uppercase' }}>{c.status}</span>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{c.rule}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.message}</div>
                    </div>
                  </div>
                ))}
              </div>

              {result.source && (
                <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Source: {result.source}
                  {result.note && <span style={{ color: '#f59e0b' }}>· {result.note}</span>}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Terminal size={40} style={{ margin: '0 auto 16px', color: 'var(--color-border-strong)' }} />
              <div>Run a check to see deterministic rule results</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
