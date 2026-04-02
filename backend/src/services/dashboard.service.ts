import { getOne, getMany } from '../database/setup';
import { DashboardSummary, CategoryTotal, WeeklyTrend, RecentActivity } from '../types';

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    const income = await getOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'income' AND is_deleted = FALSE"
    );
    const expense = await getOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'expense' AND is_deleted = FALSE"
    );
    const count = await getOne(
      "SELECT COUNT(*) as total FROM financial_records WHERE is_deleted = FALSE"
    );

    return {
      total_income: parseFloat(income.total),
      total_expenses: parseFloat(expense.total),
      net_balance: parseFloat(income.total) - parseFloat(expense.total),
      record_count: parseInt(count.total),
    };
  }

  static async getCategoryTotals(): Promise<CategoryTotal[]> {
    return await getMany(`
      SELECT category, type, SUM(amount)::NUMERIC as total
      FROM financial_records
      WHERE is_deleted = FALSE
      GROUP BY category, type
      ORDER BY total DESC
    `) as CategoryTotal[];
  }

  static async getWeeklyTrends(): Promise<WeeklyTrend[]> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: WeeklyTrend[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayData = await getOne(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
        FROM financial_records
        WHERE is_deleted = FALSE AND date = CURRENT_DATE - INTERVAL '${i} days'
      `);

      const dayOfWeek = new Date();
      dayOfWeek.setDate(dayOfWeek.getDate() - i);
      const dayName = days[dayOfWeek.getDay()];

      result.push({
        day: dayName,
        income: parseFloat(dayData.income),
        expense: parseFloat(dayData.expense),
      });
    }

    return result;
  }

  static async getMonthlyTrends(): Promise<Array<{ month: string; income: number; expense: number }>> {
    const rows = await getMany(`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM financial_records
      WHERE is_deleted = FALSE
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);
    return rows.map((r: any) => ({
      month: r.month,
      income: parseFloat(r.income),
      expense: parseFloat(r.expense),
    }));
  }

  static async getRecentActivity(limit: number = 5): Promise<RecentActivity[]> {
    return await getMany(
      `SELECT id, category, amount, type, date, status, notes
       FROM financial_records
       WHERE is_deleted = FALSE
       ORDER BY date DESC, created_at DESC
       LIMIT $1`,
      [limit]
    ) as RecentActivity[];
  }
}
