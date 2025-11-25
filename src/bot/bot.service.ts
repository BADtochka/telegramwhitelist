import { backToMenu } from '@/constants/backToMenu';
import { menuMessage } from '@/constants/menuMessage';
import { env } from '@/env';
import { UserService } from '@/user/user.service';
import { escapeMarkdown } from '@/utils/escapeMarkdown';
import { tryCatch } from '@/utils/tryCatch';
import { Action, Command, Ctx, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Update as TelegrafUpdate } from 'node_modules/telegraf/typings/core/types/typegram';
import { SceneContext } from 'node_modules/telegraf/typings/scenes';
import { Context, Markup, Telegraf } from 'telegraf';

@Update()
export class BotService {
  public constructor(
    @InjectBot() bot: Telegraf<Context>,
    private userSerivce: UserService,
  ) {
    bot.telegram.setMyCommands([{ command: 'menu', description: 'Меню бота' }]);
  }

  @Start()
  onStart(@Ctx() ctx: Context<TelegrafUpdate.MessageUpdate> & SceneContext) {
    this.onMainMenu(ctx);
  }

  @Command('menu')
  @Action('mainMenu')
  async onMainMenu(@Ctx() ctx: Context<TelegrafUpdate.MessageUpdate> & SceneContext) {
    if (ctx.scene.current) ctx.scene.leave();
    const { data: member } = await tryCatch(ctx.telegram.getChatMember(env.TELEGRAM_SUB_CHANNEL, ctx.from!.id));
    const user = await this.userSerivce.getUser(ctx.from!.id);

    if (!user) {
      this.userSerivce.createUser(ctx.from!.id);
    } else if (user.minecraftName) {
      ctx.reply(
        `🎫 Ник ${user.minecraftName} уже добавлен в вайтлист.`,
        Markup.inlineKeyboard([Markup.button.callback('Сменить ник', 'changeNickname')]),
      );
      return;
    }

    if (member && !['kicked', 'left'].includes(member.status)) {
      await ctx.reply('Круто, ты уже подписан 😎');
      ctx.replyWithMarkdownV2(
        '🧐 Отправь свой игровой никнейм для добавления в вайтлист\\. \n\n_Ник должен быть на английском языке и 3\\-16 символов\\._',
      );
      ctx.scene.enter('subscribed');
      return;
    }

    const menuKeyboard = Markup.inlineKeyboard(
      [
        Markup.button.url('Подписаться 🔗', `https://t.me/${env.TELEGRAM_SUB_CHANNEL.replace('@', '')}`),
        Markup.button.callback('Я подписался 🐸', 'subscribed'),
      ],
      { columns: 1 },
    );

    if (ctx.callbackQuery) {
      ctx.editMessageText(escapeMarkdown(menuMessage), {
        parse_mode: 'MarkdownV2',
        reply_markup: menuKeyboard.reply_markup,
      });
      return;
    }

    ctx.replyWithMarkdownV2(escapeMarkdown(menuMessage), menuKeyboard);
  }

  @Action('subscribed')
  async onSubscribed(@Ctx() ctx: Context<TelegrafUpdate.MessageUpdate> & SceneContext) {
    const { data: member } = await tryCatch(ctx.telegram.getChatMember(env.TELEGRAM_SUB_CHANNEL, ctx.from!.id));

    if (member && !['kicked', 'left'].includes(member.status)) {
      ctx.scene.enter('subscribed');
      return;
    }

    ctx.reply(
      '❌ Вы не подписались или что-то пошло не так, попробуйте ещё раз или напишите кому-нибудь об этом.',
      backToMenu,
    );
  }

  @Action('changeNickname')
  async onChangeNickname(@Ctx() ctx: Context<TelegrafUpdate.MessageUpdate> & SceneContext) {
    const { data: member } = await tryCatch(ctx.telegram.getChatMember(env.TELEGRAM_SUB_CHANNEL, ctx.from!.id));

    if (!member) {
      ctx.reply(
        '❌ Вы не подписались или что-то пошло не так, попробуйте ещё раз или напишите кому-нибудь об этом.',
        backToMenu,
      );
      return;
    }

    ctx.scene.enter('changeNickname');
  }
}
