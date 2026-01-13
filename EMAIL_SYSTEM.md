# M-Clinic Email Notification System

## Overview
Completely rewritten, enterprise-grade email notification system with queue management, automatic retries, connection pooling, and comprehensive error handling.

## 🚀 Key Features

### 1. **Email Queue System**
- Automatic queueing of all outgoing emails
- Background processing with retry logic
- Prevents email blocking during high traffic
- Configurable retry attempts (default: 3)

### 2. **Smart Retry Logic**
- Automatic retry on failure (up to 3 attempts)
- 5-second delay between retries
- Exponential backoff for persistent failures
- Detailed logging of retry attempts

### 3. **Connection Pooling**
- Reuses SMTP connections for better performance
- Configurable max connections (default: 5)
- Automatic connection verification
- Fallback to default transporter on failure

### 4. **Dual Configuration Support**
- **Database Settings**: Dynamic SMTP from System Settings
- **Environment Variables**: Fallback configuration
- Automatic switching between configurations
- Hot-reload of settings without restart

### 5. **Comprehensive Logging**
- Detailed logs for every email operation
- Success/failure tracking
- Queue status monitoring
- Error stack traces for debugging

### 6. **Priority Email Support**
- Critical emails (password reset) bypass queue
- Immediate sending for time-sensitive notifications
- Configurable priority levels

## 📧 Available Email Types

### User Management
- ✅ **Account Creation** - Welcome email with login details
- ✅ **Password Reset** - Secure reset link (priority)
- ✅ **Login Attempt** - Security notification

### Appointments
- ✅ **Appointment Confirmation** - Sent to patient and doctor
- ✅ **Appointment Reminder** - 24h before appointment
- ✅ **Appointment Notification** - Doctor notification

### Financial
- ✅ **Invoice Email** - Invoice details and payment link
- ✅ **Payment Confirmation** - Receipt after successful payment

### System
- ✅ **Test Email** - Configuration testing
- ✅ **Custom Emails** - Template-based sending

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Default SMTP Configuration (Fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=M-Clinic
SMTP_FROM_EMAIL=noreply@mclinic.co.ke

# Frontend URL
FRONTEND_URL=https://portal.mclinic.co.ke
```

### System Settings (Database - Preferred)
Navigate to: **Dashboard → Admin → Settings → Notifications**

Configure:
- SMTP Host
- SMTP Port
- SMTP Username
- SMTP Password
- SMTP Secure (SSL/TLS)
- From Name
- From Email
- Master Toggle (Enable/Disable all emails)

## 🔧 API Endpoints

### Send Test Email
```http
POST /email/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "recipient@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully to recipient@example.com"
}
```

### Get Queue Status
```http
GET /email/queue-status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "queueLength": 5,
  "isProcessing": true,
  "hasCustomTransporter": true
}
```

### Clear Queue (Admin)
```http
POST /email/clear-queue
Authorization: Bearer <token>
```

**Response:**
```json
{
  "cleared": 12
}
```

## 💻 Usage Examples

### Send Account Creation Email
```typescript
await emailService.sendAccountCreationEmail(user, 'patient');
```

### Send Password Reset Email
```typescript
await emailService.sendPasswordResetEmail(user, resetToken);
```

### Send Appointment Confirmation
```typescript
await emailService.sendAppointmentConfirmation(appointment);
```

### Send Invoice
```typescript
await emailService.sendInvoiceEmail(invoice, customer.email);
```

### Send Payment Confirmation
```typescript
await emailService.sendPaymentConfirmation(payment, customer.email);
```

## 🛡️ Error Handling

### Automatic Retry
```
Attempt 1: Failed (Connection timeout)
→ Wait 5s
Attempt 2: Failed (SMTP error)
→ Wait 5s
Attempt 3: Success ✓
```

### Fallback Strategy
```
1. Try custom transporter (from database)
   ↓ (if fails)
2. Try default transporter (from env)
   ↓ (if fails)
3. Log error and retry
```

## 📊 Monitoring

### Queue Status
Monitor email queue in real-time:
```typescript
const status = emailService.getQueueStatus();
console.log(`Queue: ${status.queueLength} emails`);
console.log(`Processing: ${status.isProcessing}`);
```

### Logs
Check application logs for:
- `✓ Email sent successfully: <subject>`
- `Email queued: <subject> → <recipient>`
- `Retrying email (1/3): <subject>`
- `✗ Failed to send email after 3 retries: <subject>`

## 🔐 Security Features

### SSL/TLS Support
- Automatic SSL/TLS detection
- Self-signed certificate support
- Secure connection verification

### Authentication
- All endpoints require JWT authentication
- Admin-only queue management
- Secure credential storage

### Data Protection
- No sensitive data in logs
- Encrypted SMTP credentials
- Secure token handling

## 🎨 Email Templates

Templates located in: `apps/api/src/email/templates/`

### Template Variables
All templates have access to:
- `frontendUrl` - Portal URL
- `currentYear` - Current year
- `supportEmail` - support@mclinic.co.ke
- `supportPhone` - +254 700 448 448
- Custom context variables

### Creating New Templates
1. Create `.hbs` file in `templates/` directory
2. Use Handlebars syntax
3. Include common variables
4. Add method in `EmailService`

Example:
```handlebars
<!DOCTYPE html>
<html>
<head>
    <title>{{subject}}</title>
</head>
<body>
    <h1>Hello {{name}}!</h1>
    <p>{{message}}</p>
    <a href="{{actionUrl}}">Click Here</a>
</body>
</html>
```

## 🚨 Troubleshooting

### Emails Not Sending
1. Check system settings: Email Notifications Enabled = true
2. Verify SMTP credentials
3. Check queue status: `GET /email/queue-status`
4. Review application logs
5. Send test email: `POST /email/test`

### SMTP Authentication Failed
1. Verify username is full email address
2. Use App Password (for Gmail)
3. Check firewall/security settings
4. Try different SMTP port (587 vs 465)

### Emails in Queue Not Processing
1. Check if queue processor is running
2. Verify no errors in logs
3. Clear queue and retry: `POST /email/clear-queue`
4. Restart API service

### Connection Timeout
1. Check SMTP host is reachable
2. Verify port is not blocked
3. Try secure=false for port 587
4. Check network/firewall settings

## 📈 Performance

### Benchmarks
- **Queue Processing**: ~1 email/second
- **Connection Pool**: Up to 5 concurrent connections
- **Retry Delay**: 5 seconds between attempts
- **Max Queue Size**: Unlimited (memory-based)

### Optimization Tips
1. Use connection pooling (enabled by default)
2. Enable email queue (enabled by default)
3. Set appropriate retry limits
4. Monitor queue length
5. Use priority flag for critical emails

## 🔄 Migration from Old System

### Changes
- ✅ Queue system added
- ✅ Automatic retries
- ✅ Better error handling
- ✅ Connection pooling
- ✅ Comprehensive logging
- ✅ Priority email support

### Breaking Changes
- None - Fully backward compatible

### Upgrade Steps
1. Pull latest code
2. Run `npm install` (if dependencies changed)
3. Deploy API: `./deploy-portal.sh`
4. Test email configuration
5. Monitor logs for any issues

## 📞 Support

For issues or questions:
- Email: support@mclinic.co.ke
- Phone: +254 700 448 448
- Check logs: `/var/log/mclinic-api.log`
