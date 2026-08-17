/**
 * Python Rule Checker Bridge
 * Calls the Python Flask microservice for deterministic network validation.
 * Falls back to Node.js built-in rules if Python checker is unavailable.
 */

const axios = require('axios');

const CHECKER_URL = process.env.PYTHON_CHECKER_URL || 'http://localhost:5002';

async function runRuleChecker(input) {
  try {
    const response = await axios.post(`${CHECKER_URL}/check`, input, { timeout: 10000 });
    return response.data;
  } catch (err) {
    console.warn(`⚠️ Python checker unavailable (${err.message}). Using built-in fallback.`);
    return runBuiltinRules(input);
  }
}

function runBuiltinRules(input) {
  const checks = [];
  const errors = [];
  const warnings = [];
  const passed = [];

  const { symptoms = '', topology_notes = '', show_commands = [], category } = input;
  const fullText = `${symptoms} ${topology_notes} ${show_commands.map((sc) => sc.output).join(' ')}`.toLowerCase();

  // Rule 1: Interface status check
  if (fullText.includes('down') && fullText.includes('interface')) {
    errors.push('Interface appears to be down based on provided output');
    checks.push({ rule: 'Interface Status', status: 'FAIL', message: 'Interface down detected in provided output' });
  } else if (fullText.includes('interface')) {
    passed.push('Interface status: No obvious down state detected');
    checks.push({ rule: 'Interface Status', status: 'PASS', message: 'No interface down state detected' });
  }

  // Rule 2: VLAN check
  if (category === 'VLAN' || fullText.includes('vlan')) {
    if (fullText.includes('vlan 30') || fullText.includes('vlan30')) {
      passed.push('VLAN 30 referenced in configuration');
      checks.push({ rule: 'VLAN Presence', status: 'PASS', message: 'VLAN 30 found in provided data' });
    } else if (category === 'VLAN') {
      warnings.push('VLAN 30 not explicitly confirmed in show command output');
      checks.push({ rule: 'VLAN Presence', status: 'WARNING', message: 'VLAN 30 not confirmed — run: show vlan brief' });
    }
    if (fullText.includes('trunk') || fullText.includes('802.1q') || fullText.includes('dot1q')) {
      passed.push('Trunk encapsulation detected');
      checks.push({ rule: 'Trunk Configuration', status: 'PASS', message: 'Trunk/dot1Q encapsulation found' });
    } else if (category === 'VLAN') {
      warnings.push('Trunk configuration not confirmed');
      checks.push({ rule: 'Trunk Configuration', status: 'WARNING', message: 'Trunk not confirmed — run: show interfaces trunk' });
    }
  }

  // Rule 3: IP address check
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  const ips = fullText.match(ipRegex) || [];
  if (ips.length > 0) {
    const uniqueIps = [...new Set(ips)];
    const duplicates = ips.filter((ip, i) => ips.indexOf(ip) !== i);
    if (duplicates.length > 0) {
      errors.push(`Duplicate IP addresses detected: ${[...new Set(duplicates)].join(', ')}`);
      checks.push({ rule: 'Duplicate IP Check', status: 'FAIL', message: `Duplicate IPs: ${[...new Set(duplicates)].join(', ')}` });
    } else {
      passed.push(`${uniqueIps.length} unique IP address(es) detected`);
      checks.push({ rule: 'Duplicate IP Check', status: 'PASS', message: `${uniqueIps.length} unique IP addresses found` });
    }
  }

  // Rule 4: Gateway check
  if (fullText.includes('gateway') || fullText.includes('default-gateway')) {
    if (fullText.includes('ping') && fullText.includes('gateway')) {
      passed.push('Gateway reachability confirmed (ping gateway mentioned)');
      checks.push({ rule: 'Gateway Reachability', status: 'PASS', message: 'Gateway ping mentioned as successful' });
    } else {
      checks.push({ rule: 'Gateway Reachability', status: 'WARNING', message: 'Gateway present but reachability not confirmed' });
      warnings.push('Gateway reachability not explicitly confirmed');
    }
  }

  // Rule 5: ACL check
  if (category === 'ACL' || fullText.includes('access-list') || fullText.includes('acl')) {
    if (fullText.includes('deny')) {
      errors.push('ACL deny statement detected — traffic may be blocked');
      checks.push({ rule: 'ACL Deny Check', status: 'FAIL', message: 'ACL contains deny statements that may block traffic' });
    } else if (fullText.includes('permit')) {
      passed.push('ACL permit statements found');
      checks.push({ rule: 'ACL Deny Check', status: 'PASS', message: 'ACL has permit statements' });
    } else {
      checks.push({ rule: 'ACL Deny Check', status: 'WARNING', message: 'ACL mentioned but no permit/deny output provided' });
      warnings.push('ACL present but no output provided — run: show access-lists');
    }
  }

  // Rule 6: Route check
  if (category === 'Routing' || fullText.includes('ip route') || fullText.includes('routing table')) {
    if (fullText.includes('0.0.0.0') || fullText.includes('default')) {
      passed.push('Default route appears to be configured');
      checks.push({ rule: 'Default Route', status: 'PASS', message: 'Default route present' });
    } else if (category === 'Routing') {
      warnings.push('Routing issue reported but routing table not provided');
      checks.push({ rule: 'Default Route', status: 'WARNING', message: 'No routing table output — run: show ip route' });
    }
  }

  // Rule 7: DHCP check
  if (category === 'DHCP' || fullText.includes('dhcp')) {
    if (fullText.includes('helper-address') || fullText.includes('relay')) {
      passed.push('DHCP relay/helper-address detected');
      checks.push({ rule: 'DHCP Relay', status: 'PASS', message: 'ip helper-address configured' });
    } else if (category === 'DHCP') {
      warnings.push('DHCP issue reported — check ip helper-address on gateway interface');
      checks.push({ rule: 'DHCP Relay', status: 'WARNING', message: 'DHCP relay not confirmed — verify ip helper-address' });
    }
  }

  const overall_status = errors.length > 0 ? 'fail' : warnings.length > 0 ? 'warning' : 'pass';

  return {
    checks,
    errors,
    warnings,
    passed,
    overall_status,
    source: 'builtin-fallback',
    note: 'Python checker unavailable. Results from Node.js built-in rules.',
    run_at: new Date().toISOString(),
  };
}

module.exports = { runRuleChecker };
