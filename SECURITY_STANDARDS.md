# M-Clinic Security Standards & Implementation

This document outlines the security measures implemented to ensure that all data is encrypted at rest, secure in transit, and that the system is protected against common vulnerabilities.

## 1. Data Encryption at Rest (Database)
We use **AES-256-CBC** encryption for all Personally Identifiable Information (PII) stored in the database.

### Implementation Details:
- **Transformer Logic**: A custom `EncryptionTransformer` is applied to sensitive columns in TypeORM entities.
- **Encrypted Fields**:
  - **Users**: First Name, Last Name, Mobile, Date of Birth, National ID, License Number, Specialization, Bio, Address.
  - **Patients**: First Name, Last Name, Mobile, Date of Birth, Emergency Contact Info, Allergies, Medical History, Genotype, Insurance Policy Numbers.
  - **Doctors**: First Name, Last Name, Mobile, Date of Birth, National ID, Address, Qualification, About, License Numbers.
- **Key Management**: The encryption key is derived from the `ENCRYPTION_KEY` environment variable using SHA-256. If the key is lost, encrypted data cannot be recovered.

## 2. Data in Transit (Network)
To ensure data is "100% safe" during transit, we enforce strict TLS/SSL protocols.

### Measures:
- **SSL Enforcement**: All traffic is proxied through Apache with Let's Encrypt SSL certificates.
- **HSTS (HTTP Strict Transport Security)**: The server instructs browsers to only interact via HTTPS.
- **Secure Headers**: Using **Helmet.js**, we implement:
  - `Content-Security-Policy`: Prevents XSS by restricting source of scripts/styles.
  - `X-Frame-Options`: Prevents Clickjacking.
  - `X-Content-Type-Options`: Prevents MIME-sniffing.
  - `Referrer-Policy`: Restricts referrer information sent with requests.

## 3. Application Security (API)
The NestJS backend is hardened with industry-standard security middleware.

### Features:
- **Rate Limiting (Throttling)**: Implemented using `@nestjs/throttler`. Limits requests to 100 per minute per IP to prevent Brute-Force and DoS attacks.
- **JWT Authentication**: All sensitive endpoints require a valid JSON Web Token. Tokens are signed with a unique secret and have expiration times.
- **CORS Configuration**: Restricts API access to authorized domains only.
- **Validation Pipes**: All incoming data is sanitized and validated against DTOs using `class-validator` to prevent injection attacks.

## 4. DevOps & Infrastructure Security
- **Docker Isolation**: Services run in isolated containers with limited privileges.
- **Environment Safety**: Sensitive credentials (DB passwords, API keys, Encryption secrets) are never committed to version control and are managed via `.env` files.
- **Automated Startup Checks**: The system verifies database schema integrity and essential security columns on every startup.

## 5. Required Actions for Administrators
1. **Change Default Secrets**: Ensure `ENCRYPTION_KEY` and `JWT_SECRET` in `apps/api/.env` are changed to strong, unique strings.
2. **Firewall**: Ensure the VPS firewall (UFW) only allows ports 80, 443, and 22 (SSH).
3. **Regular Backups**: Use the provided `backup-live-database.sh` script to maintain encrypted off-site backups.

---
*Status: All measures active as of May 06, 2026.*
