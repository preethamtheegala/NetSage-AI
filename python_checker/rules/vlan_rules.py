"""VLAN configuration rules."""
import re


def check_vlan_configuration(full_text, command_outputs, category='VLAN'):
    """Check VLAN presence and configuration."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    vlan_brief = ''
    for cmd, output in command_outputs.items():
        if 'vlan brief' in cmd.lower() or 'vlan' in cmd.lower():
            vlan_brief = output
            break
    
    # Extract VLAN numbers mentioned in symptoms/topology
    vlan_numbers = re.findall(r'[Vv][Ll][Aa][Nn]\s*(\d+)', full_text)
    
    if vlan_brief:
        existing_vlans = re.findall(r'^(\d+)\s', vlan_brief, re.MULTILINE)
        for vlan_id in set(vlan_numbers):
            if vlan_id in existing_vlans:
                result['passed'].append(f'VLAN {vlan_id} exists on the switch')
                result['checks'].append({
                    'rule': f'VLAN {vlan_id} Presence',
                    'status': 'PASS',
                    'message': f'VLAN {vlan_id} found in VLAN database'
                })
            else:
                result['errors'].append(f'VLAN {vlan_id} not found in VLAN database')
                result['checks'].append({
                    'rule': f'VLAN {vlan_id} Presence',
                    'status': 'FAIL',
                    'message': f'VLAN {vlan_id} missing — run: vlan {vlan_id}'
                })
    elif vlan_numbers:
        result['warnings'].append(f'VLANs referenced ({", ".join(set(vlan_numbers))}) but show vlan brief not provided')
        result['checks'].append({
            'rule': 'VLAN Presence',
            'status': 'WARNING',
            'message': f'VLAN(s) {", ".join(set(vlan_numbers))} referenced — run: show vlan brief to verify'
        })

    return result


def check_trunk_configuration(full_text, command_outputs):
    """Check trunk link configuration."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    trunk_output = ''
    for cmd, output in command_outputs.items():
        if 'trunk' in cmd.lower():
            trunk_output = output
            break
    
    # Extract VLANs that should be on trunk
    vlan_numbers = re.findall(r'[Vv][Ll][Aa][Nn]\s*(\d+)', full_text)
    
    if trunk_output:
        # Check if VLANs are in allowed list
        allowed_match = re.search(r'Vlans allowed on trunk\s*\n\S+\s+([\d\-,]+)', trunk_output)
        if allowed_match:
            allowed_str = allowed_match.group(1)
            # Parse allowed VLANs
            allowed_vlans = set()
            for part in allowed_str.split(','):
                if '-' in part:
                    start, end = part.split('-')
                    try:
                        allowed_vlans.update(str(v) for v in range(int(start), int(end) + 1))
                    except ValueError:
                        pass
                else:
                    allowed_vlans.add(part.strip())
            
            for vlan_id in set(vlan_numbers):
                if vlan_id in allowed_vlans:
                    result['passed'].append(f'VLAN {vlan_id} is allowed on trunk')
                    result['checks'].append({
                        'rule': f'Trunk VLAN {vlan_id}',
                        'status': 'PASS',
                        'message': f'VLAN {vlan_id} permitted on trunk link'
                    })
                else:
                    result['errors'].append(f'VLAN {vlan_id} NOT in trunk allowed list')
                    result['checks'].append({
                        'rule': f'Trunk VLAN {vlan_id}',
                        'status': 'FAIL',
                        'message': f'VLAN {vlan_id} excluded from trunk — add with: switchport trunk allowed vlan add {vlan_id}'
                    })
        
        # Check trunk status
        if 'trunking' in trunk_output.lower():
            result['passed'].append('Trunk link is in trunking state')
            result['checks'].append({
                'rule': 'Trunk Status',
                'status': 'PASS',
                'message': 'Trunk link operational (trunking mode)'
            })
        elif 'not-trunking' in trunk_output.lower():
            result['errors'].append('Trunk link is NOT trunking')
            result['checks'].append({
                'rule': 'Trunk Status',
                'status': 'FAIL',
                'message': 'Trunk link not trunking — verify switchport mode trunk'
            })
    elif 'trunk' in full_text.lower() or vlan_numbers:
        result['warnings'].append('Trunk configuration not verified — run: show interfaces trunk')
        result['checks'].append({
            'rule': 'Trunk Configuration',
            'status': 'WARNING',
            'message': 'Trunk output not provided — run: show interfaces trunk'
        })

    return result
