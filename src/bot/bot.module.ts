import { env } from '@/env';
import { RconModule } from '@/rcon/rcon.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotHelper } from './bot.helper';
import { BotService } from './bot.service';
import { ChangeNicknameScene } from './scenes/changeNickname.scene';
import { SubscribedScene } from './scenes/subscribed.scene';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: env.TOKEN,
      middlewares: [session()],
      options: {
        handlerTimeout: 10000,
      },
      launchOptions: {
        allowedUpdates: [
          'message',
          'callback_query',
          'inline_query',
          'chosen_inline_result',
          'shipping_query',
          'chat_member',
        ],
      },
    }),
    UserModule,
    RconModule,
  ],
  providers: [BotService, BotHelper, SubscribedScene, ChangeNicknameScene],
  exports: [BotService],
})
export class BotModule {}
