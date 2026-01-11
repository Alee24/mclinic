import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
    @PrimaryColumn()
    key: string;

    @Column('text')
    value: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false }) // sensitive data like secrets shouldn't be sent in plain text to everyone, though for admin it's okay
    isSecure: boolean;
}
