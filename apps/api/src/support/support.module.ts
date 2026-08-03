import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportRequest } from './entities/support-request.entity';

// NotificationModule is @Global() — available app-wide from AppModule.
// SmsModule is exported by NotificationModule — also available globally.
// No need to import either here.
@Module({
    imports: [
        TypeOrmModule.forFeature([SupportRequest]),
    ],
    controllers: [SupportController],
    providers: [SupportService]
})
export class SupportModule { }
