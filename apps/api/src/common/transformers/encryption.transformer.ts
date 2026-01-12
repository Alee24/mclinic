import { ValueTransformer } from 'typeorm';
import * as crypto from 'crypto';

export class EncryptionTransformer implements ValueTransformer {
    private key: Buffer;

    constructor() {
        // Ensure we have a key. In production, this MUST be set in .env
        const keyString = process.env.ENCRYPTION_KEY || 'MClinicDefaultSecretKeyShouldBeChanged';
        // Create a 32-byte key from the string (SHA-256 ensures consistent 32 bytes)
        this.key = crypto.createHash('sha256').update(keyString).digest();
    }

    to(value: string | null): string | null {
        if (value === null || value === undefined) return value;
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
            let encrypted = cipher.update(value, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            // Format: iv:encryptedContent
            return `${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            console.error('Encryption failed:', error);
            return value;
        }
    }

    from(value: string | null): string | null {
        if (value === null || value === undefined) return value;

        // Attempt to parse format: iv:encryptedContent
        const parts = value.split(':');

        // Fallback: If not in our format (e.g. legacy plain text), return as is
        if (parts.length !== 2) return value;

        try {
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedText = parts[1];
            const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            // If decryption fails (e.g. wrong key or just data looking like our format but isnt), 
            // return original value to be safe.
            // console.warn('Decryption failed, returning original:', error.message);
            return value;
        }
    }
}

export const Encrypt = new EncryptionTransformer();
