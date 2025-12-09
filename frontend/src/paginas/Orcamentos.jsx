import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../assets/orcamentos.css";

export default function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [produtosEstoque, setProdutosEstoque] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState("criar"); // criar | editar | visualizar

  const [filtros, setFiltros] = useState({
    busca: "",
    dataInicial: "",
    dataValidade: "",
    dataFinal: "",
  });

  const estadoInicialForm = {
    id: null,
    nomeCliente: "",
    maquinasManipuladas: "",
    descricao: "",
    dataInicial: "",
    dataValidade: "",
    dataFinal: "",
    horasServico: "",
    valorHora: "",
    kmIda: "",
    kmVolta: "",
    valorKm: "",
    formaPagamento: "",
    condicaoPagamento: "",
    valorPecas: 0,
    valorMaoDeObra: 0,
    valorDeslocamento: 0,
    valorTotal: 0,
  };

  const [form, setForm] = useState(estadoInicialForm);

  const [itens, setItens] = useState([]);
  const [novoItem, setNovoItem] = useState({
    produtoId: "",
    quantidade: "",
  });

  const token = localStorage.getItem("token");

  // Helpers de cálculo local
  function calcularTotaisLocal(formValues, itensLista) {
    const valorPecas = itensLista.reduce((soma, item) => {
      const total = Number(item.totalItem) || 0;
      return soma + total;
    }, 0);

    const horas = Number(formValues.horasServico) || 0;
    const valorHora = Number(formValues.valorHora) || 0;
    const valorMaoDeObra = horas * valorHora;

    const kmIda = Number(formValues.kmIda) || 0;
    const kmVolta = Number(formValues.kmVolta) || 0;
    const valorKm = Number(formValues.valorKm) || 0;
    const distancia = kmIda + kmVolta;
    const valorDeslocamento = distancia * valorKm;

    const valorTotal = valorPecas + valorMaoDeObra + valorDeslocamento;

    return {
      valorPecas,
      valorMaoDeObra,
      valorDeslocamento,
      valorTotal,
    };
  }

  function atualizarForm(campo, valor) {
    setForm((prev) => {
      const novo = { ...prev, [campo]: valor };
      const totais = calcularTotaisLocal(novo, itens);
      return { ...novo, ...totais };
    });
  }

  // Carregar dados
  async function carregarOrcamentos() {
    try {
      const res = await axios.get("http://localhost:3001/orcamentos", {
        headers: { Authorization: `Bearer ${token}` },
        params: filtros,
      });
      setOrcamentos(res.data || []);
    } catch (err) {
      console.error("Erro ao listar orçamentos:", err);
      Swal.fire(
        "Erro",
        err.response?.data?.error || "Falha ao carregar orçamentos.",
        "error"
      );
    }
  }

  async function carregarProdutos() {
    try {
      const res = await axios.get("http://localhost:3001/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutosEstoque(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  }

  useEffect(() => {
    carregarOrcamentos();
  }, [filtros]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Abrir / Fechar modal
  function abrirModalCriar() {
    setModo("criar");
    setForm(estadoInicialForm);
    setItens([]);
    setNovoItem({ produtoId: "", quantidade: "" });
    setModalAberto(true);
  }

  async function abrirModal(tipo, id) {
    if (tipo === "criar") return abrirModalCriar();

    setModo(tipo);

    try {
      const res = await axios.get(`http://localhost:3001/orcamentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { orcamento, itens: itensResp } = res.data;

      const formCarregado = {
        id: orcamento.id,
        nomeCliente: orcamento.nomeCliente || "",
        maquinasManipuladas: orcamento.maquinasManipuladas || "",
        descricao: orcamento.descricao || "",
        dataInicial: orcamento.dataInicial || "",
        dataValidade: orcamento.dataValidade || "",
        dataFinal: orcamento.dataFinal || "",
        horasServico: orcamento.horasServico?.toString() || "",
        valorHora: orcamento.valorHora?.toString() || "",
        kmIda: orcamento.kmIda?.toString() || "",
        kmVolta: orcamento.kmVolta?.toString() || "",
        valorKm: orcamento.valorKm?.toString() || "",
        formaPagamento: orcamento.formaPagamento || "",
        condicaoPagamento: orcamento.condicaoPagamento || "",
        valorPecas: orcamento.valorPecas || 0,
        valorMaoDeObra: orcamento.valorMaoDeObra || 0,
        valorDeslocamento: orcamento.valorDeslocamento || 0,
        valorTotal: orcamento.valorTotal || 0,
      };

      const itensCarregados = (itensResp || []).map((i) => ({
        id: i.id,
        produtoId: i.produtoId,
        descricao: i.descricao,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        totalItem: i.totalItem,
      }));

      const totaisLocal = calcularTotaisLocal(formCarregado, itensCarregados);

      setForm({ ...formCarregado, ...totaisLocal });
      setItens(itensCarregados);
      setNovoItem({ produtoId: "", quantidade: "" });
      setModalAberto(true);
    } catch (err) {
      console.error("Erro ao carregar orçamento:", err);
      Swal.fire(
        "Erro",
        err.response?.data?.error || "Falha ao carregar orçamento.",
        "error"
      );
    }
  }

  function fecharModal() {
    setModalAberto(false);
  }

  // Itens (Peças utilizadas)
  function handleNovoItemChange(campo, valor) {
    setNovoItem((prev) => ({ ...prev, [campo]: valor }));
  }
    async function adicionarItem() {
    const produtoIdNum = Number(novoItem.produtoId);
    const quantidadeNum = Number(novoItem.quantidade);

    if (!produtoIdNum || quantidadeNum <= 0) {
      Swal.fire(
        "Atenção",
        "Selecione um produto e informe uma quantidade maior que zero.",
        "warning"
      );
      return;
    }

    const produto = produtosEstoque.find((p) => p.id === produtoIdNum);
    if (!produto) {
      Swal.fire("Erro", "Produto não encontrado no estoque.", "error");
      return;
    }

    const preco = Number(produto.valorUnitario) || 0;

    const totalItem = quantidadeNum * preco;

    const novo = {
      produtoId: produto.id,
      descricao: produto.nome,
      quantidade: quantidadeNum,
      precoUnitario: preco,
      totalItem,
    };


    const listaNova = [...itens, novo];
    setItens(listaNova);

    setNovoItem({ produtoId: "", quantidade: "" });

    setForm((prev) => {
      const totais = calcularTotaisLocal(prev, listaNova);
      return { ...prev, ...totais };
    });
  }

  function removerItem(index) {
    const listaNova = itens.filter((_, i) => i !== index);
    setItens(listaNova);
    setForm((prev) => {
      const totais = calcularTotaisLocal(prev, listaNova);
      return { ...prev, ...totais };
    });
  }

  // Salvar (Criar / Editar)
  async function salvarOrcamento() {
    try {
      if (!form.nomeCliente) {
        Swal.fire("Atenção", "Informe o nome do cliente.", "warning");
        return;
      }

      if (!form.dataInicial || !form.dataValidade) {
        Swal.fire(
          "Atenção",
          "Informe pelo menos data inicial e validade.",
          "warning"
        );
        return;
      }

      if (form.dataFinal && form.dataFinal < form.dataInicial) {
        Swal.fire(
          "Atenção",
          "A data final não pode ser menor que a data inicial.",
          "warning"
        );
        return;
      }

      for (const item of itens) {
        if (!item.descricao || item.descricao.trim() === "") {
          Swal.fire("Erro", "Há um item sem nome/descrição.", "error");
          return;
        }
      }

      const payload = {
        nomeCliente: form.nomeCliente,
        maquinasManipuladas: form.maquinasManipuladas,
        descricao: form.descricao,
        dataInicial: form.dataInicial,
        dataValidade: form.dataValidade,
        dataFinal: form.dataFinal || null,
        horasServico: Number(form.horasServico) || 0,
        valorHora: Number(form.valorHora) || 0,
        kmIda: Number(form.kmIda) || 0,
        kmVolta: Number(form.kmVolta) || 0,
        valorKm: Number(form.valorKm) || 0,
        formaPagamento: form.formaPagamento,
        condicaoPagamento: form.condicaoPagamento,
        itens: itens.map((i) => ({
          produtoId: i.produtoId,
          descricao: i.descricao,         // <- CORREÇÃO
          quantidade: i.quantidade,
          valorUnitario: i.precoUnitario, // <- CORREÇÃO
        })),
      };


      if (modo === "criar") {
        await axios.post("http://localhost:3001/orcamentos", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Sucesso", "Orçamento criado!", "success");
      } else if (modo === "editar" && form.id) {
        await axios.put(
          `http://localhost:3001/orcamentos/${form.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Sucesso", "Orçamento atualizado!", "success");
      }

      fecharModal();
      carregarOrcamentos();
    } catch (err) {
      console.error("ERRO SALVAR:", err);
      Swal.fire(
        "Erro",
        err.response?.data?.error || "Falha ao salvar orçamento.",
        "error"
      );
    }
  }

  // Excluir orçamento
  async function excluirOrcamento(orc) {
    const result = await Swal.fire({
      title: `Excluir orçamento #${orc.id}?`,
      text: "Deseja repor o estoque das peças utilizadas?",
      icon: "warning",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Excluir + REPOR estoque",
      denyButtonText: "Excluir sem repor",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed && !result.isDenied) return;

    const reporEstoque = result.isConfirmed;

    try {
      await axios.delete(`http://localhost:3001/orcamentos/${orc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reporEstoque },
      });

      Swal.fire("Sucesso", "Orçamento removido.", "success");
      carregarOrcamentos();
    } catch (err) {
      Swal.fire(
        "Erro",
        err.response?.data?.error || "Falha ao excluir orçamento.",
        "error"
      );
    }
  }

  // Formatação
  function formatarData(iso) {
    if (!iso) return "";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function formatarMoeda(v) {
    const num = Number(v) || 0;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
    return (
    <div className="orcamentos-container">
      <div className="orcamentos-topo">
        <h2>Orçamentos</h2>
        <button className="btn-novo-orcamento" onClick={abrirModalCriar}>
          + NOVO ORÇAMENTO
        </button>
      </div>

      {/* FILTROS */}
      <div className="orcamentos-filtros">
        <input
          type="text"
          placeholder="Buscar por cliente ou ID"
          value={filtros.busca}
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, busca: e.target.value }))
          }
        />

        <div className="orcamentos-filtro-bloco">
          <label>Data inicial</label>
          <input
            type="date"
            value={filtros.dataInicial}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, dataInicial: e.target.value }))
            }
          />
        </div>

        <div className="orcamentos-filtro-bloco">
          <label>Validade</label>
          <input
            type="date"
            value={filtros.dataValidade}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                dataValidade: e.target.value,
              }))
            }
          />
        </div>

        <div className="orcamentos-filtro-bloco">
          <label>Data final</label>
          <input
            type="date"
            value={filtros.dataFinal}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, dataFinal: e.target.value }))
            }
          />
        </div>
      </div>

      {/* TABELA */}
      <table className="orcamentos-tabela">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Data inicial</th>
            <th>Validade</th>
            <th>Data final</th>
            <th>Total</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {orcamentos.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 10 }}>
                Nenhum orçamento encontrado.
              </td>
            </tr>
          ) : (
            orcamentos.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.nomeCliente}</td>
                <td>{formatarData(o.dataInicial)}</td>
                <td>{formatarData(o.dataValidade)}</td>
                <td>{formatarData(o.dataFinal)}</td>
                <td>{formatarMoeda(o.valorTotal)}</td>
                <td>
                  <div className="orcamentos-acoes">
                    <button
                      className="icon-btn"
                      onClick={() => abrirModal("visualizar", o.id)}
                      title="Visualizar"
                    >
                      👁
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => abrirModal("editar", o.id)}
                      title="Editar"
                    >
                      ✏
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => excluirOrcamento(o)}
                      title="Excluir"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {modalAberto && (
        <div className="orcamento-modal-overlay">
          <div className="orcamento-modal">
            <div className="orcamento-modal-header">
              <h3>
                {modo === "criar" && "Novo orçamento"}
                {modo === "editar" && `Editar orçamento #${form.id}`}
                {modo === "visualizar" && `Orçamento #${form.id}`}
              </h3>

              <button className="modal-fechar" onClick={fecharModal}>
                X
              </button>
            </div>

            <div className="orcamento-modal-body">
              {/* CLIENTE + DATAS */}
              <div className="orcamento-grid-top">
                <div className="orcamento-bloco">
                  <h4>Dados do cliente</h4>

                  <label>Cliente</label>
                  <input
                    type="text"
                    disabled={modo === "visualizar"}
                    value={form.nomeCliente}
                    onChange={(e) =>
                      atualizarForm("nomeCliente", e.target.value)
                    }
                  />

                  <label>Máquinas manipuladas</label>
                  <input
                    type="text"
                    disabled={modo === "visualizar"}
                    value={form.maquinasManipuladas}
                    onChange={(e) =>
                      atualizarForm("maquinasManipuladas", e.target.value)
                    }
                  />

                  <label>Descrição do serviço</label>
                  <textarea
                    rows={3}
                    disabled={modo === "visualizar"}
                    value={form.descricao}
                    onChange={(e) =>
                      atualizarForm("descricao", e.target.value)
                    }
                  />
                </div>

                <div className="orcamento-bloco">
                  <h4>Datas</h4>

                  <div className="orcamento-linha-datas">
                    <div>
                      <label>Data inicial</label>
                      <input
                        type="date"
                        disabled={modo === "visualizar"}
                        value={form.dataInicial}
                        onChange={(e) =>
                          atualizarForm("dataInicial", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label>Validade</label>
                      <input
                        type="date"
                        disabled={modo === "visualizar"}
                        value={form.dataValidade}
                        onChange={(e) =>
                          atualizarForm("dataValidade", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label>Data final</label>
                      <input
                        type="date"
                        disabled={modo === "visualizar"}
                        value={form.dataFinal}
                        onChange={(e) =>
                          atualizarForm("dataFinal", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <h4>Mão de obra</h4>
                  <div className="orcamento-linha-dupla">
                    <div>
                      <label>Horas</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        disabled={modo === "visualizar"}
                        value={form.horasServico}
                        onChange={(e) =>
                          atualizarForm("horasServico", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label>Valor/hora (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={modo === "visualizar"}
                        value={form.valorHora}
                        onChange={(e) =>
                          atualizarForm("valorHora", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="orcamento-resumo-campo">
                    Total mão de obra:{" "}
                    <strong>{formatarMoeda(form.valorMaoDeObra)}</strong>
                  </div>

                  <h4>Deslocamento</h4>
                  <div className="orcamento-linha-tripla">
                    <div>
                      <label>KM ida</label>
                      <input
                        type="number"
                        min="0"
                        disabled={modo === "visualizar"}
                        value={form.kmIda}
                        onChange={(e) => atualizarForm("kmIda", e.target.value)}
                      />
                    </div>

                    <div>
                      <label>KM volta</label>
                      <input
                        type="number"
                        min="0"
                        disabled={modo === "visualizar"}
                        value={form.kmVolta}
                        onChange={(e) =>
                          atualizarForm("kmVolta", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label>Valor por KM</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={modo === "visualizar"}
                        value={form.valorKm}
                        onChange={(e) =>
                          atualizarForm("valorKm", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="orcamento-resumo-campo">
                    Total deslocamento:{" "}
                    <strong>{formatarMoeda(form.valorDeslocamento)}</strong>
                  </div>
                </div>
              </div>

              {/* PEÇAS */}
              <div className="orcamento-bloco grande">
                <h4>Peças utilizadas</h4>

                {modo !== "visualizar" && (
                  <div className="orcamento-add-item">
                    <div>
                      <label>Produto</label>
                      <select
                        value={novoItem.produtoId}
                        onChange={(e) =>
                          handleNovoItemChange("produtoId", e.target.value)
                        }
                      >
                        <option value="">Selecione</option>

                        {produtosEstoque.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} – {formatarMoeda(p.valorUnitario)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Qtd</label>
                      <input
                        type="number"
                        min="1"
                        value={novoItem.quantidade}
                        onChange={(e) =>
                          handleNovoItemChange("quantidade", e.target.value)
                        }
                      />
                    </div>

                    <button className="btn-add-item" onClick={adicionarItem}>
                      + Adicionar
                    </button>
                  </div>
                )}

                <table className="orcamento-itens-tabela">
                  <thead>
                    <tr>
                      <th>Peça</th>
                      <th>Qtd</th>
                      <th>Unitário</th>
                      <th>Total</th>
                      {modo !== "visualizar" && <th>Ações</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {itens.length === 0 && (
                      <tr>
                        <td
                          colSpan={modo === "visualizar" ? 4 : 5}
                          style={{ textAlign: "center", padding: 10 }}
                        >
                          Nenhuma peça adicionada
                        </td>
                      </tr>
                    )}

                    {itens.map((item, index) => (
                      <tr key={index}>
                        <td>{item.descricao}</td>
                        <td>{item.quantidade}</td>
                        <td>{formatarMoeda(item.precoUnitario)}</td>
                        <td>{formatarMoeda(item.totalItem)}</td>

                        {modo !== "visualizar" && (
                          <td>
                            <button
                              className="icon-btn"
                              onClick={() => removerItem(index)}
                            >
                              🗑
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="orcamento-resumo-campo">
                  Total peças: <strong>{formatarMoeda(form.valorPecas)}</strong>
                </div>
              </div>

              {/* PAGAMENTO + TOTAL */}
              <div className="orcamento-grid-bottom">
                <div className="orcamento-bloco">
                  <h4>Pagamento</h4>

                  <label>Forma de pagamento</label>
                  <input
                    type="text"
                    disabled={modo === "visualizar"}
                    value={form.formaPagamento}
                    onChange={(e) =>
                      atualizarForm("formaPagamento", e.target.value)
                    }
                  />

                  <label>Condição</label>
                  <input
                    type="text"
                    disabled={modo === "visualizar"}
                    value={form.condicaoPagamento}
                    onChange={(e) =>
                      atualizarForm("condicaoPagamento", e.target.value)
                    }
                  />
                </div>

                <div className="orcamento-bloco resumo-final">
                  <h4>Resumo financeiro</h4>

                  <div className="orcamento-resumo-linha">
                    <span>Peças</span>
                    <span>{formatarMoeda(form.valorPecas)}</span>
                  </div>

                  <div className="orcamento-resumo-linha">
                    <span>Mão de obra</span>
                    <span>{formatarMoeda(form.valorMaoDeObra)}</span>
                  </div>

                  <div className="orcamento-resumo-linha">
                    <span>Deslocamento</span>
                    <span>{formatarMoeda(form.valorDeslocamento)}</span>
                  </div>

                  <div className="orcamento-resumo-linha totalzao">
                    <span>Total</span>
                    <span>{formatarMoeda(form.valorTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="orcamento-modal-footer">
              {modo === "editar" && (
                <button
                  className="btn-excluir-orc"
                  onClick={() => excluirOrcamento({ id: form.id })}
                >
                  Excluir
                </button>
              )}

              <button className="btn-cancelar-orc" onClick={fecharModal}>
                Fechar
              </button>

              {modo !== "visualizar" && (
                <button className="btn-salvar-orc" onClick={salvarOrcamento}>
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


