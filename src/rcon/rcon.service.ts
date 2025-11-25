import { env } from '@/env';
import { Injectable, Logger } from '@nestjs/common';
import RCON from 'rcon-srcds';

@Injectable()
export class RconService {
  private rcon: RCON;
  private logger = new Logger(RconService.name);

  public constructor() {
    this.init();
  }

  async init() {
    this.rcon = new RCON({ host: env.SERVER_IP_PORT.split(':')[0], port: env.RCON_PORT, encoding: 'utf8' });
    // @ts-ignore
    try {
      await this.rcon.authenticate(env.RCON_PASSWORD);
    } catch (error) {
      this.logger.error(`Fail to connect to RCON server: ${env.SERVER_IP_PORT.split(':')[0]}:${env.RCON_PORT}`);
      return;
    }
  }

  async sendCommand(command: string) {
    this.logger.log(`Sending command: ${command}`);
    return this.rcon.execute(command);
  }

  async checkWhitelist() {
    const rawWhitelist = (await this.sendCommand('whitelist list')) as string;
    if (rawWhitelist.includes('no whitelisted players')) return [];
    const nicknames = rawWhitelist.split(': ')[1]?.split(', ');

    return nicknames;
  }
}
