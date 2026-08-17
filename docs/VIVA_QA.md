# NetSage AI — Technical Viva Preparation (35 Questions & Answers)

Comprehensive technical Q&A covering Full-Stack Development, Network Engineering, Cisco IOS, AI Prompt Engineering, and Responsible AI.

---

### Part 1: Full-Stack Architecture & Development (Q1 – Q10)

#### Q1: What is the high-level architecture of NetSage AI?
**A**: NetSage AI follows a 4-tier microservice architecture: React 18 + Vite frontend, Node.js/Express REST backend, MongoDB persistence with Mongoose, and a dedicated Python Flask microservice for deterministic rule validation.

#### Q2: Why did you use React 18 and Vite for the frontend?
**A**: React 18 provides component-based reusability, fast state management with Hooks, and virtual DOM rendering. Vite provides fast HMR (Hot Module Replacement) and optimized production builds.

#### Q3: Why is the Python Rule Checker a separate microservice?
**A**: Python has rich text parsing and network libraries. Isolating deterministic validation into a separate microservice ensures modularity and enforces that the rule engine runs completely independent of the AI service.

#### Q4: How does the backend communicate with the Python rule checker?
**A**: The Express backend uses an HTTP client (`axios`) to issue POST requests to `http://localhost:5002/check` with a 10-second timeout and automatic fallback to built-in JavaScript rules if the service is unreachable.

#### Q5: How is MongoDB utilized in this application?
**A**: MongoDB stores `TroubleshootingCase` documents (symptoms, show commands, AI diagnosis, rule checker results, review state) and `DiagnosisHistory` documents for immutable audit trails.

#### Q6: How do you prevent Regular Expression Denial of Service (ReDoS) during search?
**A**: In `casesController.js`, all search query strings are sanitized through a custom `escapeRegex()` helper that escapes metacharacters (`(`, `[`, `{`, `*`, `+`, `?`, `|`, `^`, `$`, `\`) before creating MongoDB `$regex` filters.

#### Q7: What security headers and protections are implemented?
**A**: The Express server implements `helmet()` for secure HTTP headers (XSS filter, HSTS, frameguard), strict CORS origin whitelisting, and no shell command execution (`eval`, `exec`).

#### Q8: How is the database seeded?
**A**: Running `npm run seed` executes `backend/utils/seed.js`, populating 35 realistic Cisco troubleshooting cases across 12 network categories and 35 history records.

#### Q9: How is export functionality implemented on Case Detail?
**A**: Client-side Blob generation allows instant export to Markdown (`.md`), raw JSON (`.json`), and tabular CSV (`.csv`), while print styles (`@media print`) enable PDF saving via `window.print()`.

#### Q10: How does the frontend handle loading and error states?
**A**: Pages render animated skeleton loaders during API calls and present informative error cards with retry buttons when endpoints fail.

---

### Part 2: AI & Prompt Engineering (Q11 – Q18)

#### Q11: How does NetSage AI generate AI diagnoses?
**A**: Through `aiDiagnosisService.js`, which supports both real Google Gemini API calls (`gemini-1.5-flash`) with structured JSON schema enforcement, and a comprehensive offline Mock mode.

#### Q12: How does the UI distinguish between Real AI and Mock AI?
**A**: The AI Diagnosis card displays a distinct badge: green for `Real AI` and amber for `Mock AI (Demo Mode)`.

#### Q13: What prompt engineering techniques were used?
**A**: System role definition, strict JSON schema output constraint, explicit prohibition of hallucinated interfaces/IPs, requirement for confidence scoring (0–100), and evidence extraction from show commands.

#### Q14: What is the role of confidence scoring?
**A**: Quantifies AI certainty (e.g. 95% for explicit log matches vs 60% for partial show outputs), helping human reviewers prioritize detailed manual inspection.

#### Q15: Why is AI output never automatically accepted?
**A**: In production networks, applying incorrect configurations can trigger major outages or security vulnerabilities. AI is strictly an advisory copilot; human engineers retain ultimate authority.

#### Q16: What happens if Gemini returns markdown code fences (` ```json `)?
**A**: `aiDiagnosisService.js` includes regex sanitation to strip markdown code fences before calling `JSON.parse()`.

#### Q17: What are the three Human Review decisions?
**A**: **Accept** (AI diagnosis is accurate), **Edit** (engineer amends root cause or fix steps), and **Reject** (AI hallucinated or misidentified root cause).

#### Q18: What is the Responsible AI correction log?
**A**: A dedicated audit log tracking cases where humans corrected AI proposals, measuring agreement rates, error categories, and human feedback.

---

### Part 3: Cisco Networking & Packet Tracer (Q19 – Q35)

#### Q19: What is Router-on-a-Stick (ROAS)?
**A**: A routing configuration where a single physical router interface is partitioned into 802.1Q subinterfaces to route traffic between multiple VLANs over a trunk link.

#### Q20: What show commands diagnose VLAN trunking issues?
**A**: `show interfaces trunk` (verifies mode, encapsulation, and allowed VLANs) and `show vlan brief` (verifies VLAN presence in the database).

#### Q21: What is the purpose of `ip helper-address`?
**A**: It converts client DHCP broadcast DISCOVER packets into unicast packets forwarded to a remote DHCP server across subnets.

#### Q22: What causes an OSPF adjacency to remain stuck in EXSTART/EXCHANGE?
**A**: An interface MTU mismatch between neighbors. OSPF cannot exchange Database Description (DBD) packets larger than the receiving interface's MTU.

#### Q23: What causes an OSPF neighbor not to form at all?
**A**: Area ID mismatch, Hello/Dead interval mismatch, subnet mask mismatch, passive interface, or authentication key mismatch.

#### Q24: What is the difference between eBGP and iBGP?
**A**: eBGP runs between different Autonomous Systems (default TTL=1); iBGP runs within the same Autonomous System and requires `next-hop-self` on edge routers to advertise external routes.

#### Q25: Why is `ebgp-multihop` needed when peering via loopback?
**A**: eBGP packets have a default TTL of 1. Peering with a loopback IP requires TTL > 1 (e.g., `ebgp-multihop 2`) to reach the logical interface.

#### Q26: What is the rule of thumb for Standard vs Extended ACL placement?
**A**: Standard ACLs (filtering by source only) should be placed as close to the **destination** as possible. Extended ACLs (filtering by source, destination, protocol, port) should be placed as close to the **source** as possible.

#### Q27: What is the difference between NAT and PAT (NAT Overload)?
**A**: NAT maps private IPs to public IPs 1-to-1. PAT (NAT Overload) maps multiple private IPs to a single public IP using unique Layer 4 source port numbers.

#### Q28: What is HSRP and what port does it use?
**A**: Hot Standby Router Protocol (HSRP) provides default gateway redundancy. HSRP v1 sends hellos via UDP port 1985 to multicast IP 224.0.0.2.

#### Q29: What happens when an access port with BPDU Guard receives a BPDU?
**A**: BPDU Guard immediately places the interface into the `err-disabled` state to prevent unauthorized switches from altering the Spanning Tree topology.

#### Q30: What is Port Security violation mode "shutdown"?
**A**: When an unauthorized MAC address connects exceeding the maximum allowed limit, the switchport transitions immediately into `err-disabled` (secure-shutdown).

#### Q31: How do you recover an interface from `err-disabled` state?
**A**: By executing `shutdown` followed by `no shutdown` on the interface, or configuring `errdisable recovery cause <cause>`.

#### Q32: What is Native VLAN mismatch?
**A**: When two connected switch trunk ports have different Native VLAN IDs (e.g., VLAN 1 vs VLAN 99), causing untagged frames to leak between VLANs and triggering CDP syslog warnings.

#### Q33: What is DHCP Snooping?
**A**: A Layer 2 security feature that filters untrusted DHCP messages and builds a binding table, dropping rogue DHCP server responses arriving on untrusted ports.

#### Q34: What is Floating Static Route?
**A**: A backup static route configured with a higher Administrative Distance (e.g., AD 130) than dynamic routing protocols (e.g., OSPF AD 110), activating only when the primary route fails.

#### Q35: How does NetSage AI map network faults to OSI Layers?
**A**:
- Layer 2: Access VLANs, Trunks, Native VLAN, STP, Port Security, MAC filtering.
- Layer 3: Subnet masks, Gateways, Static routes, OSPF, BGP, ROAS subinterfaces.
- Layer 4: TCP/UDP ports, Extended ACL port rules, NAT PAT overload port bindings.
- Layer 7: DNS name resolution, DHCP pool options (Option 43/66), HTTP/SSH services.
