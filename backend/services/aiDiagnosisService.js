/**
 * AI Diagnosis Service
 * Abstraction layer for AI-powered network troubleshooting diagnosis.
 * Supports: mock mode, Gemini, OpenAI (extendable).
 *
 * Set AI_PROVIDER=mock|gemini|openai in .env
 */

const axios = require('axios');

const MOCK_DIAGNOSES = {
  VLAN: {
    root_cause:
      'Inter-VLAN routing is misconfigured. The subinterface for VLAN 30 may be missing on the router, or the trunk link between the switch and router is not carrying VLAN 30.',
    confidence: 'medium',
    confidence_score: 65,
    osi_layer: 'Layer 2 / Layer 3',
    evidence: [
      'PC can ping default gateway (Layer 3 reachability to router is functional)',
      'PC cannot reach server in VLAN 30 (inter-VLAN routing failure)',
      'Trunk configuration needs verification for VLAN 30 membership',
    ],
    next_command: 'show interfaces trunk',
    fix_steps: [
      'Verify trunk link is carrying VLAN 30: show interfaces trunk',
      'Check subinterface configuration on router: show running-config | section interface',
      'Verify VLAN 30 exists on the switch: show vlan brief',
      'Check ACLs that may block inter-VLAN traffic: show access-lists',
      'Ensure encapsulation dot1Q 30 is configured on the router subinterface',
      'Add VLAN 30 to trunk allowed VLANs if missing: switchport trunk allowed vlan add 30',
    ],
    alternative_causes: [
      'ACL blocking traffic between VLANs',
      'VLAN 30 not created on the switch',
      'Router subinterface IP mismatch with PC gateway',
    ],
  },
  Routing: {
    root_cause:
      'Missing or incorrect route in the routing table. The router does not have a route to the destination network, causing packets to be dropped.',
    confidence: 'high',
    confidence_score: 80,
    osi_layer: 'Layer 3',
    evidence: [
      'Connectivity fails beyond the local subnet',
      'Default gateway is reachable but remote hosts are not',
    ],
    next_command: 'show ip route',
    fix_steps: [
      'Display the routing table: show ip route',
      'Check for a route to the destination: show ip route <destination-network>',
      'Add a static route if missing: ip route <network> <mask> <next-hop>',
      'Verify routing protocol is running: show ip protocols',
      'Check neighbor adjacencies if using dynamic routing: show ip ospf neighbor',
    ],
    alternative_causes: [
      'Routing protocol not advertising the network',
      'Route summarization hiding specific routes',
      'Administrative distance misconfiguration',
    ],
  },
  DHCP: {
    root_cause:
      'DHCP server is not reachable from the client VLAN, or the DHCP pool is exhausted/misconfigured. The relay agent may not be configured on the gateway interface.',
    confidence: 'medium',
    confidence_score: 70,
    osi_layer: 'Layer 3 / Layer 7',
    evidence: [
      'Client is not receiving an IP address automatically',
      'DHCP discover packets may not be reaching the server',
    ],
    next_command: 'show ip dhcp binding',
    fix_steps: [
      'Check DHCP pool configuration: show running-config | section dhcp',
      'Verify DHCP bindings: show ip dhcp binding',
      'Check for IP helper-address on gateway interface: show running-config | section interface',
      'Verify DHCP server is reachable: ping <dhcp-server-ip>',
      'Check for DHCP conflicts: show ip dhcp conflict',
      'Clear conflicts if found: clear ip dhcp conflict *',
    ],
    alternative_causes: [
      'DHCP pool exhaustion',
      'Missing ip helper-address on the SVI or routed interface',
      'DHCP server not running',
    ],
  },
  ACL: {
    root_cause:
      'An Access Control List is blocking traffic. A permit/deny statement in the ACL is preventing packets from reaching the destination.',
    confidence: 'high',
    confidence_score: 75,
    osi_layer: 'Layer 3 / Layer 4',
    evidence: [
      'Traffic is blocked despite correct routing',
      'ACL may be applied in the wrong direction (in vs out)',
    ],
    next_command: 'show access-lists',
    fix_steps: [
      'Display all ACLs: show access-lists',
      'Check ACL application on interfaces: show running-config | section interface',
      'Identify the blocking ACE by checking hit counts',
      'Remove or modify the blocking rule: no access-list <number>',
      'Re-apply correctly: ip access-group <acl-name> in|out',
      'Test connectivity after modification',
    ],
    alternative_causes: [
      'ACL applied in wrong direction',
      'Implicit deny at end of ACL',
      'ACL matching wrong source/destination',
    ],
  },
  Gateway: {
    root_cause:
      'Default gateway is misconfigured on the end device, or the gateway interface on the router/switch is down or has an incorrect IP.',
    confidence: 'high',
    confidence_score: 85,
    osi_layer: 'Layer 3',
    evidence: ['PC cannot reach hosts outside its subnet', 'Gateway ping fails'],
    next_command: 'show ip interface brief',
    fix_steps: [
      'Verify gateway IP on the PC matches the router interface IP',
      'Check router interface status: show ip interface brief',
      'Bring up interface if down: no shutdown',
      'Verify IP address on gateway interface: show interfaces <interface>',
      'Check for HSRP/VRRP virtual IP if high availability is configured',
    ],
    alternative_causes: [
      'Incorrect default gateway configured on the PC',
      'Router interface administratively down',
      'IP address mismatch between PC gateway and router interface',
    ],
  },
  NAT: {
    root_cause:
      'NAT translation is not functioning. The inside/outside NAT designations may be incorrect, or the NAT pool/overload configuration is missing.',
    confidence: 'medium',
    confidence_score: 65,
    osi_layer: 'Layer 3',
    evidence: [
      'Internal hosts cannot reach external networks',
      'NAT translations table may be empty',
    ],
    next_command: 'show ip nat translations',
    fix_steps: [
      'View NAT translation table: show ip nat translations',
      'Check NAT statistics: show ip nat statistics',
      'Verify inside/outside designations on interfaces: show running-config | section interface',
      'Check NAT access-list: show access-lists',
      'Verify NAT pool or overload configuration',
      'Clear NAT table and retest: clear ip nat translation *',
    ],
    alternative_causes: [
      'Inside/outside interface designation reversed',
      'NAT access-list not matching traffic',
      'NAT pool exhausted',
    ],
  },
  DNS: {
    root_cause:
      'DNS resolution is failing. The client cannot resolve hostnames because the configured DNS server is unreachable or not responding.',
    confidence: 'medium',
    confidence_score: 70,
    osi_layer: 'Layer 7',
    evidence: [
      'IP-based connectivity works but hostname resolution fails',
      'DNS server may be unreachable or incorrectly configured',
    ],
    next_command: 'show hosts',
    fix_steps: [
      'Verify DNS server IP is reachable: ping <dns-server>',
      'Check DNS server configuration: show running-config | include name-server',
      'Test resolution: ping <hostname>',
      'Verify DNS is enabled on the device: ip domain-lookup',
      'Check static host entries: show hosts',
    ],
    alternative_causes: [
      'ip domain-lookup disabled',
      'Wrong DNS server IP configured',
      'Firewall blocking UDP port 53',
    ],
  },
  Wireless: {
    root_cause:
      'Wireless client cannot associate or authenticate to the access point. Possible causes include SSID mismatch, incorrect security settings, or channel interference.',
    confidence: 'low',
    confidence_score: 50,
    osi_layer: 'Layer 1 / Layer 2',
    evidence: [
      'Wireless client shows connected but no IP',
      'Signal strength may be insufficient',
    ],
    next_command: 'show dot11 associations',
    fix_steps: [
      'Check wireless client association: show dot11 associations',
      'Verify SSID and security settings match',
      'Check DHCP scope for wireless subnet',
      'Verify AP is in correct VLAN',
      'Check channel settings for interference',
    ],
    alternative_causes: [
      'SSID mismatch',
      'WPA key mismatch',
      'VLAN not assigned to wireless interface',
    ],
  },
};

function getMockDiagnosis(input) {
  const category = input.category || 'Other';
  const template = MOCK_DIAGNOSES[category] || MOCK_DIAGNOSES['VLAN'];

  // Enrich evidence with actual provided symptoms/topology
  const evidence = [...template.evidence];
  if (input.symptoms) {
    evidence.unshift(`User-reported symptom: "${input.symptoms.slice(0, 200)}"`);
  }
  if (input.topology_notes) {
    evidence.push(`Topology context: "${input.topology_notes.slice(0, 150)}"`);
  }
  if (input.show_commands && input.show_commands.length > 0) {
    input.show_commands.forEach((sc) => {
      evidence.push(`Evidence from [${sc.command}]: output provided for analysis`);
    });
  }

  return {
    root_cause: template.root_cause,
    confidence: template.confidence,
    confidence_score: template.confidence_score,
    osi_layer: template.osi_layer,
    evidence,
    next_command: template.next_command,
    fix_steps: template.fix_steps,
    alternative_causes: template.alternative_causes,
    provider: 'mock',
    generated_at: new Date().toISOString(),
    note: '⚠️ DEMO MODE: AI_PROVIDER=mock. Set GEMINI_API_KEY or OPENAI_API_KEY in .env to use real AI.',
  };
}

async function runGeminiDiagnosis(input) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `You are a Cisco network troubleshooting AI expert. Analyze the following network problem and respond ONLY with valid JSON.

Problem:
Category: ${input.category}
Severity: ${input.severity}
Device Type: ${input.device_type}
Source: ${input.source_device}
Destination: ${input.destination_device}
Symptoms: ${input.symptoms}
Topology Notes: ${input.topology_notes}
Show Commands:
${(input.show_commands || []).map((sc) => `${sc.command}:\n${sc.output}`).join('\n\n')}

Respond ONLY with this JSON structure (no markdown, no explanation):
{
  "root_cause": "Concise explanation of the most likely root cause",
  "confidence": "low|medium|high",
  "confidence_score": 85,
  "osi_layer": "Layer X - Name",
  "evidence": ["evidence item 1 from provided data", "evidence item 2"],
  "next_command": "next cisco show command to run",
  "fix_steps": ["step 1", "step 2", "step 3"],
  "alternative_causes": ["alternative 1", "alternative 2"]
}`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();
  // Strip markdown code fences if present
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  const parsed = JSON.parse(text);
  return { ...parsed, provider: 'gemini', generated_at: new Date().toISOString() };
}

async function runDiagnosis(input) {
  const provider = process.env.AI_PROVIDER || 'mock';

  try {
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      return await runGeminiDiagnosis(input);
    }
    // Default: mock
    return getMockDiagnosis(input);
  } catch (err) {
    console.error(`AI diagnosis failed (${provider}): ${err.message}. Falling back to mock.`);
    const result = getMockDiagnosis(input);
    result.note = `⚠️ AI provider "${provider}" failed: ${err.message}. Showing mock result.`;
    return result;
  }
}

function validateDiagnosisOutput(diagnosis) {
  const required = ['root_cause', 'confidence', 'osi_layer', 'evidence', 'next_command', 'fix_steps'];
  for (const field of required) {
    if (!diagnosis[field]) {
      throw new Error(`AI diagnosis missing required field: ${field}`);
    }
  }
  if (!['low', 'medium', 'high'].includes(diagnosis.confidence)) {
    diagnosis.confidence = 'medium';
  }
  if (!Array.isArray(diagnosis.evidence)) diagnosis.evidence = [];
  if (!Array.isArray(diagnosis.fix_steps)) diagnosis.fix_steps = [];
  if (!Array.isArray(diagnosis.alternative_causes)) diagnosis.alternative_causes = [];
  return diagnosis;
}

module.exports = { runDiagnosis, validateDiagnosisOutput };
