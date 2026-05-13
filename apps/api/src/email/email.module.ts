import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationLog } from '../notification/entities/communication-log.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CommunicationLog]),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get('SMTP_HOST'),
                    port: config.get('SMTP_PORT'),
                    secure: config.get('SMTP_SECURE') === 'true',
                    auth: {
                        user: config.get('SMTP_USER'),
                        pass: config.get('SMTP_PASS'),
                    },
                    pool: true,
                    name: 'mclinic.co.ke',
                    tls: {
                        rejectUnauthorized: false
                    }
                },
                defaults: {
                    from: `"${config.get('SMTP_FROM_NAME')}" <${config.get('SMTP_FROM_EMAIL')}>`,
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
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
