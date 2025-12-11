import { Context } from 'telegraf';
import { WizardContext } from 'telegraf/scenes';
import { Message, Update } from 'telegraf/types';

export type AppWizard<T extends {}> = WizardContext & {
  wizard: {
    state: T;
  };
};

export type AppContext<T extends Update = Update.MessageUpdate<Message.TextMessage>, W extends {} = {}> = Context<T> &
  AppWizard<W>;
