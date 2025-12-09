import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);

  // CAMPOS DO CADASTRO
  const [cadEmail, setCadEmail] = useState("");
  const [cadSenha, setCadSenha] = useState("");
  const [cadConfirmar, setCadConfirmar] = useState("");

  // CAMPOS DO LOGIN
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");


  //   FUNÇÃO LOGIN
  async function handleLogin() {
  if (!email || !senha) {
    return Swal.fire("Erro", "Preencha email e senha!", "error");
  }

  try {
    const response = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      // SALVAR DADOS CORRETAMENTE
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("token", data.token || "");

      Swal.fire("Sucesso!", "Login realizado!", "success");

      setTimeout(() => navigate("/"), 300);
    } else {
      Swal.fire("Erro", data.error, "error");
    }

  } catch (err) {
    Swal.fire("Erro", "Falha ao conectar ao servidor", "error");
  }
}


  //   FUNÇÃO CADASTRO
  async function handleRegister() {
    if (!cadEmail || !cadSenha || !cadConfirmar) {
      return Swal.fire("Erro", "Preencha todos os campos!", "error");
    }

    if (cadSenha !== cadConfirmar) {
      return Swal.fire("Erro", "As senhas não coincidem!", "error");
    }

    const response = await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cadEmail,
        senha: cadSenha,
        confirmarSenha: cadConfirmar
      })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire("Sucesso!", "Conta criada!", "success");
      setIsLogin(true); // Vai para a tela de login
    } else {
      Swal.fire("Erro", data.error, "error");
    }
  }

  return (
    <div className="login-page">
      <div className={`login-wrapper ${isLogin ? "login-mode" : ""}`}>

        {/*CADASTRO*/}
        <div className="panel panel-signup">
          <h2>Criar Conta</h2>
          <p>Preencha os dados para criar sua conta.</p>

          <input
            type="email"
            placeholder="Email"
            value={cadEmail}
            onChange={(e) => setCadEmail(e.target.value)}
            style={{ color: "#000" }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={cadSenha}
            onChange={(e) => setCadSenha(e.target.value)}
            style={{ color: "#000" }}
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={cadConfirmar}
            onChange={(e) => setCadConfirmar(e.target.value)}
            style={{ color: "#000" }}
          />

          <button className="btn-red" onClick={handleRegister}>Cadastrar</button>
        </div>

        {/*LOGIN*/}
        <div className="panel panel-login">
          <h2>Entrar</h2>
          <p>Informe seus dados para acessar o sistema.</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ color: "#000" }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ color: "#000" }}
          />

          <button className="btn-red" onClick={handleLogin}>Entrar</button>
        </div>

        {/*OVERLAY DESLIZANTE*/}
        <div className="overlay">
          <div className="overlay-content">
            {!isLogin ? (
              <>
                <h2>Olá!</h2>
                <p>Já possui uma conta? Clique abaixo para entrar.</p>
                <button className="btn-outline" onClick={() => setIsLogin(true)}>
                  Ir para Login
                </button>
              </>
            ) : (
              <>
                <h2>Bem-vindo!</h2>
                <p>Ainda não tem conta? Clique abaixo para se cadastrar.</p>
                <button className="btn-outline" onClick={() => setIsLogin(false)}>
                  Voltar ao Cadastro
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
