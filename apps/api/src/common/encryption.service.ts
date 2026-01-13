import * as crypto from 'crypto';

/**
 * Robust Encryption Service for M-Clinic
 * Implements AES-256-GCM encryption for secure data transmission
 */
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32; // 256 bits
    private readonly ivLength = 16; // 128 bits
    private readonly saltLength = 64;
    private readonly tagLength = 16;
    private readonly iterations = 100000;

    /**
     * Derive encryption key from master secret using PBKDF2
     */
    private deriveKey(secret: string, salt: Buffer): Buffer {
        return crypto.pbkdf2Sync(
            secret,
            salt,
            this.iterations,
            this.keyLength,
            'sha512'
        );
    }

    /**
     * Encrypt sensitive data
     * @param plaintext - Data to encrypt
     * @param secret - Master encryption key
     * @returns Encrypted data with IV, salt, and auth tag
     */
    encrypt(plaintext: string, secret: string): string {
        try {
            // Generate random salt and IV
            const salt = crypto.randomBytes(this.saltLength);
            const iv = crypto.randomBytes(this.ivLength);

            // Derive key from secret
            const key = this.deriveKey(secret, salt);

            // Create cipher
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);

            // Encrypt data
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Get authentication tag
            const authTag = cipher.getAuthTag();

            // Combine all components: salt + iv + authTag + encrypted
            const result = Buffer.concat([
                salt,
                iv,
                authTag,
                Buffer.from(encrypted, 'hex')
            ]);

            // Return as base64
            return result.toString('base64');
        } catch (error) {
            console.error('[Encryption] Encryption failed:', error);
            throw new Error('Encryption failed');
        }
    }

    /**
     * Decrypt encrypted data
     * @param ciphertext - Encrypted data (base64)
     * @param secret - Master encryption key
     * @returns Decrypted plaintext
     */
    decrypt(ciphertext: string, secret: string): string {
        try {
            // Decode from base64
            const buffer = Buffer.from(ciphertext, 'base64');

            // Extract components
            const salt = buffer.subarray(0, this.saltLength);
            const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
            const authTag = buffer.subarray(
                this.saltLength + this.ivLength,
                this.saltLength + this.ivLength + this.tagLength
            );
            const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);

            // Derive key
            const key = this.deriveKey(secret, salt);

            // Create decipher
            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            decipher.setAuthTag(authTag);

            // Decrypt
            let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('[Encryption] Decryption failed:', error);
            throw new Error('Decryption failed - data may be corrupted or key is incorrect');
        }
    }

    /**
     * Hash sensitive data (one-way)
     * Useful for passwords, tokens, etc.
     */
    hash(data: string): string {
        return crypto.createHash('sha512').update(data).digest('hex');
    }

    /**
     * Generate secure random token
     */
    generateToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Encrypt object (converts to JSON first)
     */
    encryptObject(obj: any, secret: string): string {
        const json = JSON.stringify(obj);
        return this.encrypt(json, secret);
    }

    /**
     * Decrypt to object
     */
    decryptObject<T>(ciphertext: string, secret: string): T {
        const json = this.decrypt(ciphertext, secret);
        return JSON.parse(json) as T;
    }

    /**
     * Verify data integrity using HMAC
     */
    sign(data: string, secret: string): string {
        return crypto.createHmac('sha512', secret).update(data).digest('hex');
    }

    /**
     * Verify HMAC signature
     */
    verify(data: string, signature: string, secret: string): boolean {
        const expectedSignature = this.sign(data, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }
}

export const encryptionService = new EncryptionService();
