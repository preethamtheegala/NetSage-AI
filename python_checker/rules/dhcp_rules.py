"""DHCP configuration rules."""
import re


def check_dhcp_configuration(full_text, command_outputs):
    """Check DHCP configuration for common issues."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    dhcp_output = ''
    binding_output = ''
    running_config = ''
    
    for cmd, output in command_outputs.items():
        if 'dhcp binding' in cmd.lower():
            binding_output = output
        elif 'dhcp pool' in cmd.lower() or 'dhcp' in cmd.lower():
            dhcp_output = output
        elif 'running-config' in cmd.lower():
            running_config = output
    
    # Check bindings
    if binding_output:
        lines = [l for l in binding_output.strip().split('\n') if re.match(r'\d+\.\d+', l.strip())]
        if lines:
            result['passed'].append(f'DHCP has {len(lines)} active binding(s)')
            result['checks'].append({
                'rule': 'DHCP Bindings',
                'status': 'PASS',
                'message': f'{len(lines)} active DHCP binding(s) found'
            })
        else:
            result['warnings'].append('DHCP binding table is empty — no clients received IPs')
            result['checks'].append({
                'rule': 'DHCP Bindings',
                'status': 'WARNING',
                'message': 'No DHCP bindings — clients not receiving addresses'
            })
    
    # Check for helper-address
    combined = full_text + running_config
    if 'helper-address' in combined.lower() or 'ip helper' in combined.lower():
        result['passed'].append('ip helper-address (DHCP relay) configured')
        result['checks'].append({
            'rule': 'DHCP Relay',
            'status': 'PASS',
            'message': 'ip helper-address found — DHCP relay configured'
        })
    elif 'dhcp' in full_text.lower():
        result['warnings'].append('ip helper-address not found — verify DHCP relay on gateway interface')
        result['checks'].append({
            'rule': 'DHCP Relay',
            'status': 'WARNING',
            'message': 'ip helper-address not confirmed — run: show running-config | section interface'
        })
    
    # Check for excluded addresses
    if 'ip dhcp excluded-address' in combined.lower():
        excluded = re.findall(r'ip dhcp excluded-address (\S+)\s+(\S+)', combined)
        if excluded:
            result['passed'].append(f'DHCP excluded address ranges configured: {len(excluded)} range(s)')
            result['checks'].append({
                'rule': 'DHCP Excluded Addresses',
                'status': 'PASS',
                'message': f'{len(excluded)} excluded address range(s) — gateway IPs protected'
            })
    
    # Check for pool
    if 'network' in dhcp_output.lower() or 'ip dhcp pool' in combined.lower():
        result['passed'].append('DHCP pool configured with network statement')
        result['checks'].append({
            'rule': 'DHCP Pool',
            'status': 'PASS',
            'message': 'DHCP pool with network statement found'
        })
    
    return result
