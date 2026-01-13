import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get('SMTP_HOST') || 'smtp.gmail.com',
                    port: parseInt(config.get('SMTP_PORT') || '587', 10),
                    secure: config.get('SMTP_SECURE') === 'true',
                    auth: {
                        user: config.get('SMTP_USER'),
                        pass: config.get('SMTP_PASS'),
                    },
                    tls: {
                        rejectUnauthorized: false, // Allow self-signed certificates
                    },
                    pool: true, // Use connection pooling
                    maxConnections: 5,
                    maxMessages: 100,
                },
                defaults: {
                    from: `"${config.get('SMTP_FROM_NAME') || 'M-Clinic'}" <${config.get('SMTP_FROM_EMAIL') || 'noreply@mclinic.co.ke'}>`,
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: false, // Allow missing variables
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [EmailController],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule { }
