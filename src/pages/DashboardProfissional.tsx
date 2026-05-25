import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Importações do Firebase
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  orderBy, 
  setDoc
} from "firebase/firestore";

interface Servico {
  id: string;
  familiaId: string;
  familia: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
  valor: string;
}

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

export default function DashboardProfissional() {
  const navigate = useNavigate();
  
  // Estados Globais
  const [activeTab, setActiveTab] = useState<"agenda" | "chat">("agenda");
  const [userUid, setUserUid] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);

  // Estados de Agendamento
  const [servicos, setServicos] = useState<Servico[]>([]);

  // Estados do Chat Interno
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputMensagem, setInputMensagem] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ================= ESTADOS DO POPUP EDITAR PERFIL =================
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    bio: "",
    carterinha: "",
    especialidade: "",
    cidade: "",
  });

  // ================= 1. VERIFICAR AUTENTICAÇÃO E CARREGAR DADOS =================
  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        
        // Pega todos os dados do Profissional para preencher o formulário
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNome(data.nome || "");
          setProfileData({
            name: data.nome || "",
            phone: data.telefone || "",
            bio: data.bio || "",
            carterinha: data.carterinha || "",
            especialidade: data.especialidade || "",
            cidade: data.cidade || "",
          });
        }

        // Iniciar escuta dos agendamentos
        const q = query(collection(db, "agendamentos"), where("profissionalId", "==", user.uid));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const listaServicos: Servico[] = [];
          snapshot.forEach((doc) => {
            listaServicos.push({ id: doc.id, ...doc.data() } as Servico);
          });
          setServicos(listaServicos);
          setLoading(false);
        });

        // Iniciar escuta das conversas (Chat)
        ouvirConversas(user.uid);

      } else {
        navigate("/login");
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ================= ATUALIZAR STATUS NO BANCO =================
  const alterarStatus = async (id: string, novoStatus: string) => {
    try {
      await updateDoc(doc(db, "agendamentos", id), {
        status: novoStatus
      });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao atualizar o status do serviço.");
    }
  };

  const handleReagendar = async (id: string) => {
    const novaData = prompt("Digite a nova data (ex: 2026-06-01):");
    if (novaData) {
      try {
        await updateDoc(doc(db, "agendamentos", id), {
          data: novaData,
          status: "Reagendado"
        });
        alert("Solicitação de reagendamento enviada para a família.");
      } catch (error) {
        console.error("Erro ao reagendar:", error);
        alert("Erro ao reagendar o serviço.");
      }
    }
  };

  // ================= SALVAR ALTERAÇÕES DO PERFIL (POPUP) =================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid) return;

    setSalvandoPerfil(true);
    try {
      const docRef = doc(db, "usuarios", userUid);
      await updateDoc(docRef, {
        nome: profileData.name,
        telefone: profileData.phone,
        bio: profileData.bio,
        carterinha: profileData.carterinha,
        especialidade: profileData.especialidade,
        cidade: profileData.cidade,
      });

      setNome(profileData.name); // Atualiza instantaneamente o nome na barra lateral
      setShowProfileModal(false); // Fecha o modal popup
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil profissional:", error);
      alert("Erro ao salvar alterações do perfil.");
    } finally {
      setSalvandoPerfil(false);
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
          nomeDestinatario: userDoc.exists() ? userDoc.data().nome : "Família",
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

  const handleAbrirChatComFamilia = async (familiaId: string, nomeFamilia: string) => {
    if (!userUid) return;
    const chatId = `${familiaId}_${userUid}`;
    
    setActiveChatId(chatId);
    setActiveChatUser({ id: chatId, participantes: [familiaId, userUid], nomeDestinatario: nomeFamilia });
    setActiveTab("chat");
  };

  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMensagem.trim() || !activeChatId || !userUid || !activeChatUser) return;
    const textoMensagem = inputMensagem;
    setInputMensagem("");

    try {
      await setDoc(doc(db, "conversas", activeChatId), {
        participantes: activeChatUser.participantes,
        ultimaMensagem: textoMensagem, 
        atualizadoEm: serverTimestamp()
      }, { merge: true });

      await addDoc(collection(db, "conversas", activeChatId, "mensagens"), {
        texto: textoMensagem, enviadoPor: userUid, criadoEm: serverTimestamp()
      });
    } catch (error) { console.error("Erro ao enviar mensagem:", error); }
  };

  // ================= ABA: AGENDA DE SERVIÇOS =================
  const renderAgenda = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Meus Serviços</h2>
        <p className="text-slate-500 text-sm">Gerencie suas contratações, agendamentos e status de trabalho.</p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Carregando sua agenda...</div>
        ) : servicos.length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl">
            <p className="text-slate-500 font-medium">Você ainda não possui nenhum serviço agendado.</p>
          </div>
        ) : (
          servicos.map((servico) => (
            <div key={servico.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">{servico.familia || "Família"}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    servico.status === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' :
                    servico.status === 'Reagendado' ? 'bg-orange-100 text-orange-700' :
                    servico.status === 'Pendente' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {servico.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1"><strong>Serviço:</strong> {servico.servico} - {servico.valor}</p>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {servico.data} às {servico.hora}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {servico.status === "Pendente" && (
                  <button onClick={() => alterarStatus(servico.id, "Confirmado")} className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
                    Aceitar
                  </button>
                )}
                {servico.status !== "Concluído" && (
                  <button onClick={() => handleReagendar(servico.id)} className="flex-1 md:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
                    Reagendar
                  </button>
                )}
                <button onClick={() => handleAbrirChatComFamilia(servico.familiaId, servico.familia)} className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Conversar com a Família">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );

  // ================= ABA: CHAT COM FAMÍLIAS =================
  const renderChat = () => (
    <div className="flex flex-col md:flex-row h-[75vh] w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <aside className="w-full md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white"><h2 className="font-bold text-slate-800">Suas conversas</h2></div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversas.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">Nenhuma conversa ativa. As famílias aparecerão aqui quando entrarem em contato.</div>
          ) : (
            conversas.map((chat) => (
              <button key={chat.id} onClick={() => { setActiveChatId(chat.id); setActiveChatUser(chat); }} className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${activeChatId === chat.id ? "bg-blue-50" : "hover:bg-slate-100/50"}`}>
                <img src={chat.fotoDestinatario || `https://ui-avatars.com/api/?name=${chat.nomeDestinatario}&background=0D8ABC&color=fff`} className="w-10 h-10 rounded-full object-cover" />
                <div className="overflow-hidden flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{chat.nomeDestinatario}</h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{chat.ultimaMensagem || "Iniciar conversa..."}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex-1 bg-slate-50/50 flex flex-col justify-between relative">
        {activeChatId && activeChatUser ? (
          <>
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 shadow-sm z-10">
              <img src={activeChatUser.fotoDestinatario || `https://ui-avatars.com/api/?name=${activeChatUser.nomeDestinatario}&background=0D8ABC&color=fff`} className="w-10 h-10 rounded-full object-cover" />
              <h3 className="font-bold text-slate-800">{activeChatUser.nomeDestinatario}</h3>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-100">
              {mensagens.map((msg) => {
                const souEu = msg.enviadoPor === userUid;
                return (
                  <div key={msg.id} className={`flex w-full ${souEu ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md rounded-2xl px-4 py-2.5 shadow-sm text-sm border ${souEu ? "bg-[#0a1628] text-white border-[#0a1628] rounded-tr-none" : "bg-white text-slate-800 border-slate-200 rounded-tl-none"}`}>
                      <p className="leading-relaxed break-words">{msg.texto}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleEnviarMensagem} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 z-10">
              <input type="text" value={inputMensagem} onChange={(e) => setInputMensagem(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 p-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
              <button type="submit" disabled={!inputMensagem.trim()} className="bg-blue-600 text-white p-3 rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-50">Enviar</button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
            <p className="font-medium text-slate-500">Selecione uma família na lista lateral para conversar.</p>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans relative">
      
      {/* ================= MODAL POPUP: EDITAR PERFIL DO PROFISSIONAL ================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300 relative text-slate-900">
            
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Editar Meu Perfil Professional</h2>
            <p className="text-slate-500 text-sm mb-6">Mantenha os seus dados atualizados para que as famílias o encontrem mais facilmente.</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Nome Completo</label>
                <input type="text" required value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Telefone</label>
                  <input type="text" required value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Cidade</label>
                  <input type="text" required value={profileData.cidade} onChange={(e) => setProfileData({...profileData, cidade: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Carteirinha (COREN, etc)</label>
                  <input type="text" required value={profileData.carterinha} onChange={(e) => setProfileData({...profileData, carterinha: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Especialidade</label>
                  <input type="text" required value={profileData.especialidade} onChange={(e) => setProfileData({...profileData, especialidade: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Biografia / Resumo</label>
                <textarea rows={3} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-50 resize-none" placeholder="Fale um pouco sobre a sua experiência de trabalho..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 h-12 rounded-xl border-2 border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvandoPerfil} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-50">
                  {salvandoPerfil ? "A guardar..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= FIM DO MODAL POPUP ================= */}

      {/* MENU LATERAL EXCLUSIVO DO PROFISSIONAL */}
      <aside className="w-full md:w-64 bg-[#0a1628] text-white flex flex-col min-h-screen">
        <div className="p-6 border-b border-white/10">
           <span className="font-bold text-xl tracking-tight"><span className="text-blue-400">WD</span> Profissional</span>
           <p className="text-sm text-slate-400 mt-1">Olá, {nome || 'Especialista'}</p>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button onClick={() => setActiveTab("agenda")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "agenda" ? "bg-blue-600 text-white shadow-md" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Agenda e Serviços
          </button>
          
          <button onClick={() => setActiveTab("chat")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "chat" ? "bg-blue-600 text-white shadow-md" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
             Chat com Famílias
             {conversas.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse ml-auto" />}
          </button>

          {/* O BOTÃO QUE ANTES IA PARA O OUTRO DASH, AGORA ABRE O POPUP DIRETAMENTE */}
          <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-slate-300 hover:bg-white/10 hover:text-white mt-auto">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Editar Perfil
          </button>
          
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300">
            Sair da Conta
          </button>
        </nav>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
          {activeTab === "agenda" && renderAgenda()}
          {activeTab === "chat" && renderChat()}
        </div>
      </main>

    </div>
  );
}