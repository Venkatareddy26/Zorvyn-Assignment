import bcrypt from 'bcryptjs';
import { getOne } from '../database/setup';
import { generateToken } from '../middleware/auth';
import { User, AuthPayload, UserPublic } from '../types';

export class AuthService {
  static async login(email: string, password: string): Promise<AuthPayload> {
    const user = await getOne('SELECT * FROM users WHERE email = $1', [email]) as User | null;

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'inactive') {
      throw new Error('Account is inactive. Contact an administrator.');
    }

    const token = generateToken(user.id, user.role);
    const { password_hash, ...userPublic } = user;

    return { user: userPublic, token };
  }

  static async getProfile(userId: number): Promise<UserPublic | null> {
    return await getOne(
      'SELECT id, name, email, role, status, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    ) as UserPublic | null;
  }
}
