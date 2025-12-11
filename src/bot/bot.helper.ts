import { backToMenu } from '@/constants/backToMenu';
import { BANNED_PLAYER_MESSAGE } from '@/constants/messages';
import { RconService } from '@/rcon/rcon.service';
import { AppContext } from '@/types/Context';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { escapeMarkdown } from '@/utils/escapeMarkdown';
import { validateNickname } from '@/utils/validateNickname';
import { Injectable, Logger } from '@nestjs/common';
import { Ctx } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

@Injectable()
export class BotHelper {
  private logger = new Logger(BotHelper.name);

  constructor(
    private rconService: RconService,
    private userService: UserService,
  ) {}

  async getMainMenu(@Ctx() ctx: AppContext, user: User) {
    ctx.replyWithMarkdownV2(
      `🐸 Никнейм \`${escapeMarkdown(user.minecraftName)}\` уже добавлен в вайтлист`,
      Markup.inlineKeyboard([Markup.button.callback('Сменить никнейм', 'changeNickname')]),
    );
  }

  async beforeWhitelist(@Ctx() ctx: AppContext): Promise<boolean> {
    const nickname = ctx.message.text.toLowerCase();
    const alreadyInWhitelist = await this.rconService.checkWhitelist(nickname);
    const banned = await this.rconService.checkBanlist(nickname);

    this.logger.log(
      `${nickname} beforeWhitelist accepted ${banned || alreadyInWhitelist || !nickname || !validateNickname(nickname)}`,
    );

    if (banned) {
      await this.userService.updateByTelegram(ctx.from.id, { bannedNickname: nickname });
      await this.rconService.sendCommand(`whitelist remove ${nickname}`);
      await ctx.reply(BANNED_PLAYER_MESSAGE);
      ctx.scene.leave();
      return false;
    }

    if (alreadyInWhitelist) {
      await ctx.reply('❌ Такой никнейм уже есть в вайтлисте', backToMenu);
      ctx.scene.leave();
      return false;
    }

    if (!nickname || !validateNickname(nickname)) {
      await ctx.reply('😭 Ник не подходит под требования');
      ctx.scene.leave();
      return false;
    }

    return true;
  }
}
