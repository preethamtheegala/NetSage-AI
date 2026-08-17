"""
Unit tests for NetSage AI Python Rule Checker microservice.
Tests all deterministic rule modules and Flask API endpoints.
"""

import unittest
import json
import os
import sys

# Add parent directory to path to import app and rules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, run_all_checks
from rules.ip_rules import check_duplicate_ips, check_subnet_masks
from rules.interface_rules import check_interface_status
from rules.vlan_rules import check_vlan_configuration, check_trunk_configuration
from rules.routing_rules import check_routing_table, check_default_route
from rules.acl_rules import check_acl_rules
from rules.dhcp_rules import check_dhcp_configuration
from rules.nat_rules import check_nat_configuration


class TestIPRules(unittest.TestCase):
    def test_duplicate_ips_detected(self):
        text = "Host 192.168.1.50 conflict with 192.168.1.50 and server 192.168.1.50 assigned on interface"
        res = check_duplicate_ips(text, {})
        self.assertTrue(len(res['errors']) > 0)
        self.assertTrue(any(c['status'] == 'FAIL' for c in res['checks']))

    def test_unique_ips_pass(self):
        text = "Router Fa0/0 has 192.168.1.1 and Switch VLAN 1 assigned 192.168.1.2"
        res = check_duplicate_ips(text, {})
        self.assertEqual(len(res['errors']), 0)
        self.assertTrue(any(c['status'] == 'PASS' for c in res['checks']))


class TestInterfaceRules(unittest.TestCase):
    def test_interface_down_detected(self):
        text = "GigabitEthernet0/0 is administratively down, line protocol is down"
        res = check_interface_status(text, {'show ip interface brief': text})
        self.assertTrue(len(res['errors']) > 0)
        self.assertTrue(any(c['status'] == 'FAIL' for c in res['checks']))

    def test_interface_up_pass(self):
        text = "GigabitEthernet0/0 is up, line protocol is up"
        res = check_interface_status(text, {'show ip interface brief': text})
        self.assertEqual(len(res['errors']), 0)
        self.assertTrue(any(c['status'] == 'PASS' for c in res['checks']))


class TestVLANRules(unittest.TestCase):
    def test_vlan_presence_fail(self):
        full_text = "Host in VLAN 30 cannot reach gateway"
        vlan_brief = "1 default active Fa0/1\n10 SALES active Fa0/2\n20 ENG active Fa0/3"
        res = check_vlan_configuration(full_text, {'show vlan brief': vlan_brief})
        self.assertTrue(any(c['status'] == 'FAIL' for c in res['checks']))

    def test_vlan_presence_pass(self):
        full_text = "Host in VLAN 10 communicating"
        vlan_brief = "1 default active Fa0/1\n10 SALES active Fa0/2\n20 ENG active Fa0/3"
        res = check_vlan_configuration(full_text, {'show vlan brief': vlan_brief})
        self.assertTrue(any(c['status'] == 'PASS' for c in res['checks']))


class TestRoutingRules(unittest.TestCase):
    def test_default_route_pass(self):
        full_text = "Gateway 0.0.0.0/0 via 192.168.1.1"
        res = check_default_route(full_text, {'show ip route': 'S* 0.0.0.0/0 [1/0] via 192.168.1.1'})
        self.assertTrue(any(c['status'] == 'PASS' for c in res['checks']))

    def test_routing_table_empty_warning(self):
        full_text = "No route found for 10.0.0.0/24"
        res = check_routing_table(full_text, {})
        self.assertTrue(any(c['status'] == 'WARNING' for c in res['checks']))


class TestACLRules(unittest.TestCase):
    def test_acl_deny_detected(self):
        full_text = "access-list 101 deny ip any host 192.168.1.10"
        res = check_acl_rules(full_text, {'show access-lists': 'Extended IP access list 101\n 10 deny tcp any host 192.168.1.10 eq 22 (12 matches)'})
        self.assertTrue(len(res['errors']) > 0 or len(res['warnings']) > 0 or any(c['status'] in ('FAIL', 'WARNING') for c in res['checks']))


class TestDHCPRules(unittest.TestCase):
    def test_dhcp_helper_address(self):
        full_text = "Client in VLAN 20 not getting IP. Router has ip helper-address 192.168.100.10"
        res = check_dhcp_configuration(full_text, {})
        self.assertTrue(any('helper-address' in str(c).lower() or c['status'] == 'PASS' for c in res['checks']))


class TestNATRules(unittest.TestCase):
    def test_nat_inside_outside(self):
        full_text = "ip nat inside source list 1 interface GigabitEthernet0/0 overload"
        res = check_nat_configuration(full_text, {'show ip nat translations': 'Pro Inside global Inside local Outside local Outside global'})
        self.assertTrue(len(res['checks']) > 0)


class TestFlaskAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'ok')
        self.assertIn('Deterministic', data['label'])

    def test_check_endpoint(self):
        payload = {
            "category": "VLAN",
            "symptoms": "PC in VLAN 30 cannot reach server",
            "topology_notes": "Switch1 trunk to Router1",
            "show_commands": [
                {
                    "command": "show vlan brief",
                    "output": "1 default active Fa0/1\n10 VLAN0010 active Fa0/2"
                }
            ]
        }
        response = self.client.post('/check', json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('checks', data)
        self.assertIn('overall_status', data)
        self.assertEqual(data['source'], 'python-rule-checker')


if __name__ == '__main__':
    unittest.main()
