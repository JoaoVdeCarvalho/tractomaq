// backend/models/Orcamento.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Orcamento = sequelize.define("Orcamento", {
  nomeCliente: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  dataInicial: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  dataValidade: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  dataFinal: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  horasServico: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  valorHora: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  kmIda: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  kmVolta: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  valorKm: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  valorPecas: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  valorMaoDeObra: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  valorDeslocamento: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  valorTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },

  formaPagamento: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  condicaoPagamento: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  maquinasManipuladas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "orcamentos",
});

module.exports = Orcamento;
