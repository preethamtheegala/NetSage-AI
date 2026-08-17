"""IP address related rules."""
import re


def check_duplicate_ips(full_text, command_outputs):
    """Check for duplicate IP addresses in the provided data."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    ip_pattern = re.compile(r'\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b')
    
    # Only look at actual show command outputs for IP extraction
    all_ips = []
    for cmd, output in command_outputs.items():
        ips = ip_pattern.findall(output)
        all_ips.extend(ips)

    if not all_ips:
        all_ips = ip_pattern.findall(full_text)

    # Filter out obvious broadcast/multicast/loopback
    filtered = [ip for ip in all_ips if not (
        ip.endswith('.255') or ip.startswith('224.') or ip.startswith('255.')
    )]

    seen = {}
    duplicates = []
    for ip in filtered:
        seen[ip] = seen.get(ip, 0) + 1
    duplicates = [ip for ip, count in seen.items() if count > 2]  # Allow same IP appearing twice (interface + route)

    if duplicates:
        result['errors'].append(f'Potential duplicate IP(s): {", ".join(duplicates)}')
        result['checks'].append({
            'rule': 'Duplicate IP Detection',
            'status': 'FAIL',
            'message': f'IP addresses appearing multiple times: {", ".join(duplicates)}'
        })
    elif filtered:
        result['passed'].append(f'No duplicate IPs detected ({len(set(filtered))} unique addresses found)')
        result['checks'].append({
            'rule': 'Duplicate IP Detection',
            'status': 'PASS',
            'message': f'{len(set(filtered))} unique IP addresses — no duplicates detected'
        })

    return result


def check_subnet_masks(full_text, command_outputs):
    """Check for common subnet mask errors."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    # Look for suspicious masks
    suspicious_masks = {
        '255.0.255.0': 'Non-standard mask',
        '255.255.0.255': 'Non-standard mask',
        '255.0.0.255': 'Non-standard mask',
    }
    
    common_masks = [
        '255.0.0.0', '255.128.0.0', '255.192.0.0', '255.224.0.0',
        '255.240.0.0', '255.248.0.0', '255.252.0.0', '255.254.0.0',
        '255.255.0.0', '255.255.128.0', '255.255.192.0', '255.255.224.0',
        '255.255.240.0', '255.255.248.0', '255.255.252.0', '255.255.254.0',
        '255.255.255.0', '255.255.255.128', '255.255.255.192',
        '255.255.255.224', '255.255.255.240', '255.255.255.248',
        '255.255.255.252', '255.255.255.254', '255.255.255.255',
    ]
    
    mask_pattern = re.compile(r'\b(255\.\d{1,3}\.\d{1,3}\.\d{1,3})\b')
    found_masks = mask_pattern.findall(full_text)
    
    for mask in found_masks:
        if mask in suspicious_masks:
            result['errors'].append(f'Suspicious subnet mask detected: {mask}')
            result['checks'].append({
                'rule': 'Subnet Mask Validation',
                'status': 'FAIL',
                'message': f'Non-standard subnet mask: {mask}'
            })
            return result
    
    if found_masks:
        invalid = [m for m in found_masks if m not in common_masks]
        if invalid:
            result['warnings'].append(f'Uncommon subnet mask(s): {", ".join(set(invalid))}')
            result['checks'].append({
                'rule': 'Subnet Mask Validation',
                'status': 'WARNING',
                'message': f'Verify these subnet masks: {", ".join(set(invalid))}'
            })
        else:
            result['passed'].append('All subnet masks appear valid')
            result['checks'].append({
                'rule': 'Subnet Mask Validation',
                'status': 'PASS',
                'message': 'Subnet masks are standard CIDR masks'
            })

    return result
