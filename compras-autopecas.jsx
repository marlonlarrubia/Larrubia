import { useState, useEffect, useCallback } from "react";

// ─── Persistence ───────────────────────────────────────────────────────────
const STORAGE_KEY = "cp_react_v1";
const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { fornecedores: [], pedidos: {}, historico: [] };
  } catch { return { fornecedores: [], pedidos: {}, historico: [] }; }
};
const saveState = (s) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} };

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, visible }) {
  return (
    <div style={{
      position: "fixed", bottom: 88, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`,
      opacity: visible ? 1 : 0, transition: "all .3s",
      background: "#1e2333", border: "1px solid #2a2f45",
      color: "#e8eaf0", padding: "10px 22px", borderRadius: 20,
      fontSize: 13, fontWeight: 600, pointerEvents: "none",
      zIndex: 999, whiteSpace: "nowrap", fontFamily: "'Sora', sans-serif"
    }}>{msg}</div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.72)",
        zIndex: 200, display: "flex", alignItems: "flex-end",
        animation: "fadeIn .18s ease"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#181c27", border: "1px solid #2a2f45",
          borderRadius: "20px 20px 0 0", padding: 22, width: "100%",
          maxHeight: "88vh", overflowY: "auto",
          animation: "slideUp .22s cubic-bezier(.22,1,.36,1)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "#1e2333", border: "1px solid #2a2f45",
            color: "#6b7280", borderRadius: 8, padding: "4px 12px",
            cursor: "pointer", fontSize: 16
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────
function Field({ label, ...props }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 0", borderBottom: "1px solid #2a2f45"
    }}>
      <label style={{ fontSize: 12, color: "#6b7280", minWidth: 84, fontFamily: "'Sora',sans-serif" }}>{label}</label>
      <input {...props} style={{
        flex: 1, background: "#1e2333", border: "1.5px solid #2a2f45",
        borderRadius: 8, padding: "10px 12px", color: "#e8eaf0",
        fontSize: 14, fontFamily: "'Sora', sans-serif", outline: "none",
        WebkitAppearance: "none", ...props.style
      }}
        onFocus={e => e.target.style.borderColor = "#f5a623"}
        onBlur={e => e.target.style.borderColor = "#2a2f45"}
      />
    </div>
  );
}

// ─── Supplier Card ────────────────────────────────────────────────────────────
function FornCard({ forn, itemCount, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: pressed ? "#1e2333" : "#181c27",
        border: `1px solid ${itemCount > 0 ? "#f5a623" : "#2a2f45"}`,
        borderRadius: 14, padding: 16, marginBottom: 10,
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", transition: "all .18s",
        transform: pressed ? "scale(.985)" : "scale(1)"
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "#1e2333", border: "1px solid #2a2f45",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, flexShrink: 0
      }}>{forn.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>{forn.nome}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3, fontFamily: "'DM Mono',monospace" }}>
          {forn.cats || "sem categorias"}
          {itemCount > 0 && <span style={{ color: "#f5a623" }}> · {itemCount} item(ns) em aberto</span>}
        </div>
      </div>
      <div style={{ color: "#f5a623", fontSize: 22, fontWeight: 300 }}>›</div>
    </div>
  );
}

// ─── Qty Control ─────────────────────────────────────────────────────────────
function QtyCtrl({ value, onDec, onInc }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: "#1e2333", border: "1px solid #2a2f45", borderRadius: 8, flexShrink: 0
    }}>
      <button onClick={onDec} style={{ background: "none", border: "none", color: "#f5a623", fontSize: 18, fontWeight: 700, padding: "4px 10px", cursor: "pointer" }}>−</button>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, minWidth: 26, textAlign: "center", color: "#e8eaf0" }}>{value}</span>
      <button onClick={onInc} style={{ background: "none", border: "none", color: "#f5a623", fontSize: 18, fontWeight: 700, padding: "4px 10px", cursor: "pointer" }}>+</button>
    </div>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, onDec, onInc, onDel }) {
  return (
    <div style={{
      padding: "11px 14px", borderBottom: "1px solid #2a2f45",
      display: "flex", alignItems: "center", gap: 10,
      animation: "fadeIn .2s ease"
    }}>
      <div style={{
        background: "#1e2333", border: "1px solid #2a2f45",
        borderRadius: 8, padding: "5px 9px",
        fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 500,
        color: "#f5a623", whiteSpace: "nowrap", flexShrink: 0
      }}>{item.cod}</div>
      <div style={{
        flex: 1, fontSize: 13, fontWeight: 600, overflow: "hidden",
        textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#e8eaf0",
        fontFamily: "'Sora',sans-serif"
      }}>{item.desc || "—"}</div>
      <QtyCtrl value={item.qty} onDec={onDec} onInc={onInc} />
      <button onClick={onDel} style={{
        background: "none", border: "none", color: "#6b7280",
        fontSize: 18, cursor: "pointer", padding: 4, flexShrink: 0, transition: "color .2s"
      }}
        onMouseEnter={e => e.target.style.color = "#e74c3c"}
        onMouseLeave={e => e.target.style.color = "#6b7280"}
      >✕</button>
    </div>
  );
}

// ─── Btn ─────────────────────────────────────────────────────────────────────
function Btn({ children, variant = "ghost", block, sm, onClick, style: sx }) {
  const variants = {
    accent: { background: "#f5a623", color: "#000" },
    green:  { background: "#2ecc71", color: "#000" },
    wpp:    { background: "#25D366", color: "#000" },
    red:    { background: "#e74c3c", color: "#fff" },
    ghost:  { background: "#1e2333", color: "#e8eaf0", border: "1px solid #2a2f45" },
  };
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        border: "none", borderRadius: sm ? 8 : 10,
        padding: sm ? "8px 12px" : "13px 18px",
        fontSize: sm ? 12 : 14, fontWeight: 700,
        fontFamily: "'Sora',sans-serif", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: block ? "100%" : "auto",
        transform: pressed ? "scale(.97)" : "scale(1)",
        transition: "transform .1s",
        WebkitAppearance: "none",
        ...variants[variant], ...sx
      }}
    >{children}</button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 16px", color: "#6b7280" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 13, lineHeight: 1.6, fontFamily: "'Sora',sans-serif" }}>{text}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState(0);
  const [fornAtual, setFornAtual] = useState(null);
  const [histSel, setHistSel] = useState(null);
  const [modalForn, setModalForn] = useState(false);
  const [editFornIdx, setEditFornIdx] = useState(null);
  const [modalHist, setModalHist] = useState(false);
  const [toast, setToast] = useState({ msg: "", visible: false });

  // Form state
  const [fnNome, setFnNome] = useState("");
  const [fnWpp, setFnWpp] = useState("");
  const [fnCats, setFnCats] = useState("");
  const [fnEmoji, setFnEmoji] = useState("🔧");

  // Add item
  const [inpCod, setInpCod] = useState("");
  const [inpQty, setInpQty] = useState("1");
  const [inpDesc, setInpDesc] = useState("");

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  }, []);

  const update = useCallback((fn) => {
    setState(s => {
      const next = fn(s);
      saveState(next);
      return next;
    });
  }, []);

  // ── Pedido helpers ────────────────────────────────────────────────────────
  const itensDoForn = (fid) => state.pedidos[fid] || [];

  const adicionarItem = () => {
    if (!fornAtual) return;
    const cod = inpCod.trim().toUpperCase();
    const qty = parseInt(inpQty) || 1;
    const desc = inpDesc.trim();
    if (!cod) { showToast("⚠️ Informe o código"); return; }
    update(s => {
      const lista = [...(s.pedidos[fornAtual.id] || [])];
      const idx = lista.findIndex(i => i.cod === cod);
      if (idx >= 0) {
        lista[idx] = { ...lista[idx], qty: lista[idx].qty + qty };
        showToast(`↑ ${cod} — ${lista[idx].qty}x`);
      } else {
        lista.push({ cod, desc, qty, id: Date.now() });
        showToast(`✅ ${cod} adicionado`);
      }
      return { ...s, pedidos: { ...s.pedidos, [fornAtual.id]: lista } };
    });
    setInpCod(""); setInpQty("1"); setInpDesc("");
  };

  const alterarQty = (fid, iid, delta) => update(s => {
    const lista = (s.pedidos[fid] || []).map(i =>
      i.id === iid ? { ...i, qty: Math.max(1, i.qty + delta) } : i
    );
    return { ...s, pedidos: { ...s.pedidos, [fid]: lista } };
  });

  const removerItem = (fid, iid) => update(s => ({
    ...s, pedidos: { ...s.pedidos, [fid]: (s.pedidos[fid] || []).filter(i => i.id !== iid) }
  }));

  const limparPedido = () => {
    if (!fornAtual) return;
    if (!(state.pedidos[fornAtual.id] || []).length) { showToast("Lista já está vazia"); return; }
    if (!window.confirm("Limpar todos os itens deste pedido?")) return;
    update(s => ({ ...s, pedidos: { ...s.pedidos, [fornAtual.id]: [] } }));
    showToast("🗑️ Pedido limpo");
  };

  // ── Mensagem WPP ─────────────────────────────────────────────────────────
  const montarMensagem = (forn, itens, isReenvio = false) => {
    const data = new Date().toLocaleDateString("pt-BR");
    const linhas = itens.map(i => `  • *${i.cod}*${i.desc ? " — " + i.desc : ""} — ${i.qty}x`).join("\n");
    return `Bom dia! 😊\n\n${isReenvio ? "Reenvio de p" : "P"}edido — *${data}*\n*Oseni Marcio e Marcelo Auto Peças*\n\n${linhas}\n\nPor favor confirmar disponibilidade. Obrigado! 🙏`;
  };

  const enviarWpp = () => {
    const lista = itensDoForn(fornAtual.id);
    if (!lista.length) { showToast("⚠️ Nenhum item no pedido"); return; }
    if (!fornAtual.wpp) { showToast("⚠️ Fornecedor sem WhatsApp cadastrado"); return; }
    const msg = montarMensagem(fornAtual, lista);
    // Register history and clear order
    update(s => {
      const hist = [{
        id: Date.now(),
        data: new Date().toLocaleDateString("pt-BR"),
        hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        fornId: fornAtual.id, fornNome: fornAtual.nome,
        fornEmoji: fornAtual.emoji, fornWpp: fornAtual.wpp,
        itens: JSON.parse(JSON.stringify(lista))
      }, ...s.historico].slice(0, 200);
      return { ...s, historico: hist, pedidos: { ...s.pedidos, [fornAtual.id]: [] } };
    });
    window.open(`https://wa.me/${fornAtual.wpp}?text=${encodeURIComponent(msg)}`, "_blank");
    showToast("✅ Pedido registrado!");
  };

  const copiarMensagem = () => {
    const lista = itensDoForn(fornAtual.id);
    if (!lista.length) { showToast("⚠️ Nenhum item"); return; }
    navigator.clipboard?.writeText(montarMensagem(fornAtual, lista))
      .then(() => showToast("📋 Mensagem copiada!"))
      .catch(() => showToast("⚠️ Não foi possível copiar"));
  };

  // ── Fornecedores ─────────────────────────────────────────────────────────
  const abrirModalForn = (idx = null) => {
    if (idx !== null) {
      const f = state.fornecedores[idx];
      setFnNome(f.nome); setFnWpp(f.wpp); setFnCats(f.cats); setFnEmoji(f.emoji);
      setEditFornIdx(idx);
    } else {
      setFnNome(""); setFnWpp(""); setFnCats(""); setFnEmoji("🔧");
      setEditFornIdx(null);
    }
    setModalForn(true);
  };

  const salvarFornecedor = () => {
    if (!fnNome.trim()) { showToast("⚠️ Nome obrigatório"); return; }
    if (!fnWpp.trim()) { showToast("⚠️ WhatsApp obrigatório"); return; }
    const forn = {
      nome: fnNome.trim(), wpp: fnWpp.trim().replace(/\D/g, ""),
      cats: fnCats.trim(), emoji: fnEmoji.trim() || "🔧",
      id: editFornIdx !== null ? state.fornecedores[editFornIdx].id : Date.now()
    };
    update(s => {
      const list = [...s.fornecedores];
      if (editFornIdx !== null) list[editFornIdx] = forn;
      else list.push(forn);
      return { ...s, fornecedores: list };
    });
    showToast(editFornIdx !== null ? "✅ Atualizado" : "✅ Fornecedor cadastrado");
    setModalForn(false);
  };

  const excluirForn = (idx) => {
    if (!window.confirm(`Excluir ${state.fornecedores[idx].nome}?`)) return;
    update(s => {
      const list = [...s.fornecedores];
      list.splice(idx, 1);
      return { ...s, fornecedores: list };
    });
    showToast("🗑️ Removido");
  };

  // ── Histórico ────────────────────────────────────────────────────────────
  const reenviarHist = () => {
    if (!histSel?.fornWpp) { showToast("⚠️ Sem WhatsApp"); return; }
    const msg = montarMensagem(histSel, histSel.itens, true);
    window.open(`https://wa.me/${histSel.fornWpp}?text=${encodeURIComponent(msg)}`, "_blank");
    setModalHist(false);
  };

  const repetirPedido = () => {
    if (!histSel) return;
    const forn = state.fornecedores.find(f => f.id === histSel.fornId);
    if (!forn) { showToast("⚠️ Fornecedor não encontrado"); return; }
    update(s => {
      const lista = [...(s.pedidos[forn.id] || [])];
      histSel.itens.forEach(i => {
        const ex = lista.findIndex(x => x.cod === i.cod);
        if (ex >= 0) lista[ex] = { ...lista[ex], qty: lista[ex].qty + i.qty };
        else lista.push({ ...i, id: Date.now() + Math.random() });
      });
      return { ...s, pedidos: { ...s.pedidos, [forn.id]: lista } };
    });
    setModalHist(false);
    setTab(0);
    setTimeout(() => setFornAtual(state.fornecedores.find(f => f.id === histSel.fornId)), 80);
    showToast("🔁 Itens copiados para novo pedido");
  };

  // ── Views ─────────────────────────────────────────────────────────────────
  const card = (children, style = {}) => (
    <div style={{
      background: "#181c27", border: "1px solid #2a2f45",
      borderRadius: 14, marginBottom: 12, overflow: "hidden", ...style
    }}>{children}</div>
  );

  const cardHeader = (label, right) => (
    <div style={{
      padding: "11px 14px", fontSize: 12, fontWeight: 700,
      letterSpacing: .5, textTransform: "uppercase", color: "#6b7280",
      borderBottom: "1px solid #2a2f45",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontFamily: "'Sora',sans-serif"
    }}>
      {label}
      {right && <span style={{ color: "#f5a623", fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>{right}</span>}
    </div>
  );

  // Tab 0: Fornecedor / Pedido
  const renderTab0 = () => {
    if (fornAtual) {
      const lista = itensDoForn(fornAtual.id);
      return (
        <div style={{ padding: 14, animation: "slideIn .22s ease" }}>
          {/* Header */}
          <div style={{
            background: "#181c27", border: "1px solid #2a2f45", borderRadius: 14,
            padding: "14px 16px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 12
          }}>
            <button onClick={() => setFornAtual(null)} style={{
              background: "#1e2333", border: "1px solid #2a2f45", borderRadius: 10,
              padding: "8px 12px", cursor: "pointer", color: "#6b7280", fontSize: 18, flexShrink: 0
            }}>←</button>
            <div style={{ fontSize: 28 }}>{fornAtual.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>{fornAtual.nome}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, fontFamily: "'DM Mono',monospace" }}>{fornAtual.cats}</div>
            </div>
          </div>

          {/* Add item */}
          <div style={{ background: "#181c27", border: "1px solid #2a2f45", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#6b7280", marginBottom: 10, fontFamily: "'Sora',sans-serif" }}>➕ Adicionar item</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={inpCod}
                onChange={e => setInpCod(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && document.getElementById("inp-qty-r").focus()}
                placeholder="Código"
                autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck={false}
                style={{
                  flex: "0 0 130px", background: "#1e2333", border: "1.5px solid #2a2f45",
                  borderRadius: 10, padding: "12px 14px", color: "#e8eaf0",
                  fontSize: 15, fontFamily: "'DM Mono',monospace", outline: "none", WebkitAppearance: "none"
                }}
                onFocus={e => e.target.style.borderColor = "#f5a623"}
                onBlur={e => e.target.style.borderColor = "#2a2f45"}
              />
              <input
                id="inp-qty-r" type="number" value={inpQty}
                onChange={e => setInpQty(e.target.value)}
                onKeyDown={e => e.key === "Enter" && document.getElementById("inp-desc-r").focus()}
                placeholder="Qtd" min={1}
                style={{
                  flex: "0 0 80px", background: "#1e2333", border: "1.5px solid #2a2f45",
                  borderRadius: 10, padding: "12px 14px", color: "#e8eaf0",
                  fontSize: 15, fontFamily: "'DM Mono',monospace", textAlign: "center",
                  outline: "none", WebkitAppearance: "none"
                }}
                onFocus={e => e.target.style.borderColor = "#f5a623"}
                onBlur={e => e.target.style.borderColor = "#2a2f45"}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="inp-desc-r" value={inpDesc}
                onChange={e => setInpDesc(e.target.value)}
                onKeyDown={e => e.key === "Enter" && adicionarItem()}
                placeholder="Descrição (opcional)"
                style={{
                  flex: 1, background: "#1e2333", border: "1.5px solid #2a2f45",
                  borderRadius: 10, padding: "12px 14px", color: "#e8eaf0",
                  fontSize: 15, fontFamily: "'Sora',sans-serif", outline: "none", WebkitAppearance: "none"
                }}
                onFocus={e => e.target.style.borderColor = "#f5a623"}
                onBlur={e => e.target.style.borderColor = "#2a2f45"}
              />
              <Btn variant="accent" sm onClick={adicionarItem} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>+ Add</Btn>
            </div>
          </div>

          {/* List */}
          {card(
            <>
              {cardHeader("Itens do pedido", `${lista.length} ${lista.length === 1 ? "item" : "itens"}`)}
              {lista.length === 0
                ? <Empty icon="📝" text="Adicione os itens acima." />
                : lista.map(item => (
                  <ItemRow
                    key={item.id} item={item}
                    onDec={() => alterarQty(fornAtual.id, item.id, -1)}
                    onInc={() => alterarQty(fornAtual.id, item.id, +1)}
                    onDel={() => removerItem(fornAtual.id, item.id)}
                  />
                ))
              }
            </>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <Btn variant="wpp" block onClick={enviarWpp} style={{ flex: 1 }}>💬 Enviar WhatsApp</Btn>
            <Btn variant="ghost" sm onClick={copiarMensagem}>📋</Btn>
          </div>
          <Btn variant="red" block onClick={limparPedido}>🗑️ Limpar pedido</Btn>
        </div>
      );
    }

    // Home
    return (
      <div style={{ padding: 14, animation: "fadeIn .2s ease" }}>
        <div style={{ paddingBottom: 10, fontSize: 12, color: "#6b7280", fontFamily: "'Sora',sans-serif" }}>
          Selecione o fornecedor para iniciar o pedido:
        </div>
        {state.fornecedores.length === 0
          ? <Empty icon="🏭" text={"Nenhum fornecedor cadastrado.\nAdicione na aba ⚙️ Cadastros."} />
          : state.fornecedores.map(f => (
            <FornCard
              key={f.id} forn={f}
              itemCount={(state.pedidos[f.id] || []).length}
              onClick={() => setFornAtual(f)}
            />
          ))
        }
      </div>
    );
  };

  // Tab 1: Histórico
  const renderTab1 = () => (
    <div style={{ padding: 14 }}>
      {card(
        <>
          {cardHeader("Pedidos enviados")}
          {state.historico.length === 0
            ? <Empty icon="🕐" text="Nenhum pedido enviado ainda." />
            : state.historico.map(h => (
              <div
                key={h.id}
                onClick={() => { setHistSel(h); setModalHist(true); }}
                style={{
                  padding: "13px 14px", borderBottom: "1px solid #2a2f45",
                  cursor: "pointer", transition: "background .15s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#1e2333"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Sora',sans-serif" }}>{h.fornEmoji} {h.fornNome}</div>
                  <div style={{
                    background: "#1e2333", border: "1px solid #2a2f45", borderRadius: 6,
                    padding: "2px 8px", fontSize: 11, fontFamily: "'DM Mono',monospace",
                    color: "#f5a623", whiteSpace: "nowrap"
                  }}>{h.itens.length} iten(s)</div>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontFamily: "'DM Mono',monospace" }}>
                  {h.itens.slice(0, 4).map(i => i.cod).join(" · ")}{h.itens.length > 4 ? " …" : ""}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, fontFamily: "'DM Mono',monospace" }}>
                  {h.data} às {h.hora}
                </div>
              </div>
            ))
          }
        </>
      )}
    </div>
  );

  // Tab 2: Cadastros
  const renderTab2 = () => (
    <div style={{ padding: 14 }}>
      {card(
        <>
          {cardHeader("Fornecedores")}
          {state.fornecedores.length === 0
            ? <Empty icon="🏭" text="Nenhum fornecedor cadastrado." />
            : state.fornecedores.map((f, i) => (
              <div key={f.id} style={{
                padding: "12px 14px", borderBottom: i < state.fornecedores.length - 1 ? "1px solid #2a2f45" : "none",
                display: "flex", alignItems: "center", gap: 10
              }}>
                <div style={{ fontSize: 22 }}>{f.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>{f.nome}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, fontFamily: "'DM Mono',monospace" }}>
                    {f.cats || "—"} · {f.wpp}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="ghost" sm onClick={() => abrirModalForn(i)}>✏️</Btn>
                  <Btn variant="red" sm onClick={() => excluirForn(i)}>🗑️</Btn>
                </div>
              </div>
            ))
          }
        </>
      )}
      <Btn variant="accent" block onClick={() => abrirModalForn()}>+ Novo fornecedor</Btn>
    </div>
  );

  const TABS = [
    { icon: "🏭", label: "Fornecedor" },
    { icon: "🕐", label: "Histórico" },
    { icon: "⚙️", label: "Cadastros" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #0f1117; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(16px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-track { background: #0f1117 }
        ::-webkit-scrollbar-thumb { background: #2a2f45; border-radius: 2px }
      `}</style>

      <div style={{
        fontFamily: "'Sora', sans-serif", background: "#0f1117",
        color: "#e8eaf0", fontSize: 14, minHeight: "100vh", paddingBottom: 80
      }}>
        {/* Header */}
        <div style={{
          background: "#181c27", borderBottom: "1px solid #2a2f45",
          padding: "14px 16px", position: "sticky", top: 0, zIndex: 100
        }}>
          <h1 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px" }}>
            📦 Pedido de <span style={{ color: "#f5a623" }}>Compras</span>
          </h1>
          <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2, fontFamily: "'DM Mono',monospace" }}>
            Oseni Marcio e Marcelo — Auto Peças
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "#181c27",
          borderBottom: "1px solid #2a2f45", position: "sticky", top: 63, zIndex: 99
        }}>
          {TABS.map((t, i) => (
            <div key={i} onClick={() => setTab(i)} style={{
              flex: 1, textAlign: "center", padding: "10px 4px",
              color: tab === i ? "#f5a623" : "#6b7280",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              borderBottom: `2px solid ${tab === i ? "#f5a623" : "transparent"}`,
              userSelect: "none", transition: "color .2s", fontFamily: "'Sora',sans-serif"
            }}>
              <div style={{ fontSize: 19, marginBottom: 2 }}>{t.icon}</div>
              {t.label}
            </div>
          ))}
        </div>

        {/* Pages */}
        {tab === 0 && renderTab0()}
        {tab === 1 && renderTab1()}
        {tab === 2 && renderTab2()}

        {/* Nav */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#181c27", borderTop: "1px solid #2a2f45",
          display: "flex", padding: "6px 0 10px", zIndex: 100
        }}>
          {TABS.map((t, i) => (
            <div key={i} onClick={() => setTab(i)} style={{
              flex: 1, textAlign: "center", cursor: "pointer", padding: "4px 0",
              color: tab === i ? "#f5a623" : "#6b7280",
              fontSize: 10, fontWeight: 600, userSelect: "none",
              transition: "color .2s", fontFamily: "'Sora',sans-serif"
            }}>
              <div style={{ fontSize: 21, lineHeight: 1, marginBottom: 2 }}>{t.icon}</div>
              {t.label}
            </div>
          ))}
        </div>

        {/* Modal: Fornecedor */}
        <Modal show={modalForn} onClose={() => setModalForn(false)} title="🏭 Fornecedor">
          <Field label="Nome" value={fnNome} onChange={e => setFnNome(e.target.value)} placeholder="Ex: Distribuidora Silva" />
          <Field label="WhatsApp" type="tel" value={fnWpp} onChange={e => setFnWpp(e.target.value)} placeholder="5521999999999" inputMode="numeric" />
          <Field label="Categorias" value={fnCats} onChange={e => setFnCats(e.target.value)} placeholder="freio, suspensão, filtro..." />
          <Field label="Emoji" value={fnEmoji} onChange={e => setFnEmoji(e.target.value)} placeholder="🔧" maxLength={2} style={{ width: 60, flex: "none" }} />
          <Btn variant="accent" block onClick={salvarFornecedor} style={{ marginTop: 14 }}>Salvar</Btn>
        </Modal>

        {/* Modal: Histórico detalhe */}
        <Modal show={modalHist} onClose={() => setModalHist(false)}
          title={histSel ? `${histSel.fornEmoji} ${histSel.fornNome} · ${histSel.data}` : "Pedido"}>
          {histSel?.itens.map(i => (
            <div key={i.id} style={{
              background: "#1e2333", borderRadius: 8, marginBottom: 4,
              padding: "10px 12px", display: "flex", alignItems: "center", gap: 10
            }}>
              <div style={{
                background: "#181c27", border: "1px solid #2a2f45", borderRadius: 8,
                padding: "5px 9px", fontFamily: "'DM Mono',monospace", fontSize: 13,
                fontWeight: 500, color: "#f5a623", whiteSpace: "nowrap", flexShrink: 0
              }}>{i.cod}</div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Sora',sans-serif" }}>{i.desc || "—"}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#f5a623", fontWeight: 600, whiteSpace: "nowrap" }}>{i.qty}x</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn variant="wpp" onClick={reenviarHist} style={{ flex: 1 }}>💬 Reenviar</Btn>
            <Btn variant="ghost" sm onClick={repetirPedido}>🔁 Repetir</Btn>
          </div>
        </Modal>

        <Toast msg={toast.msg} visible={toast.visible} />
      </div>
    </>
  );
}
