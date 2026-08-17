"""Interface status rules."""
import re


def check_interface_status(full_text, command_outputs):
    """Check interface up/down states."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    brief_output = ''
    for cmd, output in command_outputs.items():
        if 'interface brief' in cmd.lower() or 'ip int brief' in cmd.lower():
            brief_output = output
            break
    
    if not brief_output:
        brief_output = full_text

    # Look for down interfaces
    down_pattern = re.compile(r'(\S+)\s+[\d.]+\s+\S+\s+(down|administratively down)', re.IGNORECASE)
    err_disabled = re.compile(r'err-disabled', re.IGNORECASE)
    
    down_interfaces = down_pattern.findall(brief_output)
    has_err_disabled = err_disabled.search(full_text)
    
    if has_err_disabled:
        result['errors'].append('Interface in err-disabled state detected')
        result['checks'].append({
            'rule': 'Interface err-disabled',
            'status': 'FAIL',
            'message': 'Interface in err-disabled state — check port security or storm control'
        })
    
    if down_interfaces:
        for iface, state in down_interfaces:
            if 'admin' in state.lower():
                result['warnings'].append(f'Interface {iface} is administratively down')
                result['checks'].append({
                    'rule': 'Interface Status',
                    'status': 'WARNING',
                    'message': f'{iface} administratively down — may be intentional'
                })
            else:
                result['errors'].append(f'Interface {iface} is down (line protocol down)')
                result['checks'].append({
                    'rule': 'Interface Status',
                    'status': 'FAIL',
                    'message': f'{iface} is down — check physical connection and config'
                })
    elif 'interface brief' in ' '.join(command_outputs.keys()).lower():
        result['passed'].append('No down interfaces detected in show ip interface brief')
        result['checks'].append({
            'rule': 'Interface Status',
            'status': 'PASS',
            'message': 'All interfaces appear to be up'
        })
    
    # Check for specific "down" mentions in symptoms
    if 'line protocol is down' in full_text.lower() and not down_interfaces:
        result['errors'].append('Line protocol down mentioned in output')
        result['checks'].append({
            'rule': 'Line Protocol',
            'status': 'FAIL',
            'message': 'Line protocol down detected in provided data'
        })

    return result
