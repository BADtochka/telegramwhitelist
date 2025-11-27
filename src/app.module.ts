import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { DB_CONFIG } from './constants/db';
import { RconModule } from './rcon/rcon.module';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [TypeOrmModule.forRoot(DB_CONFIG), ScheduleModule.forRoot(), BotModule, RconModule, UserModule],
})
export class AppModule {}
