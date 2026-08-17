import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ChevronDown, Loader2, Terminal, AlertTriangle } from 'lucide-react';
import { casesApi, diagnosisApi } from '../services/api';
import { CATEGORIES, SEVERITIES, OSI_LAYERS, CONCEPT_TAGS, SHOW_COMMANDS } from '../utils/constants';

const emptyCommand = () => ({ command: '', output: '' });

export default function NewDiagnosis() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: 'VLAN',
    severity: 'medium',
    device_type: '',
    source_device: '',
    destination_device: '',
    symptoms: '',
    topology_notes: '',
    expected_fault: '',
    expected_osi_layer: '',
    concept_tag: [],
    show_commands: [emptyCommand()],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const updateCommand = (i, field, value) => {
    const cmds = [...form.show_commands];
    cmds[i] = { ...cmds[i], [field]: value };
    set('show_commands', cmds);
  };

  const addCommand = () => set('show_commands', [...form.show_commands, emptyCommand()]);
  const removeCommand = (i) => set('show_commands', form.show_commands.filter((_, j) => j !== i));

  const toggleTag = (tag) => {
    set('concept_tag', form.concept_tag.includes(tag)
      ? form.concept_tag.filter(t => t !== tag)
      : [...form.concept_tag, tag]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.symptoms.trim()) {
      setError('Case title and symptoms are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Create case
      const validCommands = form.show_commands.filter(c => c.command.trim());
      const caseData = { ...form, show_commands: validCommands };
      const caseRes = await casesApi.create(caseData);
      const caseId = caseRes.data._id;

      // Run diagnosis
      const diagInput = {
        case_id: caseId,
        category: form.category,
        severity: form.severity,
        device_type: form.device_type,
        source_device: form.source_device,
        destination_device: form.destination_device,
        symptoms: form.symptoms,
        topology_notes: form.topology_notes,
        show_commands: validCommands,
      };
      await diagnosisApi.run(diagInput);

      navigate(`/cases/${caseId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>New Diagnosis</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Enter network problem details to run AI diagnosis + deterministic rule checking
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: '0.875rem' }}>
          <AlertTriangle size={16} />{error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Case Info */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <div className="section-header">
            <span className="section-title">📋 Case Information</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label">Case Title *</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g., PC cannot reach server in VLAN 30" required />
            </div>
            <div>
              <label className="form-label">Issue Category</label>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Severity</label>
              <select className="form-input" value={form.severity} onChange={e => set('severity', e.target.value)}>
                {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label className="form-label">Device Type</label>
              <input className="form-input" value={form.device_type} onChange={e => set('device_type', e.target.value)}
                placeholder="e.g., Router + Switch" />
            </div>
            <div>
              <label className="form-label">Source Device</label>
              <input className="form-input" value={form.source_device} onChange={e => set('source_device', e.target.value)}
                placeholder="e.g., PC1 (VLAN 10)" />
            </div>
            <div>
              <label className="form-label">Destination Device</label>
              <input className="form-input" value={form.destination_device} onChange={e => set('destination_device', e.target.value)}
                placeholder="e.g., Server (VLAN 30)" />
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <div className="section-header">
            <span className="section-title">🔴 Network Symptoms *</span>
          </div>
          <textarea
            className="form-input"
            rows={5}
            value={form.symptoms}
            onChange={e => set('symptoms', e.target.value)}
            placeholder="Describe the network problem symptoms in detail. Example:&#10;PC receives an IP address but cannot reach the server in VLAN 30. The PC can ping its default gateway (192.168.10.1). Pinging 192.168.30.10 results in timeout."
            required
            style={{ resize: 'vertical', lineHeight: 1.7 }}
          />
        </div>

        {/* Topology Notes */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <div className="section-header">
            <span className="section-title">🗺️ Topology Notes</span>
          </div>
          <textarea
            className="form-input"
            rows={4}
            value={form.topology_notes}
            onChange={e => set('topology_notes', e.target.value)}
            placeholder="Describe the network topology. Example:&#10;PC is connected to access switch SW1 (port Fa0/1, access VLAN 10). SW1 connects to router R1 through a trunk link. Server is located in VLAN 30 on SW1 port Fa0/24."
            style={{ resize: 'vertical', lineHeight: 1.7 }}
          />
        </div>

        {/* Show Commands */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title">💻 Show Command Outputs</div>
            <button type="button" className="btn btn-outline" onClick={addCommand} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <PlusCircle size={14} /> Add Command
            </button>
          </div>
          {form.show_commands.map((cmd, i) => (
            <div key={i} style={{ marginBottom: 16, background: 'var(--color-bg-secondary)', borderRadius: 10, padding: 16, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Terminal size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#06b6d4' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 32, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.825rem' }}
                    value={cmd.command}
                    onChange={e => updateCommand(i, 'command', e.target.value)}
                    placeholder="show ip route"
                    list={`cmds-${i}`}
                  />
                  <datalist id={`cmds-${i}`}>
                    {SHOW_COMMANDS.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                {form.show_commands.length > 1 && (
                  <button type="button" onClick={() => removeCommand(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <textarea
                className="form-input code-output"
                rows={6}
                value={cmd.output}
                onChange={e => updateCommand(i, 'output', e.target.value)}
                placeholder="Paste the command output here..."
                style={{ resize: 'vertical', background: 'rgba(0,0,0,0.4)' }}
              />
            </div>
          ))}
        </div>

        {/* Advanced */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <div className="section-header">
            <span className="section-title">⚙️ Additional Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label">Expected Fault (for training cases)</label>
              <input className="form-input" value={form.expected_fault} onChange={e => set('expected_fault', e.target.value)}
                placeholder="What is the known root cause?" />
            </div>
            <div>
              <label className="form-label">OSI Layer</label>
              <select className="form-input" value={form.expected_osi_layer} onChange={e => set('expected_osi_layer', e.target.value)}>
                <option value="">Select layer...</option>
                {OSI_LAYERS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Concept Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {CONCEPT_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', cursor: 'pointer',
                    border: `1px solid ${form.concept_tag.includes(tag) ? '#3b82f6' : 'var(--color-border)'}`,
                    background: form.concept_tag.includes(tag) ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: form.concept_tag.includes(tag) ? '#60a5fa' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 180 }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Running Diagnosis...</> : <><PlusCircle size={16} />Run Diagnosis</>}
          </button>
        </div>
      </form>
    </div>
  );
}
