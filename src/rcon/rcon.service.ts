import { env } from '@/env';
import { UserService } from '@/user/user.service';
import { tryCatch } from '@/utils/tryCatch';
import { Injectable, Logger } from '@nestjs/common';
import RCON from 'rcon-srcds';

@Injectable()
export class RconService {
  rconIsCrashed = false;

  private readonly logger = new Logger(RconService.name);
  private rcon: RCON;

  constructor(private userService: UserService) {}

  onModuleInit() {
    this.init();
  }

  async init() {
    this.rcon = new RCON({ host: env.SERVER_IP_PORT.split(':')[0], port: env.RCON_PORT, encoding: 'utf8' });
    const { error } = await tryCatch(this.rcon.authenticate(env.RCON_PASSWORD));
    if (!error) {
      this.logger.debug(`Rcon successfully connected ${env.SERVER_IP_PORT.split(':')[0]}:${env.RCON_PORT}`);
      this.rcon.connection.addListener('error', (e) => this.handleError(`RCON crashed: ${e.message}`));
      this.rconIsCrashed = false;
      this.checkAllBanlist();
      return;
    }
    this.handleError(
      `RCON connection is failed server: ${env.SERVER_IP_PORT.split(':')[0]}:${env.RCON_PORT}. Message: ${error.message}`,
    );
  }

  async sendCommand<R extends string | boolean>(command: string) {
    this.logger.log(`Sending command: ${command}`);
    return (await this.rcon.execute(command)) as R;
  }

  async checkBanlist(nickname: string) {
    const rawBanlist = await this.sendCommand<string>('banlist');
    if (rawBanlist.includes('are no bans')) return false;
    const bannedPlayers =
      rawBanlist
        .split('ban(s):')[1]
        ?.split(' was banned')
        .map((item) => item.split('.').pop()!.trim())
        .filter((name) => name) ?? [];

    const inBanList = bannedPlayers.some((player) => player.toLowerCase() === nickname.toLowerCase());

    if (!inBanList) {
      await this.userService.updateByNickname(nickname, { bannedNickname: null });
      return false;
    }

    return inBanList;
  }

  async checkAllBanlist() {
    const rawBanlist = await this.sendCommand<string>('banlist');
    if (rawBanlist.includes('are no bans')) return false;
    const bannedPlayers =
      rawBanlist
        .split('ban(s):')[1]
        ?.split(' was banned')
        .map((item) => item.split('.').pop()!.trim())
        .filter((name) => name) ?? [];

    for (const player of bannedPlayers) {
      await this.userService.updateByNickname(player, { bannedNickname: player });
    }
  }

  async checkWhitelist(nickname: string) {
    const rawWhitelist = await this.sendCommand<string>('whitelist list');
    if (rawWhitelist.includes('no whitelisted players')) return false;
    const players = rawWhitelist.split(': ')[1]?.split(', ');
    const inWhitelist = players.some((player) => player.toLowerCase() === nickname.toLowerCase());
    const { data: userInDb } = await tryCatch(this.userService.getUserByNickname(nickname.toLowerCase()));

    return inWhitelist || !!userInDb;
  }

  async handleError(message: string) {
    this.logger.error(message);
    this.rconIsCrashed = true;
  }
}
