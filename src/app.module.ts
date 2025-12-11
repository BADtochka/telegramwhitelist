import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { DB_CONFIG } from './constants/db';
import { RconModule } from './rcon/rcon.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [TypeOrmModule.forRoot(DB_CONFIG), ScheduleModule.forRoot(), BotModule, RconModule, UserModule],
})
export class AppModule {}
