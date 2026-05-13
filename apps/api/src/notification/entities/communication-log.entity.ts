import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
}

@Entity('communication_logs')
export class CommunicationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: CommunicationType,
  })
  type: CommunicationType;

  @Column()
  recipient: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: 'sent' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
