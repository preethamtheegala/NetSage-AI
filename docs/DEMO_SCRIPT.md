# NetSage AI — 5–10 Minute Technical Presentation & Demo Script

**Project**: NetSage AI — AI-Powered Network Troubleshooting with Human Review  
**Presenter**: Student / Engineering Intern  
**Target Duration**: 8 Minutes (with 2 minutes Q&A)  

---

## ⏱️ Minute-by-Minute Presentation Timeline

### 0:00 – 1:00: Problem Statement & Motivation
- **Presenter**: "Good morning evaluators. In enterprise network engineering, troubleshooting multi-layer outages involving VLANs, OSPF, BGP, ACLs, and NAT is time-critical. While Large Language Models can rapidly analyze configurations, **autonomous AI in production networking is dangerous**—a single hallucinated command can take down a data center.
- **Solution**: "NetSage AI implements a **Human-in-the-Loop (HITL)** architecture combining AI reasoning, deterministic Python rule checking, and mandatory engineer authorization."

### 1:00 – 2:00: System Architecture
- **Visual**: Show NetSage AI Dashboard and architecture diagram.
- **Presenter**: "Our system is built on a 4-tier microservice architecture:
  1. A modern React 18 + Vite dashboard with real-time analytics.
  2. An Express.js REST API with MongoDB persistence.
  3. A Python Flask microservice performing **deterministic, non-AI rule validation**.
  4. An AI diagnostic service supporting both live Gemini and realistic mock mode."

### 2:00 – 4:00: Creating a Troubleshooting Case
- **Visual**: Click **New Diagnosis** on `http://localhost:5173`.
- **Action**: Select `VLAN` category, enter severity `High`, and paste `show interfaces trunk`, `show vlan brief`, and `show ip route`.
- **Presenter**: "Here we submit a real Packet Tracer troubleshooting case: PC in VLAN 10 cannot communicate with server in VLAN 30."

### 4:00 – 5:00: AI Diagnosis & Confidence Scoring
- **Visual**: Click **Run Diagnosis**. Show the side-by-side AI Diagnosis Card.
- **Presenter**: "In under 10 milliseconds, NetSage AI accurately identifies that subinterface Gi0/0.30 is missing on the router and VLAN 30 is excluded from the trunk link. Notice the confidence score of 90% and specific citations of evidence directly from the show commands."

### 5:00 – 6:00: Deterministic Rule Checker
- **Visual**: Scroll to the **Rule Checker Results** card with green/red badges.
- **Presenter**: "Crucially, here is our **Python Rule Checker**. This is NOT AI—it is pure deterministic regex and logic checking that validates trunk encapsulation and IP subnets. Both engines agree on the fault."

### 6:00 – 7:00: Human Review Portal (Accept / Edit / Reject)
- **Visual**: Navigate to **Human Review** page.
- **Presenter**: "The AI cannot approve its own diagnosis. The case enters `Awaiting Review`. As the network engineer, I can **Accept**, **Edit** to amend commands, or **Reject** if the AI hallucinated. I approve the diagnosis and enter my reviewer notes."

### 7:00 – 8:00: Fix, Verification & Responsible AI
- **Visual**: Return to **Case Detail**, click **Mark as Fixed** and **Mark Verified**. Then open **Responsible AI**.
- **Presenter**: "Once the fix is applied in the lab, we mark the case verified. On our **Responsible AI dashboard**, we maintain a full audit trail of cases where human engineers had to correct the AI—such as correcting an OSPF MTU mismatch or a standard ACL placement error."

### 8:00 – 10:00: Conclusion & Q&A
- **Presenter**: "NetSage AI proves that AI is most powerful not when replacing human engineers, but when empowering them with verified evidence. Thank you, and I welcome your questions!"
