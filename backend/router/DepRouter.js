import express from 'express';
import DepartamentoController from '../controllers/DepartamentoController.js';
const router = express.Router();

router.get('/', DepartamentoController.read);
router.get('/:id', DepartamentoController.readById);
router.post('/', DepartamentoController.create);
router.put('/:id', DepartamentoController.update);
router.delete('/:id', DepartamentoController.delete);





export default router;