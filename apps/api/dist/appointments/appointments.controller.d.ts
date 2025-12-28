import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './entities/appointment.entity';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: any, req: any): Promise<import("./entities/appointment.entity").Appointment>;
    findAll(req: any): Promise<import("./entities/appointment.entity").Appointment[]>;
    findMyAppointments(req: any): Promise<never[]>;
    findByPatient(id: string): Promise<import("./entities/appointment.entity").Appointment[]>;
    findByDoctor(id: string): Promise<import("./entities/appointment.entity").Appointment[]>;
    findOne(id: string): Promise<import("./entities/appointment.entity").Appointment>;
    updateStatus(id: string, status: AppointmentStatus): Promise<import("./entities/appointment.entity").Appointment | null>;
    reschedule(id: string, body: {
        date: string;
        time: string;
    }): Promise<import("./entities/appointment.entity").Appointment>;
}
