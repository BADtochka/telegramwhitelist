import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  public constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async createUser(telegramId: number, minecraftName?: string) {
    return await this.userRepository.save({ telegramId, minecraftName });
  }

  async updateUser(telegramId: number, data: Partial<User>) {
    return await this.userRepository.update({ telegramId }, data);
  }

  async getUser(telegramId: number) {
    return await this.userRepository.findOneBy({ telegramId });
  }
}
