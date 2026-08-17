# NetSage AI — Responsible AI & Human Correction Specification

## 🎯 The Core Problem: Why AI Needs Oversight

In production enterprise networks, Large Language Models and heuristics are susceptible to common failure modes:
1. **Misattributing Layers**: Blaming Layer 2 (VLANs) when the issue is Layer 3 (Routing), or vice-versa.
2. **Missing Bidirectional Paths**: Recommending a route for forward traffic while omitting return routes.
3. **Overlooking Critical Context**: Suggesting a port access VLAN when the device is a multi-SSID Access Point requiring an 802.1Q trunk.
4. **Dangerous CLI Suggestions**: Proposing `clear ip bgp *` or `permit any any` on firewall interfaces.

NetSage AI addresses these risks with a **Responsible AI Governance Framework**.

---

## 📊 Responsible AI Metrics Tracked

1. **AI-Human Agreement Rate**: Percentage of AI proposals accepted by engineers without modification.
2. **AI Correction Rate**: Frequency with which engineers had to edit or reject AI proposals.
3. **Discrepancy Log**: Side-by-side comparison of the original AI hypothesis vs the engineer's authorized solution.
4. **Reason AI Was Wrong**: Mandatory rationale provided by engineers whenever an AI suggestion is amended or rejected.

---

## 🛠️ The 8 Pre-Seeded AI Correction Case Studies

| Case ID / Title | Category | Initial AI Error | Human Review Decision | Human Technical Correction |
| :--- | :--- | :--- | :---: | :--- |
| **Case 4**: VTP Pruning Stripping VLAN 50 | VLAN | AI claimed VTP domain name/password mismatch. | **Edited** | VTP domain is working; dynamic VTP pruning dropped VLAN 50 because no active access ports were assigned. |
| **Case 6**: HSRP Split-Brain | Gateway | AI guessed HSRP group ID mismatch. | **Edited** | Extended ACL 100 on standby router was denying HSRP UDP port 1985 multicast packets. |
| **Case 9**: Missing IP Helper-Address | DHCP | AI hallucinated DHCP server crash & firewall block. | **Rejected** | Subinterface Gi0/0.30 simply lacked `ip helper-address 10.0.0.5`. |
| **Case 13**: Static Route Missing to HQ | Routing | AI configured forward route on branch only. | **Edited** | Routing is bidirectional; HQ router R1 also required return route for branch LAN. |
| **Case 18**: OSPF Stuck in EXSTART | Routing | AI blamed OSPF Network Type mismatch. | **Rejected** | Interface MTU mismatch (1500 vs 1400) caused Database Description (DBD) packets to drop. |
| **Case 21**: BGP Route Not Advertised | Routing | AI suggested clearing BGP sessions. | **Edited** | BGP network command specified `/8` mask while RIB had `/24`; mask must match RIB exactly. |
| **Case 25**: Standard ACL Near Source | ACL | AI suggested adding `permit any` to standard ACL. | **Edited** | Standard ACLs filter source only; filtering specific destination at source requires Extended ACL. |
| **Case 29**: Wireless Client DHCP Failure | Wireless | AI changed AP switchport to access VLAN 40. | **Edited** | AP serves both Corp and Guest SSIDs and strictly requires an 802.1Q trunk port. |
