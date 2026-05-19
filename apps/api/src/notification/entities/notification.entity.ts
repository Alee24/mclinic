import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number | null; // if null, it is for admins/all users depending on isAdminOnly

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column()
  type: string; // e.g. 'signup', 'dispatched', 'support', 'appointment'

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isAdminOnly: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
