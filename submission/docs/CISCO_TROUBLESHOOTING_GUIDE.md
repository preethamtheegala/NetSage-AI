# NetSage AI — Cisco & Packet Tracer Troubleshooting Guide

This guide details common Cisco network failure modes and show command diagnostics supported by NetSage AI.

---

## 1. VLAN & Inter-VLAN Routing (Router-on-a-Stick)

### Common Failure Points:
- Switch access port assigned to wrong VLAN or VLAN not created in database.
- Trunk link between switch and router missing encapsulation (`dot1Q`) or excluding required VLANs from the allowed list.
- Subinterface on router missing, administratively down, or configured with wrong IP / encapsulation tag.

### Key Show Commands:
```cisco
show vlan brief
show interfaces trunk
show ip interface brief
show running-config | section interface
```

---

## 2. DHCP Configuration & Relay

### Common Failure Points:
- Missing `ip helper-address <DHCP_SERVER_IP>` on the default gateway / SVI interface.
- DHCP address pool exhausted or subnet misconfigured.
- IP conflict preventing lease distribution.

### Key Show Commands:
```cisco
show ip dhcp pool
show ip dhcp binding
show ip dhcp conflict
show running-config | section dhcp
```

---

## 3. Access Control Lists (ACLs)

### Common Failure Points:
- Implicit `deny ip any any` at the bottom of the ACL dropping legitimate traffic.
- ACL applied in the wrong direction (`in` vs `out`) or on the wrong interface.
- Standard ACL placed near the destination instead of near the source (or vice-versa for extended ACLs).

### Key Show Commands:
```cisco
show access-lists
show ip interface <interface_id>
```

---

## 4. IP Routing & OSPF

### Common Failure Points:
- Missing static default route (`ip route 0.0.0.0 0.0.0.0 <next-hop>`).
- OSPF area ID mismatch or hello/dead timer mismatch between neighbors.
- Network command wildcard mask misconfigured.

### Key Show Commands:
```cisco
show ip route
show ip ospf neighbor
show ip ospf interface
show ip protocols
```

---

## 5. Network Address Translation (NAT)

### Common Failure Points:
- Missing `ip nat inside` or `ip nat outside` interface directives.
- Access list referenced in NAT statement does not match source traffic.
- NAT overload pool / interface missing `overload` keyword.

### Key Show Commands:
```cisco
show ip nat translations
show ip nat statistics
```

---

## 6. Port Security & Err-Disabled Interfaces

### Common Failure Points:
- Maximum MAC addresses exceeded on switchport.
- Violation action set to `shutdown`, placing port into `err-disabled` state.

### Key Show Commands:
```cisco
show port-security interface <interface_id>
show interfaces status err-disabled
```
