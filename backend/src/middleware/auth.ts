import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getOne } from '../database/setup';
import { AuthRequest, UserPublic } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'the-ledger-secret-key-change-in-production';

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    const user = await getOne(
      'SELECT id, name, email, role, status, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [decoded.userId]
    ) as UserPublic | null;

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found. Token may be invalid.' });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({ success: false, error: 'Account is inactive. Contact an administrator.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

export function generateToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
}
