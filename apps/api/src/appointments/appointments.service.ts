import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Service } from '../services/entities/service.entity';
import { Invoice, InvoiceStatus } from '../financial/entities/invoice.entity';
import { FinancialService } from '../financial/financial.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private financialService: FinancialService,
    private emailService: EmailService,
  ) { }

  async create(createAppointmentDto: any): Promise<Appointment> {
    const {
      appointmentDate,
      appointmentTime,
      isVirtual,
      serviceId,
      // New Fields
      isForSelf,
      beneficiaryName,
      beneficiaryGender,
      beneficiaryAge,
      beneficiaryRelation,
      activeMedications,
      currentPrescriptions,
      homeAddress, // Make sure to use this if provided
      ...rest
    } = createAppointmentDto;

    // Sanitize serviceId: If it's a special string (e.g. HOME_VISIT_NURSE), treat as generic (null)
    // and rely on dr_type logic for fees.
    let finalServiceId = serviceId;
    if (typeof serviceId === 'string' && isNaN(Number(serviceId))) {
      finalServiceId = null;
    } else if (serviceId) {
      finalServiceId = Number(serviceId);
    }

    // Fetch doctor once for fee and location calculations
    const doctor = await this.appointmentsRepository.manager
      .getRepository(Doctor)
      .findOne({ where: { id: createAppointmentDto.doctorId } });
    if (!doctor) {
      throw new BadRequestException('Doctor not found.');
    }

    // Calculate Fees
    let fee = 0;

    // Check if a specific service was selected
    if (finalServiceId) {
      const service = await this.servicesRepository.findOne({
        where: { id: finalServiceId },
      });
      if (service) {
        fee = Number(service.price);
      }

    } else {
      // Standard Consultation Fee Logic
      // If Nurse/Clinician -> Fixed 1500
      // If Doctor -> Custom Fee
      const drType = (doctor.dr_type || '').toLowerCase();

      console.log(`[DEBUG_FEE] Doctor ID: ${doctor.id}, Type: ${drType}, DB Fee: ${doctor.fee}`);

      if (drType.includes('nurse') || drType.includes('clinician')) {
        fee = 1500;
      } else {
        fee = Number(doctor.fee || 1500);
      }
      console.log(`[DEBUG_FEE] Calculated Fee: ${fee}`);
    }

    // Calculate Transport Fee normally first
    let transportFee = 0;
    if (createAppointmentDto.patientLocation) {
      if (doctor && doctor.latitude && doctor.longitude) {
        const dist = this.calculateDistance(
          createAppointmentDto.patientLocation.lat,
          createAppointmentDto.patientLocation.lng,
          Number(doctor.latitude),
          Number(doctor.longitude),
        );
        // 120 KES per KM
        transportFee = Math.ceil(dist * 120);
        if (transportFee < 150) transportFee = 150;
      }
    }

    // Override Transport Fee for Virtual Sessions
    if (isVirtual) {
      console.log(
        `[CREATE-APPT] Virtual Session detected. Setting Transport Fee to 0.`,
      );
      transportFee = 0;
    }

    // Conditional Video Link Generation
    let meetingId = null;
    let meetingLink = null;

    if (isVirtual) {
      meetingId = `mclinic-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      meetingLink = `https://virtual.mclinic.co.ke/${meetingId}`;
      console.log(
        `[NOTIFICATION] Meeting Created. Link sent to Patient: ${meetingLink}`,
      );
    }

    const appointment = this.appointmentsRepository.create({
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      serviceId: finalServiceId,
      fee,
      transportFee,
      meetingId,
      meetingLink,
      isForSelf: isForSelf ?? true, // Default to true if undefined
      beneficiaryName,
      beneficiaryGender,
      beneficiaryAge,
      beneficiaryRelation,
      activeMedications,
      currentPrescriptions,
      homeAddress,
      ...rest,
    } as DeepPartial<Appointment>);

    const savedAppointment =
      await this.appointmentsRepository.save(appointment);

    // Create Invoice
    const totalAmount = fee + transportFee;
    if (totalAmount > 0) {
      // Fetch patient to get details
      const appointmentWithPatient = await this.appointmentsRepository.findOne({
        where: { id: savedAppointment.id },
        relations: ['patient'],
      });

      if (appointmentWithPatient?.patient) {
        const invoiceNumber = `INV-${Date.now()}-${savedAppointment.id}`;

        // Calculate Shares
        const commission = fee * 0.4;
        const doctorShare = fee * 0.6 + transportFee;

        const invoice = this.invoiceRepository.create({
          invoiceNumber,
          customerName: `${appointmentWithPatient.patient.fname} ${appointmentWithPatient.patient.lname}`,
          customerEmail:
            appointmentWithPatient.patient.mobile || 'noemail@mclinic.com',
          totalAmount: totalAmount,
          status: InvoiceStatus.PENDING,
          dueDate: new Date(appointmentDate),
          commissionAmount: commission,
          doctorId: createAppointmentDto.doctorId, // Link to doctor
          appointment: savedAppointment,
          appointmentId: savedAppointment.id,
        });
        await this.invoiceRepository.save(invoice);

        console.log(
          `[INVOICE] Created PENDING invoice ${invoiceNumber} for Appointment #${savedAppointment.id}`,
        );
      }
    }

    // Send booking confirmation email
    try {
      const appointmentWithRelations = await this.appointmentsRepository.findOne({
        where: { id: savedAppointment.id },
        relations: ['patient', 'doctor'],
      });

      if (appointmentWithRelations?.patient && appointmentWithRelations?.doctor) {
        await this.emailService.sendBookingConfirmationEmail(
          appointmentWithRelations.patient,
          appointmentWithRelations,
          appointmentWithRelations.doctor,
        );

        // Notify Doctor
        await this.emailService.sendAppointmentNotificationToDoctor(
          appointmentWithRelations.doctor,
          appointmentWithRelations,
          appointmentWithRelations.patient,
        );
      }
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
    }

    return savedAppointment;
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      relations: ['patient', 'doctor', 'service', 'invoice'],
      order: { appointment_date: 'DESC' },
    });
  }

  async findByPatient(patientId: number): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { patientId },
      relations: ['doctor', 'service'],
    });
  }

  async diagnoseUser(user: any) {
    let doctor = await this.appointmentsRepository.manager
      .getRepository(Doctor)
      .findOne({ where: { user_id: user.sub || user.id } });

    if (!doctor) {
      doctor = await this.appointmentsRepository.manager
        .getRepository(Doctor)
        .findOne({ where: { email: user.email } });
    }

    const appointments = doctor
      ? await this.appointmentsRepository.count({ where: { doctorId: doctor.id } })
      : 0;

    return {
      userContext: user,
      lookupMethod: doctor ? (doctor.user_id === (user.sub || user.id) ? 'USER_ID' : 'EMAIL') : 'FAILED',
      doctorMatch: doctor ? { id: doctor.id, email: doctor.email, type: doctor.dr_type, doctor_user_id: doctor.user_id } : null,
      appointmentsCount: appointments
    };
  }

  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { doctorId },
      relations: ['patient', 'service'],
    });
  }

  async findAllForUser(user: any): Promise<Appointment[]> {
    // FIX: Admin should not see system-wide appointments in the personal view.
    // if (user.role === 'admin') {
    //   return this.findAll();
    // }

    console.log(`[Appointments] findAllForUser called. Role: ${user.role}, Email: ${user.email}`);

    // Unified Medic Check: If the user is a 'Doctor'/'Medic' or 'Admin' (who is also a provider), try to find their provider profile.
    if (['medic', 'doctor', 'nurse', 'admin'].includes(user.role)) { // Included admin to allow provider-admins to see their schedule
      // Generic Provider Check: Try to find a Doctor/Medic profile for this user
      // Priority 1: Check by user_id
      let doctor = await this.appointmentsRepository.manager
        .getRepository(Doctor)
        .findOne({ where: { user_id: user.sub || user.id } });

      // Priority 2: Fallback to email if not found by ID (legacy support for non-backfilled data)
      if (!doctor) {
        doctor = await this.appointmentsRepository.manager
          .getRepository(Doctor)
          .findOne({ where: { email: user.email } });
      }

      if (doctor) {
        console.log(`[Appointments] Found Medic Profile for ${user.email} (ID: ${doctor.id}). Fetching provider schedule.`);

        const appointments = await this.appointmentsRepository.find({
          where: { doctorId: doctor.id },
          relations: ['patient', 'doctor', 'service'],
          order: { appointment_date: 'DESC' },
        });

        // Enrich with Patient Medical Data
        const userIds = appointments.map((a) => a.patient?.id).filter(Boolean);
        if (userIds.length > 0) {
          try {
            const profiles = await this.appointmentsRepository.manager
              .getRepository(Patient)
              .createQueryBuilder('patient')
              .where('patient.user_id IN (:...ids)', { ids: userIds })
              .getMany();

            appointments.forEach((a) => {
              if (a.patient) {
                const profile = profiles.find((p) => p.user_id === a.patient.id);
                if (profile) {
                  // Attach profile data
                  (a.patient as any).blood_group = profile.blood_group;
                  (a.patient as any).sex = profile.sex || a.patient.sex;
                  (a.patient as any).genotype = profile.genotype;
                  (a.patient as any).allergies = profile.allergies;
                  (a.patient as any).conditions = profile.medical_history;
                  (a.patient as any).emergency_contact = profile.emergency_contact_name;
                }
              }
            });
          } catch (e) {
            console.warn('[Appointments] Failed to enrich patient data', e);
          }
        }

        return appointments;
      } else {
        console.log(`[Appointments] No Medic Profile found for ${user.email} despite having Medic Role.`);
        // If they are a medic but have no profile, return empty or fallback? 
        // Better to return empty provider schedule than patient schedule to avoid confusion, 
        // but previously it fell back. Let's return empty if they are explicitly medic.
        return [];
      }
    }

    // Fallback: If no Medic profile found, assume Patient role
    console.log(`[Appointments] No Medic Profile found for ${user.email}. Fetching as Patient.`);
    return this.appointmentsRepository.find({
      where: { patientId: user.sub || user.id },
      relations: ['doctor', 'service'],
      order: { appointment_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Appointment | null> {
    return this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'service', 'invoice'],
    });
  }

  async updateStatus(
    id: number,
    status: AppointmentStatus,
  ): Promise<Appointment | null> {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) return null;

    await this.appointmentsRepository.update(id, { status });

    if (status === AppointmentStatus.COMPLETED) {
      // Release funds to doctor wallet
      await this.financialService.releaseFunds(id);
    }

    return this.appointmentsRepository.findOne({ where: { id } });
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async reschedule(id: number, date: string, time: string) {
    const appointment = await this.findOne(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment #${id} not found`);
    }

    appointment.appointment_date = new Date(date);
    appointment.appointment_time = time;
    appointment.status = AppointmentStatus.RESCHEDULED;

    return this.appointmentsRepository.save(appointment);
  }
}
