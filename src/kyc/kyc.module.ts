import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kyc } from './entities/kyc.entity';
import { User } from 'src/user/entities/user.entity';
import { KycController } from './controller/kyc.controller';
import { KycService } from './service/kyc.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Kyc, User]), AuthModule, UserModule],
  controllers: [KycController],
  providers: [KycService]
})
export class KycModule {}
