const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrcamentoItem = sequelize.define("OrcamentoItem", {
  descricao: DataTypes.STRING,
  quantidade: DataTypes.FLOAT,
  precoUnitario: DataTypes.FLOAT,
  totalItem: DataTypes.FLOAT,

  produtoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  orcamentoId: DataTypes.INTEGER,
  userId: DataTypes.INTEGER,
}, {
  tableName: "orcamento_itens",
});

OrcamentoItem.associate = (models) => {
  OrcamentoItem.belongsTo(models.Orcamento, {
    foreignKey: "orcamentoId",
    as: "orcamento",
  });

  OrcamentoItem.belongsTo(models.Produto, {
    foreignKey: "produtoId",
    as: "produto",
  });
};

module.exports = OrcamentoItem;
