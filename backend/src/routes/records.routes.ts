import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { RecordsService } from '../services/records.service';
import { createRecordValidation, updateRecordValidation, recordFiltersValidation } from '../middleware/validate';
import { handleValidationErrors } from '../middleware/errorHandler';
import { AuthRequest, RecordType } from '../types';

const router = Router();

router.use(authenticate);

// GET /api/records — list records with filters (All roles)
router.get('/', recordFiltersValidation, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  const filters = {
    type: (req.query.type as string | undefined) as RecordType | undefined,
    category: req.query.category as string | undefined,
    start_date: req.query.start_date as string | undefined,
    end_date: req.query.end_date as string | undefined,
    search: req.query.search as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
  };

  const result = await RecordsService.getAll(filters);
  res.json({ success: true, data: result });
});

// GET /api/records/categories — list unique categories (All roles)
router.get('/categories', async (_req: AuthRequest, res: Response) => {
  const categories = await RecordsService.getCategories();
  res.json({ success: true, data: categories });
});

// GET /api/records/:id — single record (All roles)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const record = await RecordsService.getById(parseInt(req.params.id as string, 10));
  if (!record) {
    res.status(404).json({ success: false, error: 'Record not found' });
    return;
  }
  res.json({ success: true, data: record });
});

// POST /api/records — create record (Admin only)
router.post('/', authorize('admin'), createRecordValidation, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, type, category, date, notes, status } = req.body;
    const record = await RecordsService.create(req.user!.id, amount, type, category, date, notes, status);
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/records/:id — update record (Admin only)
router.put('/:id', authorize('admin'), updateRecordValidation, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { amount, type, category, date, notes, status } = req.body;
    const record = await RecordsService.update(id, { amount, type, category, date, notes, status });
    res.json({ success: true, data: record });
  } catch (err: any) {
    const statusCode = err.message === 'Record not found' ? 404 : 400;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// DELETE /api/records/:id — soft delete record (Admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    await RecordsService.softDelete(id);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err: any) {
    const statusCode = err.message === 'Record not found' ? 404 : 400;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

export default router;
