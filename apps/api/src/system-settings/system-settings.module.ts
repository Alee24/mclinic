import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsController } from './system-settings.controller';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([SystemSetting])],
    providers: [SystemSettingsService],
    controllers: [SystemSettingsController],
    exports: [SystemSettingsService],
})
export class SystemSettingsModule { }
