import { env } from '@/env';
import { escapeMarkdown } from '@/utils/escapeMarkdown';

export const whitelistMessage = `🎉 Ты добавлен в вайтлист\\.\nПриятной игры 😊 IP:\`\`\`${escapeMarkdown(env.SERVER_IP_PORT)}\`\`\``;
