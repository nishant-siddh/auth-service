import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Aadhar } from './aadhar.entity';
import { Pan } from './pan.entity';
import { Status } from 'src/common/enums';

export enum BusinessType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  PARTNERSHIP = 'partnership',
  LLP = 'llp',
  TRUST = 'trust',
  OTHER = 'other',
}

@Entity()
export class Kyc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.kycRecords)
  user: User;

  // Aadhar Details as JSON Object
  @Column({ type: 'jsonb', nullable: true })
  aadhar: Aadhar;

  // PAN Details as JSON Object
  @Column({ type: 'jsonb', nullable: true })
  pan: Pan;

  // Bank Details
  @Column({ nullable: true })
  ifsc: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  accountHolderName: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  branchName: string;

  // GST Details
  @Column({ nullable: true })
  gstNumber: string;

  @Column({ nullable: true })
  gstCertificate: string; // URL to GST certificate

  // Business Type
  @Column({ type: 'enum', enum: BusinessType, nullable: true })
  businessType: BusinessType;

  // Overall KYC Status
  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
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
