import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum UserRole {
  INDIVIDUAL = 'individual',
  AGENCY = 'agency',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  phone: string;
  
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.INDIVIDUAL })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' , type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
