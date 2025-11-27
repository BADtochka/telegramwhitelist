import { env } from '@/env';
import { tryCatch } from '@/utils/tryCatch';
import { Injectable, Logger } from '@nestjs/common';
import RCON from 'rcon-srcds';

@Injectable()
export class RconService {
  rconIsCrashed = false;

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

  async ensureConnected() {
    if (!this.rcon || !this.rcon.isConnected) await this.init();
  }

  async sendCommand<R extends string | boolean>(command: string) {
    await this.ensureConnected();
    this.logger.log(`Sending command: ${command}`);

    return (await this.rcon.execute(command)) as R;
  }

  async checkWhitelist() {
    const rawWhitelist = await this.sendCommand<string>('whitelist list');
    if (rawWhitelist.includes('no whitelisted players')) return [];
    const nicknames = rawWhitelist.split(': ')[1]?.split(', ');

    return nicknames;
  }
}
