import express from 'express';
const router = express.Router();

import Auth from '../middleware/AuthMiddleware.js';
import ctl from '../controllers/RequisicaoFuncionarioController.js';


router.get('/', Auth, ctl.Read);
router.get('/:id', Auth, ctl.ReadById);
router.get('/func/:id', Auth, ctl.ReadByFunc);
router.get('/dep/:id', Auth, ctl.ReadByDepartamento);
router.post('/', Auth, ctl.Create);
router.put('/:id', Auth, ctl.Update);
router.delete('/:id', Auth, ctl.Delete);

export default router;