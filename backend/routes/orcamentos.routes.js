// backend/routes/orcamentos.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/orcamentos.controller");
const authMiddleware = require("../middleware/auth");

// todas as rotas de orçamento exigem usuário logado
router.use(authMiddleware);

// listar com filtros
router.get("/", controller.listar);

// buscar um (para editar/visualizar)
router.get("/:id", controller.buscarUm);

// criar
router.post("/", controller.criar);

// atualizar
router.put("/:id", controller.atualizar);

// excluir (com opção de repor estoque)
router.delete("/:id", controller.remover);

module.exports = router;
