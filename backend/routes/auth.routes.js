// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "segredo";



// LOGIN

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Email ou senha inválidos." });
    }

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) {
      return res.status(400).json({ error: "Email ou senha inválidos." });
    }

    // TOKEN agora inclui isAdmin
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro no servidor." });
  }
});



//                REGISTRO
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    if (!email || !senha || !confirmarSenha) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({ error: "As senhas não coincidem." });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ error: "Este email já está cadastrado." });
    }

    const hash = await bcrypt.hash(senha, 10);

    const novo = await Usuario.create({
      nome,
      email,
      senha: hash,
      isAdmin: false // usuário comum
    });

    return res.json({
      message: "Usuário registrado com sucesso!",
      user: {
        id: novo.id,
        email: novo.email,
        nome: novo.nome
      }
    });

  } catch (err) {
    console.error("Erro no registro:", err);
    return res.status(500).json({ error: "Erro no servidor." });
  }
});


module.exports = router;
