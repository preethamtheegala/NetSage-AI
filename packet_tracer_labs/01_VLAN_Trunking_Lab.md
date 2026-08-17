# Lab 01: Inter-VLAN Routing & 802.1Q Trunking

## 🎯 Lab Overview
Troubleshoot inter-VLAN communication failure between PC1 in VLAN 10 and Server1 in VLAN 30 across an 802.1Q trunk link and a Router-on-a-Stick (ROAS) subinterface setup.

---

## 📐 Topology & Device Addressing

```
[PC1: 192.168.10.10/24] (Fa0/1, VLAN 10)
        │
     [SW1] ───(Trunk Gi0/1)─── [R1: Gi0/0]
        │
[Server: 192.168.30.10/24] (Fa0/24, VLAN 30)
```

| Device | Interface | IP Address | Subnet Mask | Default Gateway | VLAN / Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PC1** | FastEthernet0 | 192.168.10.10 | 255.255.255.0 | 192.168.10.1 | VLAN 10 (Student) |
| **Server** | FastEthernet0 | 192.168.30.10 | 255.255.255.0 | 192.168.30.1 | VLAN 30 (Server) |
| **SW1** | Gi0/1 | N/A | N/A | N/A | 802.1Q Trunk to R1 |
| **R1** | Gi0/0.10 | 192.168.10.1 | 255.255.255.0 | N/A | VLAN 10 Gateway |
| **R1** | Gi0/0.20 | 192.168.20.1 | 255.255.255.0 | N/A | VLAN 20 Gateway |
| **R1** | Gi0/0.30 | 192.168.30.1 | 255.255.255.0 | N/A | VLAN 30 Gateway *(Missing)* |

---

## 🔍 Diagnostic Commands
```cisco
SW1# show vlan brief
SW1# show interfaces trunk
R1# show ip interface brief
R1# show ip route
```

---

## 🛠️ Step-by-Step Remediation

1. **Add VLAN 30 to Trunk on Switch SW1**:
   ```cisco
   SW1# configure terminal
   SW1(config)# interface GigabitEthernet0/1
   SW1(config-if)# switchport trunk allowed vlan add 30
   SW1(config-if)# end
   ```

2. **Configure VLAN 30 Subinterface on Router R1**:
   ```cisco
   R1# configure terminal
   R1(config)# interface GigabitEthernet0/0.30
   R1(config-subif)# encapsulation dot1Q 30
   R1(config-subif)# ip address 192.168.30.1 255.255.255.0
   R1(config-subif)# end
   ```

3. **Verify Connectivity**:
   ```cisco
   PC1> ping 192.168.30.10
   ! Expected Output: Reply from 192.168.30.10: bytes=32 time<1ms TTL=127
   ```
