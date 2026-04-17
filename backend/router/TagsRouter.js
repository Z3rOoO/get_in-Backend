import express from 'express';
import TagsController from '../controllers/TagsController.js';
const router = express.Router();

router.get('/', TagsController.Read);
router.get('/:id', TagsController.ReadById);
router.post('/', TagsController.Create);
router.put('/:id', TagsController.Update);
router.delete('/:id', TagsController.Delete);

export default router;