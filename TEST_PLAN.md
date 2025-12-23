# Master Test Plan

## 1. Testing Strategy
The testing strategy envisions a pyramid approach:
- **70% Unit Tests**: Low-level logic verification (Jest for Backend, Jest/Testing-Library for Frontend).
- **20% Integration Tests**: API endpoints and Database interactions (Supertest).
- **10% E2E / UI Tests**: Critical user flows (Maestro or Detox for Mobile, Cypress/Playwright for Web).

## 2. Test Scope

### 2.1 Backend Testing (API & Logic)
- **Authentication**: Verify Login, Registration, JWT validity, Role-based access.
- **Booking Logic**:
    - Verify double-booking prevention.
    - Verify slot release on cancellation.
- **Payments**:
    - Mock M-Pesa callbacks to verify status updates.
    - Verify error handling for failed transactions.

### 2.2 Frontend Testing (Mobile & Web)
- **User Interface**: Verify rendering of all components on different screen sizes.
- **Forms**: Validation testing (e.g., verifying phone number formats, required fields).
- **State Management**: Verify Redux/Context updates on user actions.

### 2.3 Security Testing (SAST/DAST)
- **Static Analysis**: Run SonarQube on every commit.
- **Vulnerability Scanning**: Snyk for dependencies.
- **Penetration Testing**: Manual testing for IDOR (Insecure Direct Object References) and Injection attacks.

### 2.4 User Acceptance Testing (UAT)
- **Beta Group**: Testing with a closed group of real doctors and patients.
- **Scenarios**:
    - "Complete a full booking flow and join the video call."
    - "Register as a provider and upload license."

## 3. Automation Tools
- **Unit/Integration**: Jest, Supertest.
- **Mobile E2E**: Detox (React Native).
- **CI Integation**: GitHub Actions pipeline triggering tests on PR.

## 4. Defect Management
- **Reporting**: All bugs logged in Jira/GitHub Issues.
- **Severity Levels**: Critical (Blocker), High (Major feature broken), Medium, Low (UI glitch).
