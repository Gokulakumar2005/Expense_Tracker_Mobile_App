import { Router } from 'express';
import budgetController from '../controllers/budgetController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/summary/', budgetController.getBudgetSummary);
router.get('/', budgetController.listBudgets);
router.post('/', budgetController.createBudget);
router.get('/:id/', budgetController.getBudget);
router.put('/:id/', budgetController.updateBudget);
router.patch('/:id/', budgetController.patchBudget);
router.delete('/:id/', budgetController.deleteBudget);

export default router;
