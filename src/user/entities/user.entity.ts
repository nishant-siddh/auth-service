import { Kyc } from 'src/kyc/entities/kyc.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';

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
  
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;
  
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @OneToMany(() => Kyc, (kyc) => kyc.user)
  kycRecords: Kyc[];

  @CreateDateColumn({ name: 'created_at' , type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
