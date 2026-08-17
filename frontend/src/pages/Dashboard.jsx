import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  FolderOpen, CheckCircle2, XCircle, Edit3, AlertTriangle,
  TrendingUp, Zap, PlusCircle, ShieldCheck, RefreshCw
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { formatDate } from '../utils/constants';

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="glass-card stat-card" style={{ flex: 1, minWidth: 160 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ background: `${color}15`, borderRadius: 10, padding: 10 }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem' }}>
        <div style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.fill || p.color }}>{p.name}: <strong>{p.value}</strong></div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div className="skeleton" style={{ height: 32, width: 260, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 20, width: 380 }} />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, flex: '1 1 160px' }} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <AlertTriangle size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>Failed to load dashboard</div>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.875rem' }}>{error}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={load}><RefreshCw size={16} />Retry</button>
          <button className="btn btn-outline" onClick={() => navigate('/new-diagnosis')}><PlusCircle size={16} />New Case</button>
        </div>
      </div>
    );
  }

  const ov = stats?.overview || {};
  const isEmpty = ov.total_cases === 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header-gradient" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>
              <span className="gradient-text">NetSage AI</span> Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              AI-Powered Network Troubleshooting with Human Review — Cisco AICTE Internship
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={load}><RefreshCw size={15} />Refresh</button>
            <button className="btn btn-primary" onClick={() => navigate('/new-diagnosis')}><PlusCircle size={15} />New Diagnosis</button>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌐</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 10 }}>No Cases Yet</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Run the seed script to add 10 sample cases, or create your first diagnosis case.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/new-diagnosis')}><PlusCircle size={16} />Create First Case</button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total Cases" value={ov.total_cases} icon={FolderOpen} color="#3b82f6" />
            <StatCard label="Diagnosed" value={ov.diagnosed_cases} icon={CheckCircle2} color="#10b981" />
            <StatCard label="Accepted" value={ov.accepted} icon={CheckCircle2} color="#10b981" sub="Human approved" />
            <StatCard label="Edited" value={ov.edited} icon={Edit3} color="#f59e0b" sub="Human corrected" />
            <StatCard label="Rejected" value={ov.rejected} icon={XCircle} color="#ef4444" sub="AI was wrong" />
            <StatCard label="AI-Human Agreement" value={`${ov.agreement_rate ?? 0}%`} icon={TrendingUp} color="#8b5cf6" />
            <StatCard label="High Severity" value={ov.high_severity} icon={AlertTriangle} color="#ef4444" />
            <StatCard label="Avg AI Confidence" value={`${ov.avg_confidence ?? 0}%`} icon={Zap} color="#06b6d4" />
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* By Category */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div className="section-header">
                <span className="section-title">Issues by Category</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.by_category || []} barSize={28}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {(stats?.by_category || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Review Decisions */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div className="section-header">
                <span className="section-title">AI vs Human Decisions</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats?.review_decisions?.filter(d => d.value > 0) || []}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    dataKey="value" nameKey="name"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {(stats?.review_decisions || []).map((_, i) => (
                      <Cell key={i} fill={['#10b981', '#f59e0b', '#ef4444'][i] || CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* OSI Layer */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div className="section-header">
                <span className="section-title">Issues by OSI Layer</span>
              </div>
              {(stats?.by_osi_layer || []).length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 40, fontSize: '0.875rem' }}>
                  OSI layer data will appear after diagnosis
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.by_osi_layer} layout="vertical" barSize={18}>
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {(stats.by_osi_layer).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status Distribution */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div className="section-header">
                <span className="section-title">Case Status Distribution</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(stats?.by_status || []).filter(s => s.value > 0)} barSize={28}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {(stats?.by_status || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Cases */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="section-title">Recent Cases</span>
              <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => navigate('/cases')}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(stats?.recent_cases || []).map((c) => (
                <div key={c._id}
                  onClick={() => navigate(`/cases/${c._id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatDate(c.createdAt)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className={`badge badge-${c.severity === 'critical' || c.severity === 'high' ? 'red' : c.severity === 'medium' ? 'yellow' : 'blue'}`}>{c.severity}</span>
                    <span className="badge badge-gray">{c.category}</span>
                    <span className={`badge ${c.status === 'verified' || c.status === 'approved' ? 'badge-green' : c.status === 'awaiting_review' ? 'badge-yellow' : c.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>{c.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
