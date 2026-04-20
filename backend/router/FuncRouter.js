import express from 'express';
const router = express.Router();

import Auth from '../middleware/AuthMiddleware.js';
import FuncController from '../controllers/FuncController.js';

router.get('/', Auth, FuncController.Read);
router.get('/:id', Auth, FuncController.ReadId);
router.get('/name/:nome', Auth, FuncController.ReadName);
router.get('/cpf/:cpf', Auth, FuncController.ReadCpf);
router.post('/', Auth, FuncController.Create);
router.put('/:id', Auth, FuncController.Update);
router.delete('/:id', Auth, FuncController.Delete);


export default router;
