import { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, BarElement, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend
} from "chart.js";
import "../assets/dashboard.css";

ChartJS.register(
  ArcElement, BarElement, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend
);

export default function Dashboard() {

  const token = localStorage.getItem("token");
  const [dados, setDados] = useState(null);
  const [graficoTipo, setGraficoTipo] = useState("pizza");

  async function carregar() {
    try {
      const res = await axios.get("http://localhost:3001/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDados(res.data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (!dados) return <div>Carregando...</div>;

  const { cards, semana, vencendoMes, marcasCount, statusCount } = dados;

  //GRÁFICO PRINCIPAL 
  const dataGraficoPrincipal = {
    labels: ["Produtos", "Agendamentos", "Orçamentos"],
    datasets: [
      {
        data: [
          cards.totalProdutos,
          cards.totalAgendamentos,
          cards.totalOrcamentos
        ],
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"]
      }
    ]
  };

  function renderGraficoPrincipal() {
    switch (graficoTipo) {
      case "pizza": return <Pie data={dataGraficoPrincipal} />;
      case "barra": return <Bar data={dataGraficoPrincipal} />;
      case "linha": return <Line data={dataGraficoPrincipal} />;
      default: return null;
    }
  }

  //PRODUTOS POR MARCA
  const graficoMarcas = {
    labels: Object.keys(marcasCount),
    datasets: [
      {
        label: "Qtd. de Produtos",
        data: Object.values(marcasCount),
        backgroundColor: "#1976D2"
      }
    ]
  };

  //AGENDAMENTOS POR STATUS
  const graficoStatus = {
    labels: ["Pendente", "Aguardando Pagamento", "Concluído"],
    datasets: [
      {
        data: [
          statusCount.PENDENTE,
          statusCount.AGUARDANDO_PAGAMENTO,
          statusCount.CONCLUIDO
        ],
        backgroundColor: ["#FF9800", "#2196F3", "#4CAF50"]
      }
    ]
  };

  return (
    <div className="dashboard-wrapper">

      <h2 className="titulo">Dashboard</h2>

      {/*CARDS*/}
      <div className="cards-linha">
        <div className="card"><p>Total Produtos</p><h3>{cards.totalProdutos}</h3></div>
        <div className="card"><p>Total Agendamentos</p><h3>{cards.totalAgendamentos}</h3></div>
        <div className="card"><p>Total Orçamentos</p><h3>{cards.totalOrcamentos}</h3></div>
        <div className="card fat"><p>Total Faturado</p><h3>R$ {cards.totalFaturado.toFixed(2)}</h3></div>
      </div>

      {/*GRÁFICO PRINCIPAL*/}
      <div className="grafico-container">
        <select
          className="select-grafico"
          value={graficoTipo}
          onChange={(e) => setGraficoTipo(e.target.value)}
        >
          <option value="pizza">Gráfico de Pizza</option>
          <option value="barra">Gráfico de Barras</option>
          <option value="linha">Gráfico de Linha</option>
        </select>

        <div className="grafico-box">
          {renderGraficoPrincipal()}
        </div>
      </div>

      {/*PRODUTOS POR MARCA*/}
      <div className="grafico-container">
        <h3 className="subtitulo">Produtos por Marca</h3>
        <div className="grafico-box">
          <Bar data={graficoMarcas} />
        </div>
      </div>

      {/*AGENDAMENTOS POR STATUS*/}
      <div className="grafico-container">
        <h3 className="subtitulo">Agendamentos por Status</h3>
        <div className="grafico-box">
          <Pie data={graficoStatus} />
        </div>
      </div>

      {/*LISTAS*/}
      <div className="listas-container">
        <div className="lista">
          <h3>Agendamentos da Semana</h3>
          {semana.length === 0 && <p>Nenhum agendamento.</p>}
          {semana.map(a => (
            <div key={a.id} className="linha-item">
              <strong>{a.clienteNome}</strong>
              <span>{a.data} — {a.horario}</span>
            </div>
          ))}
        </div>

        <div className="lista">
          <h3>Orçamentos que vencem neste mês</h3>
          {vencendoMes.length === 0 && <p>Nenhum orçamento com validade este mês.</p>}
          {vencendoMes.map(o => (
            <div key={o.id} className="linha-item">
              <strong>{o.nomeCliente}</strong>
              <span>Vence: {o.dataValidade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
