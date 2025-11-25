import { backToMenu } from '@/constants/backToMenu';
import { whitelistMessage } from '@/constants/whitelistMessage';
import { env } from '@/env';
import { RconService } from '@/rcon/rcon.service';
import { UserService } from '@/user/user.service';
import { tryCatch } from '@/utils/tryCatch';
import { validateNickname } from '@/utils/validateNickname';
import { Command, Ctx, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { Message, Update as TelegrafUpdate } from 'node_modules/telegraf/typings/core/types/typegram';
import { SceneContext, WizardContext } from 'node_modules/telegraf/typings/scenes';
import { Context } from 'telegraf';
import { BotService } from '../bot.service';

@Wizard('subscribed')
export class SubscribedScene {
  constructor(
    private botService: BotService,
    private userSerivce: UserService,
    private rconSerivce: RconService,
  ) {}

  @Command('mainMenu')
  async onMenu(@Ctx() ctx: Context<TelegrafUpdate.MessageUpdate> & SceneContext) {
    this.botService.onMainMenu(ctx);
  }

  @WizardStep(0)
  async onStep1(@Ctx() ctx: WizardContext) {
    if (ctx.callbackQuery) ctx.answerCbQuery();
    ctx.editMessageText(
      '🧐 Отправь свой игровой никнейм для добавления в вайтлист\\. \n\n_Ник должен быть на английском языке и 3\\-16 символов\\._',
      {
        parse_mode: 'MarkdownV2',
      },
    );
  }

  @On('message')
  async onMessage(@Ctx() ctx: WizardContext & Context<TelegrafUpdate.MessageUpdate<Message.TextMessage>>) {
    if (ctx.message.entities?.some((entity) => entity.type === 'bot_command')) return;
    const nickname = ctx.message.text;

    if (!('text' in ctx.message)) {
      ctx.reply('Что-то пошло не так 😭', backToMenu);
      ctx.scene.leave();
      return;
    }

    const isAlreadyWhitelisted = (await this.rconSerivce.checkWhitelist()).includes(nickname);

    if (isAlreadyWhitelisted) {
      ctx.reply('❌ Этот ник уже в вайтлисте', backToMenu);
      ctx.scene.leave();
      return;
    }

    if (!nickname || !validateNickname(nickname)) {
      ctx.reply('Ник неподходит под требования 😭');
      ctx.scene.leave();
      return;
    }

    const { error } = await tryCatch(this.userSerivce.createUser(ctx.from!.id, nickname));

    if (error) {
      ctx.reply('Что-то пошло не так 😭', backToMenu);
      ctx.scene.leave();
      return;
    }

    await this.userSerivce.updateUser(ctx.from!.id, { minecraftName: nickname });
    this.rconSerivce.sendCommand(`whitelist add ${nickname}`);
    await ctx.replyWithMarkdownV2(`${whitelistMessage} \n${env.WELCOME_MESSAGE}`, {
      reply_markup: backToMenu.reply_markup,
      link_preview_options: {
        is_disabled: true,
      },
    });
    ctx.scene.leave();
  }
}
