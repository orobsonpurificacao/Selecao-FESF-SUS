import { useState, useEffect } from "react";

const API = "";

const TIPOS_TAREFA = [
  "Visita Domiciliar",
  "Consulta Ambulatorial",
  "Reunião de Equipe",
  "Grupo Educativo",
  "Ação Coletiva",
  "Acolhimento",
  "Matriciamento",
  "Atendimento Fisioterapêutico",
  "Busca Ativa",
  "Outro",
];

const cor = {
  azul: "#1a5276",
  azulClaro: "#2e86c1",
  verde: "#1e8449",
  verdeClaro: "#27ae60",
  vermelho: "#c0392b",
  cinza: "#7f8c8d",
  fundo: "#f0f4f8",
  branco: "#ffffff",
  bordaClara: "#dde3ea",
};

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", background: cor.fundo, minHeight: "100vh", margin: 0, padding: "1.5rem" },
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: { background: `linear-gradient(135deg, ${cor.azul}, ${cor.azulClaro})`, color: "#fff", padding: "1.25rem 1.75rem", borderRadius: "12px", marginBottom: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
  card: { background: cor.branco, borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  row: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  input: { padding: "0.55rem 0.85rem", borderRadius: "8px", border: `1px solid ${cor.bordaClara}`, fontSize: "0.9rem", flex: 1, minWidth: "140px", outline: "none" },
  select: { padding: "0.55rem 0.85rem", borderRadius: "8px", border: `1px solid ${cor.bordaClara}`, fontSize: "0.9rem", flex: 1, background: "#fff", outline: "none" },
  btnPrimary: { padding: "0.55rem 1.2rem", background: cor.azulClaro, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap" },
  btnSuccess: { padding: "0.3rem 0.7rem", background: cor.verdeClaro, color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" },
  btnDanger: { padding: "0.3rem 0.7rem", background: cor.vermelho, color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" },
  btnGhost: (ativo) => ({ padding: "0.3rem 0.9rem", borderRadius: "20px", border: `2px solid ${cor.azulClaro}`, background: ativo ? cor.azulClaro : "#fff", color: ativo ? "#fff" : cor.azulClaro, cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }),
  badge: (concluida) => ({ display: "inline-block", padding: "0.15rem 0.55rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: concluida ? "#d5f5e3" : "#fef9e7", color: concluida ? cor.verde : "#b7950b" }),
  erro: { background: "#fde8e8", color: cor.vermelho, padding: "0.65rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" },
  tarefaItem: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0.75rem 1rem", borderRadius: "8px", border: `1px solid ${cor.bordaClara}`, marginBottom: "0.6rem", background: "#fafbfc" },
  residenteItem: (ativo) => ({ padding: "0.75rem 1rem", borderRadius: "8px", border: `2px solid ${ativo ? cor.azulClaro : cor.bordaClara}`, marginBottom: "0.6rem", cursor: "pointer", background: ativo ? "#eaf4fb" : "#fff", transition: "all 0.15s" }),
};

export default function App() {
  const [residentes, setResidentes] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [erro, setErro] = useState(null);

  // form nova tarefa
  const [formTarefa, setFormTarefa] = useState({ tipo: TIPOS_TAREFA[0], descricao: "", data_prevista: "" });
  // form novo residente
  const [formRes, setFormRes] = useState({ nome: "", crm: "", especialidade: "", unidade: "" });
  const [abaAtiva, setAbaAtiva] = useState("tarefas"); // "tarefas" | "residentes"

  const fetchResidentes = async () => {
    try {
      const res = await fetch(`${API}/residentes`);
      const data = await res.json();
      setResidentes(data);
      if (!selecionado && data.length > 0) setSelecionado(data[0]);
    } catch { setErro("Erro ao carregar residentes."); }
  };

  const fetchTarefas = async () => {
    if (!selecionado) return;
    try {
      let url = `${API}/tarefas?residente_id=${selecionado.id}`;
      if (filtro === "pendentes") url += "&concluida=false";
      if (filtro === "concluidas") url += "&concluida=true";
      const res = await fetch(url);
      setTarefas(await res.json());
      setErro(null);
    } catch { setErro("Erro ao carregar tarefas."); }
  };

  useEffect(() => { fetchResidentes(); }, []);
  useEffect(() => { fetchTarefas(); }, [selecionado, filtro]);

  const criarTarefa = async (e) => {
    e.preventDefault();
    if (!formTarefa.tipo) return;
    try {
      await fetch(`${API}/tarefas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formTarefa, residente_id: selecionado.id }),
      });
      setFormTarefa({ tipo: TIPOS_TAREFA[0], descricao: "", data_prevista: "" });
      fetchTarefas();
    } catch { setErro("Erro ao criar tarefa."); }
  };

  const toggleTarefa = async (t) => {
    await fetch(`${API}/tarefas/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluida: !t.concluida }),
    });
    fetchTarefas();
  };

  const deletarTarefa = async (id) => {
    if (!confirm("Remover tarefa?")) return;
    await fetch(`${API}/tarefas/${id}`, { method: "DELETE" });
    fetchTarefas();
  };

  const criarResidente = async (e) => {
    e.preventDefault();
    if (!formRes.nome || !formRes.crm) return setErro("Nome e CRM são obrigatórios.");
    try {
      const res = await fetch(`${API}/residentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formRes),
      });
      if (!res.ok) { const d = await res.json(); return setErro(d.detail); }
      setFormRes({ nome: "", crm: "", especialidade: "", unidade: "" });
      setErro(null);
      fetchResidentes();
    } catch { setErro("Erro ao cadastrar residente."); }
  };

  const deletarResidente = async (id) => {
    if (!confirm("Remover residente e todas as suas tarefas?")) return;
    await fetch(`${API}/residentes/${id}`, { method: "DELETE" });
    setSelecionado(null);
    fetchResidentes();
  };

  const pendentes = tarefas.filter(t => !t.concluida).length;
  const concluidas = tarefas.filter(t => t.concluida).length;

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <h1 style={{ margin: 0, fontSize: "1.35rem" }}>🏥 Programa de Residência FESF-SUS</h1>
          <p style={{ margin: "0.2rem 0 0", opacity: 0.85, fontSize: "0.85rem" }}>
            Gestão de Atividades dos Residentes
          </p>
        </div>

        {erro && <div style={s.erro}>⚠️ {erro}</div>}

        {/* Abas */}
        <div style={{ ...s.row, marginBottom: "1rem" }}>
          {["tarefas", "residentes"].map(aba => (
            <button key={aba} style={s.btnGhost(abaAtiva === aba)} onClick={() => setAbaAtiva(aba)}>
              {aba === "tarefas" ? "📋 Tarefas" : "👥 Residentes"}
            </button>
          ))}
        </div>

        {/* ABA TAREFAS */}
        {abaAtiva === "tarefas" && (
          <div style={s.row}>

            {/* Coluna esquerda — lista de residentes */}
            <div style={{ flex: "0 0 260px" }}>
              <div style={s.card}>
                <h3 style={{ margin: "0 0 0.75rem", color: cor.azul, fontSize: "0.95rem" }}>Residentes</h3>
                {residentes.map(r => (
                  <div
                    key={r.id}
                    style={s.residenteItem(selecionado?.id === r.id)}
                    onClick={() => { setSelecionado(r); setFiltro("todas"); }}
                  >
                    <strong style={{ fontSize: "0.9rem", color: cor.azul }}>{r.nome.split(" ")[0]} {r.nome.split(" ")[1]}</strong>
                    <div style={{ fontSize: "0.75rem", color: cor.cinza, marginTop: "0.1rem" }}>{r.crm}</div>
                    <div style={{ fontSize: "0.75rem", color: cor.cinza }}>{r.especialidade}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna direita — tarefas do residente selecionado */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {selecionado && (
                <>
                  {/* Info do residente */}
                  <div style={{ ...s.card, borderLeft: `4px solid ${cor.azulClaro}` }}>
                    <div style={s.row}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: cor.azul }}>{selecionado.nome}</strong>
                        <div style={{ fontSize: "0.82rem", color: cor.cinza, marginTop: "0.2rem" }}>
                          {selecionado.especialidade} · {selecionado.unidade}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: "0.82rem" }}>
                        <span style={{ color: "#b7950b", fontWeight: 700 }}>{pendentes} pendente(s)</span>
                        <span style={{ color: cor.verde, fontWeight: 700, marginLeft: "0.75rem" }}>{concluidas} concluída(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Nova tarefa */}
                  <div style={s.card}>
                    <h3 style={{ margin: "0 0 0.75rem", color: cor.azul, fontSize: "0.95rem" }}>Nova Tarefa</h3>
                    <form onSubmit={criarTarefa}>
                      <div style={{ ...s.row, marginBottom: "0.5rem" }}>
                        <select style={s.select} value={formTarefa.tipo} onChange={e => setFormTarefa({ ...formTarefa, tipo: e.target.value })}>
                          {TIPOS_TAREFA.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <input style={{ ...s.input, flex: "0 0 150px" }} type="date" value={formTarefa.data_prevista}
                          onChange={e => setFormTarefa({ ...formTarefa, data_prevista: e.target.value })} />
                      </div>
                      <div style={s.row}>
                        <input style={s.input} placeholder="Descrição (opcional)" value={formTarefa.descricao}
                          onChange={e => setFormTarefa({ ...formTarefa, descricao: e.target.value })} />
                        <button type="submit" style={s.btnPrimary}>+ Adicionar</button>
                      </div>
                    </form>
                  </div>

                  {/* Lista tarefas */}
                  <div style={s.card}>
                    <div style={{ ...s.row, marginBottom: "0.75rem", alignItems: "center" }}>
                      <h3 style={{ margin: 0, color: cor.azul, fontSize: "0.95rem", flex: 1 }}>Atividades</h3>
                      {["todas", "pendentes", "concluidas"].map(f => (
                        <button key={f} style={s.btnGhost(filtro === f)} onClick={() => setFiltro(f)}>
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>

                    {tarefas.length === 0 && (
                      <p style={{ color: cor.cinza, textAlign: "center", fontSize: "0.9rem" }}>Nenhuma atividade encontrada.</p>
                    )}

                    {tarefas.map(t => (
                      <div key={t.id} style={s.tarefaItem}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: t.concluida ? cor.cinza : cor.azul, textDecoration: t.concluida ? "line-through" : "none", fontSize: "0.9rem" }}>
                            {t.tipo}
                          </strong>
                          {t.descricao && <div style={{ fontSize: "0.8rem", color: cor.cinza, marginTop: "0.15rem" }}>{t.descricao}</div>}
                          <div style={{ marginTop: "0.3rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={s.badge(t.concluida)}>{t.concluida ? "✓ Concluída" : "⏳ Pendente"}</span>
                            {t.data_prevista && <span style={{ fontSize: "0.75rem", color: cor.cinza }}>📅 {t.data_prevista}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", marginLeft: "0.75rem" }}>
                          <button style={s.btnSuccess} onClick={() => toggleTarefa(t)} title={t.concluida ? "Reabrir" : "Concluir"}>
                            {t.concluida ? "↩" : "✓"}
                          </button>
                          <button style={s.btnDanger} onClick={() => deletarTarefa(t.id)} title="Remover">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ABA RESIDENTES */}
        {abaAtiva === "residentes" && (
          <>
            <div style={s.card}>
              <h3 style={{ margin: "0 0 0.75rem", color: cor.azul, fontSize: "0.95rem" }}>Cadastrar Residente</h3>
              <form onSubmit={criarResidente}>
                <div style={{ ...s.row, marginBottom: "0.5rem" }}>
                  <input style={s.input} placeholder="Nome completo *" value={formRes.nome} onChange={e => setFormRes({ ...formRes, nome: e.target.value })} />
                  <input style={s.input} placeholder="CRM (ex: 111222/BA) *" value={formRes.crm} onChange={e => setFormRes({ ...formRes, crm: e.target.value })} />
                </div>
                <div style={s.row}>
                  <input style={s.input} placeholder="Especialidade" value={formRes.especialidade} onChange={e => setFormRes({ ...formRes, especialidade: e.target.value })} />
                  <input style={s.input} placeholder="Unidade de Saúde" value={formRes.unidade} onChange={e => setFormRes({ ...formRes, unidade: e.target.value })} />
                  <button type="submit" style={s.btnPrimary}>+ Cadastrar</button>
                </div>
              </form>
            </div>

            <div style={s.card}>
              <h3 style={{ margin: "0 0 0.75rem", color: cor.azul, fontSize: "0.95rem" }}>Residentes Cadastrados</h3>
              {residentes.map(r => (
                <div key={r.id} style={{ ...s.tarefaItem, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: cor.azul, fontSize: "0.9rem" }}>{r.nome}</strong>
                    <div style={{ fontSize: "0.8rem", color: cor.cinza, marginTop: "0.15rem" }}>
                      {r.crm} · {r.especialidade} · {r.unidade}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: cor.cinza, marginTop: "0.15rem" }}>
                      {r.tarefas?.length ?? 0} tarefa(s) cadastrada(s)
                    </div>
                  </div>
                  <button style={s.btnDanger} onClick={() => deletarResidente(r.id)}>Remover</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
