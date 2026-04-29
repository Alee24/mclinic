import { AppDataSource } from '../data-source';
import { AmbulancePackage } from '../ambulance/entities/ambulance-package.entity';

async function run() {
    await AppDataSource.initialize();
    
    const packageRepo = AppDataSource.getRepository(AmbulancePackage);
    
    const packages = [
        {
            name: 'Individual Subscription',
            description: 'Full coverage for one person for one year.',
            price: 3000,
            commission: 3000,
            validity_days: 365,
            max_adults: 1,
            max_children: 0,
            features: ['Air Evacuation', 'Ground Ambulance', '24/7 Support'],
        },
        {
            name: 'Family Package',
            description: 'Coverage for parents and up to 4 children.',
            price: 6000,
            commission: 6000,
            validity_days: 365,
            max_adults: 2,
            max_children: 4,
            features: ['Air Evacuation', 'Ground Ambulance', 'Home Medical Support'],
        },
        {
            name: 'Parents Package',
            description: 'Specialized coverage for elderly parents.',
            price: 2500,
            commission: 2500,
            validity_days: 365,
            max_adults: 2,
            max_children: 0,
            features: ['Geriatric Care Transport', 'Priority Dispatch'],
        },
        {
            name: 'Students Package',
            description: 'Coverage for students (min 150 students).',
            price: 800,
            commission: 800,
            validity_days: 365,
            is_group_package: true,
            min_members: 150,
            features: ['Emergency Campus Dispatch', 'Sporting Event Support'],
        },
        {
            name: 'Corporate Package',
            description: 'Coverage for company members (min 150 members).',
            price: 700,
            commission: 700,
            validity_days: 365,
            is_group_package: true,
            min_members: 150,
            features: ['Workplace Emergency Resp', 'Executive Transport'],
        },
        {
            name: 'Instant Dispatch',
            description: 'Immediate one-off emergency ambulance dispatch.',
            price: 7000,
            commission: 8000,
            validity_days: 1,
            features: ['Immediate Response', 'Advanced Life Support'],
        },
    ];

    for (const p of packages) {
        let existing = await packageRepo.findOne({ where: { name: p.name } });
        if (existing) {
            Object.assign(existing, p);
            await packageRepo.save(existing);
            console.log(`Updated package: ${p.name}`);
        } else {
            await packageRepo.save(packageRepo.create(p));
            console.log(`Created package: ${p.name}`);
        }
    }

    // Also update system settings
    await AppDataSource.query("UPDATE system_setting SET `value` = '7000' WHERE `key` = 'FEE_AMBULANCE_BASE'");
    console.log('Updated FEE_AMBULANCE_BASE setting');

    await AppDataSource.destroy();
}

run().catch(console.error);
