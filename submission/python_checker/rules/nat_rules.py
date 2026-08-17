"""NAT configuration rules."""
import re


def check_nat_configuration(full_text, command_outputs):
    """Check NAT configuration for common issues."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    nat_translation = ''
    running_config = ''
    
    for cmd, output in command_outputs.items():
        if 'nat translation' in cmd.lower():
            nat_translation = output
        elif 'running-config' in cmd.lower():
            running_config = output
    
    combined = full_text + running_config
    
    # Check inside/outside designation
    has_inside = bool(re.search(r'ip\s+nat\s+inside', combined, re.IGNORECASE))
    has_outside = bool(re.search(r'ip\s+nat\s+outside', combined, re.IGNORECASE))
    
    if has_inside:
        result['passed'].append('ip nat inside configured on at least one interface')
        result['checks'].append({
            'rule': 'NAT Inside',
            'status': 'PASS',
            'message': 'ip nat inside found on interface'
        })
    else:
        result['errors'].append('ip nat inside not found on any interface')
        result['checks'].append({
            'rule': 'NAT Inside',
            'status': 'FAIL',
            'message': 'ip nat inside missing — configure on inside interface'
        })
    
    if has_outside:
        result['passed'].append('ip nat outside configured on at least one interface')
        result['checks'].append({
            'rule': 'NAT Outside',
            'status': 'PASS',
            'message': 'ip nat outside found on interface'
        })
    else:
        result['errors'].append('ip nat outside not found on any interface')
        result['checks'].append({
            'rule': 'NAT Outside',
            'status': 'FAIL',
            'message': 'ip nat outside missing — configure on outside interface'
        })
    
    # Check translation table
    if nat_translation:
        lines = [l for l in nat_translation.strip().split('\n') if re.search(r'\d+\.\d+', l)]
        if lines and len(lines) > 1:  # More than header line
            result['passed'].append(f'NAT translation table has {len(lines) - 1} active entry/entries')
            result['checks'].append({
                'rule': 'NAT Translations',
                'status': 'PASS',
                'message': f'{len(lines) - 1} active NAT translation(s)'
            })
        else:
            result['warnings'].append('NAT translation table is empty — no active translations')
            result['checks'].append({
                'rule': 'NAT Translations',
                'status': 'WARNING',
                'message': 'Empty NAT table — verify traffic is flowing and NAT rule matches'
            })
    
    # Check for NAT source list
    has_source_list = bool(re.search(r'ip\s+nat\s+inside\s+source\s+list', combined, re.IGNORECASE))
    has_overload = bool(re.search(r'overload', combined, re.IGNORECASE))
    
    if has_source_list:
        result['passed'].append('NAT source list configured')
        result['checks'].append({
            'rule': 'NAT Source List',
            'status': 'PASS',
            'message': f'ip nat inside source list configured{"  (overload/PAT)" if has_overload else ""}'
        })
    
    return result
