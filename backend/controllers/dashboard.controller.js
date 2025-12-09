const Produto = require("../models/Produto");
const Agendamento = require("../models/Agendamento");
const Orcamento = require("../models/Orcamento");
const { Op } = require("sequelize");

module.exports = {
  async dadosDashboard(req, res) {
    try {
      const isAdmin = req.user.isAdmin;
      let userId = req.user.id;

      // Se for admin, pode ver tudo ou filtrar por usuário específico:
      if (isAdmin && req.query.userId) {
        userId = req.query.userId;
      }

      // Se for admin sem filtro → não aplica where:userId
      const filtroUser = isAdmin && !req.query.userId 
        ? {} 
        : { userId };

      // CARDS 
      const totalProdutos = await Produto.count({ where: filtroUser });
      const totalAgendamentos = await Agendamento.count({ where: filtroUser });
      const totalOrcamentos = await Orcamento.count({ where: filtroUser });

      const totalFaturado =
        (await Orcamento.sum("valorTotal", { where: filtroUser })) || 0;

      // AGENDAMENTOS DA SEMANA 
      const hoje = new Date();
      const ultimoDia = new Date();
      ultimoDia.setDate(hoje.getDate() + 7);

      const inicioISO = hoje.toISOString().split("T")[0];
      const fimISO = ultimoDia.toISOString().split("T")[0];

      const semana = await Agendamento.findAll({
        where: {
          ...filtroUser,
          data: { [Op.between]: [inicioISO, fimISO] }
        },
        order: [["data", "ASC"]]
      });

      // ORÇAMENTOS QUE VENCEM ESTE MÊS 
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      const pMes = primeiroDiaMes.toISOString().split("T")[0];
      const uMes = ultimoDiaMes.toISOString().split("T")[0];

      const vencendoMes = await Orcamento.findAll({
        where: {
          ...filtroUser,
          dataValidade: { [Op.between]: [pMes, uMes] }
        },
        order: [["dataValidade", "ASC"]]
      });

      // PRODUTOS POR MARCA 
      const produtos = await Produto.findAll({ where: filtroUser });
      const marcasCount = {};

      produtos.forEach(p => {
        const marca = p.marca || "Sem marca";
        marcasCount[marca] = (marcasCount[marca] || 0) + 1;
      });

      // AGENDAMENTOS POR STATUS 
      const agendamentos = await Agendamento.findAll({ where: filtroUser });

      const statusCount = {
        PENDENTE: 0,
        AGUARDANDO_PAGAMENTO: 0,
        CONCLUIDO: 0
      };

      agendamentos.forEach(a => {
        if (a.status === "PENDENTE") statusCount.PENDENTE++;
        else if (a.status === "AGUARDANDO_PAGAMENTO")
          statusCount.AGUARDANDO_PAGAMENTO++;
        else if (a.status === "CONCLUIDO") statusCount.CONCLUIDO++;
      });

      return res.json({
        isAdmin,
        filtroAplicado: isAdmin && req.query.userId ? userId : "USUÁRIO_ATUAL",
        cards: {
          totalProdutos,
          totalAgendamentos,
          totalOrcamentos,
          totalFaturado
        },
        semana,
        vencendoMes,
        marcasCount,
        statusCount
      });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Falha ao carregar dashboard" });
    }
  }
};
