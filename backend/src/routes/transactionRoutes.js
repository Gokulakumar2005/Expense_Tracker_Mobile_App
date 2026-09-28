import { Router } from 'express';
import transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/categories/', transactionController.getCategories);
router.get('/', transactionController.listTransactions);
router.post('/', transactionController.createTransaction);
router.get('/:id/', transactionController.getTransaction);
router.put('/:id/', transactionController.updateTransaction);
router.patch('/:id/', transactionController.patchTransaction);
router.delete('/:id/', transactionController.deleteTransaction);

export default router;
