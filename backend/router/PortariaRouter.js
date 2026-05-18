import express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import PortariaController from '../controllers/PortariaController.js';

const router = express.Router();

router.get('/vlocal',  Auth, PortariaController.readVisitanteLocal);
router.get('/pendencias',  Auth, PortariaController.readPendencias);
router.put('/visitante/:id', Auth, PortariaController.updateVisitante);
router.delete('/visitante/:id', Auth, PortariaController.deleteVisitante);



export default router;
