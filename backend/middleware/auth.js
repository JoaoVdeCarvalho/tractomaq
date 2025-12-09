// middleware/auth.js
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "segredo";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado." });
  }

  const [scheme, token] = authHeader.split(" ");

  if (!scheme || !token || !/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Formato do token inválido." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    // Agora passa TAMBÉM o isAdmin
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false
    };

    return next();

  } catch (err) {
    console.error("Erro ao validar token:", err.message);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
