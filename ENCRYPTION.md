# M-Clinic Encryption System

## Overview
Robust end-to-end encryption system for secure communication and data protection in the M-Clinic healthcare platform.

## Features

### 🔐 Backend Encryption (Node.js/NestJS)
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with SHA-512 (100,000 iterations)
- **Authentication**: Built-in authentication tags for data integrity
- **Random Components**: Cryptographically secure random salt and IV generation

### 🌐 Frontend Encryption (Web Crypto API)
- **Algorithm**: AES-GCM (256-bit)
- **Browser-Native**: Uses Web Crypto API for optimal performance
- **Zero Dependencies**: No external libraries required
- **Async Operations**: Non-blocking encryption/decryption

## Usage

### Backend (NestJS)

#### Basic Encryption/Decryption
```typescript
import { EncryptionService } from './common/encryption.service';

@Injectable()
export class MyService {
    constructor(private encryptionService: EncryptionService) {}

    async saveSensitiveData(data: string) {
        const secret = process.env.ENCRYPTION_KEY;
        const encrypted = this.encryptionService.encrypt(data, secret);
        // Save encrypted to database
    }

    async retrieveSensitiveData(encrypted: string) {
        const secret = process.env.ENCRYPTION_KEY;
        const decrypted = this.encryptionService.decrypt(encrypted, secret);
        return decrypted;
    }
}
```

#### Encrypt Objects
```typescript
const patient = {
    name: 'John Doe',
    diagnosis: 'Confidential medical info',
    prescription: 'Sensitive prescription data'
};

const encrypted = this.encryptionService.encryptObject(patient, secret);
const decrypted = this.encryptionService.decryptObject<Patient>(encrypted, secret);
```

#### Data Signing (HMAC)
```typescript
const data = JSON.stringify(sensitiveData);
const signature = this.encryptionService.sign(data, secret);

// Verify later
const isValid = this.encryptionService.verify(data, signature, secret);
```

### Frontend (React/Next.js)

#### Basic Usage
```typescript
import { clientEncryption } from '@/lib/encryption';

// Encrypt before sending to server
const encryptedData = await clientEncryption.encrypt(
    'sensitive medical data',
    userPassword
);

// Decrypt received data
const decrypted = await clientEncryption.decrypt(
    encryptedData,
    userPassword
);
```

#### Encrypt Objects
```typescript
const medicalRecord = {
    diagnosis: 'Confidential',
    notes: 'Private notes'
};

const encrypted = await clientEncryption.encryptObject(medicalRecord, password);
const decrypted = await clientEncryption.decryptObject<MedicalRecord>(encrypted, password);
```

#### Generate Secure Tokens
```typescript
const sessionToken = clientEncryption.generateToken(32);
```

## Environment Variables

Add to `.env`:
```env
# Encryption Configuration
ENCRYPTION_KEY=your-super-secret-256-bit-key-change-this-in-production
ENABLE_ENCRYPTION=true
```

## Security Best Practices

### ✅ DO:
- Use environment variables for encryption keys
- Rotate encryption keys periodically
- Use different keys for different environments (dev/staging/prod)
- Store keys in secure key management systems (AWS KMS, Azure Key Vault)
- Use HTTPS for all communications
- Implement proper access controls

### ❌ DON'T:
- Hardcode encryption keys in source code
- Use weak or default keys in production
- Store unencrypted sensitive data in logs
- Share encryption keys via insecure channels
- Reuse keys across different applications

## Data Flow

### Encrypting Sensitive Data (Backend)
```
Plaintext → PBKDF2 Key Derivation → AES-256-GCM Encryption → Base64 Encoding → Storage
```

### Decrypting Data (Backend)
```
Base64 Encoded → Decode → Extract Salt/IV/Tag → PBKDF2 Key Derivation → AES-256-GCM Decryption → Plaintext
```

### Client-Side Encryption
```
User Data → Web Crypto API → AES-GCM Encryption → Base64 → Send to Server
```

## Automatic Encryption with Interceptor

Apply to specific routes:
```typescript
@Controller('medical-records')
@UseInterceptors(EncryptionInterceptor)
export class MedicalRecordsController {
    // Responses automatically encrypted
}
```

Sensitive fields automatically encrypted:
- `medicalHistory`
- `diagnosis`
- `prescription`
- `labResults`
- `personalNotes`
- `idNumber`
- `phoneNumber`
- `address`

## Performance Considerations

- **Backend**: ~1-2ms per encryption/decryption operation
- **Frontend**: ~5-10ms per operation (browser-dependent)
- **Key Derivation**: ~100ms (intentionally slow for security)

## Compliance

This encryption system helps meet:
- ✅ HIPAA (Health Insurance Portability and Accountability Act)
- ✅ GDPR (General Data Protection Regulation)
- ✅ Kenya Data Protection Act
- ✅ ISO 27001 Information Security Standards

## Testing

```typescript
// Test encryption/decryption
const original = 'sensitive data';
const encrypted = encryptionService.encrypt(original, 'test-key');
const decrypted = encryptionService.decrypt(encrypted, 'test-key');
expect(decrypted).toBe(original);
```

## Troubleshooting

### "Decryption failed" Error
- Verify the encryption key matches
- Check if data was corrupted during transmission
- Ensure proper base64 encoding/decoding

### Performance Issues
- Consider caching decrypted data when appropriate
- Use encryption selectively for truly sensitive data
- Implement connection pooling for database operations

## Support

For security concerns or questions:
- Email: security@mclinic.co.ke
- Never share encryption keys via email or chat
