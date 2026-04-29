import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Invoice } from '../financial/entities/invoice.entity';
import { Transaction } from '../financial/entities/transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import AdmZip from 'adm-zip';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class MigrationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private dataSource: DataSource,
  ) {}

  async clearDatabase() {
    // Use a query runner to ensure we use the SAME connection for all queries
    // This is critical for SET FOREIGN_KEY_CHECKS to apply to the subsequent commands
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('[MIGRATION] Starting Database Clear...');

      // Disable foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

      // List of tables to clear
      // Order doesn't strictly matter with FK checks off, but good practice to follow dependency
      const tables = [
        'doctor_specialities', // Pivot table
        'invoice_items',
        'invoices',
        'transactions',
        'wallets',
        'service_prices',
        'payment_configs',
        'appointments',
        'doctor_schedules',
        'doctor_licences',
        'reviews',
        'medical_records',
        'doctors',
        'departments',
        'specialities',
        'locations',
        'services',
        'users',
      ];

      for (const table of tables) {
        try {
          console.log(`[MIGRATION] Clearing table: ${table}`);
          // Use TRUNCATE as it resets auto-increment and is faster
          await queryRunner.query(`TRUNCATE TABLE ${table}`);
        } catch (e: any) {
          // Ignore if table doesn't exist
          if (e.errno === 1146 || e.code === 'ER_NO_SUCH_TABLE') {
            console.log(
              `[MIGRATION] Table ${table} does not exist. Skipping...`,
            );
            continue;
          }

          console.warn(
            `[MIGRATION] TRUNCATE failed for ${table}, trying DELETE. Error: ${e.message}`,
          );
          try {
            await queryRunner.query(`DELETE FROM ${table}`);
          } catch (delErr: any) {
            if (delErr.errno === 1146 || delErr.code === 'ER_NO_SUCH_TABLE') {
              console.log(
                `[MIGRATION] Table ${table} does not exist. Skipping...`,
              );
              continue;
            }
            console.error(
              `[MIGRATION] DELETE also failed for ${table}: ${delErr.message}`,
            );
            // We might want to throw here, but continuing might clear what CAN be cleared.
            // For "Clear DB" expecting total wipe, throwing is safer to indicate failure.
            throw delErr;
          }
        }
      }

      console.log('[MIGRATION] Database cleared successfully.');

      // Re-seed Default Admin
      try {
        const adminExists = await this.userRepository.findOne({
          where: { email: 'mettoalex@gmail.com' },
        });
        if (!adminExists) {
          await this.userRepository.save({
            fname: 'Metto',
            lname: 'Alex',
            email: 'mettoalex@gmail.com',
            password: 'Digital2025', // In real app, hash this!
            role: UserRole.ADMIN,
            status: true,
          });
          console.log('[MIGRATION] Default admin account restored.');
        }
      } catch (seedErr) {
        console.error('[MIGRATION] Failed to restore admin:', seedErr);
      }

      return { message: 'Database cleared successfully' };
    } catch (err) {
      console.error('[MIGRATION] Error clearing database:', err);
      throw err;
    } finally {
      // Re-enable foreign key checks on the same connection before releasing
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
      await queryRunner.release();
    }
  }

  getTemplate(type: string): string {
    const templates = {
      users: 'id,fname,lname,email,password,mobile,national_id,dob,sex,address,city,latitude,longitude,role,status,isPublic,verificationToken,resetToken,resetTokenExpires,emailVerifiedAt,profilePicture',
      medics: 'id,fname,lname,username,email,password,mobile,national_id,dob,sex,address,qualification,speciality,dr_type,about,fee,reg_code,licenceNo,licenceExpiry,Verified_status,approved_status,approvalStatus,rejectionReason,balance,slot_type,latitude,longitude,serial_or_slot,start_time,end_time,serial_day,max_serial,duration,department_id,location_id,residance,regulatory_body,years_of_experience,hospital_attachment,telemedicine,on_call,featured,status,is_online,profile_image,signatureUrl,stampUrl,otp,otpExpiry,resetToken,resetTokenExpiry,can_prescribe,accepted_terms,onboarding_completed',
      transactions: 'id,reference,amount,type,source,status,user_email,invoice_number,description,createdAt,updatedAt',
      invoices: 'id,invoiceNumber,customerName,customerEmail,customerMobile,totalAmount,status,dueDate,paymentMethod,doctor_email,commissionAmount,appointmentId,createdAt,updatedAt',
      appointments: 'id,patient_email,doctor_email,appointment_date,appointment_time,fee,status,notes,reason,isVirtual,createdAt,updatedAt',
      departments: 'id,name,description,status',
      specialities: 'id,name,description,department_id',
      locations: 'id,name,address,latitude,longitude',
      services: 'id,name,description,price,duration,isActive,createdAt,updatedAt'
    };
    return (templates as any)[type] || '';
  }

  private parseCsv(content: string): any[] {
    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = this.splitCsvLine(lines[0]);
    return lines.slice(1).map((line) => {
      const values = this.splitCsvLine(line);
      const obj: Record<string, any> = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || null;
      });
      return obj;
    });
  }

  private splitCsvLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  }

  /**
   * Parse SQL INSERT statement and extract rows
   */
  private parseInsertStatement(sqlContent: string): string[] {
    const valuesMatch = sqlContent.match(/VALUES\s*\n?([\s\S]*);/i);
    if (!valuesMatch) {
      throw new Error('Could not find VALUES clause in SQL');
    }

    const valuesString = valuesMatch[1];
    const rows: string[] = [];
    let currentRow = '';
    let inString = false;
    let stringChar: string | null = null;
    let parenDepth = 0;

    for (let i = 0; i < valuesString.length; i++) {
      const char = valuesString[i];
      const prevChar = i > 0 ? valuesString[i - 1] : '';

      // Track string boundaries
      if ((char === "'" || char === '"') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
      }

      // Track parentheses depth
      if (!inString) {
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;
      }

      currentRow += char;

      // When we close a row (parenDepth = 0 after closing paren)
      if (!inString && parenDepth === 0 && currentRow.trim().endsWith(')')) {
        const trimmed = currentRow.trim();
        if (trimmed.startsWith('(')) {
          // Remove trailing comma if present
          const cleanRow = trimmed.replace(/,\s*$/, '');
          rows.push(cleanRow);
        }
        currentRow = '';
        // Skip any whitespace and comma after the row
        while (
          i + 1 < valuesString.length &&
          (valuesString[i + 1] === ',' ||
            valuesString[i + 1] === ' ' ||
            valuesString[i + 1] === '\n' ||
            valuesString[i + 1] === '\r')
        ) {
          i++;
        }
      }
    }

    return rows;
  }

  /**
   * Parse a single row of values
   */
  private parseRow(rowString: string): string[] {
    const content = rowString.slice(1, -1);
    const values: string[] = [];
    let current = '';
    let inString = false;
    let stringChar: string | null = null;
    let parenDepth = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';

      if ((char === "'" || char === '"') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
          current += char;
          continue;
        } else if (char === stringChar) {
          inString = false;
          current += char;
          stringChar = null;
          continue;
        }
      }

      if (!inString) {
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;
      }

      if (char === ',' && !inString && parenDepth === 0) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      values.push(current.trim());
    }

    return values;
  }

  /**
   * Clean and format a value
   */
  private cleanValue(value: string): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed.toUpperCase() === 'NULL') {
      return null;
    }

    if (
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      return trimmed.slice(1, -1);
    }

    return trimmed;
  }

  private parseNumeric(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'string' && value.toUpperCase() === 'NULL') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;
    if (typeof value === 'string' && value.toUpperCase() === 'NULL') return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  /**
   * Split full name into first and last name
   */
  private splitName(fullName: string): { fname: string; lname: string } {
    if (!fullName) return { fname: '', lname: '' };

    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { fname: parts[0], lname: '' };
    }

    return {
      fname: parts[0],
      lname: parts.slice(1).join(' '),
    };
  }

  /**
   * Transform old user record to new schema
   * Template: id,fname,lname,email,password,mobile,national_id,dob,sex,address,city,latitude,longitude,role,status,isPublic,verificationToken,resetToken,resetTokenExpires,emailVerifiedAt,profilePicture
   */
  private transformUser(values: string[]): any {
    return {
      fname: this.cleanValue(values[1]),
      lname: this.cleanValue(values[2]),
      email: this.cleanValue(values[3]),
      password: this.cleanValue(values[4]),
      mobile: this.cleanValue(values[5]),
      national_id: this.cleanValue(values[6]),
      dob: this.cleanValue(values[7]),
      sex: this.cleanValue(values[8]),
      address: this.cleanValue(values[9]),
      city: this.cleanValue(values[10]),
      latitude: this.parseNumeric(this.cleanValue(values[11])),
      longitude: this.parseNumeric(this.cleanValue(values[12])),
      role: this.cleanValue(values[13]) || 'patient',
      status: this.parseNumeric(this.cleanValue(values[14])) || 1,
      isPublic: this.parseNumeric(this.cleanValue(values[15])) || 1,
      verificationToken: this.cleanValue(values[16]),
      resetToken: this.cleanValue(values[17]),
      resetTokenExpires: this.parseDate(this.cleanValue(values[18])),
      emailVerifiedAt: this.parseDate(this.cleanValue(values[19])),
      profilePicture: this.cleanValue(values[20]),
    };
  }

  /**
   * Transform old doctor record to new schema
   * Based on template: id,fname,lname,username,email,password,mobile,national_id,dob,sex,address,qualification,speciality,dr_type,about,fee,reg_code,licenceNo,licenceExpiry,Verified_status,approved_status,approvalStatus,rejectionReason,balance,slot_type,latitude,longitude,serial_or_slot,start_time,end_time,serial_day,max_serial,duration,department_id,location_id,residance,regulatory_body,years_of_experience,hospital_attachment,telemedicine,on_call,featured,status,is_online,profile_image,signatureUrl,stampUrl,otp,otpExpiry,resetToken,resetTokenExpiry,can_prescribe,accepted_terms,onboarding_completed
   */
  private transformDoctor(values: string[]): any {
    return {
      fname: this.cleanValue(values[1]),
      lname: this.cleanValue(values[2]),
      username: this.cleanValue(values[3]),
      email: this.cleanValue(values[4]),
      password: this.cleanValue(values[5]),
      mobile: this.cleanValue(values[6]),
      national_id: this.cleanValue(values[7]),
      dob: this.cleanValue(values[8]),
      sex: this.cleanValue(values[9]),
      address: this.cleanValue(values[10]),
      qualification: this.cleanValue(values[11]),
      speciality: this.cleanValue(values[12]),
      dr_type: this.cleanValue(values[13]),
      about: this.cleanValue(values[14]),
      fee: this.parseNumeric(this.cleanValue(values[15])) || 1500,
      reg_code: this.cleanValue(values[16]),
      licenceNo: this.cleanValue(values[17]),
      licenceExpiry: this.cleanValue(values[18]),
      Verified_status: this.parseNumeric(this.cleanValue(values[19])) || 0,
      approved_status: this.cleanValue(values[20]),
      approvalStatus: this.cleanValue(values[21]) || 'pending',
      rejectionReason: this.cleanValue(values[22]),
      balance: this.parseNumeric(this.cleanValue(values[23])) || 0,
      slot_type: this.parseNumeric(this.cleanValue(values[24])) || 0,
      latitude: this.parseNumeric(this.cleanValue(values[25])),
      longitude: this.parseNumeric(this.cleanValue(values[26])),
      serial_or_slot: this.cleanValue(values[27]),
      start_time: this.cleanValue(values[28]),
      end_time: this.cleanValue(values[29]),
      serial_day: this.parseNumeric(this.cleanValue(values[30])) || 0,
      max_serial: this.parseNumeric(this.cleanValue(values[31])) || 0,
      duration: this.parseNumeric(this.cleanValue(values[32])) || 0,
      department_id: this.parseNumeric(this.cleanValue(values[33])),
      location_id: this.parseNumeric(this.cleanValue(values[34])),
      residance: this.cleanValue(values[35]),
      regulatory_body: this.cleanValue(values[36]),
      featured: this.parseNumeric(this.cleanValue(values[41])) || 0,
      status: this.parseNumeric(this.cleanValue(values[42])) || 0,
      profile_image: this.cleanValue(values[44]),
      signatureUrl: this.cleanValue(values[45]),
      stampUrl: this.cleanValue(values[46]),
      can_prescribe: this.parseNumeric(this.cleanValue(values[51])) || 0,
      accepted_terms: this.parseNumeric(this.cleanValue(values[52])) || 0,
      onboarding_completed: this.parseNumeric(this.cleanValue(values[53])) || 0,
    };
  }

  private transformData(dataType: string, values: string[]): any {
    switch (dataType) {
      case 'medics':
      case 'doctors':
        return this.transformDoctor(values);
      case 'users':
        return this.transformUser(values);
      case 'appointments':
        return {
          id: this.cleanValue(values[0]),
          patient_email: this.cleanValue(values[1]),
          doctor_email: this.cleanValue(values[2]),
          appointment_date: this.cleanValue(values[3]),
          appointment_time: this.cleanValue(values[4]),
          fee: this.cleanValue(values[5]),
          status: this.cleanValue(values[6]),
          notes: this.cleanValue(values[7]),
          reason: this.cleanValue(values[8]),
          isVirtual: this.cleanValue(values[9]),
          createdAt: this.cleanValue(values[10]),
          updatedAt: this.cleanValue(values[11]),
        };
      case 'invoices':
        return {
          id: this.cleanValue(values[0]),
          invoiceNumber: this.cleanValue(values[1]),
          customerName: this.cleanValue(values[2]),
          customerEmail: this.cleanValue(values[3]),
          customerMobile: this.cleanValue(values[4]),
          totalAmount: this.cleanValue(values[5]),
          status: this.cleanValue(values[6]),
          dueDate: this.cleanValue(values[7]),
          paymentMethod: this.cleanValue(values[8]),
          doctor_email: this.cleanValue(values[9]),
          commissionAmount: this.cleanValue(values[10]),
          appointmentId: this.cleanValue(values[11]),
          createdAt: this.cleanValue(values[12]),
          updatedAt: this.cleanValue(values[13]),
        };
      case 'transactions':
        return {
          id: this.cleanValue(values[0]),
          reference: this.cleanValue(values[1]),
          amount: this.cleanValue(values[2]),
          type: this.cleanValue(values[3]),
          source: this.cleanValue(values[4]),
          status: this.cleanValue(values[5]),
          user_email: this.cleanValue(values[6]),
          invoice_number: this.cleanValue(values[7]),
          description: this.cleanValue(values[8]),
          createdAt: this.cleanValue(values[9]),
          updatedAt: this.cleanValue(values[10]),
        };
      default:
        // For simple types, just map to an object if possible or return raw values
        return values;
    }
  }

  /**
   * Preview data before migration
   */
  async previewData(content: string, dataType: string, isCsv: boolean) {
    try {
      let sample: any[] = [];
      let total = 0;

      if (isCsv) {
        const rows = this.parseCsv(content);
        total = rows.length;
        sample = rows.slice(0, 10);
      } else {
        const rows = this.parseInsertStatement(content);
        total = rows.length;
        // Get first 10 records for preview
        for (let i = 0; i < Math.min(10, rows.length); i++) {
          const values = this.parseRow(rows[i]);
          const transformed = this.transformData(dataType, values);
          sample.push(transformed);
        }
      }

      return {
        type: dataType,
        sample,
        total,
      };
    } catch (error) {
      throw new Error(`Failed to preview data: ${error.message}`);
    }
  }

  async executeMigration(content: string, dataType: string, isCsv: boolean) {
    const stats: {
      totalRecords: number;
      transformed: number;
      skipped: number;
      errors: string[];
    } = {
      totalRecords: 0,
      transformed: 0,
      skipped: 0,
      errors: [],
    };

    try {
      let rows = [];
      if (isCsv) {
        rows = this.parseCsv(content);
      } else {
        const sqlRows = this.parseInsertStatement(content);
        rows = sqlRows.map((r) => {
          const vals = this.parseRow(r);
          return this.transformData(dataType, vals);
        });
      }

      stats.totalRecords = rows.length;

      for (let i = 0; i < rows.length; i++) {
        try {
          const data = rows[i];
          await this.processItem(dataType, data);
          stats.transformed++;
        } catch (error) {
          stats.skipped++;
          stats.errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      return { stats };
    } catch (error) {
      throw new Error(`Migration failed: ${error.message}`);
    }
  }

  private async processItem(type: string, data: any) {
    switch (type) {
      case 'users':
        await this.processUser(data);
        break;
      case 'medics':
      case 'doctors':
        await this.processDoctor(data);
        break;
      case 'appointments':
        await this.processAppointment(data);
        break;
      case 'invoices':
        await this.processInvoice(data);
        break;
      case 'transactions':
        await this.processTransaction(data);
        break;
      case 'departments':
        await this.processDepartment(data);
        break;
      case 'specialities':
        await this.processSpeciality(data);
        break;
      case 'locations':
        await this.processLocation(data);
        break;
      case 'services':
        await this.processService(data);
        break;
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }

  private async processUser(data: any) {
    if (!data.email) throw new Error('Missing email');

    // Field mapping and cleaning
    if (data.profile_image && !data.profilePicture) {
      data.profilePicture = data.profile_image;
    }
    delete data.profile_image;

    // Numeric sanitization
    data.latitude = this.parseNumeric(data.latitude);
    data.longitude = this.parseNumeric(data.longitude);
    data.status = data.status === 'true' || data.status === '1' || data.status === 1 || data.status === true;
    data.isPublic = data.isPublic === 'true' || data.isPublic === '1' || data.isPublic === 1 || data.isPublic === true;

    // Date sanitization
    data.createdAt = this.parseDate(data.createdAt) || new Date();
    data.updatedAt = this.parseDate(data.updatedAt) || new Date();
    data.emailVerifiedAt = this.parseDate(data.emailVerifiedAt);
    data.resetTokenExpires = this.parseDate(data.resetTokenExpires);

    let user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (user) {
      // Deep merge / Override
      await this.userRepository.save({ ...user, ...data });
    } else {
      user = await this.userRepository.save({
        ...data,
        password: data.password || 'Mclinic@2026',
        role: (data.role as UserRole) || UserRole.PATIENT,
      });
      if (user) await this.ensureWallet(user.id);
    }
  }

  private async processDoctor(data: any) {
    if (!data.email) throw new Error('Missing email');

    // Numeric sanitization
    data.fee = this.parseNumeric(data.fee) || 1500;
    data.balance = this.parseNumeric(data.balance) || 0;
    data.latitude = this.parseNumeric(data.latitude);
    data.longitude = this.parseNumeric(data.longitude);
    data.status = this.parseNumeric(data.status) || 0;
    data.Verified_status = this.parseNumeric(data.Verified_status) || 0;
    data.isPublic = data.isPublic === 'true' || data.isPublic === '1' || data.isPublic === 1 || data.isPublic === true;
    data.featured = this.parseNumeric(data.featured) || 0;
    data.can_prescribe = this.parseNumeric(data.can_prescribe) || 0;

    // Date sanitization
    data.licenceExpiry = this.parseDate(data.licenceExpiry);
    data.created_at = this.parseDate(data.created_at) || new Date();
    data.updated_at = this.parseDate(data.updated_at) || new Date();

    let doctor = await this.doctorRepository.findOne({
      where: { email: data.email },
    });

    if (doctor) {
      // Deep merge / Override
      await this.doctorRepository.save({ ...doctor, ...data });
    } else {
      doctor = await this.doctorRepository.save({
        ...data,
        password: data.password || 'Mclinic@2026',
        dr_type: data.dr_type || 'Doctor',
      });

      // Also ensure corresponding User exists
      let user = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (!user) {
        user = await this.userRepository.save({
          fname: data.fname,
          lname: data.lname,
          email: data.email,
          password: data.password || 'Mclinic@2026',
          role: UserRole.MEDIC,
          mobile: data.mobile,
          address: data.address,
        });
      }
      if (user) await this.ensureWallet(user.id);
    }
  }

  private async processAppointment(data: any) {
    const patient = await this.userRepository.findOne({
      where: { email: data.patient_email },
    });
    const doctor = await this.doctorRepository.findOne({
      where: { email: data.doctor_email },
    });

    if (!patient || !doctor) {
      throw new Error(
        `Patient or Doctor not found (${data.patient_email} / ${data.doctor_email})`,
      );
    }

    await this.appointmentRepository.save({
      patientId: patient.id,
      doctorId: doctor.id,
      appointment_date: this.parseDate(data.appointment_date) || new Date(),
      appointment_time: data.appointment_time,
      fee: this.parseNumeric(data.fee) || 0,
      status: data.status || 'pending',
      notes: data.notes,
      reason: data.reason,
      isVirtual: data.isVirtual === 'true' || data.isVirtual === '1' || data.isVirtual === 1 || data.isVirtual === true,
      createdAt: this.parseDate(data.createdAt) || new Date(),
      updatedAt: this.parseDate(data.updatedAt) || new Date(),
    } as any);
  }

  private async processInvoice(data: any) {
    const doctor = data.doctor_email
      ? await this.doctorRepository.findOne({
          where: { email: data.doctor_email },
        })
      : null;

    await this.invoiceRepository.save({
      invoiceNumber: data.invoiceNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      totalAmount: this.parseNumeric(data.totalAmount) || 0,
      status: data.status || 'pending',
      dueDate: this.parseDate(data.dueDate),
      customerMobile: data.customerMobile,
      paymentMethod: data.paymentMethod,
      doctorId: doctor?.id,
      commissionAmount: this.parseNumeric(data.commissionAmount) || 0,
      appointmentId: this.parseNumeric(data.appointmentId),
      createdAt: this.parseDate(data.createdAt) || new Date(),
      updatedAt: this.parseDate(data.updatedAt) || new Date(),
    } as any);
  }

  private async processTransaction(data: any) {
    const user = data.user_email
      ? await this.userRepository.findOne({
          where: { email: data.user_email },
        })
      : null;
    const invoice = data.invoice_number
      ? await this.invoiceRepository.findOne({
          where: { invoiceNumber: data.invoice_number },
        })
      : null;

    await this.transactionRepository.save({
      reference: data.reference,
      amount: this.parseNumeric(data.amount) || 0,
      type: data.type || 'credit',
      source: data.source || 'MPESA',
      status: data.status || 'completed',
      userId: user?.id,
      invoiceId: invoice?.id,
      description: data.description,
      createdAt: this.parseDate(data.createdAt) || new Date(),
      updatedAt: this.parseDate(data.updatedAt) || new Date(),
    } as any);
  }

  private async ensureWallet(userId: number) {
    const wallet = await this.walletRepository.findOne({ where: { user_id: userId } });
    if (!wallet) {
      await this.walletRepository.save({ user_id: userId, balance: 0 });
    }
  }


  private async processDepartment(data: any) {
    const repo = this.dataSource.getRepository('departments');
    if (data.id) {
      await repo.upsert(data, ['id']);
    } else {
      await repo.save(data);
    }
  }

  private async processSpeciality(data: any) {
    const repo = this.dataSource.getRepository('specialities');
    const deptRepo = this.dataSource.getRepository('departments');
    
    if (data.department_name) {
      const dept = await deptRepo.findOne({ where: { name: data.department_name } });
      if (dept) data.department_id = dept.id;
      delete data.department_name;
    }

    if (data.id) {
      await repo.upsert(data, ['id']);
    } else {
      await repo.save(data);
    }
  }

  private async processLocation(data: any) {
    const repo = this.dataSource.getRepository('locations');
    if (data.id) {
      await repo.upsert(data, ['id']);
    } else {
      await repo.save(data);
    }
  }

  private async processService(data: any) {
    const repo = this.dataSource.getRepository('services');
    if (data.id) {
      await repo.upsert(data, ['id']);
    } else {
      await repo.save(data);
    }
  }

  async exportAssets(): Promise<Buffer> {
    const zip = new AdmZip();
    const uploadPath = join(process.cwd(), 'uploads');

    if (existsSync(uploadPath)) {
      zip.addLocalFolder(uploadPath);
    }

    return zip.toBuffer();
  }
}
