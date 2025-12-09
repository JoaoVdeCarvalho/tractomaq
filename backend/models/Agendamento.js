const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Agendamento = sequelize.define(
  "Agendamento",
  {
    clienteNome: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    tipoServico: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    descricao: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    horario: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PENDENTE",
    },

    observacoes: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "agendamentos",
  }
);

Agendamento.associate = (models) => {
  Agendamento.belongsTo(models.Usuario, {
    foreignKey: "userId",
    as: "usuario",
  });
};

module.exports = Agendamento;
