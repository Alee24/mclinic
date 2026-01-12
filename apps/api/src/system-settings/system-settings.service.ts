import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class SystemSettingsService {
    constructor(
        @InjectRepository(SystemSetting)
        private settingsRepo: Repository<SystemSetting>,
    ) { }

    async get(key: string): Promise<string | null> {
        const setting = await this.settingsRepo.findOne({ where: { key } });
        return setting ? setting.value : null;
    }

    async set(key: string, value: string, description?: string, isSecure?: boolean) {
        let setting = await this.settingsRepo.findOne({ where: { key } });
        if (!setting) {
            setting = this.settingsRepo.create({ key, value, description, isSecure });
        } else {
            setting.value = value;
            if (description !== undefined) setting.description = description;
            if (isSecure !== undefined) setting.isSecure = isSecure;
        }
        return this.settingsRepo.save(setting);
    }

    async getAll() {
        return this.settingsRepo.find();
    }

    async updateSettings(settings: { key: string; value: string }[]) {
        for (const s of settings) {
            await this.settingsRepo.update({ key: s.key }, { value: s.value });
        }
        return { success: true };
    }
}
