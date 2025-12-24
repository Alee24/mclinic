import { Doctor } from '../../doctors/entities/doctor.entity';
export declare class DoctorSchedule {
    id: number;
    doctor_id: number;
    doctor: Doctor;
    slot_type: number;
    start_time: string;
    end_time: string;
    duration: number;
    max_serial: number;
    serial_day: number;
}
