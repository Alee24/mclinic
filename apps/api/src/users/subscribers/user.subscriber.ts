import {
    EventSubscriber,
    EntitySubscriberInterface,
    UpdateEvent,
    InsertEvent,
    DataSource,
} from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    constructor(
        @InjectDataSource() readonly dataSource: DataSource,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return User;
    }

    /**
     * Called after entity is updated in the database.
     */
    async afterUpdate(event: UpdateEvent<User>) {
        await this.syncDomainEntities(event.entity as User, event.manager);
    }

    /**
     * Called after entity is inserted (for safety, though normally domains are created separately).
     */
    async afterInsert(event: InsertEvent<User>) {
        // Usually auth happens first, then doctor profile is created. 
        // But if auth is created with full details, we might want to sync if domain exists (unlikely on insert).
        // Skipping insert for now as domain profiles are created explicitly.
    }

    private async syncDomainEntities(user: User, manager: any) {
        if (!user) return;
        console.log(`[UserSubscriber] Syncing updates for User ${user.email} (${user.role})...`);

        try {
            if (['doctor', 'medic', 'nurse', 'clinician'].includes(user.role)) {
                // Update Doctor
                const updateData: any = {};
                if (user.fname) updateData.fname = user.fname;
                if (user.lname) updateData.lname = user.lname;
                if (user.mobile) updateData.mobile = user.mobile;
                if (user.address) updateData.address = user.address;
                if (user.profilePicture) updateData.profile_image = user.profilePicture;

                // Only update if we have data
                if (Object.keys(updateData).length > 0) {
                    // Find by Email is safest as user_id might be missing in legacy data
                    await manager.update(Doctor, { email: user.email }, updateData);
                }

            } else if (user.role === UserRole.PATIENT) {
                // Update Patient
                const updateData: any = {};
                if (user.fname) updateData.fname = user.fname;
                if (user.lname) updateData.lname = user.lname;
                if (user.mobile) updateData.mobile = user.mobile;
                if (user.address) updateData.address = user.address;
                if (user.dob) updateData.dob = user.dob; // Patients have DOB

                if (Object.keys(updateData).length > 0) {
                    // Find by Email often works if Patient has email, but Patient entity might rely on user_id
                    // Let's try user_id first if available, else fallback to something else? 
                    // Patient entity has `user_id` and OneToOne relation.
                    if (user.id) {
                        await manager.update(Patient, { user_id: user.id }, updateData);
                    }
                }
            }
        } catch (error) {
            console.error(`[UserSubscriber] Error syncing domain entity:`, error);
            // Don't throw, as we don't want to block the Auth update if sync fails
        }
    }
}
