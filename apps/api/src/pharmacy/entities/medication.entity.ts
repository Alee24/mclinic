import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Medication {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string; // e.g., Antibiotic, Painkiller, Supplement

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;

    @Column({ default: 0 })
    stock: number; // Inventory count

    @Column({ nullable: true })
    image_url: string;

    // Enhanced Med Fields
    @Column({ nullable: true })
    brandName: string;

    @Column({ nullable: true })
    genericName: string;

    @Column({ nullable: true })
    strength: string; // e.g., '500mg'

    @Column({ nullable: true })
    formulation: string; // e.g., 'Tablet', 'Syrup'

    @Column({ default: true })
    requiresPrescription: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
