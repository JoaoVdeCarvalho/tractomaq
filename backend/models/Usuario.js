// models/Usuario.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define("Usuario", {
  nome: {
    type: DataTypes.STRING,
    allowNull: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // identifica se é administrador
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "usuarios",
});



//     ASSOCIAÇÕES
Usuario.associate = (models) => {
  Usuario.hasMany(models.Produto, { foreignKey: "userId", as: "produtos" });
  Usuario.hasMany(models.Orcamento, { foreignKey: "userId", as: "orcamentos" });
  Usuario.hasMany(models.Agendamento, { foreignKey: "userId", as: "agendamentos" });
};

module.exports = Usuario;
