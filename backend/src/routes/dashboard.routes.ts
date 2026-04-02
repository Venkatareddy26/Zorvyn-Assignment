import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../types';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboard/summary — total income, expenses, net balance
router.get('/summary', async (req: AuthRequest, res: Response) => {
  const summary = await DashboardService.getSummary();
  res.json({ success: true, data: summary });
});

// GET /api/dashboard/trends — weekly or monthly trends
router.get('/trends', async (req: AuthRequest, res: Response) => {
  const period = req.query.period as string || 'weekly';
  let data;

  if (period === 'monthly') {
    data = await DashboardService.getMonthlyTrends();
  } else {
    data = await DashboardService.getWeeklyTrends();
  }

  res.json({ success: true, data });
});

// GET /api/dashboard/categories — category-wise totals
router.get('/categories', async (req: AuthRequest, res: Response) => {
  const categories = await DashboardService.getCategoryTotals();
  res.json({ success: true, data: categories });
});

// GET /api/dashboard/recent — recent activity feed
router.get('/recent', async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const recent = await DashboardService.getRecentActivity(Math.min(limit, 20));
  res.json({ success: true, data: recent });
});

export default router;
