import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { RconHelthService } from './rcon.interval';
import { RconService } from './rcon.service';

@Module({
  imports: [UserModule],
  providers: [RconService, RconHelthService],
  exports: [RconService],
})
export class RconModule {}
