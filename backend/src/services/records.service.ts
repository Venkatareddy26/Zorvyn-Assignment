import { query, getOne, getMany } from '../database/setup';
import { FinancialRecord, RecordFilters, PaginatedResponse, RecordType, RecordStatus } from '../types';

export class RecordsService {
  static async getAll(filters: RecordFilters): Promise<PaginatedResponse<FinancialRecord>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_deleted = FALSE';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(filters.type);
    }
    if (filters.category) {
      whereClause += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }
    if (filters.start_date) {
      whereClause += ` AND date >= $${paramIndex++}`;
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      whereClause += ` AND date <= $${paramIndex++}`;
      params.push(filters.end_date);
    }
    if (filters.search) {
      whereClause += ` AND (notes ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const countResult = await getOne(
      `SELECT COUNT(*) as count FROM financial_records ${whereClause}`,
      params
    );
    const total = parseInt(countResult.count);
    const total_pages = Math.ceil(total / limit);

    const data = await getMany(
      `SELECT * FROM financial_records ${whereClause} ORDER BY date DESC, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    ) as FinancialRecord[];

    return { data, total, page, limit, total_pages };
  }

  static async getById(id: number): Promise<FinancialRecord | null> {
    return await getOne(
      'SELECT * FROM financial_records WHERE id = $1 AND is_deleted = FALSE',
      [id]
    ) as FinancialRecord | null;
  }

  static async create(
    userId: number,
    amount: number,
    type: RecordType,
    category: string,
    date: string,
    notes: string = '',
    status: RecordStatus = 'pending'
  ): Promise<FinancialRecord> {
    const result = await getOne(
      `INSERT INTO financial_records (user_id, amount, type, category, date, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId, amount, type, category, date, notes, status]
    );

    return (await this.getById(result.id))!;
  }

  static async update(
    id: number,
    updates: {
      amount?: number;
      type?: RecordType;
      category?: string;
      date?: string;
      notes?: string;
      status?: RecordStatus;
    }
  ): Promise<FinancialRecord> {
    const record = await this.getById(id);
    if (!record) {
      throw new Error('Record not found');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.amount !== undefined) { fields.push(`amount = $${paramIndex++}`); values.push(updates.amount); }
    if (updates.type !== undefined) { fields.push(`type = $${paramIndex++}`); values.push(updates.type); }
    if (updates.category !== undefined) { fields.push(`category = $${paramIndex++}`); values.push(updates.category); }
    if (updates.date !== undefined) { fields.push(`date = $${paramIndex++}`); values.push(updates.date); }
    if (updates.notes !== undefined) { fields.push(`notes = $${paramIndex++}`); values.push(updates.notes); }
    if (updates.status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(updates.status); }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(
      `UPDATE financial_records SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
    return (await this.getById(id))!;
  }

  static async softDelete(id: number): Promise<void> {
    const record = await this.getById(id);
    if (!record) {
      throw new Error('Record not found');
    }
    await query(
      'UPDATE financial_records SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1',
      [id]
    );
  }

  static async getCategories(): Promise<string[]> {
    const rows = await getMany(
      'SELECT DISTINCT category FROM financial_records WHERE is_deleted = FALSE ORDER BY category'
    );
    return rows.map((r: any) => r.category);
  }
}
