export const CATEGORIES = ['VLAN', 'Gateway', 'DHCP', 'DNS', 'Routing', 'ACL', 'NAT', 'Wireless', 'Other'];

export const SEVERITIES = [
  { value: 'low', label: 'Low', color: 'badge-blue' },
  { value: 'medium', label: 'Medium', color: 'badge-yellow' },
  { value: 'high', label: 'High', color: 'badge-red' },
  { value: 'critical', label: 'Critical', color: 'badge-red' },
];

export const STATUSES = [
  { value: 'open', label: 'Open', color: 'badge-gray' },
  { value: 'diagnosing', label: 'Diagnosing', color: 'badge-blue' },
  { value: 'awaiting_review', label: 'Awaiting Review', color: 'badge-yellow' },
  { value: 'approved', label: 'Approved', color: 'badge-green' },
  { value: 'edited', label: 'Edited', color: 'badge-blue' },
  { value: 'rejected', label: 'Rejected', color: 'badge-red' },
  { value: 'fixed', label: 'Fixed', color: 'badge-green' },
  { value: 'verified', label: 'Verified', color: 'badge-purple' },
];

export const OSI_LAYERS = [
  'Layer 1 - Physical',
  'Layer 2 - Data Link',
  'Layer 3 - Network',
  'Layer 4 - Transport',
  'Layer 5 - Session',
  'Layer 6 - Presentation',
  'Layer 7 - Application',
];

export const CONCEPT_TAGS = [
  'VLAN', 'Inter-VLAN Routing', 'Router-on-a-Stick',
  'DHCP', 'DNS', 'ACL', 'NAT', 'PAT',
  'Routing', 'Static Route', 'OSPF', 'EIGRP',
  'Wireless', 'Port Security', 'STP', 'VTP',
  'SSH', 'Telnet', 'HSRP', 'VRRP',
];

export const SHOW_COMMANDS = [
  'show ip route',
  'show access-lists',
  'show interfaces trunk',
  'show vlan brief',
  'show ip interface brief',
  'show running-config',
  'show ip dhcp binding',
  'show ip nat translations',
  'show ip ospf neighbor',
  'show port-security',
  'show dot11 associations',
  'show ip nat statistics',
];

export const getSeverityColor = (severity) => {
  const map = { low: 'badge-blue', medium: 'badge-yellow', high: 'badge-red', critical: 'badge-red' };
  return map[severity] || 'badge-gray';
};

export const getStatusColor = (status) => {
  const map = {
    open: 'badge-gray',
    diagnosing: 'badge-blue',
    awaiting_review: 'badge-yellow',
    approved: 'badge-green',
    edited: 'badge-blue',
    rejected: 'badge-red',
    fixed: 'badge-green',
    verified: 'badge-purple',
  };
  return map[status] || 'badge-gray';
};

export const getConfidenceColor = (confidence) => {
  const map = { low: '#f59e0b', medium: '#3b82f6', high: '#10b981' };
  return map[confidence] || '#94a3b8';
};

export const getDecisionColor = (decision) => {
  const map = { accepted: 'badge-green', edited: 'badge-yellow', rejected: 'badge-red', pending: 'badge-gray' };
  return map[decision] || 'badge-gray';
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const truncate = (str, n = 80) => str && str.length > n ? str.slice(0, n) + '…' : str;

export const getCheckIcon = (status) => {
  if (status === 'PASS') return '✅';
  if (status === 'WARNING') return '⚠️';
  if (status === 'FAIL') return '❌';
  return 'ℹ️';
};
