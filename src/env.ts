import { createEnv } from '@t3-oss/env-core';
import 'dotenv/config';
import z from 'zod';

export const env = createEnv({
  server: {
    TOKEN: z.string('Укажите токен в .env файле'),
    TELEGRAM_SUB_CHANNEL: z.string('Укажите @channel в .env файле'),
    SERVER_IP_PORT: z.string('Укажите IP сервера в .env файле'),
    RCON_PORT: z
      .string('Укажите порт RCON сервера в .env файле')
      .transform((port) => parseInt(port, 10))
      .pipe(z.number()),
    RCON_PASSWORD: z.string('Укажите пароль RCON сервера в .env файле'),
  },
  runtimeEnv: process.env,
});
