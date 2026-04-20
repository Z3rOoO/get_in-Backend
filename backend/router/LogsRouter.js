import express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import LogsController from '../controllers/LogsController.js';

const router = express.Router();

router.get('/', Auth, LogsController.Read);
router.get('/:id', Auth, LogsController.ReadById);
router.get('/user/:idUsuario', Auth, LogsController.ReadByUser);
router.get('/device/:idDispositivo', Auth, LogsController.ReadByDevice);
router.post('/', Auth, LogsController.Create);
router.put('/:id', Auth, LogsController.Update);
router.delete('/:id', Auth, LogsController.Delete);

export default router;
