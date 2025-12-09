import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../assets/agenda.css";

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState("criar"); // criar | editar | visualizar

  const [filtros, setFiltros] = useState({
    busca: "",
    data: "",
    status: "",
  });

  const [form, setForm] = useState({
    id: null,
    clienteNome: "",
    tipoServico: "",
    descricao: "",
    data: "",
    horario: "",
    observacoes: "",
    status: "PENDENTE",
  });

  const token = localStorage.getItem("token");

  // Carregar agendamentos do backend
  async function carregarAgendamentos() {
    try {
      const res = await axios.get("http://localhost:3001/agendamentos", {
        headers: { Authorization: `Bearer ${token}` },
        params: filtros,
      });

      setAgendamentos(res.data);
    } catch (err) {
      console.error("ERRO LISTAR AGENDA:", err);
      Swal.fire("Erro", "Falha ao carregar agendamentos!", "error");
    }
  }

  useEffect(() => {
    carregarAgendamentos();
  }, [filtros]);


  // Abrir / Fechar modais
  function abrirModalCriar() {
    setModo("criar");
    setForm({
      id: null,
      clienteNome: "",
      tipoServico: "",
      descricao: "",
      data: "",
      horario: "",
      observacoes: "",
      status: "PENDENTE",
    });
    setModalAberto(true);
  }

  function abrirModalEditar(a) {
    setModo("editar");
    setForm({
      id: a.id,
      clienteNome: a.clienteNome,
      tipoServico: a.tipoServico,
      descricao: a.descricao,
      data: a.data,
      horario: a.horario,
      observacoes: a.observacoes || "",
      status: a.status,
    });
    setModalAberto(true);
  }

  function abrirModalVer(a) {
    setModo("visualizar");
    setForm({
      id: a.id,
      clienteNome: a.clienteNome,
      tipoServico: a.tipoServico,
      descricao: a.descricao,
      data: a.data,
      horario: a.horario,
      observacoes: a.observacoes || "",
      status: a.status,
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }


  // Salvar
  async function salvarAgendamento() {
    try {
      if (!form.clienteNome || !form.tipoServico || !form.data || !form.horario) {
        Swal.fire("Atenção", "Preencha cliente, serviço, data e horário.", "warning");
        return;
      }

      if (modo === "criar") {
        await axios.post("http://localhost:3001/agendamentos", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Sucesso", "Agendamento criado!", "success");
      } else {
        await axios.put(`http://localhost:3001/agendamentos/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Sucesso", "Agendamento atualizado!", "success");
      }

      fecharModal();
      carregarAgendamentos();
    } catch (err) {
      console.error("ERRO SALVAR:", err);
      Swal.fire("Erro", "Falha ao salvar agendamento!", "error");
    }
  }

  // Excluir
  async function excluirAgendamento() {
    if (!form.id) return;

    const confirm = await Swal.fire({
      title: "Excluir agendamento?",
      text: "Isso não poderá ser desfeito.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3001/agendamentos/${form.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Excluído!", "Agendamento removido.", "success");
      fecharModal();
      carregarAgendamentos();
    } catch (err) {
      console.error("ERRO EXCLUIR:", err);
      Swal.fire("Erro", "Falha ao excluir agendamento!", "error");
    }
  }

  // Utilidades
  function formatarDataISO(d) {
    if (!d) return "";
    const [a, m, dia] = d.split("-");
    return `${dia}/${m}/${a}`;
  }

  const proximos = agendamentos.filter(a => a.status !== "CONCLUIDO");
  const concluidos = agendamentos.filter(a => a.status === "CONCLUIDO");

  function agrupar(lista) {
    const out = {};
    lista.forEach(a => {
      if (!out[a.data]) out[a.data] = [];
      out[a.data].push(a);
    });
    return out;
  }

  const ativosPorDia = agrupar(proximos);
  const concluidosPorDia = agrupar(concluidos);

  function getStatusInfo(s) {
    return {
      PENDENTE: { label: "Pendente", className: "status-pendente" },
      AGUARDANDO_PAGAMENTO: { label: "Aguardando pagamento", className: "status-pagamento" },
      CONCLUIDO: { label: "Concluído", className: "status-concluido" },
    }[s] || { label: s, className: "status-pendente" };
  }

  // JSX
  return (
    <div className="agenda-container">

      <div className="agenda-header">
        <h2>Agenda de serviços</h2>
        <button className="btn-novo" onClick={abrirModalCriar}>
          + NOVO AGENDAMENTO
        </button>
      </div>

      {/* FILTROS */}
      <div className="agenda-filters">
        <input
          type="text"
          placeholder="Buscar por nome ou ID"
          value={filtros.busca}
          onChange={e => setFiltros({ ...filtros, busca: e.target.value })}
        />

        <input
          type="date"
          value={filtros.data}
          onChange={e => setFiltros({ ...filtros, data: e.target.value })}
        />

        <select
          value={filtros.status}
          onChange={e => setFiltros({ ...filtros, status: e.target.value })}
        >
          <option value="">Status: Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
      </div>

      {/* ATIVOS */}
      <div className="agenda-section-title">AGENDAMENTOS ATIVOS</div>

      {Object.keys(ativosPorDia).length === 0 && <p>Nenhum agendamento ativo.</p>}

      {Object.keys(ativosPorDia).map(dia => (
        <div key={dia}>
          <div className="agenda-day-box">DIA {formatarDataISO(dia)}</div>

          {ativosPorDia[dia].map(a => {
            const info = getStatusInfo(a.status);
            return (
              <div className="agenda-card" key={a.id}>
                <div className="agenda-card-content">
                  <div>
                    <strong>{a.horario} {a.clienteNome}</strong>
                    <div>{a.tipoServico}</div>
                  </div>

                  <div>
                    <strong>Descrição</strong>
                    <div>{a.descricao}</div>
                  </div>
                </div>

                <div className="agenda-card-footer">
                  <span className={`agenda-status ${info.className}`}>
                    {info.label}
                  </span>

                  <div className="agenda-actions">
                    <span onClick={() => abrirModalEditar(a)}>Editar</span>
                    <span onClick={() => abrirModalVer(a)}>Ver</span>
                    <span onClick={() => abrirModalEditar(a)}>Concluir / Status</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* CONCLUÍDOS */}
      <div className="agenda-section-title" style={{ marginTop: 25 }}>
        SERVIÇOS CONCLUÍDOS
      </div>

      {Object.keys(concluidosPorDia).length === 0 && <p>Nenhum serviço concluído.</p>}

      {Object.keys(concluidosPorDia).map(dia => (
        <div key={dia}>
          <div className="agenda-day-box">DIA {formatarDataISO(dia)}</div>

          {concluidosPorDia[dia].map(a => {
            const info = getStatusInfo(a.status);
            return (
              <div className="agenda-card" key={a.id}>
                <div className="agenda-card-content">
                  <div>
                    <strong>{a.horario} {a.clienteNome}</strong>
                    <div>{a.tipoServico}</div>
                  </div>

                  <div>
                    <strong>Descrição</strong>
                    <div>{a.descricao}</div>
                  </div>
                </div>

                <div className="agenda-card-footer">
                  <span className={`agenda-status ${info.className}`}>
                    {info.label}
                  </span>

                  <div className="agenda-actions">
                    <span onClick={() => abrirModalVer(a)}>Ver</span>
                    <span onClick={() => abrirModalEditar(a)}>Editar</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* MODAL */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-container">

            <h3 className="modal-title">
              {modo === "criar" && "Novo agendamento"}
              {modo === "editar" && "Editar agendamento"}
              {modo === "visualizar" && "Detalhes do agendamento"}
            </h3>

            <div className="modal-form">
              <input
                type="text"
                placeholder="Nome do cliente"
                value={form.clienteNome}
                disabled={modo === "visualizar"}
                onChange={e => setForm({ ...form, clienteNome: e.target.value })}
              />

              <input
                type="text"
                placeholder="Tipo de serviço"
                value={form.tipoServico}
                disabled={modo === "visualizar"}
                onChange={e => setForm({ ...form, tipoServico: e.target.value })}
              />

              <input
                type="text"
                placeholder="Descrição da máquina / serviço"
                value={form.descricao}
                disabled={modo === "visualizar"}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="date"
                  value={form.data}
                  disabled={modo === "visualizar"}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                />

                <input
                  type="time"
                  value={form.horario}
                  disabled={modo === "visualizar"}
                  onChange={e => setForm({ ...form, horario: e.target.value })}
                />
              </div>

              <select
                value={form.status}
                disabled={modo === "visualizar"}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>

              <textarea
                rows={4}
                placeholder="Observações"
                value={form.observacoes}
                disabled={modo === "visualizar"}
                onChange={e => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>

            <div className="modal-buttons">
              {modo !== "criar" && (
                <button className="btn-delete" onClick={excluirAgendamento}>
                  Excluir
                </button>
              )}

              <button className="btn-cancel" onClick={fecharModal}>
                Fechar
              </button>

              {modo !== "visualizar" && (
                <button className="btn-save" onClick={salvarAgendamento}>
                  Salvar
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
