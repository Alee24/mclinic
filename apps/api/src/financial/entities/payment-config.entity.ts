import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentProvider {
  MPESA = 'mpesa',
  VISA = 'visa',
  PAYPAL = 'paypal',
}

@Entity('payment_config')
export class PaymentConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    unique: true,
  })
  provider: PaymentProvider;

  // Storing credentials as a JSON string for flexibility (e.g., consumerKey, consumerSecret for MPESA)
  // In a production env, these should be encrypted before saving.
  @Column('text')
  credentials: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'KES' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
