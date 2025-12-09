const { Op } = require("sequelize");
const Orcamento = require("../models/Orcamento");
const OrcamentoItem = require("../models/OrcamentoItem");
const Produto = require("../models/Produto");


// Cálculos
function calcularTotais({ itens, horasServico, valorHora, kmIda, kmVolta, valorKm }) {
  const valorPecas = (itens || []).reduce(
    (soma, item) => soma + (Number(item.totalItem) || 0),
    0
  );

  const valorMaoDeObra = (Number(horasServico) || 0) * (Number(valorHora) || 0);

  const distancia = (Number(kmIda) || 0) + (Number(kmVolta) || 0);
  const valorDeslocamento = distancia * (Number(valorKm) || 0);

  return {
    valorPecas,
    valorMaoDeObra,
    valorDeslocamento,
    valorTotal: valorPecas + valorMaoDeObra + valorDeslocamento,
  };
}


// Estoque
async function debitarEstoque(userId, produtoId, quantidade) {
  if (!produtoId || !quantidade) return;

  const produto = await Produto.findOne({ where: { id: produtoId, userId } });
  if (!produto) throw new Error(`Produto não encontrado.`);

  if (produto.quantidade < quantidade)
    throw new Error(`Estoque insuficiente de ${produto.nome}.`);

  produto.quantidade -= quantidade;
  await produto.save();
}

async function reporEstoque(userId, produtoId, quantidade) {
  if (!produtoId || !quantidade) return;
  const produto = await Produto.findOne({ where: { id: produtoId, userId } });
  if (!produto) return;

  produto.quantidade += quantidade;
  await produto.save();
}

// Controller
module.exports = {
  // LISTAR
  async listar(req, res) {
    try {
      const { busca, dataInicial, dataValidade, dataFinal } = req.query;

      const where = { userId: req.user.id };

      if (busca) {
        if (!isNaN(Number(busca))) {
          where[Op.or] = [
            { id: Number(busca) },
            { nomeCliente: { [Op.iLike]: `%${busca}%` } },
          ];
        } else {
          where.nomeCliente = { [Op.iLike]: `%${busca}%` };
        }
      }

      if (dataInicial) where.dataInicial = dataInicial;
      if (dataValidade) where.dataValidade = dataValidade;
      if (dataFinal) where.dataFinal = dataFinal;

      const lista = await Orcamento.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });

      return res.json(lista);
    } catch (err) {
      return res.status(500).json({ error: "Erro ao listar orçamentos." });
    }
  },

  // BUSCAR UM
  async buscarUm(req, res) {
    try {
      const { id } = req.params;

      const orcamento = await Orcamento.findOne({
        where: { id, userId: req.user.id },
      });

      if (!orcamento)
        return res.status(404).json({ error: "Orçamento não encontrado." });

      const itens = await OrcamentoItem.findAll({
        where: { orcamentoId: id, userId: req.user.id },
      });

      return res.json({ orcamento, itens });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar orçamento." });
    }
  },

  // CRIAR
  async criar(req, res) {
    const userId = req.user.id;

    try {
      const {
        nomeCliente,
        descricao,
        dataInicial,
        dataValidade,
        dataFinal,
        horasServico,
        valorHora,
        kmIda,
        kmVolta,
        valorKm,
        maquinasManipuladas,
        formaPagamento,
        condicaoPagamento,
        itens,
      } = req.body;

      if (!nomeCliente)
        return res.status(400).json({ error: "Informe o nome do cliente." });

      if (!dataInicial || !dataValidade)
        return res.status(400).json({ error: "Datas obrigatórias." });

      if (!itens || itens.length === 0)
        return res.status(400).json({ error: "Adicione ao menos um item." });

      const itensProcessados = [];

      for (const item of itens) {
        const descricaoItem = (item.descricao || "").trim();
        const quantidade = Number(item.quantidade) || 0;
        const precoUnitario =
          Number(item.precoUnitario ?? item.valorUnitario) || 0;

        if (!descricaoItem)
          return res.status(400).json({ error: "Item sem nome (descricao)." });

        if (quantidade <= 0)
          return res.status(400).json({ error: `Quantidade inválida.` });

        const totalItem = quantidade * precoUnitario;

        if (item.produtoId)
          await debitarEstoque(userId, item.produtoId, quantidade);

        itensProcessados.push({
          descricao: descricaoItem,
          quantidade,
          precoUnitario,
          totalItem,
          produtoId: item.produtoId || null,
        });
      }

      const totais = calcularTotais({
        itens: itensProcessados,
        horasServico,
        valorHora,
        kmIda,
        kmVolta,
        valorKm,
      });

      const novo = await Orcamento.create({
        nomeCliente,
        descricao: descricao || "",
        dataInicial,
        dataValidade,
        dataFinal: dataFinal || null,
        maquinasManipuladas: maquinasManipuladas || "",
        formaPagamento: formaPagamento || "",
        condicaoPagamento: condicaoPagamento || "",
        horasServico: Number(horasServico) || 0,
        valorHora: Number(valorHora) || 0,
        kmIda: Number(kmIda) || 0,
        kmVolta: Number(kmVolta) || 0,
        valorKm: Number(valorKm) || 0,
        ...totais,
        userId,
      });

      for (const item of itensProcessados) {
        await OrcamentoItem.create({
          ...item,
          orcamentoId: novo.id,
          userId,
        });
      }

      return res.status(201).json(novo);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // ATUALIZAR
  async atualizar(req, res) {
    const userId = req.user.id;

    try {
      const { id } = req.params;
      const dados = req.body;

      const orcamento = await Orcamento.findOne({
        where: { id, userId },
      });

      if (!orcamento)
        return res.status(404).json({ error: "Orçamento não encontrado." });

      const itensAntigos = await OrcamentoItem.findAll({
        where: { orcamentoId: id, userId },
      });

      // repor estoque
      for (const item of itensAntigos) {
        if (item.produtoId) await reporEstoque(userId, item.produtoId, item.quantidade);
      }

      await OrcamentoItem.destroy({
        where: { orcamentoId: id, userId },
      });

      const itensProcessados = [];

      for (const item of dados.itens || []) {
        const descricaoItem = (item.descricao || "").trim();
        const quantidade = Number(item.quantidade) || 0;
        const precoUnitario =
          Number(item.precoUnitario ?? item.valorUnitario) || 0;

        if (!descricaoItem)
          return res.status(400).json({ error: "Item sem nome (descricao)." });

        const totalItem = quantidade * precoUnitario;

        if (item.produtoId)
          await debitarEstoque(userId, item.produtoId, quantidade);

        itensProcessados.push({
          descricao: descricaoItem,
          quantidade,
          precoUnitario,
          totalItem,
          produtoId: item.produtoId || null,
        });
      }

      const totais = calcularTotais({
        itens: itensProcessados,
        horasServico: dados.horasServico,
        valorHora: dados.valorHora,
        kmIda: dados.kmIda,
        kmVolta: dados.kmVolta,
        valorKm: dados.valorKm,
      });

      await orcamento.update({
        nomeCliente: dados.nomeCliente,
        descricao: dados.descricao || "",
        dataInicial: dados.dataInicial,
        dataValidade: dados.dataValidade,
        dataFinal: dados.dataFinal || null,
        maquinasManipuladas: dados.maquinasManipuladas || "",
        formaPagamento: dados.formaPagamento || "",
        condicaoPagamento: dados.condicaoPagamento || "",
        horasServico: Number(dados.horasServico) || 0,
        valorHora: Number(dados.valorHora) || 0,
        kmIda: Number(dados.kmIda) || 0,
        kmVolta: Number(dados.kmVolta) || 0,
        valorKm: Number(dados.valorKm) || 0,
        ...totais,
      });

      for (const item of itensProcessados) {
        await OrcamentoItem.create({
          ...item,
          orcamentoId: orcamento.id,
          userId,
        });
      }

      return res.json({ message: "Orçamento atualizado!" });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // REMOVER
  async remover(req, res) {
    const userId = req.user.id;

    try {
      const { id } = req.params;
      const { reporEstoque: repor } = req.body || {};

      const orcamento = await Orcamento.findOne({
        where: { id, userId },
      });

      if (!orcamento)
        return res.status(404).json({ error: "Orçamento não encontrado." });

      const itens = await OrcamentoItem.findAll({
        where: { orcamentoId: id, userId },
      });

      if (repor) {
        for (const item of itens) {
          if (item.produtoId && item.quantidade > 0) {
            await reporEstoque(userId, item.produtoId, item.quantidade);
          }
        }
      }

      await OrcamentoItem.destroy({ where: { orcamentoId: id, userId } });
      await orcamento.destroy();

      return res.json({ message: "Orçamento removido!" });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },
};
