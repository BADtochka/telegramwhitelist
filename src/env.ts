import { createEnv } from '@t3-oss/env-core';
import 'dotenv/config';
import z from 'zod';

export const env = createEnv({
  server: {
    TOKEN: z.string('Укажите токен в .env файле'),
    TELEGRAM_SUB_CHANNEL: z.string('Укажите @channel в .env файле'),
    POSTGRES_USER: z.string('Укажите пользователя в .env файле'),
    POSTGRES_PASSWORD: z.string('Укажите пароль в .env файле'),
    POSTGRES_DB: z.string('Укажите базу данных в .env файле'),
    SERVER_IP: z.string('Укажите IP сервера в .env файле'),
    RCON_PORT: z
      .string('Укажите порт RCON сервера в .env файле')
      .transform((port) => parseInt(port, 10))
      .pipe(z.number()),
    RCON_PASSWORD: z.string('Укажите пароль RCON сервера в .env файле'),
  },
  runtimeEnv: process.env,
});
