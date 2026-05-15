import express from "express";
import multer from "multer";
import AvatarController from "../controllers/AvatarController.js";
import { AuthMiddleware } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Configurar multer para armazenar em memória
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Apenas arquivos de imagem são permitidos (JPEG, PNG, GIF, WebP)"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

/**
 * GET /avatar/:funcId
 * Obter imagem de um funcionário específico
 */
router.get("/:funcId", AvatarController.getAvatar);

/**
 * POST /avatar/:funcId
 * Fazer upload de imagem para um funcionário
 */
router.post("/:funcId", AuthMiddleware, upload.single("avatar"), AvatarController.uploadAvatar);

/**
 * DELETE /avatar/:funcId
 * Deletar imagem de um funcionário
 */
router.delete("/:funcId", AuthMiddleware, AvatarController.deleteAvatar);

/**
 * GET /avatar
 * Obter todas as imagens de funcionários
 */
router.get("/", AvatarController.getAllAvatars);

export default router;
