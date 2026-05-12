import express from "express";
import multer from "multer";
import AvatarController from "../controllers/AvatarController.js";

const router = express.Router();

// Configurar multer para armazenar em memória (não em disco)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Aceitar apenas imagens
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
 * GET /api/avatar/:userId
 * Obter avatar de um usuário específico
 */
router.get("/:userId", AvatarController.getAvatar);

/**
 * POST /api/avatar/:userId
 * Fazer upload de avatar para um usuário
 */
router.post("/:userId", upload.single("avatar"), AvatarController.uploadAvatar);

/**
 * DELETE /api/avatar/:userId
 * Deletar avatar de um usuário
 */
router.delete("/:userId", AvatarController.deleteAvatar);

/**
 * GET /api/avatar
 * Obter todos os avatares de usuários
 */
router.get("/", AvatarController.getAllAvatars);

export default router;
