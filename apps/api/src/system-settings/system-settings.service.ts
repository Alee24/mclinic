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

    async set(key: string, value: string, description?: string, isSecure = false): Promise<SystemSetting> {
        const setting = this.settingsRepo.create({ key, value, description, isSecure });
        return await this.settingsRepo.save(setting);
    }

    async getAll(): Promise<SystemSetting[]> {
        return await this.settingsRepo.find();
    }

    async getAllPublic(): Promise<SystemSetting[]> {
        return await this.settingsRepo.find({ where: { isSecure: false } });
    }

    // Helper for bulk updates
    async updateSettings(settings: { key: string; value: string }[]) {
        const results = [];
        for (const s of settings) {
            results.push(await this.set(s.key, s.value));
        }
        return results;
    }
}
