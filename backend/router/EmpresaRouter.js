import express from "express";
import Auth from "../middleware/AuthMiddleware.js";
import EmpresaController from '../controllers/EmpresaController.js';
const router = express.Router();


router.get("/", Auth, EmpresaController.read)
router.post("/", Auth, EmpresaController.create)
router.put("/:id", Auth, EmpresaController.update)
router.delete("/:id", Auth, EmpresaController.delete)


export default router;
