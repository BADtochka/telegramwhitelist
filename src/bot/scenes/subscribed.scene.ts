import { NOT_AVAILABLE_BOT_MESSAGE, WHITELIST_MESSAGE } from '@/constants/messages';
import { env } from '@/env';
import { RconService } from '@/rcon/rcon.service';
import { AppContext } from '@/types/Context';
import { UserService } from '@/user/user.service';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Message, Update as TelegrafUpdate } from 'telegraf/types';
import { BotHelper } from '../bot.helper';
import { BotService } from '../bot.service';

@Wizard('subscribed')
export class SubscribedScene {
  constructor(
    private userSerivce: UserService,
    private rconSerivce: RconService,
    private botService: BotService,
    private botHelper: BotHelper,
  ) {}

  @WizardStep(1)
  async onSubscribed(@Ctx() ctx: AppContext) {
    if (this.rconSerivce.rconIsCrashed) return NOT_AVAILABLE_BOT_MESSAGE;

    ctx.replyWithMarkdownV2(
      `😇 Пока вы подписаны на канал ${env.TELEGRAM_SUB_CHANNEL} вы будите находится в вайтлисте\\. \nЕсли вы отпишитесь от канала, бот автоматически удалит вас\\. \n\n*Отправьте свой никнейм в майнкрафте, например\\: Notch*`,
    );

    ctx.wizard.next();
  }

  @WizardStep(2)
  async onMessage(@Ctx() ctx: AppContext<TelegrafUpdate.MessageUpdate<Message.TextMessage>>) {
    if (ctx.wizard.cursor === 0) return;
    if (this.rconSerivce.rconIsCrashed) return NOT_AVAILABLE_BOT_MESSAGE;
    if (ctx.message.entities) {
      await ctx.scene.leave();
      this.botService.onMainMenu(ctx);
      return;
    }

    const nickname = ctx.message.text;
    const accepted = await this.botHelper.beforeWhitelist(ctx);

    if (!accepted) return;

    await this.userSerivce.createUser(ctx.from.id, nickname.toLowerCase());
    await this.rconSerivce.sendCommand(`whitelist add ${nickname}`);
    ctx.replyWithMarkdownV2(WHITELIST_MESSAGE, { link_preview_options: { is_disabled: true } });
  }
}
