const Produto = require("../models/Produto");

module.exports = {
  // LISTAR PRODUTOS DO USUÁRIO
  async listar(req, res) {
    try {
      const produtos = await Produto.findAll({
        where: { userId: req.user.id },
        order: [["nome", "ASC"]],
      });

      return res.json(produtos);
    } catch (err) {
      console.error("ERRO LISTAR:", err);
      return res.status(500).json({ error: "Erro ao listar produtos." });
    }
  },


  // CRIAR PRODUTO
  async criar(req, res) {
    try {
      const { nome, marca, categoria, maquina, quantidade, valorUnitario } = req.body;

      const novo = await Produto.create({
        nome,
        marca,
        categoria,
        maquina,
        quantidade,
        valorUnitario,
        userId: req.user.id, // multiusuário
      });

      return res.json(novo);
    } catch (err) {
      console.error("ERRO CRIAR:", err);
      return res.status(500).json({ error: "Erro ao criar produto." });
    }
  },


  // ATUALIZAR PRODUTO
  async atualizar(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findOne({
        where: { id, userId: req.user.id },
      });

      if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado." });
      }

      await produto.update({
        nome: req.body.nome,
        marca: req.body.marca,
        categoria: req.body.categoria,
        maquina: req.body.maquina,
        quantidade: req.body.quantidade,
        valorUnitario: req.body.valorUnitario,
      });

      return res.json(produto);
    } catch (err) {
      console.error("ERRO ATUALIZAR:", err);
      return res.status(500).json({ error: "Erro ao atualizar produto." });
    }
  },


  // REMOVER PRODUTO
  async remover(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findOne({
        where: { id, userId: req.user.id },
      });

      if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado." });
      }

      await produto.destroy();

      return res.json({ msg: "Produto removido com sucesso." });
    } catch (err) {
      console.error("ERRO REMOVER:", err);
      return res.status(500).json({ error: "Erro ao remover produto." });
    }
  },
};
