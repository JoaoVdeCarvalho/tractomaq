const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SECRET = process.env.JWT_SECRET || 'TRACTOMAQ_SUPER_SECRETO';

module.exports = {
  async register(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      }

      const existe = await Usuario.findOne({ where: { email } });
      if (existe) {
        return res.status(400).json({ error: 'Email já cadastrado.' });
      }

      const hash = await bcrypt.hash(senha, 10);
      const user = await Usuario.create({ email, senha: hash });

      return res.json({ message: 'Usuário cadastrado com sucesso!', id: user.id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const user = await Usuario.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Email ou senha inválidos.' });
      }

      const ok = await bcrypt.compare(senha, user.senha);
      if (!ok) {
        return res.status(400).json({ error: 'Email ou senha inválidos.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        message: 'Login realizado com sucesso!',
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao efetuar login.' });
    }
  },

  // 🚀 SEED AUTOMÁTICO DE USUÁRIOS PADRÃO
 async seedDefaultUsers() {
  try {
    const defaults = [
      { nome: "Administrador", email: "admin@tractomaq.com", senha: "123456" },
      { nome: "Tractomaq", email: "tractomaq@gmail.com", senha: "123456" }
    ];

    for (let user of defaults) {
      const existe = await Usuario.findOne({ where: { email: user.email } });

      if (!existe) {
        const hash = await bcrypt.hash(user.senha, 10);
        await Usuario.create({ 
          nome: user.nome,
          email: user.email,
          senha: hash 
        });
        console.log(`Usuário criado automaticamente: ${user.email}`);
      } else {
        console.log(`Usuário já existe: ${user.email}`);
      }
    }
  } catch (err) {
    console.error("Erro ao criar usuários padrão:", err);
  }
}


};
