# NetSage AI — Python Deterministic Rule Checker Specification

**Microservice**: Python Flask Rule Engine  
**Port**: `5002`  
**Classification**: `DETERMINISTIC RULE-BASED VALIDATION — NOT AI`  

---

## 🎯 Purpose & Philosophy

The Python Rule Checker operates as an independent, deterministic second opinion alongside heuristic AI models.
- **100% Deterministic**: Given identical Cisco show outputs, it produces the exact same pass/warning/fail verdicts every time.
- **Zero Hallucination Risk**: Evaluates explicit regex patterns and mathematical subnet boundaries.
- **Non-AI Labeling**: Strictly labeled in the UI as **Deterministic Validation — NOT AI** to maintain ethical transparency.

---

## 🧩 Rule Modules Overview

### 1. `ip_rules.py`
- `check_duplicate_ips`: Detects duplicate IPv4 addresses across show command outputs.
- `check_subnet_masks`: Flags non-contiguous or invalid subnet masks (e.g. `255.0.255.0`).

### 2. `interface_rules.py`
- `check_interface_status`: Detects `administratively down`, `down/down`, and `err-disabled` states on Cisco physical and logical interfaces.

### 3. `vlan_rules.py`
- `check_vlan_configuration`: Verifies VLAN database membership in `show vlan brief`.
- `check_trunk_configuration`: Parses `show interfaces trunk` for `trunking` status, encapsulation, and allowed VLAN ranges.

### 4. `routing_rules.py`
- `check_routing_table`: Validates presence of destination subnets in `show ip route`.
- `check_default_route`: Confirms existence of `0.0.0.0/0` Gateway of Last Resort.

### 5. `acl_rules.py`
- `check_acl_rules`: Scans `show access-lists` for explicit `deny` lines with active packet match counters.

### 6. `dhcp_rules.py`
- `check_dhcp_configuration`: Checks for `ip helper-address` directives on routed interfaces and parses DHCP pool binding counts.

### 7. `nat_rules.py`
- `check_nat_configuration`: Verifies `ip nat inside` / `outside` interface roles and checks translation table bindings.

---

## 📡 API Endpoints

- **`GET /health`**:
  ```json
  {
    "status": "ok",
    "service": "NetSage AI Python Rule Checker",
    "version": "1.0.0",
    "label": "Deterministic Rule-Based Validation — NOT AI"
  }
  ```

- **`POST /check`**:
  Accepts case symptoms, topology notes, and show command outputs; returns structured checks with `overall_status` (`pass`, `warning`, `fail`).
