import { Router } from 'express';
import { getDashboardStats, getOverview } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', requireAuth, authorize('organizer'), getDashboardStats);
router.get('/overview', requireAuth, authorize('organizer'), getOverview);

export default router;
