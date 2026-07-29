import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = (plainPassword: string): Promise<string> =>
  bcrypt.hash(plainPassword, SALT_ROUNDS);

export const verifyPassword = (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => bcrypt.compare(plainPassword, hashedPassword);