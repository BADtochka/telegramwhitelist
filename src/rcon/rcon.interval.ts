import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RconService } from './rcon.service';

@Injectable()
export class RconHelthService {
  private logger = new Logger(RconHelthService.name);

  constructor(private rconService: RconService) {}

  @Interval(5000)
  async checkHealth() {
    if (!this.rconService.rconIsCrashed) return;

    this.logger.log('Rcon crash detected trying to reconnect...');
    this.rconService.init();
  }
}
