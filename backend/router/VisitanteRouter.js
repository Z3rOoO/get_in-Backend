import express from "express";
import Auth from "../middleware/AuthMiddleware.js";
import VController from '../controllers/VisitanteController.js';
const router = express.Router();


router.post("/", Auth, VController.criar);

export default router;