import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// FIREBASE
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

interface Usuario {
  id: string;
  nome: string;
  tipoConta: string;
  telefone?: string;
  photoURL?: string;
  bio?: string;
  especialidade?: string;
  cidade?: string;
}

interface Plano {
  id: number;
  nome: string;
  valor: string;
  descricao: string;
  horario: string;
  tipo: "diurno" | "noturno" | "integral";
  destaque?: boolean;
}

// Interfaces do Chat
interface Mensagem {
  id: string;
  texto: string;
  enviadoPor: string;
  criadoEm: any;
}

interface Conversa {
  id: string;
  participantes: string[];
  ultimaMensagem?: string;
  nomeDestinatario?: string;
  fotoDestinatario?: string;
}

export default function ConectarPage() {
  const navigate = useNavigate();

  // Estados Globais
  const [activeScreen, setActiveScreen] = useState<"agendar" | "chat">("agendar");
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [nomeFamilia, setNomeFamilia] = useState("Família");

  // Estados de Agendamento
  const [profissionais, setProfissionais] = useState<Usuario[]>([]);
  const [loadingProfissionais, setLoadingProfissionais] = useState(true);
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano | null>(null);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<Usuario | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<string>("");
  const [diasOcupados, setDiasOcupados] = useState<string[]>([]);
  const [pagamentoLiberado, setPagamentoLiberado] = useState(false);

  // Estados do Chat Interno
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputMensagem, setInputMensagem] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ================= PLANOS =================
  const planos: Plano[] = [
    { id: 1, nome: "8H DIURNO", valor: "R$170", descricao: "Plantão de 8 horas no período diurno.", horario: "07:00 às 15:00", tipo: "diurno" },
    { id: 2, nome: "8H NOTURNO", valor: "R$200", descricao: "Plantão de 8 horas no período noturno.", horario: "19:00 às 03:00", tipo: "noturno" },
    { id: 3, nome: "12H NOTURNO", valor: "R$230", descricao: "Plantão premium de 12 horas noturno.", horario: "19:00 às 07:00", tipo: "noturno", destaque: true },
    { id: 4, nome: "12H DIURNO", valor: "R$215", descricao: "Plantão completo de 12 horas diurno.", horario: "07:00 às 19:00", tipo: "diurno" },
    { id: 5, nome: "INTEGRAL", valor: "R$400", descricao: "Acesso integral com cobertura total.", horario: "24 horas disponíveis", tipo: "integral" },
  ];

  // ================= AUTH E CARREGAMENTO INICIAL =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUid(user.uid);
        
        // Busca o nome da Família para salvar no agendamento depois
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));
        if (docSnap.exists()) setNomeFamilia(docSnap.data().nome);

        buscarProfissionais();
        ouvirConversas(user.uid);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  // ================= BUSCAR PROFISSIONAIS =================
  const buscarProfissionais = async () => {
    try {
      const q = query(collection(db, "usuarios"), where("tipoConta", "==", "professional"));
      const querySnapshot = await getDocs(q);
      const lista: Usuario[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() } as Usuario);
      });
      setProfissionais(lista);
    } catch (error) { console.error(error); } 
    finally { setLoadingProfissionais(false); }
  };

  // ================= GERAR E BUSCAR DIAS =================
  const gerarDias = () => {
    const dias = [];
    for (let i = 0; i < 15; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      dias.push(data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" }));
    }
    return dias;
  };

  useEffect(() => {
    const buscarDias = async () => {
      if (!profissionalSelecionado) return;
      const q = query(collection(db, "agendamentos"), where("profissionalId", "==", profissionalSelecionado.id));
      const querySnapshot = await getDocs(q);
      const ocupados: string[] = [];
      querySnapshot.forEach((doc) => { ocupados.push(doc.data().data); }); // Atualizado para 'data' em vez de 'dia'
      setDiasOcupados(ocupados);
    };
    buscarDias();
  }, [profissionalSelecionado]);

  // ================= PAGAMENTO (AGENDAMENTO) =================
  const handlePagamento = async () => {
    if (!planoSelecionado || !profissionalSelecionado || !diaSelecionado || !currentUid) {
      alert("Selecione todas as opções.");
      return;
    }
    try {
      // Salva com a estrutura exata que o Dashboard do Profissional lê
      await addDoc(collection(db, "agendamentos"), {
        profissionalId: profissionalSelecionado.id,
        familiaId: currentUid,
        familia: nomeFamilia,
        servico: planoSelecionado.nome,
        data: diaSelecionado,
        hora: planoSelecionado.horario,
        status: "Pendente", // Começa pendente para o profissional aceitar
        valor: planoSelecionado.valor,
        createdAt: serverTimestamp(),
      });
      setPagamentoLiberado(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao finalizar agendamento.");
    }
  };

  // ================= LÓGICA DO CHAT INTERNO =================
  const ouvirConversas = (uidLogado: string) => {
    const q = query(collection(db, "conversas"), where("participantes", "array-contains", uidLogado));
    return onSnapshot(q, async (snapshot) => {
      const listaConversas: Conversa[] = [];
      for (const docSnap of snapshot.docs) {
        const dados = docSnap.data();
        const idDestinatario = dados.participantes.find((p: string) => p !== uidLogado);
        const userDoc = await getDoc(doc(db, "usuarios", idDestinatario));
        
        listaConversas.push({
          id: docSnap.id,
          participantes: dados.participantes,
          ultimaMensagem: dados.ultimaMensagem || "",
          nomeDestinatario: userDoc.exists() ? userDoc.data().nome : "Usuário",
          fotoDestinatario: userDoc.exists() ? userDoc.data().photoURL : ""
        });
      }
      setConversas(listaConversas);
    });
  };

  useEffect(() => {
    if (!activeChatId) return;
    const q = query(collection(db, "conversas", activeChatId, "mensagens"), orderBy("criadoEm", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaMensagens: Mensagem[] = [];
      snapshot.forEach((doc) => listaMensagens.push({ id: doc.id, ...doc.data() } as Mensagem));
      setMensagens(listaMensagens);
    });
    return () => unsubscribe();
  }, [activeChatId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensagens]);

  const handleIniciarChat = async (profissional: Usuario) => {
    if (!currentUid) return;
    const chatId = `${currentUid}_${profissional.id}`;
    
    await setDoc(doc(db, "conversas", chatId), {
      participantes: [currentUid, profissional.id],
      atualizadoEm: serverTimestamp()
    }, { merge: true });

    setActiveChatId(chatId);
    setActiveChatUser({ id: chatId, participantes: [currentUid, profissional.id], nomeDestinatario: profissional.nome, fotoDestinatario: profissional.photoURL });
    setActiveScreen("chat");
  };

  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMensagem.trim() || !activeChatId || !currentUid) return;
    const textoMensagem = inputMensagem;
    setInputMensagem("");

    try {
      await addDoc(collection(db, "conversas", activeChatId, "mensagens"), {
        texto: textoMensagem, enviadoPor: currentUid, criadoEm: serverTimestamp()
      });
      await setDoc(doc(db, "conversas", activeChatId), {
        ultimaMensagem: textoMensagem, atualizadoEm: serverTimestamp()
      }, { merge: true });
    } catch (error) { console.error("Erro ao enviar mensagem:", error); }
  };

  // ================= RENDERIZAÇÃO =================
  return (
    <div className="min-h-screen bg-[#07111F] text-white overflow-hidden flex flex-col">

      {/* BG ESTILIZADO */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* HEADER COM ALTERNADOR DE ABAS */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-2xl bg-[#07111F]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button onClick={() => navigate("/configuracoes")} className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold">
              ← Voltar
            </button>
            <div className="text-right md:text-left">
              <h1 className="text-xl font-black">WD <span className="text-cyan-400">Conecta</span></h1>
            </div>
          </div>

          {/* Alternador: Agendar vs Chat */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
            <button 
              onClick={() => setActiveScreen("agendar")}
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-semibold rounded-lg transition-all ${activeScreen === "agendar" ? "bg-cyan-500 text-[#07111F] shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              Agendar Serviço
            </button>
            <button 
              onClick={() => setActiveScreen("chat")}
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeScreen === "chat" ? "bg-cyan-500 text-[#07111F] shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              Chat Interno
              {conversas.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
            </button>
          </div>
        </div>
      </header>

      {/* ================= TELA DE CHAT INTERNO ================= */}
      {activeScreen === "chat" && (
        <main className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full relative z-10 py-6 px-4">
          <div className="w-full flex rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
            
            {/* Lista de Conversas */}
            <aside className="w-full md:w-80 border-r border-white/10 flex flex-col bg-black/20">
              <div className="p-5 border-b border-white/10"><h2 className="font-black text-lg">Mensagens</h2></div>
              <div className="flex-1 overflow-y-auto">
                {conversas.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">Nenhuma conversa ativa.</div>
                ) : (
                  conversas.map((chat) => (
                    <button key={chat.id} onClick={() => { setActiveChatId(chat.id); setActiveChatUser(chat); }} className={`w-full p-4 flex items-center gap-4 text-left transition-colors border-b border-white/5 ${activeChatId === chat.id ? "bg-cyan-500/10" : "hover:bg-white/5"}`}>
                      <img src={chat.fotoDestinatario || `https://ui-avatars.com/api/?name=${chat.nomeDestinatario}&background=0D8ABC&color=fff`} className="w-12 h-12 rounded-full object-cover" />
                      <div className="overflow-hidden flex-1">
                        <h4 className="font-bold text-white text-sm truncate">{chat.nomeDestinatario}</h4>
                        <p className="text-xs text-slate-400 truncate mt-1">{chat.ultimaMensagem || "Iniciar conversa..."}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            {/* Janela de Bate-Papo */}
            <section className="hidden md:flex flex-1 flex-col bg-black/10">
              {activeChatId && activeChatUser ? (
                <>
                  <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4 bg-white/5">
                    <img src={activeChatUser.fotoDestinatario || `https://ui-avatars.com/api/?name=${activeChatUser.nomeDestinatario}&background=0D8ABC&color=fff`} className="w-10 h-10 rounded-full object-cover" />
                    <h3 className="font-bold text-white text-lg">{activeChatUser.nomeDestinatario}</h3>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {mensagens.map((msg) => {
                      const souEu = msg.enviadoPor === currentUid;
                      return (
                        <div key={msg.id} className={`flex w-full ${souEu ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-md rounded-2xl px-5 py-3 text-sm ${souEu ? "bg-cyan-500 text-black rounded-tr-none" : "bg-white/10 text-white rounded-tl-none border border-white/5"}`}>
                            <p className="leading-relaxed break-words">{msg.texto}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleEnviarMensagem} className="p-5 border-t border-white/10 bg-white/5 flex items-center gap-3">
                    <input type="text" value={inputMensagem} onChange={(e) => setInputMensagem(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-400 transition-all text-sm" />
                    <button type="submit" disabled={!inputMensagem.trim()} className="bg-cyan-500 text-black px-6 py-3.5 rounded-xl font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50">Enviar</button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">Selecione uma conversa ao lado.</div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* ================= TELA DE AGENDAMENTO (SEU FLUXO ORIGINAL) ================= */}
      {activeScreen === "agendar" && (
        <main className="flex-1 overflow-y-auto relative z-10">
          {/* HERO */}
          <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                ✨ Atendimento profissional premium
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-[1.05]">
                Escolha seu <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">plano ideal</span>
              </h2>
              <p className="text-slate-400 text-lg mt-6 leading-relaxed max-w-2xl">
                Selecione um plano, escolha um profissional e reserve um dia disponível em tempo real.
              </p>
            </div>
          </section>

          {/* PLANOS */}
          <section className="max-w-7xl mx-auto px-6 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              {planos.map((plano) => {
                const ativo = planoSelecionado?.id === plano.id;
                return (
                  <div key={plano.id} onClick={() => { setPlanoSelecionado(plano); setProfissionalSelecionado(null); setDiaSelecionado(""); setPagamentoLiberado(false); }} className={`relative overflow-hidden rounded-[32px] border cursor-pointer transition-all duration-500 p-8 ${ativo ? "border-cyan-400 bg-gradient-to-b from-cyan-500 to-blue-700 scale-[1.03]" : "border-white/10 bg-white/5 hover:border-cyan-400/30"}`}>
                    {plano.destaque && <div className="absolute top-5 right-5 bg-cyan-400 text-black text-xs font-black px-3 py-1 rounded-full">MAIS ESCOLHIDO</div>}
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl mb-8">⚡</div>
                    <h3 className="text-2xl font-black mb-3">{plano.nome}</h3>
                    <p className="text-slate-200 text-sm leading-relaxed mb-5">{plano.descricao}</p>
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-4 mb-7">
                      <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Horário do plantão</p>
                      <p className="text-cyan-300 font-bold text-lg">{plano.horario}</p>
                    </div>
                    <div className="text-5xl font-black">{plano.valor}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PROFISSIONAIS */}
          {planoSelecionado && (
            <section className="max-w-7xl mx-auto px-6 pb-16">
              <div className="mb-8">
                <h3 className="text-3xl font-black">Escolha um profissional</h3>
                <p className="text-slate-400 mt-2">Profissionais disponíveis para o plano selecionado.</p>
              </div>
              {loadingProfissionais ? (
                <div className="py-10 text-center text-slate-400">Carregando profissionais...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {profissionais.map((prof) => {
                    const ativo = profissionalSelecionado?.id === prof.id;
                    return (
                      <div key={prof.id} className={`group overflow-hidden rounded-[32px] border transition-all duration-300 ${ativo ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-white/5 hover:border-cyan-400/30"}`}>
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500 cursor-pointer" onClick={() => { setProfissionalSelecionado(prof); setDiaSelecionado(""); setPagamentoLiberado(false); }}></div>
                        <div className="px-7 relative cursor-pointer" onClick={() => { setProfissionalSelecionado(prof); setDiaSelecionado(""); setPagamentoLiberado(false); }}>
                          <img src={prof.photoURL || `https://ui-avatars.com/api/?name=${prof.nome}&background=0D8ABC&color=fff`} className="w-24 h-24 rounded-3xl object-cover border-4 border-[#07111F] -mt-12" />
                        </div>
                        <div className="p-7 pt-4 flex flex-col justify-between h-[250px]">
                          <div>
                            <h3 className="text-2xl font-black cursor-pointer" onClick={() => { setProfissionalSelecionado(prof); setDiaSelecionado(""); setPagamentoLiberado(false); }}>{prof.nome}</h3>
                            <p className="text-cyan-400 font-semibold mt-1">{prof.especialidade || "Profissional WD"}</p>
                            <p className="text-slate-300 text-sm mt-4 leading-relaxed line-clamp-2">{prof.bio || "Profissional disponível para atendimento imediato."}</p>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button onClick={() => { setProfissionalSelecionado(prof); setDiaSelecionado(""); setPagamentoLiberado(false); }} className={`flex-1 h-12 rounded-xl font-bold transition-all ${ativo ? "bg-cyan-400 text-black" : "bg-white/10 hover:bg-white/20"}`}>
                              {ativo ? "Selecionado" : "Selecionar"}
                            </button>
                            <button onClick={() => handleIniciarChat(prof)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black transition-all" title="Chat Interno">
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* CALENDÁRIO */}
          {profissionalSelecionado && (
            <section className="max-w-7xl mx-auto px-6 pb-16">
              <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-black">Agenda disponível</h3>
                    <p className="text-slate-400 mt-2">Selecione um dia disponível para reservar.</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-sm font-bold">● Atualização em tempo real</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-5">
                  {gerarDias().map((dia) => {
                    const ocupado = diasOcupados.includes(dia);
                    const ativo = diaSelecionado === dia;
                    return (
                      <button key={dia} disabled={ocupado} onClick={() => setDiaSelecionado(dia)} className={`h-28 rounded-3xl border transition-all font-bold p-4 ${ocupado ? "bg-red-500/10 border-red-500/20 text-red-300 cursor-not-allowed" : ativo ? "bg-cyan-400 border-cyan-400 text-black scale-[1.03]" : "border-white/10 bg-white/5 hover:border-cyan-400/30"}`}>
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-lg capitalize">{dia}</span>
                          <span className="mt-3 text-xs font-semibold opacity-80">{ocupado ? "INDISPONÍVEL" : "DISPONÍVEL"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* PAGAMENTO */}
          {diaSelecionado && (
            <section className="max-w-4xl mx-auto px-6 pb-24">
              <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-2xl p-10">
                <h3 className="text-4xl font-black mb-10">Finalizar agendamento</h3>
                {!pagamentoLiberado ? (
                  <>
                    <div className="space-y-5 mb-10">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-slate-400">Plano</span><span className="font-bold">{planoSelecionado?.nome}</span></div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-slate-400">Horário do plantão</span><span className="font-bold text-cyan-300">{planoSelecionado?.horario}</span></div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-slate-400">Profissional</span><span className="font-bold">{profissionalSelecionado?.nome}</span></div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-slate-400">Dia reservado</span><span className="font-bold">{diaSelecionado}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Valor</span><span className="text-4xl font-black text-cyan-400">{planoSelecionado?.valor}</span></div>
                    </div>
                    <button onClick={handlePagamento} className="w-full h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-xl font-black hover:scale-[1.01] transition-all">
                      Confirmar pedido
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-7xl mb-5">✅</div>
                    <h3 className="text-4xl font-black text-emerald-400 mb-4">Solicitação enviada</h3>
                    <p className="text-slate-300 text-lg mb-8">Sua solicitação foi enviada para o painel do profissional. Ele irá confirmar em breve!</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Botão de WhatsApp Original */}
                      <button onClick={() => {
                        if (!profissionalSelecionado?.telefone) { alert("Profissional sem WhatsApp cadastrado."); return; }
                        const numeroLimpo = profissionalSelecionado.telefone.replace(/\D/g, "");
                        const mensagem = encodeURIComponent(`Olá ${profissionalSelecionado.nome}, solicitei um serviço na plataforma WD Conecta para o dia ${diaSelecionado}.`);
                        window.open(`https://wa.me/55${numeroLimpo}?text=${mensagem}`, "_blank");
                      }} className="h-14 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] transition-all text-white font-black text-base flex items-center justify-center gap-2">
                        WhatsApp
                      </button>
                      
                      {/* Botão Novo de Chat Interno */}
                      <button onClick={() => handleIniciarChat(profissionalSelecionado!)} className="h-14 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-base flex items-center justify-center gap-2">
                        Chat na Plataforma
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}