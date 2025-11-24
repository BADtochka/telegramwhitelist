import { Module } from '@nestjs/common';
import { RconService } from './rcon.service';

@Module({
  imports: [],
  providers: [RconService],
  exports: [RconService],
})
export class RconModule {}
