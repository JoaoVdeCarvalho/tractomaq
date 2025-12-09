const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");

async function garantirAdmin() {
  try {
    let admin = await Usuario.findOne({ where: { email: "admin@gmail.com" } });

    if (!admin) {
      const senhaHash = await bcrypt.hash("123", 10);

      await Usuario.create({
        nome: "Administrador",
        email: "admin@gmail.com",
        senha: senhaHash,
        isAdmin: true
      });

      console.log("✔ Admin criado: admin@gmail.com / 123");
    } else {
      console.log("✔ Admin já existe.");
    }

  } catch (err) {
    console.error("Erro ao garantir admin:", err);
  }
}

module.exports = { garantirAdmin };
