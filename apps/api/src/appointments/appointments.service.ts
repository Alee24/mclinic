import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, In, Not } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Service } from '../services/entities/service.entity';
import { Invoice, InvoiceStatus } from '../financial/entities/invoice.entity';
import { FinancialService } from '../financial/financial.service';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '../users/entities/user.entity';
import { SystemSettingsService } from '../system-settings/system-settings.service';


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
    private smsService: SmsService,
    private notificationService: NotificationService,
    private systemSettingsService: SystemSettingsService,
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
    let doctor = null;
    if (createAppointmentDto.doctorId) {
      doctor = await this.appointmentsRepository.manager
        .getRepository(Doctor)
        .findOne({ where: { id: createAppointmentDto.doctorId } });
      if (!doctor && !createAppointmentDto.isConcierge) {
        throw new BadRequestException('Doctor not found.');
      }
    } else if (!createAppointmentDto.isConcierge) {
      throw new BadRequestException('Doctor ID is required for standard appointments.');
    }

    // Calculate Fees using dynamic settings
    const defaultBookingFee = Number(await this.systemSettingsService.get('FEE_BOOKING') || 500);
    const defaultVirtualFee = Number(await this.systemSettingsService.get('FEE_VIRTUAL_VISIT') || 1500);
    const defaultPhysicalFee = Number(await this.systemSettingsService.get('FEE_PHYSICAL_VISIT') || 2500);
    const defaultAmbulanceBase = Number(await this.systemSettingsService.get('FEE_AMBULANCE_BASE') || 5000);

    let fee = 0;
    let serviceName = 'Consultation';

    // Check if a specific service was selected
    if (createAppointmentDto.isConcierge) {
      const hours = createAppointmentDto.durationHours || 6;
      fee = (hours / 6) * 6000;
      serviceName = `Medical Concierge (${createAppointmentDto.conciergeType || 'General'})`;
    } else if (finalServiceId) {
      const service = await this.servicesRepository.findOne({
        where: { id: finalServiceId },
      });
      if (service) {
        fee = Number(service.price);
        serviceName = service.name;
      }
    } else if (doctor) {
      const drType = (doctor.dr_type || '').toLowerCase();
      if (drType.includes('nurse') || drType.includes('clinician')) {
        fee = defaultPhysicalFee;
        serviceName = 'Nurse/Clinician Consultation';
      } else if (drType.includes('ambulance')) {
        fee = defaultAmbulanceBase;
        serviceName = 'Ambulance Service';
      } else {
        fee = Number(doctor.fee || defaultPhysicalFee);
        serviceName = 'Specialist Consultation';
      }
    }

    // Override Fee for Virtual Sessions
    if (isVirtual) {
      fee = defaultVirtualFee;
      console.log(`[CREATE-APPT] Virtual Session detected. Setting consultation fee to ${fee} KES.`);
    }

    // Add Mandatory Booking Fee to the Total Patient Charge
    const totalPatientFee = fee + defaultBookingFee;

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
      isVirtual,
      fee: totalPatientFee, // Store total charged to patient
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

        // Calculate Shares using dynamic commission rate
        const commissionRate = Number(await this.systemSettingsService.get('COMMISSION_PERCENTAGE') || 40) / 100;
        
        // Commission = (Consultation Fee * Rate) + Booking Fee
        const commission = (fee * commissionRate) + defaultBookingFee;
        const doctorShare = (fee * (1 - commissionRate)) + transportFee;

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

    // ... (existing invoice logic)

    // Notify Patient via Email (Existing)
    // await this.emailService.sendAppointmentConfirmation(savedAppointment); // Assuming this exists or will be added

    // --- SMS Notifications (Initial Booking) ---
    try {
      const patientUser = await this.appointmentsRepository.manager
        .getRepository(User)
        .findOne({ where: { id: createAppointmentDto.patientId } });

      const patientName = patientUser?.fname || 'Patient';
      const doctorName = (doctor && doctor.fname) ? `Dr. ${doctor.fname} ${doctor.lname}` : 'the Specialist';
      const portalUrl = 'https://portal.mclinic.co.ke';

      // 1. SMS to Patient: Initial Booking
      if (patientUser?.mobile) {
        const patientMsg = createAppointmentDto.isConcierge 
          ? `Dear ${patientName}, your Medical Concierge booking (${createAppointmentDto.conciergeType}) has been received. Please complete your payment of KES ${totalPatientFee} to confirm. An agent will be assigned shortly.`
          : `Dear ${patientName}, you have successfully booked an appointment with ${doctorName}. Please complete your payment to confirm. View details: ${portalUrl}/dashboard/appointments`;
        await this.notificationService.sendCustomSms(patientUser.mobile, patientMsg);
      }

      // 2. Notify Admin
      await this.notificationService.notifyAdmin(
        'booking',
        `New Booking (Unconfirmed): ${patientName} with ${doctorName} for ${new Date(appointmentDate).toDateString()} @ ${appointmentTime}.`
      );

    } catch (error) {
      console.error('[Appointments] Failed to send initial booking SMS', error);
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
      relations: ['patient', 'doctor', 'service', 'invoice'],
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
      relations: ['patient', 'doctor', 'service', 'invoice'],
    });
  }

  async findAllForUser(user: any): Promise<Appointment[]> {
    // Admin should see all appointments system-wide
    if (user.role === 'admin') {
      return this.findAll();
    }

    console.log(`[Appointments] findAllForUser called. Role: ${user.role}, Email: ${user.email}`);

    // Simplified list of medical roles for filtering
    const medicalRoles = ['medic', 'doctor', 'nurse', 'clinician', 'lab_tech', 'pharmacist'];
    const isMedicalRole = medicalRoles.includes(user.role);

    if (isMedicalRole || user.role === 'admin') {
      if (user.role === 'admin') return this.findAll();

      console.log(`[Appointments] Attempting to resolve Medic Profile for User: ${user.email}`);

      // Try searching for the doctor profile
      let doctor = await this.appointmentsRepository.manager
        .getRepository(Doctor)
        .findOne({
          where: [
            { user_id: user.sub || user.id },
            { email: user.email }
          ]
        });

      if (doctor) {
        console.log(`[Appointments] Found Medic Profile. Doctor ID: ${doctor.id}`);
        const appointments = await this.appointmentsRepository.find({
          where: { doctorId: doctor.id },
          relations: ['patient', 'doctor', 'service', 'invoice'],
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
                const profile = profiles.find((p) => Number(p.user_id) === Number(a.patient.id));
                if (profile) {
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
        console.warn(`[Appointments] Medic role user ${user.email} has no Doctor profile. Returning empty list.`);
        // Fallback: If no doctor profile but logged in as medic, maybe they have appointments directly under user ID?
        // (This happens if migration/sync didn't run)
        const fallbackApts = await this.appointmentsRepository.find({
          where: { doctorId: user.sub || user.id },
          relations: ['patient', 'doctor', 'service', 'invoice'],
          order: { appointment_date: 'DESC' },
        });
        if (fallbackApts.length > 0) return fallbackApts;
        return [];
      }
    }

    // Patient View
    console.log(`[Appointments] Fetching for Patient: ${user.email}`);
    return this.appointmentsRepository.find({
      where: { patientId: user.sub || user.id },
      relations: ['patient', 'doctor', 'service', 'invoice'], // Added invoice relation for patient view
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
