# Compliance & Security Strategy

## 1. Compliance Checklist

### 1.1 Kenyan Data Protection Act (2019)
- [ ] **Data Controller Registration**: Register with the Office of the Data Protection Commissioner (ODPC).
- [ ] **Consent**: Explicit, informed consent for data collection (checkboxes, clear privacy policy).
- [ ] **Data Localization**: Critical health data should arguably be hosted within Kenya or in jurisdictions with adequate protection.
- [ ] **Subject Rights**: Mechanism for users to request data access, correction, or deletion.

### 1.2 HIPAA (Health Insurance Portability and Accountability Act)
*Applicable if serving US patients or integrating with US entities.*
- [ ] **BAA (Business Associate Agreement)**: Signed with all cloud providers (AWS/GCP/Azure).
- [ ] **PHI Encryption**: All Protected Health Information encrypted at rest and in transit.
- [ ] **Audit Controls**: Immutable logs of who accessed what record and when.

### 1.3 GDPR (General Data Protection Regulation)
*Applicable for EU users.*
- [ ] **Right to be Forgotten**: Automated deletion workflows.
- [ ] **Data Portability**: Users can download their medical history in a standard format (e.g., PDF/JSON/FHIR).

### 1.4 PCI-DSS (Payment Card Industry Data Security Standard)
- [ ] **Payment Handling**: Offload all card processing to PCI-compliant gateways (Stripe/PayPal/DPO).
- [ ] **No Card Storage**: Do not store CVV or full card numbers on local servers.

## 2. Technical Security Architecture

### 2.1 Encryption
- **Data at Rest**: AES-256 encryption for database columns containing sensitive data (Bio-data, Medical Notes).
- **Data in Transit**: TLS 1.3 for all API communication.
- **Key Management**: Use AWS KMS or HashiCorp Vault for managing encryption keys; never hardcode keys.

### 2.2 Authentication & Authorization
- **Identity Provider**: Keycloak or Auth0 for centralized identity management.
- **MFA (Multi-Factor Authentication)**: Mandatory for Providers and Admins (SMS/TOTP).
- **RBAC (Role-Based Access Control)**: Strict separation of duties (e.g., Nurses cannot delete records).

### 2.3 Secure Data Exchange (FHIR)
- **Standard**: Fast Healthcare Interoperability Resources (FHIR) R4.
- **Implementation**: Use a FHIR server (e.g., HAPI FHIR or Azure FHIR) to standardize patient data for interoperability with hospitals and wearables.

## 3. Disaster Recovery & Backups
- **RPO/RTO**: Define Recovery Point Objective (1 hour) and Recovery Time Objective (4 hours).
- **Offsite Backups**: Encrypted backups stored in a different geographic region.
