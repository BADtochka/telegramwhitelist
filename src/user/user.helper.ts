import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class UserHelper {
  private logger = new Logger(UserHelper.name);

  constructor(private userSerivce: UserService) {}

  async onModuleInit() {
    const { affected } = await this.userSerivce.removeEmptyAccounts();
    if (!affected) return;
    this.logger.debug(`${affected} removed users from db`);
  }
}
