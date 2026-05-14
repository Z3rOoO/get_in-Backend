import express from "express";
import Auth from "../middleware/AuthMiddleware.js";
import EmpresasController from "../controllers/EmpresasController.js";

const router = express.Router();

router.get("/", Auth, EmpresasController.Read);

export default router;
