import { env } from '@/env';
import { RconModule } from '@/rcon/rcon.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotService } from './bot.service';
import { ChangeNicknameScene } from './scenes/changeNickname.scene';
import { SubscribedScene } from './scenes/subscribed.scene';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: env.TOKEN,
      middlewares: [session()],
    }),
    UserModule,
    RconModule,
  ],
  providers: [BotService, SubscribedScene, ChangeNicknameScene],
  exports: [BotService],
})
export class BotModule {}
