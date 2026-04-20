import express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import RequisicaoVisitanteController from '../controllers/RequisicaoVisitanteController.js';

const router = express.Router();

router.get('/', Auth, RequisicaoVisitanteController.Read);
router.get('/:id', Auth, RequisicaoVisitanteController.ReadById);
router.post('/', Auth, RequisicaoVisitanteController.Create);
router.put('/:id', Auth, RequisicaoVisitanteController.Update);
router.delete('/:id', Auth, RequisicaoVisitanteController.Delete);

export default router;
