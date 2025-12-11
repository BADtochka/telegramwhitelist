import { BANNED_PLAYER_MESSAGE, NOT_AVAILABLE_BOT_MESSAGE } from '@/constants/messages';
import { env } from '@/env';
import { RconService } from '@/rcon/rcon.service';
import { AppContext } from '@/types/Context';
import { TelegrafUpdate } from '@/types/TelegrafUpdates';
import { UserService } from '@/user/user.service';
import { tryCatch } from '@/utils/tryCatch';
import { Logger } from '@nestjs/common';
import { Action, Command, Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { BotHelper } from './bot.helper';

@Update()
export class BotService {
  private logger = new Logger(BotService.name);

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    private rconService: RconService,
    private userService: UserService,
    private botHelper: BotHelper,
  ) {}

  @Start()
  @Action('mainMenu')
  @Command('menu')
  async onMainMenu(@Ctx() ctx: AppContext) {
    if (ctx.callbackQuery) tryCatch(ctx.answerCbQuery());
    if (ctx.scene.current) await ctx.scene.leave();
    if (this.rconService.rconIsCrashed) return NOT_AVAILABLE_BOT_MESSAGE;
    const { data: user } = await tryCatch(this.userService.getUserByTelegram(ctx.from.id));

    if (user && user.bannedNickname) {
      const banIsRelevant = await this.rconService.checkBanlist(user.bannedNickname);
      if (banIsRelevant) return BANNED_PLAYER_MESSAGE;
    }

    const { data: member } = await tryCatch(ctx.telegram.getChatMember(env.TELEGRAM_SUB_CHANNEL, ctx.from!.id));

    if (member && ['kicked', 'left'].includes(member.status)) {
      await ctx.replyWithMarkdownV2(
        `🧐 Вижу, что вы ещё не подписаны на канал ${env.TELEGRAM_SUB_CHANNEL}\\. Давайте исправим этот момент и продолжим наше общение\\!`,
      );
      return;
    }

    if (user?.minecraftName) {
      await this.botHelper.getMainMenu(ctx, user);
      return;
    }

    await ctx.replyWithMarkdownV2(
      `👋 Привет, меня зовут ${this.bot.botInfo?.first_name} \nЯ здесь, чтобы помочь вам попасть на сервер в майнкрафте\\.`,
    );

    await ctx.scene.enter('subscribed');
  }

  @Action('changeNickname')
  async onChangeNickname(@Ctx() ctx: AppContext) {
    await tryCatch(ctx.answerCbQuery());
    ctx.scene.enter('changeNickname');
  }

  @Action('subscribed')
  async onSubscribed(@Ctx() ctx: AppContext) {
    await tryCatch(ctx.answerCbQuery());
    ctx.scene.enter('subscribed');
  }

  @On('chat_member')
  async onChatMember(@Ctx() ctx: AppContext<TelegrafUpdate.ChatMemberUpdate>) {
    const { new_chat_member, chat } = ctx.chatMember;
    if (chat.type !== 'channel' || chat.username !== env.TELEGRAM_SUB_CHANNEL.replace('@', '')) return;
    this.logger.log(`${new_chat_member.user.username ?? new_chat_member.user.first_name} ${new_chat_member.status}`);

    const { data: user } = await tryCatch(this.userService.getUserByTelegram(new_chat_member.user.id));

    if (user && user.minecraftName && ['left', 'kicked'].includes(new_chat_member.status)) {
      this.rconService.sendCommand(`kick ${user?.minecraftName}`);
      this.rconService.sendCommand(`whitelist remove ${user?.minecraftName}`);
      this.bot.telegram.sendMessage(
        new_chat_member.user.id,
        `🥹 Вы отписались от канала ${env.TELEGRAM_SUB_CHANNEL}, к сожалению вы удалены из вайтлиста, чтобы исправить это просто подпишитесь назад`,
        Markup.inlineKeyboard([
          Markup.button.url('Подписаться', `https://t.me/${env.TELEGRAM_SUB_CHANNEL.replace('@', '')}`),
        ]),
      );
      return;
    }

    if (['member'].includes(new_chat_member.status) && user) {
      await this.rconService.sendCommand(`whitelsit add ${user.minecraftName}`);
      this.bot.telegram.sendMessage(
        new_chat_member.user.id,
        `😊 Спасибо за переподписку, вы снова добавлены в вайтлист`,
      );
      return;
    }

    if (['member'].includes(new_chat_member.status) && !user) {
      this.bot.telegram.sendMessage(
        new_chat_member.user.id,
        `👍 Вижу вы подписались, давайте добавим вас в вайтлист`,
        Markup.inlineKeyboard([Markup.button.callback('Продолжить', 'subscribed')]),
      );
      return;
    }
  }
}
