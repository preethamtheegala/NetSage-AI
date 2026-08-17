import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { casesApi } from '../services/api';
import { CATEGORIES, SEVERITIES, STATUSES, getSeverityColor, getStatusColor, formatDate, truncate } from '../utils/constants';

export default function Cases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', severity: '', status: '', page: 1, limit: 10 });

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await casesApi.getAll(params);
      setCases(res.data);
      setPagination(res.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="animate-fade-in">
      <div className="page-header-gradient">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>Troubleshooting Cases</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{pagination.total} total cases</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={load}><RefreshCw size={15} />Refresh</button>
            <button className="btn btn-primary" onClick={() => navigate('/new-diagnosis')}><Plus size={15} />New Case</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search cases..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>
          <select className="form-input" style={{ flex: 1, minWidth: 130 }} value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-input" style={{ flex: 1, minWidth: 120 }} value={filters.severity} onChange={e => setFilter('severity', e.target.value)}>
            <option value="">All Severities</option>
            {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="form-input" style={{ flex: 1, minWidth: 150 }} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
              {['Title', 'Category', 'Severity', 'OSI Layer', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}>
                      <div className="skeleton" style={{ height: 16, width: '80%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No cases found. <button className="btn btn-primary" style={{ marginLeft: 16, padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => navigate('/new-diagnosis')}>Create one</button>
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{truncate(c.title, 45)}</div>
                    {c.is_sample && <span style={{ fontSize: '0.7rem', color: '#a78bfa' }}>Sample</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}><span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{c.category}</span></td>
                  <td style={{ padding: '14px 16px' }}><span className={`badge ${getSeverityColor(c.severity)}`} style={{ fontSize: '0.72rem' }}>{c.severity}</span></td>
                  <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.ai_diagnosis?.osi_layer || '—'}</td>
                  <td style={{ padding: '14px 16px' }}><span className={`badge ${getStatusColor(c.status)}`} style={{ fontSize: '0.72rem' }}>{c.status?.replace(/_/g, ' ')}</span></td>
                  <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(c.createdAt)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => navigate(`/cases/${c._id}`)}>
                        <Eye size={13} />View
                      </button>
                      {c.status === 'awaiting_review' && (
                        <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => navigate(`/review/${c._id}`)}>
                          <ShieldCheck size={13} />Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '16px', borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn-outline" style={{ padding: '6px 12px' }} disabled={pagination.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
              <ChevronLeft size={14} />Prev
            </button>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <button className="btn btn-outline" style={{ padding: '6px 12px' }} disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
              Next<ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
