import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../assets/estoque.css";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState("criar");

  // CAMPOS DE FILTRO SEPARADOS
  const [filtro, setFiltro] = useState({
    id: "",
    nome: "",
    marca: "",
    categoria: "",
    maquina: "",
  });

  const [form, setForm] = useState({
    id: null,
    nome: "",
    marca: "",
    categoria: "",
    maquina: "",
    quantidade: "",
    valorUnitario: "",
  });

  const token = localStorage.getItem("token");

  async function carregarProdutos() {
    try {
      const res = await axios.get("http://localhost:3001/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProdutos(res.data);
    } catch (err) {
      Swal.fire("Erro", "Falha ao carregar produtos.", "error");
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  // FILTRAGEM LOCAL
  const produtosFiltrados = produtos.filter((p) => {
    return (
      (filtro.id === "" || p.id.toString().includes(filtro.id)) &&
      (filtro.nome === "" || p.nome.toLowerCase().includes(filtro.nome.toLowerCase())) &&
      (filtro.marca === "" || p.marca.toLowerCase().includes(filtro.marca.toLowerCase())) &&
      (filtro.categoria === "" || p.categoria.toLowerCase().includes(filtro.categoria.toLowerCase())) &&
      (filtro.maquina === "" || p.maquina.toLowerCase().includes(filtro.maquina.toLowerCase()))
    );
  });

  function abrirCriar() {
    setModo("criar");
    setForm({
      id: null,
      nome: "",
      marca: "",
      categoria: "",
      maquina: "",
      quantidade: "",
      valorUnitario: "",
    });
    setModalAberto(true);
  }

  function abrirEditar(p) {
    setModo("editar");
    setForm({
      id: p.id,
      nome: p.nome,
      marca: p.marca,
      categoria: p.categoria,
      maquina: p.maquina,
      quantidade: p.quantidade,
      valorUnitario: p.valorUnitario,
    });
    setModalAberto(true);
  }

  function abrirVer(p) {
    setModo("ver");
    setForm({ ...p });
    setModalAberto(true);
  }

  async function salvar() {
    try {
      if (!form.nome || !form.marca || !form.categoria || !form.quantidade) {
        Swal.fire("Atenção", "Preencha todos os campos obrigatórios.", "warning");
        return;
      }

      if (modo === "criar") {
        await axios.post("http://localhost:3001/produtos", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.put(`http://localhost:3001/produtos/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Swal.fire("Sucesso", "Produto salvo!", "success");
      setModalAberto(false);
      carregarProdutos();
    } catch (err) {
      Swal.fire("Erro", "Falha ao salvar produto.", "error");
    }
  }

  async function remover(id) {
    const confirmar = await Swal.fire({
      title: "Tem certeza?",
      text: "O produto será removido do sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3001/produtos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Removido!", "Produto deletado.", "success");
      carregarProdutos();
    } catch (err) {
      Swal.fire("Erro", "Falha ao remover produto.", "error");
    }
  }

  return (
    <div className="estoque-container">

      <div className="estoque-header">
        <h2>Estoque</h2>
        <button className="btn-add" onClick={abrirCriar}>
          + Adicionar Produto
        </button>
      </div>

      {/* FILTROS SEPARADOS */}
      <div className="filtros-container">
        <input placeholder="ID" className="filtro" onChange={(e) => setFiltro({ ...filtro, id: e.target.value })} />
        <input placeholder="Nome" className="filtro" onChange={(e) => setFiltro({ ...filtro, nome: e.target.value })} />
        <input placeholder="Marca" className="filtro" onChange={(e) => setFiltro({ ...filtro, marca: e.target.value })} />
        <input placeholder="Categoria" className="filtro" onChange={(e) => setFiltro({ ...filtro, categoria: e.target.value })} />
        <input placeholder="Máquina" className="filtro" onChange={(e) => setFiltro({ ...filtro, maquina: e.target.value })} />
      </div>

      {/* TABELA */}
      <table className="estoque-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Marca</th>
            <th>Categoria</th>
            <th>Máquina</th>
            <th>Qtd</th>
            <th>Valor Unitário (R$)</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtosFiltrados.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nome}</td>
              <td>{p.marca}</td>
              <td>{p.categoria}</td>
              <td>{p.maquina}</td>
              <td>{p.quantidade}</td>
              <td>{Number(p.valorUnitario).toFixed(2)}</td>
              <td className="acoes-col">
                <span className="icon-btn" onClick={() => abrirVer(p)}>👁️</span>
                <span className="icon-btn" onClick={() => abrirEditar(p)}>✏️</span>
                <span className="icon-btn" onClick={() => remover(p.id)}>🗑️</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>{modo === "criar" ? "Novo Produto" : modo === "editar" ? "Editar Produto" : "Detalhes"}</h3>

            <div className="modal-form">
              <input value={form.nome} placeholder="Nome"
                     disabled={modo === "ver"}
                     onChange={(e) => setForm({ ...form, nome: e.target.value })} />

              <input value={form.marca} placeholder="Marca"
                     disabled={modo === "ver"}
                     onChange={(e) => setForm({ ...form, marca: e.target.value })} />

              <input value={form.categoria} placeholder="Categoria"
                     disabled={modo === "ver"}
                     onChange={(e) => setForm({ ...form, categoria: e.target.value })} />

              <input value={form.maquina} placeholder="Máquina"
                     disabled={modo === "ver"}
                     onChange={(e) => setForm({ ...form, maquina: e.target.value })} />

              <input type="number" value={form.quantidade} placeholder="Quantidade"
                     disabled={modo === "ver"}
                     onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />

              <input type="number" value={form.valorUnitario} placeholder="Valor Unitário (R$)"
                     disabled={modo === "ver"}
                     onChange={(e) => setForm({ ...form, valorUnitario: e.target.value })} />
            </div>

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setModalAberto(false)}>Fechar</button>

              {modo !== "ver" && (
                <button className="btn-save" onClick={salvar}>Salvar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
