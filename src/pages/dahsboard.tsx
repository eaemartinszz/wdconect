
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Firebase
import { auth, db } from "../firebaseConfig"; // <-- storage removido
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  deleteUser,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

// ================= INTERFACES =================
interface Servico {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
  valor: string;
  avaliado?: boolean;
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

export default function DashboardSettings() {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "agenda" | "chat" | "security" | "compliance">("agenda");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [deletandoConta, setDeletandoConta] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [userUid, setUserUid] = useState<string | null>(null);

  // ================= ESTADO DOS AGENDAMENTOS =================
  const [servicos, setServicos] = useState<Servico[]>([]);

  // ================= ESTADOS DO CHAT =================
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputMensagem, setInputMensagem] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ================= ESTADOS DE AVALIAÇÃO =================
  const [servicoAvaliar, setServicoAvaliar] = useState<Servico | null>(null);
  const [nota, setNota] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  // ================= LGPD =================
  const [showLgpdPopup, setShowLgpdPopup] = useState(false);
  const [lgpdChecked, setLgpdChecked] = useState(false);
  const [salvandoLgpd, setSalvandoLgpd] = useState(false);

  // ================= PERFIL E SENHA =================
  const [profileData, setProfileData] = useState({
    name: "", email: "", cpf: "", phone: "", bio: "", photoURL: "", coverURL: "",
  });
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });

  // ================= BUSCAR DADOS E ESCUTAS =================
  useEffect(() => {
    let unsubAgendamentos: () => void;
    let unsubConversas: () => void;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);

        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData({
              name: data.nome || "", email: user.email || "", cpf: data.cpf || "", phone: data.telefone || "", bio: data.bio || "", photoURL: data.photoURL || "", coverURL: data.coverURL || "",
            });
            if (!data.lgpdAceito) setShowLgpdPopup(true);
          } else {
            setShowLgpdPopup(true);
          }

          // Busca agendamentos
          const qAgendamentos = query(collection(db, "agendamentos"), where("familiaId", "==", user.uid));
          unsubAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
            const lista: Servico[] = [];
            snapshot.forEach((d) => lista.push({ id: d.id, ...d.data() } as Servico));
            setServicos(lista);
          });

          // Busca conversas
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
                nomeDestinatario: userDoc.exists() ? userDoc.data().nome : "Profissional",
                fotoDestinatario: userDoc.exists() ? userDoc.data().photoURL : ""
              });
            }
            setConversas(listaConversas);
          });

        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => {
      unsubscribe();
      if (unsubAgendamentos) unsubAgendamentos();
      if (unsubConversas) unsubConversas();
    };
  }, [navigate]);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // ================= AÇÕES DO CHAT =================
  const handleAbrirChatComProfissional = async (profissionalId: string, nomeSalvo: string) => {
    if (!userUid) return;
    let nomeDestinatario = nomeSalvo;

    if (!nomeDestinatario) {
      try {
        const profDoc = await getDoc(doc(db, "usuarios", profissionalId));
        if (profDoc.exists()) {
          nomeDestinatario = profDoc.data().nome || "Profissional";
        } else {
          nomeDestinatario = "Profissional";
        }
      } catch (error) {
        nomeDestinatario = "Profissional";
      }
    }
    
    const chatId = `${userUid}_${profissionalId}`;
    setActiveChatId(chatId);
    setActiveChatUser({ id: chatId, participantes: [userUid, profissionalId], nomeDestinatario: nomeDestinatario });
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
        texto: textoMensagem,
        enviadoPor: userUid,
        criadoEm: serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // ================= CANCELAR SERVIÇO =================
  const cancelarServico = async (id: string) => {
    if (window.confirm("Deseja realmente cancelar este serviço?")) {
      try {
        await updateDoc(doc(db, "agendamentos", id), { status: "Cancelado" });
        toast.success("Serviço cancelado com sucesso!");
      } catch (error) {
        toast.error("Erro ao cancelar o serviço.");
      }
    }
  };

  // ================= ENVIAR AVALIAÇÃO =================
  const handleEnviarAvaliacao = async () => {
    if (!servicoAvaliar || !userUid) return;
    if (nota === 0) {
      toast.error("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setEnviandoAvaliacao(true);
    try {
      await addDoc(collection(db, "avaliacoes"), {
        profissionalId: servicoAvaliar.profissionalId,
        familiaId: userUid,
        agendamentoId: servicoAvaliar.id,
        nota: nota,
        comentario: comentarioAvaliacao,
        criadoEm: serverTimestamp()
      });

      await updateDoc(doc(db, "agendamentos", servicoAvaliar.id), {
        avaliado: true
      });

      toast.success("Avaliação enviada com sucesso! Obrigado.");
      setServicoAvaliar(null);
      setNota(0);
      setComentarioAvaliacao("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar avaliação.");
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  // ================= FUNÇÃO AUXILIAR: CONVERTER ARQUIVO PARA BASE64 =================
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // ================= UPLOAD FOTOS (BASE64) =================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userUid) return;

    // Proteção: Limite de 800KB para evitar exceder 1MB do documento Firestore
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userUid) return;

    // Proteção: Limite de 800KB
    if (file.size > 800 * 1024) {
      toast.error("Capa muito pesada! Escolha uma imagem de até 800KB.");
      return;
    }

    setUploadingCover(true);
    try {
      const base64String = await convertToBase64(file);
      setProfileData((prev) => ({ ...prev, coverURL: base64String }));
      await setDoc(doc(db, "usuarios", userUid), { coverURL: base64String }, { merge: true });
      toast.success("Capa atualizada com sucesso!"); 
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar capa."); 
    } finally { 
      setUploadingCover(false); 
    }
  };

  // ================= AÇÕES BÁSICAS =================
  const handleAcceptLGPD = async () => {
    if (!userUid || !lgpdChecked) return;
    setSalvandoLgpd(true);
    try {
      await setDoc(doc(db, "usuarios", userUid), { lgpdAceito: true, lgpdDataAceite: new Date().toISOString() }, { merge: true });
      setShowLgpdPopup(false);
      toast.success("Termos de privacidade aceites!");
    } catch (error) {
      toast.error("Erro ao salvar consentimento.");
    } finally { setSalvandoLgpd(false); }
  };

  const handleSaveProfile = async () => {
    if (!userUid) return;
    setSalvando(true);
    try {
      await setDoc(doc(db, "usuarios", userUid), { nome: profileData.name, telefone: profileData.phone, bio: profileData.bio }, { merge: true });
      toast.success("Perfil atualizado com sucesso!"); 
    } catch (error) { 
      toast.error("Erro ao salvar alterações."); 
    } finally { setSalvando(false); }
  };

  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("As senhas não coincidem."); 
      return;
    }
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, passwords.newPassword);
        toast.success("Senha atualizada com sucesso!"); 
        setPasswords({ newPassword: "", confirmPassword: "" });
      } catch (error) { 
        toast.error("Sessão expirada. Faça login novamente para alterar a senha."); 
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Deseja realmente excluir sua conta?")) return;
    if (!auth.currentUser || !userUid) return;
    setDeletandoConta(true);
    try {
      await deleteDoc(doc(db, "usuarios", userUid));
      await deleteUser(auth.currentUser);
      navigate("/login");
    } catch (error: any) { 
      toast.error("Autenticação necessária. Faça login novamente antes de excluir."); 
    } finally { setDeletandoConta(false); }
  };

  const handleLogout = async () => { await signOut(auth); navigate("/login"); };

  const changeTab = (tab: any) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // ================= TABS COMPONENTS =================

  const renderAgendaTab = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Meus Agendamentos</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Acompanhe os serviços que você contratou.</p>
      </div>

      <div className="grid gap-5">
        {servicos.length === 0 ? (
          <div className="bg-[#101C2C] border border-white/10 rounded-3xl p-8 md:p-10 text-center text-slate-400 text-sm md:text-base">
            Você ainda não contratou nenhum profissional.
          </div>
        ) : (
          servicos.map((s) => (
            <div key={s.id} className="bg-[#101C2C] border border-white/10 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
              <div className="w-full">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg md:text-xl font-bold text-white">{s.servico}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                    s.status === 'Confirmado' ? 'bg-emerald-500/20 text-emerald-400' :
                    s.status === 'Reagendado' ? 'bg-orange-500/20 text-orange-400' :
                    s.status === 'Cancelado' ? 'bg-red-500/20 text-red-400' :
                    s.status === 'Concluído' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-1"><strong>Profissional:</strong> {s.profissionalNome}</p>
                <p className="text-sm text-slate-400"><strong>Data e Hora:</strong> {s.data} às {s.hora}</p>
                <p className="text-sm md:text-base text-cyan-400 font-bold mt-2">{s.valor}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                {/* Botão Cancelar */}
                {s.status !== "Cancelado" && s.status !== "Concluído" && (
                  <button 
                    onClick={() => cancelarServico(s.id)}
                    className="w-full sm:w-auto px-5 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                )}

                {/* NOVO: Botão Avaliar */}
                {s.status === "Concluído" && !s.avaliado && (
                  <button 
                    onClick={() => setServicoAvaliar(s)}
                    className="w-full sm:w-auto px-5 py-3 border border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    Avaliar Serviço
                  </button>
                )}
                
                <button 
                  onClick={() => handleAbrirChatComProfissional(s.profissionalId, s.profissionalNome)}
                  className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Chat com Profissional
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderChatTab = () => (
    <div className="flex flex-col md:flex-row h-[75vh] min-h-[500px] w-full bg-[#101C2C] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in duration-500 relative">
      <aside className={`w-full md:w-80 border-r border-white/10 bg-black/20 flex-col ${activeChatId ? "hidden md:flex" : "flex"}`}>
        <div className="p-5 border-b border-white/10"><h2 className="font-black text-lg text-white">Mensagens</h2></div>
        <div className="flex-1 overflow-y-auto">
          {conversas.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">Nenhuma conversa activa.</div>
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

      <section className={`flex-1 flex-col bg-black/10 ${!activeChatId ? "hidden md:flex" : "flex"}`}>
        {activeChatId && activeChatUser ? (
          <>
            <div className="border-b border-white/10 px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4 bg-white/5">
              <button onClick={() => { setActiveChatId(null); setActiveChatUser(null); }} className="md:hidden text-slate-300 hover:text-white p-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <img src={activeChatUser.fotoDestinatario || `https://ui-avatars.com/api/?name=${activeChatUser.nomeDestinatario}&background=0D8ABC&color=fff`} className="w-10 h-10 rounded-full object-cover" />
              <h3 className="font-bold text-white text-base md:text-lg truncate">{activeChatUser.nomeDestinatario}</h3>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {mensagens.map((msg) => {
                const souEu = msg.enviadoPor === userUid;
                return (
                  <div key={msg.id} className={`flex w-full ${souEu ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-md rounded-2xl px-4 md:px-5 py-2 md:py-3 text-sm ${souEu ? "bg-cyan-500 text-black rounded-tr-none" : "bg-white/10 text-white rounded-tl-none border border-white/5"}`}>
                      <p className="leading-relaxed break-words">{msg.texto}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleEnviarMensagem} className="p-3 md:p-5 border-t border-white/10 bg-white/5 flex items-center gap-2 md:gap-3">
              <input type="text" value={inputMensagem} onChange={(e) => setInputMensagem(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400 transition-all text-sm" />
              <button type="submit" disabled={!inputMensagem.trim()} className="bg-cyan-500 text-black px-4 md:px-6 py-3 md:py-3.5 rounded-xl font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50">
                 <span className="hidden md:inline">Enviar</span>
                 <svg className="w-5 h-5 md:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm md:text-base font-medium">Selecione uma conversa ao lado.</div>
        )}
      </section>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Minha Conta</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Gerencie suas informações pessoais.</p>
      </div>

      <div className="bg-[#101C2C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <label htmlFor="upload-cover" className="h-32 md:h-52 block relative cursor-pointer group">
          {profileData.coverURL ? (
            <img src={profileData.coverURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0EA5E9] via-[#2563EB] to-[#7C3AED]" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-xs md:text-sm font-semibold">Alterar capa</div>
          </div>
        </label>
        <input type="file" id="upload-cover" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />

        <div className="p-6 md:p-8 relative">
          <div className="-mt-16 md:-mt-24 mb-6">
            <label htmlFor="upload-photo" className="relative group cursor-pointer w-24 h-24 md:w-32 md:h-32 rounded-full border-[5px] border-[#101C2C] overflow-hidden block shadow-2xl">
              {uploadingImage ? (
                <div className="w-full h-full flex items-center justify-center bg-[#07111F]"><span className="text-[10px] md:text-xs text-white">Enviando...</span></div>
              ) : (
                <>
                  <img src={profileData.photoURL || `https://ui-avatars.com/api/?name=${profileData.name}`} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs md:text-sm font-semibold">Editar</div>
                </>
              )}
            </label>
            <input type="file" id="upload-photo" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-xs md:text-sm text-slate-300 mb-2 block">Nome Completo</label>
              <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value }) } className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm md:text-base" />
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-300 mb-2 block">Telefone</label>
              <input type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value }) } className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm md:text-base" />
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-500 mb-2 block">E-mail</label>
              <input disabled type="email" value={profileData.email} className="w-full bg-[#0B1523] border border-white/5 rounded-2xl px-4 py-3 text-slate-500 text-sm md:text-base" />
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-500 mb-2 block">CPF</label>
              <input disabled type="text" value={profileData.cpf} className="w-full bg-[#0B1523] border border-white/5 rounded-2xl px-4 py-3 text-slate-500 text-sm md:text-base" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs md:text-sm text-slate-300 mb-2 block">Biografia</label>
              <textarea rows={4} value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value }) } className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none resize-none focus:border-blue-500 text-sm md:text-base" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2 md:mt-0">
              <button onClick={handleSaveProfile} disabled={salvando} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-semibold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 text-sm md:text-base">
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Segurança</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Atualize sua senha e gerencie sua conta.</p>
      </div>

      <div className="bg-[#101C2C] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="grid gap-4 md:gap-5">
          <div>
            <label className="text-xs md:text-sm text-slate-300 mb-2 block">Nova Senha</label>
            <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value }) } className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm md:text-base" />
          </div>
          <div>
            <label className="text-xs md:text-sm text-slate-300 mb-2 block">Confirmar Senha</label>
            <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value }) } className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm md:text-base" />
          </div>
          <button onClick={handleUpdatePassword} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-2xl mt-2 hover:opacity-90 transition-opacity text-sm md:text-base">
            Atualizar Senha
          </button>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-bold text-red-400 mb-2 md:mb-3">Zona de Perigo</h2>
        <p className="text-red-200/80 text-xs md:text-sm mb-4 md:mb-5">Excluir sua conta removerá permanentemente todos os seus dados.</p>
        <button onClick={handleDeleteAccount} disabled={deletandoConta} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors text-sm md:text-base">
          {deletandoConta ? "Excluindo..." : "Excluir Conta"}
        </button>
      </div>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Privacidade e LGPD</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Informações relacionadas à privacidade.</p>
      </div>
      <div className="bg-[#101C2C] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <p className="text-sm md:text-base text-slate-300 leading-relaxed">Seus dados são protegidos conforme a Lei Geral de Proteção de Dados (LGPD).</p>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-[#07111F] flex items-center justify-center text-white">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-[#07111F] flex flex-col md:flex-row text-white font-sans relative overflow-x-hidden">

      {/* MODAL DE AVALIAÇÃO */}
      {servicoAvaliar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#101C2C] border border-white/10 rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
            
            <button onClick={() => setServicoAvaliar(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 className="text-2xl font-black text-white mb-2">Avaliar Serviço</h2>
            <p className="text-slate-400 text-sm mb-6">Como foi o seu atendimento com <strong>{servicoAvaliar.profissionalNome}</strong>?</p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setNota(star)}
                  className={`transition-all transform hover:scale-110 ${nota >= star ? "text-yellow-400" : "text-slate-600"}`}
                >
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </button>
              ))}
            </div>

            <textarea 
              rows={3} 
              value={comentarioAvaliacao} 
              onChange={(e) => setComentarioAvaliacao(e.target.value)}
              className="w-full bg-[#0B1523] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-all text-sm resize-none placeholder:text-slate-600 mb-6" 
              placeholder="Deixe um comentário (opcional)..."
            />

            <button 
              onClick={handleEnviarAvaliacao} 
              disabled={enviandoAvaliacao}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold transition-all hover:opacity-90 disabled:opacity-50"
            >
              {enviandoAvaliacao ? "Enviando..." : "Enviar Avaliação"}
            </button>
          </div>
        </div>
      )}

      {/* BG EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-200px] left-[-100px] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between bg-[#0B1523] p-4 border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logowd.png" alt="Logo" className="w-8 h-8" />
          <h1 className="font-bold text-lg">WD Conecta</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1523] border-r border-white/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-7 border-b border-white/10 hidden md:block">
          <div className="flex items-center gap-3">
            <img src="/logowd.png" alt="" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-xl">WD Conecta</h1>
              <p className="text-xs text-slate-400">Dashboard Premium</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-2 overflow-y-auto">
          <button onClick={() => navigate("/conectar")} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/20 mb-4 hover:scale-[1.02] transition-transform text-sm">
            Contratar Novo Serviço
          </button>

          <button onClick={() => changeTab("agenda")} className={`w-full text-left px-5 py-4 rounded-2xl transition flex items-center justify-between text-sm ${activeTab === "agenda" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
            Meus Agendamentos
          </button>

          <button onClick={() => changeTab("chat")} className={`w-full text-left px-5 py-4 rounded-2xl transition flex items-center justify-between text-sm ${activeTab === "chat" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
            Mensagens
            {conversas.length > 0 && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
          </button>

          <button onClick={() => changeTab("profile")} className={`w-full text-left px-5 py-4 rounded-2xl transition text-sm ${activeTab === "profile" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
            Minha Conta
          </button>

          <button onClick={() => changeTab("security")} className={`w-full text-left px-5 py-4 rounded-2xl transition text-sm ${activeTab === "security" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
            Segurança
          </button>

          <button onClick={() => changeTab("compliance")} className={`w-full text-left px-5 py-4 rounded-2xl transition text-sm ${activeTab === "compliance" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
            LGPD
          </button>
        </div>

        <div className="p-5 border-t border-white/10">
          <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 py-3 rounded-2xl font-semibold transition-colors text-sm">
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto z-10 w-full h-[calc(100vh-73px)] md:h-screen">
        <div className="max-w-5xl mx-auto w-full">
          {activeTab === "agenda" && renderAgendaTab()}
          {activeTab === "chat" && renderChatTab()}
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "compliance" && renderComplianceTab()}
        </div>
      </main>

      {/* MODAL LGPD */}
      {showLgpdPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-5">
          <div className="bg-[#101C2C] border border-white/10 rounded-3xl max-w-xl w-full p-8 shadow-2xl">
            <h2>Termos e Privacidade</h2>
            <p>Para continuar utilizando a plataforma, você precisa aceitar os termos de uso e política de privacidade.</p>
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={lgpdChecked} onChange={(e) => setLgpdChecked(e.target.checked) } className="mt-1 w-4 h-4" />
              <span>Li e concordo com os termos e política de privacidade.</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleAcceptLGPD} disabled={!lgpdChecked || salvandoLgpd} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-2xl font-semibold disabled:opacity-50">
                {salvandoLgpd ? "Salvando..." : "Aceitar e Continuar"}
              </button>
              <button onClick={handleLogout} className="px-6 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-white transition-colors">Sair</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

