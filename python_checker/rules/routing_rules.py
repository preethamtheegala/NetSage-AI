"""Routing table rules."""
import re


def check_routing_table(full_text, command_outputs):
    """Check routing table for issues."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    route_output = ''
    for cmd, output in command_outputs.items():
        if 'ip route' in cmd.lower() and 'show' in cmd.lower():
            route_output = output
            break
    
    if route_output:
        # Look for connected routes
        connected = re.findall(r'^C\s+(\S+)', route_output, re.MULTILINE)
        static = re.findall(r'^S\s+(\S+)', route_output, re.MULTILINE)
        ospf = re.findall(r'^O\s+(\S+)', route_output, re.MULTILINE)
        eigrp = re.findall(r'^D\s+(\S+)', route_output, re.MULTILINE)
        
        total_routes = len(connected) + len(static) + len(ospf) + len(eigrp)
        
        if total_routes > 0:
            result['passed'].append(f'Routing table has {total_routes} route(s): {len(connected)} connected, {len(static)} static')
            result['checks'].append({
                'rule': 'Routing Table',
                'status': 'PASS',
                'message': f'{total_routes} routes found ({len(connected)} connected, {len(static)} static, {len(ospf)} OSPF, {len(eigrp)} EIGRP)'
            })
        
        # Check for gateway of last resort
        if 'gateway of last resort is not set' in route_output.lower():
            result['warnings'].append('No gateway of last resort — no default route configured')
            result['checks'].append({
                'rule': 'Gateway of Last Resort',
                'status': 'WARNING',
                'message': 'No default route — add: ip route 0.0.0.0 0.0.0.0 <next-hop>'
            })
        elif 'gateway of last resort' in route_output.lower():
            result['passed'].append('Gateway of last resort is configured')
            result['checks'].append({
                'rule': 'Gateway of Last Resort',
                'status': 'PASS',
                'message': 'Default route/gateway of last resort present'
            })
    else:
        result['warnings'].append('Routing table not provided — run: show ip route')
        result['checks'].append({
            'rule': 'Routing Table',
            'status': 'WARNING',
            'message': 'No routing table output — run: show ip route'
        })
    
    return result


def check_default_route(full_text, command_outputs):
    """Check for default route configuration."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    route_output = ''
    for cmd, output in command_outputs.items():
        if 'ip route' in cmd.lower():
            route_output = output
            break
    
    if route_output:
        if '0.0.0.0/0' in route_output or 'S*' in route_output or '0.0.0.0 0.0.0.0' in full_text:
            result['passed'].append('Default route (0.0.0.0/0) present')
            result['checks'].append({
                'rule': 'Default Route',
                'status': 'PASS',
                'message': 'Default route configured'
            })
        else:
            result['warnings'].append('No default route detected in routing table')
            result['checks'].append({
                'rule': 'Default Route',
                'status': 'WARNING',
                'message': 'Default route may be missing — check: show ip route 0.0.0.0'
            })
    
    return result
