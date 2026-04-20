import express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import DepartamentoController from '../controllers/DepartamentoController.js';
const router = express.Router();

router.get('/', Auth, DepartamentoController.read);
router.get('/:id', Auth, DepartamentoController.readById);
router.post('/', Auth, DepartamentoController.create);
router.put('/:id', Auth, DepartamentoController.update);
router.delete('/:id', Auth, DepartamentoController.delete);





export default router;