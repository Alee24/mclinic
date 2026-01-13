/**
 * Frontend Encryption Utility for M-Clinic
 * Uses Web Crypto API for secure client-side encryption
 */

class ClientEncryption {
    private algorithm = 'AES-GCM';
    private keyLength = 256;

    /**
     * Generate encryption key from password
     */
    private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        const baseKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-512',
            },
            baseKey,
            { name: this.algorithm, length: this.keyLength },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data using AES-GCM
     */
    async encrypt(plaintext: string, password: string): Promise<string> {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(plaintext);

            // Generate random salt and IV
            const salt = crypto.getRandomValues(new Uint8Array(64));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Derive key
            const key = await this.deriveKey(password, salt);

            // Encrypt
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv,
                },
                key,
                data
            );

            // Combine salt + iv + encrypted data
            const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encrypted), salt.length + iv.length);

            // Convert to base64
            return this.arrayBufferToBase64(combined);
        } catch (error) {
            console.error('[ClientEncryption] Encryption failed:', error);
            throw new Error('Encryption failed');
        }
    }

    /**
     * Decrypt data
     */
    async decrypt(ciphertext: string, password: string): Promise<string> {
        try {
            // Decode from base64
            const combined = this.base64ToArrayBuffer(ciphertext);

            // Extract components
            const salt = combined.slice(0, 64);
            const iv = combined.slice(64, 76);
            const encrypted = combined.slice(76);

            // Derive key
            const key = await this.deriveKey(password, salt);

            // Decrypt
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv,
                },
                key,
                encrypted
            );

            // Convert to string
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('[ClientEncryption] Decryption failed:', error);
            throw new Error('Decryption failed');
        }
    }

    /**
     * Hash data (one-way)
     */
    async hash(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
        return this.arrayBufferToHex(hashBuffer);
    }

    /**
     * Generate secure random token
     */
    generateToken(length: number = 32): string {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Encrypt object (converts to JSON first)
     */
    async encryptObject(obj: any, password: string): Promise<string> {
        const json = JSON.stringify(obj);
        return this.encrypt(json, password);
    }

    /**
     * Decrypt to object
     */
    async decryptObject<T>(ciphertext: string, password: string): Promise<T> {
        const json = await this.decrypt(ciphertext, password);
        return JSON.parse(json) as T;
    }

    // Helper methods
    private arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    private arrayBufferToHex(buffer: ArrayBuffer): string {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}

export const clientEncryption = new ClientEncryption();
