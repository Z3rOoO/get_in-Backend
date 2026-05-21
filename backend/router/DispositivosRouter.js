import  express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import ctl from '../controllers/DispositivosController.js';
const router = express.Router();

router.get('/', Auth, ctl.Read);
router.get('/:id', Auth, ctl.ReadById);
router.post('/', Auth, ctl.Create);
router.get('/:id/:cracha', ctl.verificarCracha)
router.put('/:id', Auth, ctl.Update);
router.delete('/:id', Auth, ctl.Delete);

export default router;
