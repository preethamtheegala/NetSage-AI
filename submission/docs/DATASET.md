# NetSage AI — Dataset Specification & Taxonomy

Total Cases: **35 Scenarios**  
File Formats: MongoDB Collection (`TroubleshootingCase`), JSON (`data/sample_cases.json`), CSV (`data/cases.csv` and `cases.csv`).

---

## 📊 Category Distribution

| Category | Cases Count | Primary Protocols & Concepts |
| :--- | :---: | :--- |
| **VLAN** | 4 | 802.1Q Trunking, ROAS, Native VLAN Mismatch, Access VLANs, VTP Pruning |
| **Gateway** | 3 | Subnet Mask Mismatches, HSRP Active/Active Split-Brain, Proxy ARP |
| **DHCP** | 3 | Pool Exhaustion, IP Helper-Address Relay, DHCP Snooping Untrusted Ports |
| **DNS** | 2 | Client DNS IP Misconfigurations, Router Domain Lookup Hangs |
| **Static Routing** | 3 | Missing Return Routes, Floating Static AD Conflicts, Recursive Next-Hop Failures |
| **OSPF** | 4 | Area ID Mismatches, Hello/Dead Timers, MTU Mismatch EXSTART, Passive Interfaces |
| **BGP** | 3 | eBGP Multihop on Loopbacks, BGP Network Statement Masks, iBGP Next-Hop-Self |
| **ACL** | 3 | Line VTY Management ACLs, Extended Port 8080 vs 80, Standard ACL Placement |
| **NAT / PAT** | 3 | Missing Overload Keyword, Missing `ip nat inside`, ACL Subnet Omissions |
| **Wireless** | 3 | Multi-SSID Trunking on AP Ports, WPA2-PSK Mismatch, CAPWAP Option 43 Discovery |
| **STP** | 2 | Root Bridge Priority Elections, BPDU Guard Err-Disable on Rogue Switches |
| **Port Security** | 2 | Maximum MAC Limit Violations, Sticky MAC Mismatch on Replacement |

---

## 🏷️ Case Schema Attributes
Every case contains:
1. `case_id`: Unique identifier
2. `title`: Human-readable problem title
3. `category`: Network protocol category
4. `severity`: `low` | `medium` | `high` | `critical`
5. `device_type`: Cisco Router / Switch / WLC / AP / Host
6. `source_device`: Originating client/endpoint
7. `destination_device`: Target server/gateway
8. `symptoms`: Observable user complaints
9. `topology_notes`: Physical/logical wiring and IP allocations
10. `show_commands`: Array of Cisco CLI commands and terminal outputs
11. `expected_fault`: Canonical root cause
12. `expected_osi_layer`: Target OSI Layer (Layer 2, 3, 4, 7)
13. `concept_tag`: Array of search tags
14. `expected_next_command`: Recommended verification command
15. `expected_fix`: Step-by-step CLI remediation
16. `verification_steps`: Ping / show verification criteria
