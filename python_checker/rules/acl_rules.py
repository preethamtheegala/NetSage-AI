"""ACL validation rules."""
import re


def check_acl_rules(full_text, command_outputs):
    """Check ACL configuration for common issues."""
    result = {'checks': [], 'errors': [], 'warnings': [], 'passed': []}
    
    acl_output = ''
    for cmd, output in command_outputs.items():
        if 'access-list' in cmd.lower() or 'access-lists' in cmd.lower():
            acl_output = output
            break
    
    if acl_output:
        # Check for deny rules with high hit counts
        deny_matches = re.findall(r'deny\s+\S+.*?\((\d+)\s+match', acl_output, re.IGNORECASE)
        permit_matches = re.findall(r'permit\s+\S+.*?\((\d+)\s+match', acl_output, re.IGNORECASE)
        
        total_denies = sum(int(m) for m in deny_matches)
        total_permits = sum(int(m) for m in permit_matches)
        
        if total_denies > 0:
            result['errors'].append(f'ACL deny rules have {total_denies} hit(s) — traffic is being actively blocked')
            result['checks'].append({
                'rule': 'ACL Deny Hits',
                'status': 'FAIL',
                'message': f'ACL deny statements matched {total_denies} packet(s) — traffic blocked'
            })
        
        if total_permits > 0:
            result['passed'].append(f'ACL permit rules matched {total_permits} packet(s)')
            result['checks'].append({
                'rule': 'ACL Permit Hits',
                'status': 'PASS',
                'message': f'ACL permitting {total_permits} packet(s) — traffic flowing for permitted sources'
            })
        
        # Check for permit rules with 0 matches (may indicate mismatch)
        permit_zero = re.findall(r'permit\s+\S+[^\n]*\(0\s+match', acl_output, re.IGNORECASE)
        if permit_zero:
            result['warnings'].append(f'{len(permit_zero)} permit rule(s) have 0 matches — may indicate source/destination mismatch')
            result['checks'].append({
                'rule': 'ACL Permit Zero Matches',
                'status': 'WARNING',
                'message': f'{len(permit_zero)} permit rule(s) not matching any traffic — verify source/destination'
            })
        
        # Check for implicit deny (any ACL has one)
        deny_any_any = re.findall(r'deny\s+ip\s+any\s+any', acl_output, re.IGNORECASE)
        if deny_any_any:
            result['warnings'].append('Explicit deny ip any any found — ensure all required traffic is permitted above this')
            result['checks'].append({
                'rule': 'Explicit Deny Any',
                'status': 'WARNING',
                'message': 'Explicit deny ip any any — verify all needed traffic is permitted first'
            })
    else:
        result['warnings'].append('ACL output not provided — run: show access-lists')
        result['checks'].append({
            'rule': 'ACL Configuration',
            'status': 'WARNING',
            'message': 'No ACL output provided — run: show access-lists'
        })
    
    return result
