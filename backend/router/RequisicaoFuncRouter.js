import express from 'express';
const router = express.Router();

import ctl from '../controllers/RequisicaoFuncionarioController.js';


router.get('/', ctl.Read);
router.get('/:id', ctl.ReadById);
router.get('/func/:id', ctl.ReadByFunc);
router.get('/dep/:id', ctl.ReadByDepartamento);
router.post('/', ctl.Create);
router.put('/:id', ctl.Update);
router.delete('/:id', ctl.Delete);

export default router;