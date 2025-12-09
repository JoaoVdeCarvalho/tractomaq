require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const sequelize = require("./config/database");

// MODELS
const Usuario = require("./models/Usuario");
const Produto = require("./models/Produto");
const Agendamento = require("./models/Agendamento");
const Orcamento = require("./models/Orcamento");
const OrcamentoItem = require("./models/OrcamentoItem");

// ASSOCIAR MODELS
Object.values(sequelize.models).forEach(model => {
  if (typeof model.associate === "function") {
    model.associate(sequelize.models);
  }
});


// CRIAR USUÁRIO PADRÃO TRACTOMAQ

async function criarUsuarioPadrao() {
  const bcrypt = require("bcryptjs");

  try {
    const existe = await Usuario.findOne({
      where: { email: "tractomaq@gmail.com" }
    });

    if (!existe) {
      const senhaHash = await bcrypt.hash("123456", 10);

      await Usuario.create({
        nome: "Tractomaq",
        email: "tractomaq@gmail.com",
        senha: senhaHash,
        isAdmin: false
      });

      console.log("✔ Usuário padrão criado: tractomaq@gmail.com / 123456");
    } else {
      console.log("✔ Usuário padrão já existe.");
    }

  } catch (err) {
    console.error("Erro ao criar usuário padrão:", err);
  }
}


// SINCRONIZAÇÃO + SEEDS
sequelize.sync({ alter: true })
  .then(async () => {
    console.log("✔ Banco sincronizado!");

    // Criar admin
    const { garantirAdmin } = require("./utils/seedAdmin");
    await garantirAdmin();

    // Criar usuário Tractomaq
    await criarUsuarioPadrao();

    console.log("✔ Seeds finalizados!");
  })
  .catch(err => console.error("Erro ao sincronizar:", err));

// ROTAS
app.use("/auth", require("./routes/auth.routes"));
app.use("/produtos", require("./routes/produtos.routes"));
app.use("/agendamentos", require("./routes/agendamentos.routes"));
app.use("/orcamentos", require("./routes/orcamentos.routes"));
app.use("/dashboard", require("./routes/dashboard.routes"));

// SERVER
app.listen(3001, () => console.log("🚀 Servidor rodando na porta 3001"));
