import bcrypt from 'bcryptjs';
import { query, getOne, getMany } from '../database/setup';
import { UserPublic, UserRole, UserStatus } from '../types';

export class UsersService {
  static async getAll(): Promise<UserPublic[]> {
    return await getMany(
      'SELECT id, name, email, role, status, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC'
    ) as UserPublic[];
  }

  static async getById(id: number): Promise<UserPublic | null> {
    return await getOne(
      'SELECT id, name, email, role, status, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [id]
    ) as UserPublic | null;
  }

  static async create(name: string, email: string, password: string, role: UserRole): Promise<UserPublic> {
    const existing = await getOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      throw new Error('A user with this email already exists');
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await getOne(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, passwordHash, role]
    );

    return (await this.getById(result.id))!;
  }

  static async update(id: number, updates: { name?: string; role?: UserRole; status?: UserStatus }): Promise<UserPublic> {
    const user = await getOne('SELECT id FROM users WHERE id = $1', [id]);
    if (!user) {
      throw new Error('User not found');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(updates.role);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
    return (await this.getById(id))!;
  }

  static async delete(id: number): Promise<void> {
    const user = await getOne('SELECT id FROM users WHERE id = $1', [id]);
    if (!user) {
      throw new Error('User not found');
    }

    await query(
      "UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = $1",
      [id]
    );
  }

  static async getStats(): Promise<{ active: number; inactive: number; total: number; by_role: Record<string, number> }> {
    const activeRes = await getOne("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
    const inactiveRes = await getOne("SELECT COUNT(*) as count FROM users WHERE status = 'inactive'");
    const active = parseInt(activeRes.count);
    const inactive = parseInt(inactiveRes.count);
    const total = active + inactive;

    const roleRows = await getMany("SELECT role, COUNT(*) as count FROM users GROUP BY role");
    const by_role: Record<string, number> = {};
    roleRows.forEach((r: any) => { by_role[r.role] = parseInt(r.count); });

    return { active, inactive, total, by_role };
  }
}
