import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';

/**
 * Interceptor to automatically encrypt sensitive response data
 * Use @UseInterceptors(EncryptionInterceptor) on controllers/routes
 */
@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
    private readonly encryptionKey: string;
    private readonly enabled: boolean;

    constructor(
        private readonly encryptionService: EncryptionService,
        private readonly configService: ConfigService,
    ) {
        this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-change-in-production';
        this.enabled = this.configService.get<string>('ENABLE_ENCRYPTION') === 'true';
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (!this.enabled) {
            return next.handle();
        }

        return next.handle().pipe(
            map(data => {
                // Skip encryption for certain response types
                if (!data || typeof data !== 'object') {
                    return data;
                }

                // Check if response has sensitive data marker
                if (data._encrypted) {
                    return data;
                }

                // Encrypt sensitive fields
                return this.encryptSensitiveFields(data);
            }),
        );
    }

    private encryptSensitiveFields(data: any): any {
        const sensitiveFields = [
            'medicalHistory',
            'diagnosis',
            'prescription',
            'labResults',
            'personalNotes',
            'idNumber',
            'phoneNumber',
            'address',
        ];

        if (Array.isArray(data)) {
            return data.map(item => this.encryptSensitiveFields(item));
        }

        if (typeof data === 'object' && data !== null) {
            const encrypted = { ...data };

            for (const field of sensitiveFields) {
                if (encrypted[field] && typeof encrypted[field] === 'string') {
                    try {
                        encrypted[field] = this.encryptionService.encrypt(
                            encrypted[field],
                            this.encryptionKey,
                        );
                        encrypted[`${field}_encrypted`] = true;
                    } catch (error) {
                        console.error(`[Encryption] Failed to encrypt field: ${field}`, error);
                    }
                }
            }

            return encrypted;
        }

        return data;
    }
}
