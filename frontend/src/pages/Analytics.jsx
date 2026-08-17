import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart2, RefreshCw } from 'lucide-react';
import { dashboardApi } from '../services/api';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem' }}>
      <div style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.fill || p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
  return null;
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [stats, analytics] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getAnalytics(),
      ]);
      setData({ stats: stats.data, analytics: analytics.data });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 12, marginBottom: 16 }} />)}
    </div>
  );

  const { stats, analytics } = data || {};

  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
              <BarChart2 size={22} style={{ display: 'inline', marginRight: 8, color: '#3b82f6' }} />Analytics
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Diagnosis trends and performance metrics</p>
          </div>
          <button className="btn btn-outline" onClick={load}><RefreshCw size={15} />Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Severity Distribution */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>Severity Distribution</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={(analytics?.severity_distribution || []).filter(d => d.value > 0)}
                cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                dataKey="value" nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(analytics?.severity_distribution || []).map((_, i) => (
                  <Cell key={i} fill={['#3b82f6', '#f59e0b', '#ef4444', '#dc2626'][i] || COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Bar */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>Cases by Category</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.by_category || []} barSize={22}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {(stats?.by_category || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Monthly Trend */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>Monthly Case Volume</div>
          {(analytics?.monthly_trend || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Monthly trend data will appear as cases accumulate
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={analytics.monthly_trend}>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Cases" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Decision Breakdown */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>Human Review Decisions</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.review_decisions?.filter(d => d.value > 0) || []} barSize={50}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {(stats?.review_decisions || []).map((_, i) => (
                  <Cell key={i} fill={['#10b981', '#f59e0b', '#ef4444'][i] || COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card" style={{ padding: 24, overflow: 'hidden' }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Recent Diagnosis History</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
              {['Case', 'Category', 'AI Confidence', 'Decision', 'Reviewer', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(analytics?.history || []).slice(0, 10).map((h, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '10px 14px', fontSize: '0.85rem', maxWidth: 200 }}>{h.case_title || '—'}</td>
                <td style={{ padding: '10px 14px' }}><span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{h.category}</span></td>
                <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                  <span style={{ color: h.confidence_score >= 80 ? '#10b981' : h.confidence_score >= 60 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                    {h.confidence_score ?? 0}%
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span className={`badge ${h.human_decision === 'accepted' ? 'badge-green' : h.human_decision === 'edited' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                    {h.human_decision}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{h.reviewer || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {!(analytics?.history?.length) && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>No history yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
