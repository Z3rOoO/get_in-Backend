import express from "express";
import Auth from "../middleware/AuthMiddleware.js";
import EmpresaController from '../controllers/EmpresaController.js';
const router = express.Router();


router.get("/", Auth, EmpresaController.read)


export default router;