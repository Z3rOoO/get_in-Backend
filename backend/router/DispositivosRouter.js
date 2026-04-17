import  express from 'express';
import ctl from '../controllers/DispositivosController.js';
const router = express.Router();

router.get('/', ctl.Read);
router.get('/:id', ctl.ReadById);
router.post('/', ctl.Create);
router.put('/:id', ctl.Update);
router.delete('/:id', ctl.Delete);

export default router;
