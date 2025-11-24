import { Markup } from 'telegraf';

export const backToMenu = Markup.inlineKeyboard([Markup.button.callback('Главное меню', 'mainMenu')]);
