# NetSage AI — Flagship Live Demonstration Scenario

**Selected Scenario**: Multi-VLAN Inter-VLAN Routing & 802.1Q Trunking Failure  
**Target Duration**: 5–8 minutes  
**Target Audience**: Cisco Internship Evaluators, Technical Reviewers, College Faculty  

---

## 🎯 Scenario Overview

A student in **VLAN 10** (Student Subnet: `192.168.10.0/24`) cannot submit an exam file to the local **VLAN 30** internal grading server (`192.168.30.10`).

- The student PC can ping its local gateway `192.168.10.1`.
- However, pinging the server `192.168.30.10` results in `Request timed out`.
- Network admin gathers show commands from Switch `SW1` and Router `R1`.

---

## 🔄 End-to-End Demonstration Steps

```
[Broken Network State in Lab]
             ↓
[1. Open NetSage AI Dashboard] ──────────▶ (Show 35+ cases, agreement rates)
             ↓
[2. Click 'New Diagnosis'] ──────────────▶ (Select VLAN, enter symptoms & show commands)
             ↓
[3. Click 'Run Full Diagnosis'] ─────────▶ (AI diagnoses ROAS fault; Python Rule Checker verifies trunk)
             ↓
[4. Inspect Evidence & Side-by-Side View]
             ↓
[5. Click 'Human Review'] ───────────────▶ (Reviewer authorizes / amends fix steps)
             ↓
[6. Apply Fix Commands on Cisco Router/Switch]
             ↓
[7. Verify Ping in Packet Tracer]
             ↓
[8. Click 'Mark as Fixed' & 'Mark Verified']
             ↓
[9. Check Dashboard & Responsible AI Log] ─▶ (Show live audit metrics updating)
             ↓
[10. Click 'Export Case Report (PDF/MD)']
```

---

## 📋 Exact Show Commands to Paste During Demo

### Command 1: `show interfaces trunk`
```text
Port        Mode         Encapsulation  Status        Native vlan
Gi0/0       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/0       1-29,31-4094

Port        Vlans allowed and active in management domain
Gi0/0       1,10,20
```

### Command 2: `show vlan brief`
```text
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    
10   STUDENT                          active    Fa0/1, Fa0/2
20   FACULTY                          active    Fa0/3, Fa0/4
30   SERVER                           active    Fa0/24
```

### Command 3: `show ip route`
```text
Codes: C - connected, L - local
Gateway of last resort is not set

      192.168.10.0/24 is variably subnetted
C     192.168.10.0/24 is directly connected, GigabitEthernet0/0.10
L     192.168.10.1/32 is directly connected, GigabitEthernet0/0.10
      192.168.20.0/24 is variably subnetted
C     192.168.20.0/24 is directly connected, GigabitEthernet0/0.20
L     192.168.20.1/32 is directly connected, GigabitEthernet0/0.20
```

---

## 🛠️ Remediation Commands Applied
```cisco
! On Switch SW1:
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport trunk allowed vlan add 30

! On Router R1:
R1(config)# interface GigabitEthernet0/0.30
R1(config-subif)# encapsulation dot1Q 30
R1(config-subif)# ip address 192.168.30.1 255.255.255.0
```

---

## 💡 Key Talking Points for Judges
1. **AI Acceleration**: Reduced diagnostic time from 20 minutes to under 5 seconds.
2. **Deterministic Dual-Check**: Python rule engine independently confirmed trunk allowed exclusion.
3. **Accountability**: AI suggested the fix, but a human engineer made the authorization decision.
4. **Responsible AI**: System maintains a transparent log of all human corrections to evaluate model drift.
