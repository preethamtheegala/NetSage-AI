"""
NetSage AI — Python Rule Checker Microservice
Deterministic network configuration validation.
Clearly labeled as rule-based, NOT AI.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import datetime
import os

app = Flask(__name__)
CORS(app)

# Import rules
from rules.ip_rules import check_duplicate_ips, check_subnet_masks
from rules.interface_rules import check_interface_status
from rules.vlan_rules import check_vlan_configuration, check_trunk_configuration
from rules.routing_rules import check_routing_table, check_default_route
from rules.acl_rules import check_acl_rules
from rules.dhcp_rules import check_dhcp_configuration
from rules.nat_rules import check_nat_configuration


def run_all_checks(data):
    """Run all applicable deterministic rules against the provided network data."""
    checks = []
    errors = []
    warnings = []
    passed = []

    category = data.get('category', '')
    symptoms = data.get('symptoms', '')
    topology_notes = data.get('topology_notes', '')
    show_commands = data.get('show_commands', [])

    # Build full text corpus for pattern matching
    full_text = f"{symptoms} {topology_notes}"
    command_outputs = {}
    for sc in show_commands:
        cmd = sc.get('command', '').strip()
        output = sc.get('output', '').strip()
        command_outputs[cmd] = output
        full_text += f" {output}"

    full_text_lower = full_text.lower()

    # Always run IP checks
    ip_results = check_duplicate_ips(full_text, command_outputs)
    checks.extend(ip_results['checks'])
    errors.extend(ip_results['errors'])
    warnings.extend(ip_results['warnings'])
    passed.extend(ip_results['passed'])

    subnet_results = check_subnet_masks(full_text, command_outputs)
    checks.extend(subnet_results['checks'])
    errors.extend(subnet_results['errors'])
    warnings.extend(subnet_results['warnings'])
    passed.extend(subnet_results['passed'])

    # Interface checks
    iface_results = check_interface_status(full_text, command_outputs)
    checks.extend(iface_results['checks'])
    errors.extend(iface_results['errors'])
    warnings.extend(iface_results['warnings'])
    passed.extend(iface_results['passed'])

    # Category-specific checks
    if category in ('VLAN', 'Wireless') or 'vlan' in full_text_lower:
        vlan_results = check_vlan_configuration(full_text, command_outputs, category)
        checks.extend(vlan_results['checks'])
        errors.extend(vlan_results['errors'])
        warnings.extend(vlan_results['warnings'])
        passed.extend(vlan_results['passed'])

        trunk_results = check_trunk_configuration(full_text, command_outputs)
        checks.extend(trunk_results['checks'])
        errors.extend(trunk_results['errors'])
        warnings.extend(trunk_results['warnings'])
        passed.extend(trunk_results['passed'])

    if category in ('Routing', 'Gateway') or 'route' in full_text_lower or 'routing' in full_text_lower:
        route_results = check_routing_table(full_text, command_outputs)
        checks.extend(route_results['checks'])
        errors.extend(route_results['errors'])
        warnings.extend(route_results['warnings'])
        passed.extend(route_results['passed'])

        default_results = check_default_route(full_text, command_outputs)
        checks.extend(default_results['checks'])
        errors.extend(default_results['errors'])
        warnings.extend(default_results['warnings'])
        passed.extend(default_results['passed'])

    if category == 'ACL' or 'access-list' in full_text_lower or 'acl' in full_text_lower:
        acl_results = check_acl_rules(full_text, command_outputs)
        checks.extend(acl_results['checks'])
        errors.extend(acl_results['errors'])
        warnings.extend(acl_results['warnings'])
        passed.extend(acl_results['passed'])

    if category == 'DHCP' or 'dhcp' in full_text_lower:
        dhcp_results = check_dhcp_configuration(full_text, command_outputs)
        checks.extend(dhcp_results['checks'])
        errors.extend(dhcp_results['errors'])
        warnings.extend(dhcp_results['warnings'])
        passed.extend(dhcp_results['passed'])

    if category == 'NAT' or 'nat' in full_text_lower:
        nat_results = check_nat_configuration(full_text, command_outputs)
        checks.extend(nat_results['checks'])
        errors.extend(nat_results['errors'])
        warnings.extend(nat_results['warnings'])
        passed.extend(nat_results['passed'])

    # Determine overall status
    if errors:
        overall_status = 'fail'
    elif warnings:
        overall_status = 'warning'
    else:
        overall_status = 'pass'

    return {
        'checks': checks,
        'errors': errors,
        'warnings': warnings,
        'passed': passed,
        'overall_status': overall_status,
        'source': 'python-rule-checker',
        'label': 'Deterministic Rule-Based Validation',
        'run_at': datetime.datetime.utcnow().isoformat() + 'Z',
        'total_checks': len(checks),
    }


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'NetSage AI Python Rule Checker',
        'version': '1.0.0',
        'label': 'Deterministic Rule-Based Validation — NOT AI',
    })


@app.route('/check', methods=['POST'])
def check():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        result = run_all_checks(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'error': str(e),
            'checks': [],
            'errors': [f'Rule checker error: {str(e)}'],
            'warnings': [],
            'passed': [],
            'overall_status': 'error',
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 5002))
    print(f"🔧 NetSage AI Python Rule Checker running on port {port}")
    print("   Label: Deterministic Rule-Based Validation — NOT AI")
    app.run(host='0.0.0.0', port=port, debug=False)
