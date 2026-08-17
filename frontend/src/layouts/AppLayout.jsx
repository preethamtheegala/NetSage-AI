import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, FolderOpen, History, ShieldCheck,
  Terminal, Brain, BarChart2, Settings, Network, ChevronRight,
  Wifi
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/new-diagnosis', icon: PlusCircle, label: 'New Diagnosis' },
  { path: '/cases', icon: FolderOpen, label: 'Troubleshooting Cases' },
  { path: '/history', icon: History, label: 'Diagnosis History' },
  { path: '/review', icon: ShieldCheck, label: 'Human Review' },
  { path: '/rule-checker', icon: Terminal, label: 'Rule Checker' },
  { path: '/responsible-ai', icon: Brain, label: 'Responsible AI' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 256,
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Network size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>NetSage AI</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>Network Troubleshooting</div>
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(59, 130, 246, 0.1)', borderRadius: 6,
            padding: '3px 10px', fontSize: '0.7rem', color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Cisco AICTE 2024
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 12px', flex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
            Navigation
          </div>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{ marginBottom: 2 }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
          <div style={{ marginBottom: 4 }}>Cisco AICTE Virtual Internship</div>
          <div>Applied AI + Network Troubleshooting</div>
          <div style={{ marginTop: 8, color: '#475569' }}>v1.0.0 — Demo Mode</div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 256, flex: 1, padding: '28px 32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
