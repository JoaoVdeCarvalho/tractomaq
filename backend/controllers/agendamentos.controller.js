// controllers/agendamentos.controller.js
const { Op } = require("sequelize");
const Agendamento = require("../models/Agendamento");

module.exports = {
  // LISTAR COM FILTROS
  async listar(req, res) {
    try {
      const { busca, data, status } = req.query;

      const filtros = {
        userId: req.user.id, // somente registros do usuário logado
      };

      // Busca por nome do cliente ou ID
      if (busca) {
        filtros[Op.or] = [
          { clienteNome: { [Op.iLike]: `%${busca}%` } },
          { id: Number(busca) || 0 },
        ];
      }

      // Filtro por data única (campo date do HTML já vem em YYYY-MM-DD)
      if (data) {
        filtros.data = data;
      }

      // Filtro de status
      if (status && status !== "TODOS") {
        filtros.status = status.toUpperCase();
      }

      const agendamentos = await Agendamento.findAll({
        where: filtros,
        order: [
          ["data", "ASC"],
          ["horario", "ASC"],
        ],
      });

      return res.json(agendamentos);
    } catch (err) {
      console.error("ERRO LISTAR AGENDA:", err);
      return res
        .status(500)
        .json({ error: "Erro ao carregar agendamentos." });
    }
  },


  // CRIAR AGENDAMENTO
  async criar(req, res) {
    try {
      const novo = await Agendamento.create({
        ...req.body,
        userId: req.user.id,
      });

      return res.json(novo);
    } catch (err) {
      console.error("ERRO CRIAR AGENDA:", err);
      return res
        .status(500)
        .json({ error: "Erro ao criar agendamento." });
    }
  },


  // EDITAR AGENDAMENTO
  async atualizar(req, res) {
    try {
      const { id } = req.params;

      const ag = await Agendamento.findByPk(id);
      if (!ag) {
        return res
          .status(404)
          .json({ error: "Agendamento não encontrado." });
      }

      await ag.update(req.body);
      return res.json(ag);
    } catch (err) {
      console.error("ERRO ATUALIZAR AGENDA:", err);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar agendamento." });
    }
  },

  // ALTERAR STATUS
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const ag = await Agendamento.findByPk(id);
      if (!ag) {
        return res
          .status(404)
          .json({ error: "Agendamento não encontrado." });
      }

      await ag.update({ status });
      return res.json(ag);
    } catch (err) {
      console.error("ERRO ALTERAR STATUS AGENDA:", err);
      return res
        .status(500)
        .json({ error: "Erro ao alterar status." });
    }
  },


  // EXCLUIR AGENDAMENTO
  async remover(req, res) {
    try {
      const { id } = req.params;

      const ag = await Agendamento.findByPk(id);
      if (!ag) {
        return res
          .status(404)
          .json({ error: "Agendamento não encontrado." });
      }

      await ag.destroy();
      return res.json({ msg: "Agendamento removido." });
    } catch (err) {
      console.error("ERRO REMOVER AGENDA:", err);
      return res
        .status(500)
        .json({ error: "Erro ao excluir agendamento." });
    }
  },
};
