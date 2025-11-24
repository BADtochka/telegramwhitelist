export const validateNickname = (nickname: string) => {
  return /^[a-zA-Z0-9_]{3,16}$/.test(nickname);
};
