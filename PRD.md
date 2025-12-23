# Product Requirements Document (PRD): M-Clinic Platform

## 1. Executive Summary
M-Clinic is a globally compliant, scalable digital healthcare platform designed to bridge the gap between patients and healthcare providers. It facilitates clinic and home visits, ambulance services, and remote care while ensuring strict adherence to data protection laws (Kenya DPA, GDPR, HIPAA).

## 2. User Personas
1.  **Patient**: Seeks convenient medical services, booking, and health tracking.
2.  **Provider (Doctor/Nurse/Specialist)**: distinct credentialing, schedule management, patient notes.
3.  **Administrator**: Platform oversight, compliance audits, user management.
4.  **Partner Service**: Ambulance operators, Pharmacies (future).

## 3. Core Features & Functional Requirements

### 3.1 User Management
- **Patient Registration**: Full bio-data (Name, DOB, Gender, Blood Type, Allergies), 2FA support.
- **Provider Registration**: License upload, Specialty verification, Verification workflow (Admin approval required).
- **KYC/Identity**: Verification integration (e.g., ID upload).

### 3.2 Booking & Services
- **Consultation Types**: In-clinic, Home Visit, Telemedicine (Video/Audio).
- **Specialized Services**:
    - Ambulance Dispatch (GPS-based).
    - Medical Tourism (Packages, Visa assistance info).
    - Care Services (Elderly/Palliative care).
- **Scheduling**: Real-time availability, Calendar sync.

### 3.3 Health Tracking & IoT
- **Medical Device Sync**: Integration with Apple Health, Google Fit, Garmin via API.
- **Female Health**: Period tracker, fertility logs, pregnancy milestones.

### 3.4 Medical Intelligence (AI)
- **Symptom Checker**: AI-driven triage (disclaimer: "Not medical advice").
- **Knowledge Base**: Verified sources (e.g., Mayo Clinic, WHO feeds) - Avoid generative hallucinations for critical info.

### 3.5 Financials
- **Payment Gateways**: M-Pesa (Daraja API), PayPal, Stripe/Visa/Mastercard.
- **Wallet**: Pre-load funds, refunds.
- **Insurance**: Future integration for direct billing.

### 3.6 Multilingual & Localization
- **Languages**: English, Swahili (Primary); French, Arabic (Secondary).
- **Timezones**: Auto-detect.

## 4. User Journeys (High Level)

### Journey A: Emergency Ambulance
1.  Patient selects "Ambulance".
2.  App captures GPS location.
3.  Dispatcher/Driver accepts.
4.  Real-time tracking.
5.  Payment processing (Pre-auth or Post).

### Journey B: Specialist Booking
1.  Patient searches "Cardiologist".
2.  Filters by Rating/Price/Availability.
3.  Views Profile (Credentials Verified).
4.  Selects Slot -> Pays -> Confirmation.
5.  Tele-consult link generated.

## 5. Non-Functional Requirements
- **Performance**: <2s load time.
- **Availability**: 99.9% uptime.
- **Scalability**: Microservices architecture.

## 6. Legal & Disclaimers
> **IMPORTANT**: This platform provides information and connects users to providers. The AI Assistant is for triage only, not diagnosis.
- **Compliance**: Adherence to Kenyan Data Protection Act 2019.
- **Consent**: Explicit opt-in for data sharing (GDPR).
