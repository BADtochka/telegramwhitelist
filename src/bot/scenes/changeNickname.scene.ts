import { backToMenu } from '@/constants/backToMenu';
import { RconService } from '@/rcon/rcon.service';
import { UserService } from '@/user/user.service';
import { validateNickname } from '@/utils/validateNickname';
import { Action, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { Message, Update as TelegrafUpdate } from 'node_modules/telegraf/typings/core/types/typegram';
import { SceneContext, WizardContext } from 'node_modules/telegraf/typings/scenes';
import { Context } from 'telegraf';
import { BotService } from '../bot.service';

@Wizard('changeNickname')
export class ChangeNicknameScene {
  constructor(
    private botService: BotService,
    private userSerivce: UserService,
    private rconSerivce: RconService,
  ) { }

  @WizardStep(0)
  async onStep1(ctx: WizardContext) {
    if (ctx.callbackQuery) ctx.answerCbQuery();
    ctx.editMessageText(
      '🧐 Отправь свой игровой никнейм для добавления в вайтлист\\. \n\nНик должен быть на английском языке и 3\\-16 символов\\.',
      {
        parse_mode: 'MarkdownV2',
      },
    );
  }

  @Action('mainMenu')
  async onMenu(ctx: Context<TelegrafUpdate.MessageUpdate> & SceneContext) {
    this.botService.onMainMenu(ctx);
  }

  @On('message')
  async onMessage(ctx: WizardContext & Context<TelegrafUpdate.MessageUpdate<Message.TextMessage>>) {
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

    const user = await this.userSerivce.getUser(ctx.from!.id);

    await this.rconSerivce.sendCommand(`whitelist remove ${user?.minecraftName}`);
    await this.rconSerivce.sendCommand(`kick ${user?.minecraftName} Смена никнейма в боте`);
    await this.userSerivce.updateUser(ctx.from!.id, { minecraftName: nickname });
    await this.rconSerivce.sendCommand(`whitelist add ${nickname}`);
    await ctx.replyWithMarkdownV2(`Никнейм успешно изменён на ${nickname}`);
    ctx.scene.leave();
  }
}
