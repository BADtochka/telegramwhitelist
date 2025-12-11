import { BANNED_PLAYER_MESSAGE, NOT_AVAILABLE_BOT_MESSAGE, WHITELIST_MESSAGE } from '@/constants/messages';
import { RconService } from '@/rcon/rcon.service';
import { AppContext } from '@/types/Context';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { tryCatch } from '@/utils/tryCatch';
import { Logger } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Message, Update } from 'telegraf/types';
import { BotHelper } from '../bot.helper';
import { BotService } from '../bot.service';

@Wizard('changeNickname')
export class ChangeNicknameScene {
  private logger = new Logger(ChangeNicknameScene.name);

  constructor(
    private rconService: RconService,
    private userService: UserService,
    private botHelper: BotHelper,
    private botService: BotService,
  ) {}

  @WizardStep(1)
  async onFirstStep(@Ctx() ctx: AppContext<Update.MessageUpdate<Message.TextMessage>, { user: User }>) {
    if (this.rconService.rconIsCrashed) return NOT_AVAILABLE_BOT_MESSAGE;
    const { data: user } = await tryCatch(this.userService.getUserByTelegram(ctx.from.id));

    if (!user) return 'Что-то пошло не так, попробуйте вызвать /menu ещё раз.';

    if (user && user.bannedNickname) {
      const banIsRelevant = await this.rconService.checkBanlist(user.bannedNickname);
      if (banIsRelevant) return BANNED_PLAYER_MESSAGE;
    }

    ctx.replyWithMarkdownV2(
      '👌 Давайте сменим никнейм, его нужно отправить в чат\\. \n\nПри смене никнейма старый аккаунт удаляется из вайтлиста сервера\\.',
    );

    ctx.wizard.state.user = user;
    ctx.wizard.next();
  }

  @WizardStep(2)
  async onMessage(@Ctx() ctx: AppContext<Update.MessageUpdate<Message.TextMessage>, { user: User }>) {
    if (ctx.wizard.cursor === 0) return;
    if (this.rconService.rconIsCrashed) return NOT_AVAILABLE_BOT_MESSAGE;
    if (ctx.message.entities) {
      await ctx.scene.leave();
      this.botService.onMainMenu(ctx);
      return;
    }

    const nickname = ctx.message.text.toLowerCase();
    const { user } = ctx.wizard.state;
    const accepted = await this.botHelper.beforeWhitelist(ctx);
    if (!accepted) return;

    await this.rconService.sendCommand(`whitelist remove ${user?.minecraftName}`);
    await this.rconService.sendCommand(`kick ${user.minecraftName} Смена никнейма в боте`);
    await this.userService.updateByTelegram(ctx.from.id, { minecraftName: nickname });
    await this.rconService.sendCommand(`whitelist add ${nickname}`);
    ctx.replyWithMarkdownV2(WHITELIST_MESSAGE, { link_preview_options: { is_disabled: true } });
  }
}
