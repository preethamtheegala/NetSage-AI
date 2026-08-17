# NetSage AI — Cisco Packet Tracer Lab Assets & Configurations

Welcome to the **NetSage AI Packet Tracer Lab Reference Suite**.

> **Note on Binary `.pkt` Files**:
> Cisco Packet Tracer `.pkt` files use a proprietary, encrypted binary format that cannot be reliably created by automated non-Cisco tools without data corruption. To ensure 100% technical accuracy and reproducibility across all Packet Tracer versions (7.x, 8.x), this directory provides **complete, copy-pasteable Cisco IOS configuration files (`.cfg`) and comprehensive lab markdown guides (`.md`)**.
>
> You can build the topologies in Cisco Packet Tracer in minutes by pasting the baseline configs into device CLI consoles.

---

## 📁 Lab Reference Catalog

| Lab # | Category | Lab Title | Config File | Guide |
| :--- | :--- | :--- | :--- | :--- |
| **Lab 01** | VLAN / ROAS | Inter-VLAN Routing & 802.1Q Trunking | [`01_VLAN_Trunking_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/01_VLAN_Trunking_Lab.cfg) | [`01_VLAN_Trunking_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/01_VLAN_Trunking_Lab.md) |
| **Lab 02** | Gateway | HSRP First-Hop Redundancy & ACL Fault | [`02_Gateway_HSRP_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/02_Gateway_HSRP_Lab.cfg) | [`02_Gateway_HSRP_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/02_Gateway_HSRP_Lab.md) |
| **Lab 03** | DHCP | IP Helper-Address Relay & DHCP Snooping | [`03_DHCP_Relay_Snooping_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/03_DHCP_Relay_Snooping_Lab.cfg) | [`03_DHCP_Relay_Snooping_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/03_DHCP_Relay_Snooping_Lab.md) |
| **Lab 04** | DNS | Client DNS Resolution & Domain Lookup | [`04_DNS_Resolution_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/04_DNS_Resolution_Lab.cfg) | [`04_DNS_Resolution_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/04_DNS_Resolution_Lab.md) |
| **Lab 05** | Routing | Static & Floating Static Backup Routing | [`05_Static_Routing_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/05_Static_Routing_Lab.cfg) | [`05_Static_Routing_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/05_Static_Routing_Lab.md) |
| **Lab 06** | OSPF | Single & Multi-Area OSPF Troubleshooting | [`06_OSPF_Routing_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/06_OSPF_Routing_Lab.cfg) | [`06_OSPF_Routing_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/06_OSPF_Routing_Lab.md) |
| **Lab 07** | BGP | eBGP Multihop & Next-Hop-Self iBGP | [`07_BGP_Peering_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/07_BGP_Peering_Lab.cfg) | [`07_BGP_Peering_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/07_BGP_Peering_Lab.md) |
| **Lab 08** | ACL | Standard & Extended IPv4 Access Lists | [`08_ACL_Security_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/08_ACL_Security_Lab.cfg) | [`08_ACL_Security_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/08_ACL_Security_Lab.md) |
| **Lab 09** | NAT | NAT/PAT Overload & Interface Roles | [`09_NAT_PAT_Overload_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/09_NAT_PAT_Overload_Lab.cfg) | [`09_NAT_PAT_Overload_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/09_NAT_PAT_Overload_Lab.md) |
| **Lab 10** | Wireless | Multi-SSID to VLAN Mapping & CAPWAP | [`10_Wireless_AP_VLAN_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/10_Wireless_AP_VLAN_Lab.cfg) | [`10_Wireless_AP_VLAN_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/10_Wireless_AP_VLAN_Lab.md) |
| **Lab 11** | STP | Spanning-Tree Root Bridge & BPDU Guard | [`11_STP_RootBridge_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/11_STP_RootBridge_Lab.cfg) | [`11_STP_RootBridge_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/11_STP_RootBridge_Lab.md) |
| **Lab 12** | Port Security | MAC Limit, Sticky MAC & Err-Disable | [`12_Port_Security_Lab.cfg`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/12_Port_Security_Lab.cfg) | [`12_Port_Security_Lab.md`](file:///Users/preetham/Desktop/netsage-ai/packet_tracer_labs/12_Port_Security_Lab.md) |

---

## 🛠️ How to Use These Labs in Cisco Packet Tracer

1. **Open Cisco Packet Tracer**.
2. **Add Devices**: Place the specified router/switch models (e.g. Cisco 2911 / 2960).
3. **Connect Cabling**: Connect interfaces as listed in each lab topology section.
4. **Paste Configuration**:
   - Open device CLI tab.
   - Enter `enable` then `configure terminal`.
   - Copy the baseline or broken configuration from the `.cfg` file and paste directly into the CLI.
5. **Reproduce & Diagnose**:
   - Run the show commands documented in the lab markdown file.
   - Feed the symptoms and show command outputs into **NetSage AI** (`http://localhost:5173/new-diagnosis`).
6. **Apply & Verify Fix**:
   - Apply the recommended remediation commands.
   - Verify connectivity with ping / show commands.
