import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) { }

  async create(createPatientDto: any, user?: User | null): Promise<User> {
    // Generate a default email if not provided
    const email = createPatientDto.email || `patient${Date.now()}@mclinic.temp`;
    const password = createPatientDto.password || 'Patient123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const patientUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      role: UserRole.PATIENT,
      ...createPatientDto,
    } as DeepPartial<User>);

    const savedUser = await this.usersRepository.save(patientUser);

    // Create Patient Profile entry
    const patientProfile = this.patientsRepository.create({
      user: savedUser,
      user_id: savedUser.id,
      fname: savedUser.fname,
      lname: savedUser.lname,
      mobile: savedUser.mobile,
      dob: savedUser.dob,
      sex: savedUser.sex,
      address: savedUser.address,
      city: savedUser.city,
      latitude: savedUser.latitude,
      longitude: savedUser.longitude,
    });
    await this.patientsRepository.save(patientProfile);

    return savedUser;
  }

  async findAll(): Promise<any[]> {
    const users = await this.usersRepository.find({
      where: { role: UserRole.PATIENT },
    });

    // Fetch all patient profiles to map blood group etc.
    // Optimization: In a real app, use a proper Join or Relation.
    // For now, let's just fetch all profiles and map them in memory or use a query builder if linked.
    // Since there is no relation in Entity, we do separate fetch.
    const profiles = await this.patientsRepository.find();

    return users.map(user => {
      const profile = profiles.find(p => p.user_id === user.id);
      return {
        ...user,
        blood_group: profile?.blood_group,
        genotype: profile?.genotype,
        // Add other fields if needed
      };
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id, role: UserRole.PATIENT },
    });
  }

  async findByUserId(userId: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    let patient = await this.patientsRepository.findOne({
      where: { user_id: userId },
    });

    if (!patient && user) {
      // Create if missing (lazy creation)
      patient = this.patientsRepository.create({
        user_id: user.id,
        fname: user.fname,
        lname: user.lname,
        mobile: user.mobile,
      });
      await this.patientsRepository.save(patient);
    }

    return { user, patient };
  }

  async update(id: number, updateDto: any): Promise<User | null> {

    // Define allowed fields for User entity
    const userFieldsAllowed = [
      'fname', 'lname', 'mobile', 'address', 'city', 'sex', 'dob', 'profilePicture', 'latitude', 'longitude', 'national_id'
    ];

    const medicalFieldsAllowed = [
      'blood_group', 'genotype', 'height', 'weight',
      'allergies', 'medical_history', 'social_history', 'family_history',
      'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
      'insurance_provider', 'insurance_policy_no', 'shif_number', 'subscription_plan',
      'current_medications', 'surgical_history', 'disability_status'
    ];

    const userUpdate: any = {};
    const medicalUpdate: any = {};

    Object.keys(updateDto).forEach(key => {
      if (userFieldsAllowed.includes(key)) {
        userUpdate[key] = updateDto[key];
      } else if (medicalFieldsAllowed.includes(key)) {
        medicalUpdate[key] = updateDto[key];
      }
    });

    if (updateDto.password) {
      userUpdate.password = await bcrypt.hash(updateDto.password, 10);
    }

    // Update User Table if there are valid user fields
    if (Object.keys(userUpdate).length > 0) {
      console.log(`[PATIENTS_SVC] Updating User fields for ID ${id}`, userUpdate);
      await this.usersRepository.update(id, userUpdate);
    }

    // Update Patient Table if there are valid medical fields
    if (Object.keys(medicalUpdate).length > 0) {
      console.log(`[PATIENTS_SVC] Searching for Patient record with user_id ${id}`);
      // Find patient record by user_id = id
      const patient = await this.patientsRepository.findOne({ where: { user_id: id } });

      if (patient) {
        console.log(`[PATIENTS_SVC] Found Patient ID ${patient.id}. Updating medical fields.`, medicalUpdate);
        await this.patientsRepository.update(patient.id, medicalUpdate);
      } else {
        console.log(`[PATIENTS_SVC] Patient record not found for user_id ${id}. Creating new record.`);
        // Create if missing
        const newP = this.patientsRepository.create({
          user_id: id,
          ...medicalUpdate
        });
        await this.patientsRepository.save(newP);
      }
    } else {
      console.log(`[PATIENTS_SVC] No medical fields to update.`);
    }

    // Return the updated user
    return this.findOne(id);
  }

  // DANGER: Clears all patients
  async deleteAll(): Promise<void> {
    await this.patientsRepository.clear();
    // Also delete all users with role patient to keep it clean
    await this.usersRepository.delete({ role: UserRole.PATIENT });
  }

  async processCsvUpload(buffer: Buffer): Promise<{ success: boolean; count: number; errors: string[] }> {
    const content = buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const created = [];
    const errors = [];

    // Expected headers: fname,lname,email,mobile,dob,sex,blood_group,address

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i];
        // Simple split handling quotes roughly
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        const data: any = {};
        headers.forEach((h, idx) => {
          data[h] = values[idx];
        });

        if (!data.fname || !data.email) {
          // simple skip
          continue;
        }

        // Create Patient
        await this.create({
          fname: data.fname,
          lname: data.lname,
          email: data.email,
          mobile: data.mobile,
          dob: data.dob,
          sex: data.sex || 'Male',
          address: data.address,
          city: data.city,
          // Medical fields for profile update
          blood_group: data.blood_group,
          genotype: data.genotype,
          allergies: data.allergies,
          medical_history: data.medical_history,
          password: 'password123' // default
        });

        created.push(data.email);

      } catch (err) {
        errors.push(`Line ${i + 1}: ${err.message}`);
      }
    }

    return { success: true, count: created.length, errors };
  }
}
