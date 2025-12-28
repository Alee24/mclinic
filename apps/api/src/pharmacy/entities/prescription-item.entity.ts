import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';
import { Medication } from './medication.entity';

@Entity()
export class PrescriptionItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Prescription, (prescription) => prescription.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'prescriptionId' })
    prescription: Prescription;

    @Column()
    prescriptionId: number;

    @ManyToOne(() => Medication, { nullable: true })
    @JoinColumn({ name: 'medicationId' })
    medication: Medication;

    @Column({ nullable: true })
    medicationId: number;

    @Column()
    medicationName: string; // Fallback if medication ID is null (custom text prescription)

    @Column({ nullable: true })
    dosage: string; // e.g., "500mg"

    @Column({ nullable: true })
    frequency: string; // e.g., "2x Daily"

    @Column({ nullable: true })
    duration: string; // e.g., "7 Days"

    @Column({ default: 1 })
    quantity: number;

    @Column({ type: 'text', nullable: true })
    instructions: string; // "Take after meals"
}
