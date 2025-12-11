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

  async updateByTelegram(telegramId: number, data: Partial<User>) {
    return await this.userRepository.update({ telegramId }, data);
  }

  async updateByNickname(nickname: string, data: Partial<User>) {
    return await this.userRepository.update({ minecraftName: nickname }, data);
  }

  async getUserByTelegram(telegramId: number) {
    return await this.userRepository.findOneBy({ telegramId });
  }

  async getUserByNickname(nickname: string) {
    return await this.userRepository.findOneBy({ minecraftName: nickname });
  }
}
