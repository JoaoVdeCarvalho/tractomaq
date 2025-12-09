const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Produto = sequelize.define("Produto", {
  nome: DataTypes.STRING,
  marca: DataTypes.STRING,
  categoria: DataTypes.STRING,
  maquina: DataTypes.STRING,
  quantidade: DataTypes.FLOAT,
  valorUnitario: DataTypes.FLOAT,
  userId: DataTypes.INTEGER,
}, {
  tableName: "produtos",
});

Produto.associate = (models) => {
  Produto.belongsTo(models.Usuario, { foreignKey: "userId", as: "usuario" });

  Produto.hasMany(models.OrcamentoItem, {
    foreignKey: "produtoId",
    as: "itensProduto",
  });
};

module.exports = Produto;
