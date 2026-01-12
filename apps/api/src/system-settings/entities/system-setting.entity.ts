import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('system_setting')
export class SystemSetting {
    @PrimaryColumn()
    key: string;

    @Column('text')
    value: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    isSecure: boolean;
}
