const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const controller = require("../controllers/agendamentos.controller");

router.use(authMiddleware);

router.get("/", controller.listar);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);

module.exports = router;
