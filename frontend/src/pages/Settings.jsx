import { Settings, Database, Brain, Terminal, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          <Settings size={22} style={{ display: 'inline', marginRight: 8 }} />Settings
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Application configuration and environment settings</p>
      </div>

      {[
        {
          icon: Brain, color: '#3b82f6', title: 'AI Provider',
          items: [
            { label: 'Provider', value: 'Mock (Demo Mode)', note: 'Set AI_PROVIDER=gemini in backend/.env to use real AI' },
            { label: 'Model', value: 'gemini-pro (when configured)' },
            { label: 'Status', value: 'Demo mode active — mock diagnoses generated' },
          ]
        },
        {
          icon: Database, color: '#10b981', title: 'Database',
          items: [
            { label: 'Database', value: 'MongoDB' },
            { label: 'URI', value: 'mongodb://localhost:27017/netsage-ai' },
            { label: 'Schema', value: 'TroubleshootingCase, DiagnosisHistory' },
          ]
        },
        {
          icon: Terminal, color: '#8b5cf6', title: 'Python Rule Checker',
          items: [
            { label: 'URL', value: 'http://localhost:5001' },
            { label: 'Mode', value: 'Deterministic — NOT AI' },
            { label: 'Rules', value: 'IP, Interface, VLAN, Trunk, Routing, ACL, DHCP, NAT' },
          ]
        },
        {
          icon: Shield, color: '#f59e0b', title: 'Security',
          items: [
            { label: 'CORS', value: 'Configured for localhost:5173' },
            { label: 'Helmet', value: 'Enabled' },
            { label: 'Input Sanitization', value: 'Active' },
            { label: 'No secrets in code', value: 'Verified — all via .env' },
          ]
        },
      ].map(section => (
        <div key={section.title} className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: `${section.color}15`, borderRadius: 8, padding: 8 }}>
              <section.icon size={18} color={section.color} />
            </div>
            <span style={{ fontWeight: 600 }}>{section.title}</span>
          </div>
          {section.items.map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-primary)' }}>{item.value}</span>
                {item.note && <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: 2 }}>{item.note}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Start Commands</div>
        <div className="code-output" style={{ marginBottom: 10 }}>
          {`# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm run dev

# Terminal 3 — Python Checker
cd python_checker && python3 app.py

# Seed database with sample data
cd backend && npm run seed`}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Make sure MongoDB is running: <code style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4ade80', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4 }}>mongod</code>
        </div>
      </div>
    </div>
  );
}
