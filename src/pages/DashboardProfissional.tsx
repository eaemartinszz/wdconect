
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Firebase
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

// ================= INTERFACES =================
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
  
  // Menu Mobile Toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    bio: "",
    carterinha: "",
    especialidade: "",
    cidade: "",
    photoURL: "",
  });

  // ================= ESTADO DO POPUP VER CLIENTE =================
  const [familiaModal, setFamiliaModal] = useState<any | null>(null);

  // ================= INTELIGÊNCIA FINANCEIRA =================
  const parseValor = (valorStr: string) => {
    if (!valorStr) return 0;
    const num = String(valorStr).replace(/\D/g, "");
    return Number(num);
  };

  const saldoProfissional = servicos
    .filter(s => s.status === "Concluído" || s.status === "Confirmado")
    .reduce((acc, s) => acc + parseValor(s.valor), 0) * 0.70; // 70% do Profissional

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // ================= 1. VERIFICAR AUTENTICAÇÃO E CARREGAR DADOS =================
  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    let unsubConversas: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        
        // Pega todos os dados do Profissional
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
            photoURL: data.photoURL || "",
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
        const qConversas = query(collection(db, "conversas"), where("participantes", "array-contains", user.uid));
        unsubConversas = onSnapshot(qConversas, async (snapshot) => {
          const listaConversas: Conversa[] = [];
          for (const docSnap of snapshot.docs) {
            const dados = docSnap.data();
            const idDestinatario = dados.participantes.find((p: string) => p !== user.uid);
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

      } else {
        navigate("/login");
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubConversas) unsubConversas();
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
      toast.success(`Serviço alterado para: ${novoStatus}`);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao atualizar o status do serviço.");
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
        toast.success("Solicitação de reagendamento enviada!");
      } catch (error) {
        console.error("Erro ao reagendar:", error);
        toast.error("Erro ao reagendar o serviço.");
      }
    }
  };

  // ================= FUNÇÃO AUXILIAR: BASE64 =================
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // ================= UPLOAD FOTO DE PERFIL (BASE64) =================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userUid) return;

    if (file.size > 800 * 1024) {
      toast.error("Imagem muito pesada! Escolha uma imagem de até 800KB.");
      return;
    }

    setUploadingImage(true);
    try {
      const base64String = await convertToBase64(file);
      setProfileData((prev) => ({ ...prev, photoURL: base64String }));
      await setDoc(doc(db, "usuarios", userUid), { photoURL: base64String }, { merge: true });
      toast.success("Foto de perfil atualizada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar imagem.");
    } finally {
      setUploadingImage(false);
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

      setNome(profileData.name); 
      setShowProfileModal(false); 
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil profissional:", error);
      toast.error("Erro ao salvar alterações do perfil.");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  // ================= ABRIR PERFIL DA FAMÍLIA =================
  const handleAbrirPerfilFamilia = async (familiaId: string) => {
    try {
      const docRef = doc(db, "usuarios", familiaId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFamiliaModal({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Perfil do cliente não encontrado.");
      }
    } catch (error) {
      toast.error("Erro ao carregar perfil do cliente.");
    }
  };

  // ================= LÓGICA DO CHAT INTERNO =================
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
    setIsMobileMenuOpen(false);
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

  // ================= NAVEGAÇÃO MOBILE =================
  const changeTab = (tab: any) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // ================= ABA: AGENDA DE SERVIÇOS =================
  const renderAgenda = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER E CARTEIRA DO PROFISSIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8">
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Meus Serviços</h2>
          <p className="text-slate-400 text-sm md:text-base">Gerencie suas contratações e status de trabalho.</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/30 p-6 rounded-3xl shadow-[0_0_15px_rgba(16,185,129,0.1)] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
          <p className="text-emerald-400 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Meu Saldo </p>
          <p className="text-3xl md:text-4xl font-black text-white">{formatarMoeda(saldoProfissional)}</p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-5">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Carregando sua agenda...</div>
        ) : servicos.length === 0 ? (
          <div className="bg-[#101C2C] border border-white/10 rounded-3xl p-8 md:p-10 text-center text-slate-400 text-sm md:text-base">
            Você ainda não possui nenhum serviço agendado.
          </div>
        ) : (
          servicos.map((servico) => (
            <div key={servico.id} className="bg-[#101C2C] border border-white/10 p-5 md:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all">
              
              <div className="w-full">
                <div className="flex items-center gap-3 mb-3">
                  <h3 
                    className="font-bold text-white text-lg md:text-xl cursor-pointer hover:text-cyan-400 transition-colors flex items-center gap-2"
                    onClick={() => handleAbrirPerfilFamilia(servico.familiaId)}
                    title="Ver perfil do cliente"
                  >
                    {servico.familia || "Família"}
                    <svg className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                    servico.status === 'Confirmado' ? 'bg-emerald-500/20 text-emerald-400' :
                    servico.status === 'Reagendado' ? 'bg-orange-500/20 text-orange-400' :
                    servico.status === 'Pendente' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-white/10 text-slate-300'
                  }`}>
                    {servico.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-1"><strong>Serviço:</strong> {servico.servico}</p>
                <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {servico.data} às {servico.hora}
                </p>
                <p className="text-sm md:text-base text-cyan-400 font-bold mt-2">{servico.valor || ""}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                {servico.status === "Pendente" && (
                  <button onClick={() => alterarStatus(servico.id, "Confirmado")} className="w-full sm:w-auto px-5 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-sm font-semibold rounded-xl transition-colors">
                    Aceitar
                  </button>
                )}
                {servico.status !== "Concluído" && servico.status !== "Cancelado" && (
                  <button onClick={() => handleReagendar(servico.id)} className="w-full sm:w-auto px-5 py-3 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-xl transition-colors">
                    Reagendar
                  </button>
                )}
                <button onClick={() => handleAbrirChatComFamilia(servico.familiaId, servico.familia)} className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Conversar
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );

  // ================= ABA: CHAT RESPONSIVO =================
  const renderChat = () => (
    <div className="flex flex-col md:flex-row h-[75vh] min-h-[500px] w-full bg-[#101C2C] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in duration-500 relative">
      
      {/* Lista de Conversas */}
      <aside className={`w-full md:w-80 border-r border-white/10 bg-black/20 flex-col ${activeChatId ? "hidden md:flex" : "flex"}`}>
        <div className="p-5 border-b border-white/10"><h2 className="font-black text-lg text-white">Mensagens</h2></div>
        <div className="flex-1 overflow-y-auto">
          {conversas.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">Nenhuma conversa ativa. As famílias aparecerão aqui quando entrarem em contato.</div>
          ) : (
            conversas.map((chat) => (
              <button key={chat.id} onClick={() => { setActiveChatId(chat.id); setActiveChatUser(chat); }} className={`w-full p-4 flex items-center gap-4 text-left transition-colors border-b border-white/5 ${activeChatId === chat.id ? "bg-cyan-500/10" : "hover:bg-white/5"}`}>
                <img src={chat.fotoDestinatario || `https://ui-avatars.com/api/?name=${chat.nomeDestinatario}&background=0D8ABC&color=fff`} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                <div className="overflow-hidden flex-1">
                  <h4 className="font-bold text-white text-sm truncate">{chat.nomeDestinatario}</h4>
                  <p className="text-xs text-slate-400 truncate mt-1">{chat.ultimaMensagem || "Iniciar conversa..."}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Área da Conversa */}
      <section className={`flex-1 flex-col bg-black/10 ${!activeChatId ? "hidden md:flex" : "flex"}`}>
        {activeChatId && activeChatUser ? (
          <>
            <div className="border-b border-white/10 px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4 bg-white/5">
              <button onClick={() => { setActiveChatId(null); setActiveChatUser(null); }} className="md:hidden text-slate-300 hover:text-white p-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <img src={activeChatUser.fotoDestinatario || `https://ui-avatars.com/api/?name=${activeChatUser.nomeDestinatario}&background=0D8ABC&color=fff`} className="w-10 h-10 rounded-full object-cover border border-white/10" />
              <h3 className="font-bold text-white text-base md:text-lg truncate">{activeChatUser.nomeDestinatario}</h3>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {mensagens.map((msg) => {
                const souEu = msg.enviadoPor === userUid;
                return (
                  <div key={msg.id} className={`flex w-full ${souEu ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-md rounded-2xl px-4 md:px-5 py-2 md:py-3 text-sm ${souEu ? "bg-cyan-500 text-[#07111F] rounded-tr-none font-medium" : "bg-white/10 text-white rounded-tl-none border border-white/5"}`}>
                      <p className="leading-relaxed break-words">{msg.texto}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleEnviarMensagem} className="p-3 md:p-5 border-t border-white/10 bg-white/5 flex items-center gap-2 md:gap-3">
              <input type="text" value={inputMensagem} onChange={(e) => setInputMensagem(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400 transition-all text-sm" />
              <button type="submit" disabled={!inputMensagem.trim()} className="bg-cyan-500 text-[#07111F] px-4 md:px-6 py-3 md:py-3.5 rounded-xl font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50">
                 <span className="hidden md:inline">Enviar</span>
                 <svg className="w-5 h-5 md:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-sm md:text-base font-medium">Selecione uma conversa ao lado.</div>
        )}
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07111F] flex flex-col md:flex-row text-white font-sans relative overflow-x-hidden">
      
      {/* BG EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-200px] left-[-100px] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between bg-[#0B1523] p-4 border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logowd.png" alt="Logo" className="w-8 h-8" />
          <h1 className="font-bold text-lg">WD <span className="text-cyan-400">Pro</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* MODAL POPUP: VER PERFIL DA FAMÍLIA/CLIENTE */}
      {familiaModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101C2C] border border-white/10 rounded-3xl shadow-2xl max-w-sm w-full p-6 relative text-white animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setFamiliaModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="flex flex-col items-center text-center mt-4">
              <img src={familiaModal.photoURL || `https://ui-avatars.com/api/?name=${familiaModal.nome}&background=0D8ABC&color=fff`} alt={familiaModal.nome} className="w-24 h-24 rounded-full object-cover border-4 border-[#07111F] shadow-lg mb-4" />
              <h2 className="text-2xl font-black">{familiaModal.nome}</h2>
              <p className="text-cyan-400 font-semibold mt-1">Cliente / Família</p>
              
              {familiaModal.bio && (
                <p className="text-slate-300 text-sm mt-4 leading-relaxed px-2">"{familiaModal.bio}"</p>
              )}
              
              <div className="mt-6 w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 text-left">
                {familiaModal.telefone && (
                  <p className="text-sm"><strong className="text-slate-400">Telefone:</strong> {familiaModal.telefone}</p>
                )}
                <p className="text-sm"><strong className="text-slate-400">Membro desde:</strong> 2026</p>
              </div>
            </div>
            <button onClick={() => setFamiliaModal(null)} className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL POPUP: EDITAR PERFIL DO PROFISSIONAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101C2C] border border-white/10 rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 animate-in fade-in duration-300 relative text-white">
            
            <button onClick={() => setShowProfileModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 className="text-2xl font-black mb-2 text-center">Editar Meu Perfil</h2>
            <p className="text-slate-400 text-sm mb-6 text-center">Mantenha os seus dados atualizados para as famílias.</p>

            {/* FOTO DE PERFIL UPLOAD */}
            <div className="flex justify-center mb-6">
              <label htmlFor="upload-photo" className="relative group cursor-pointer w-24 h-24 rounded-full border-4 border-[#101C2C] overflow-hidden block shadow-xl bg-[#07111F]">
                {uploadingImage ? (
                  <div className="w-full h-full flex items-center justify-center"><span className="text-[10px] text-white">A enviar...</span></div>
                ) : (
                  <>
                    <img src={profileData.photoURL || `https://ui-avatars.com/api/?name=${profileData.name}&background=0D8ABC&color=fff`} alt="Perfil" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">Alterar</div>
                  </>
                )}
              </label>
              <input type="file" id="upload-photo" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Nome Completo</label>
                <input type="text" required value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-3 bg-[#0B1523] border border-white/10 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Telefone</label>
                  <input type="text" required value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-3 bg-[#0B1523] border border-white/10 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Cidade</label>
                  <input type="text" required value={profileData.cidade} onChange={(e) => setProfileData({...profileData, cidade: e.target.value})} className="w-full px-4 py-3 bg-[#0B1523] border border-white/10 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Carteirinha</label>
                  <input type="text" required value={profileData.carterinha} onChange={(e) => setProfileData({...profileData, carterinha: e.target.value})} className="w-full px-4 py-3 bg-[#0B1523] border border-white/10 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm placeholder:text-slate-600" placeholder="Ex: COREN..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Especialidade</label>
                  <input type="text" required value={profileData.especialidade} onChange={(e) => setProfileData({...profileData, especialidade: e.target.value})} className="w-full px-4 py-3 bg-[#0B1523] border border-white/10 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm placeholder:text-slate-600" placeholder="Ex: Enfermeiro" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Biografia / Resumo</label>
                <textarea rows={3} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full px-4 py-3 bg-[#0B1523] border border-white/10 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm resize-none placeholder:text-slate-600" placeholder="Fale um pouco sobre a sua experiência..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-bold text-sm text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvandoPerfil} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50">
                  {salvandoPerfil ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR (Desktop & Mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1523] border-r border-white/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="p-7 border-b border-white/10 hidden md:block">
           <span className="font-bold text-xl tracking-tight"><span className="text-cyan-400">WD</span> Profissional</span>
           <p className="text-xs text-slate-400 mt-1">Olá, {nome || 'Especialista'}</p>
        </div>
        
        <nav className="flex-1 p-5 flex flex-col gap-2 overflow-y-auto">
          
          <button onClick={() => changeTab("agenda")} className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium transition-colors ${activeTab === "agenda" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Agenda e Serviços
          </button>
          
          <button onClick={() => changeTab("chat")} className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium transition-colors ${activeTab === "chat" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
             Mensagens
             {conversas.length > 0 && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-auto" />}
          </button>

          <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium transition-colors text-slate-300 hover:bg-white/5 hover:text-white mt-4 md:mt-auto border border-dashed border-white/10">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Editar Perfil
          </button>
          
        </nav>

        <div className="p-5 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-4 rounded-2xl text-sm font-semibold transition-colors">
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto z-10 w-full h-[calc(100vh-73px)] md:h-screen">
        <div className="max-w-5xl mx-auto w-full">
          {activeTab === "agenda" && renderAgenda()}
          {activeTab === "chat" && renderChat()}
        </div>
      </main>

    </div>
  );
}

