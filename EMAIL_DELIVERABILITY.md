# M-Clinic Email Deliverability & Anti-Spam Implementation

This document outlines the technical measures implemented to ensure M-Clinic emails land in the **Inbox** instead of the Spam folder.

## 1. Technical Enhancements (Implemented)

### A. Multi-Part Emails (HTML + Text Fallback)
Spam filters often flag emails that only contain HTML. I have implemented an automatic **Text Fallback** generator. If an email is sent as HTML, the system automatically strips the tags and creates a plain-text version to satisfy strict filters.

### B. List-Unsubscribe Headers
I have added standard `List-Unsubscribe` headers to all outgoing emails. This allows modern email clients (Gmail, Outlook) to show a "Unsubscribe" button at the top, which significantly increases sender reputation and reduces "Mark as Spam" actions.

### C. Professional Footers
Updated templates now include:
- Registered physical address and contact info.
- Explicit Unsubscribe links.
- "Sent to [User]" personalization (reduces bulk-mail suspicion).

### D. SMTP Hardening
- **TLS 1.2+ Enforcement**: Ensures all emails are encrypted during the SMTP handshake.
- **Connection Pooling**: Reduces the number of handshakes by reusing connections, preventing the server from being flagged as "aggressive."

## 2. DNS Authentication (Required Action)
To achieve 100% deliverability, you MUST configure your DNS (e.g., Cloudflare, GoDaddy) with the following records for `mclinic.co.ke`:

### A. SPF (Sender Policy Framework)
Add a TXT record to allow your VPS to send mail:
- **Type**: `TXT`
- **Host**: `@`
- **Value**: `v=spf1 ip4:YOUR_VPS_IP include:_spf.google.com ~all`
*(Replace YOUR_VPS_IP with your server's IP)*

### B. DKIM (DomainKeys Identified Mail)
The code is now ready for DKIM. 
1. Generate a DKIM key on your VPS (e.g., using `opendkim`).
2. Add the public key to your DNS as a TXT record (usually `default._domainkey`).
3. Add the private key to your `.env` file:
   - `DKIM_DOMAIN=mclinic.co.ke`
   - `DKIM_KEY_SELECTOR=default`
   - `DKIM_PRIVATE_KEY="-----BEGIN PRIVATE KEY----- ..."`

### C. DMARC Policy
Add a policy to tell providers you are serious about security:
- **Type**: `TXT`
- **Host**: `_dmarc`
- **Value**: `v=DMARC1; p=quarantine; rua=mailto:notifications@mclinic.co.ke`

## 3. Sender Reputation Tips
1. **Match the "From" Address**: Ensure `SMTP_FROM_EMAIL` in your settings matches the domain `mclinic.co.ke`.
2. **Warm-up**: If sending thousands of emails suddenly, start slowly to "warm up" the IP reputation.
3. **Avoid Spam Keywords**: Avoid using "FREE", "URGENT!!!", or excessive exclamation marks in subjects.

---
*Status: Deliverability infrastructure active as of May 06, 2026.*
