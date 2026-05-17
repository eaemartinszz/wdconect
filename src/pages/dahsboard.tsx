import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importações do Firebase
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function DashboardSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Estados de Controle e Feedback
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [userUid, setUserUid] = useState<string | null>(null);

  // Estados do Perfil
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    bio: "",
  });

  // Estados de Senha (Segurança)
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [notificacoes, setNotificacoes] = useState({
    app: true,
    email: true,
    whatsapp: false,
    frequencia: "evento",
  });

  // ================= 1. BUSCAR DADOS AO CARREGAR A TELA =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          // Busca os dados do usuário lá na coleção "usuarios" do Firestore
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData({
              name: data.nome || "", // Pega o nome que salvamos na criação da conta
              email: user.email || "", // Pega o email seguro da Autenticação
              cpf: data.cpf || "",
              phone: data.telefone || "",
              bio: data.bio || "",
            });
          }
        } catch (error) {
          console.error("Erro ao buscar dados do perfil:", error);
        } finally {
          setLoading(false); // Para a tela de "Carregando"
        }
      } else {
        // Se não tiver ninguém logado, expulsa de volta pro Login
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ================= 2. SALVAR ALTERAÇÕES NO PERFIL =================
 // ================= 2. SALVAR ALTERAÇÕES NO PERFIL =================
  const handleSaveProfile = async () => {
    if (!userUid) return;
    setSalvando(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      const docRef = doc(db, "usuarios", userUid);
      
      // SUBSTITUA O updateDoc POR setDoc com { merge: true }
      await setDoc(docRef, {
        nome: profileData.name,
        telefone: profileData.phone,
        bio: profileData.bio,
      }, { merge: true }); // <-- Isso faz a mágica de criar se não existir!
      
      setMensagem({ tipo: "sucesso", texto: "Perfil atualizado com sucesso!" });
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMensagem({ tipo: "", texto: "" }), 3000);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      setMensagem({ tipo: "erro", texto: "Erro ao salvar alterações. Tente novamente." });
    } finally {
      setSalvando(false);
    }
  };

  // ================= 3. ATUALIZAR SENHA =================
  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMensagem({ tipo: "erro", texto: "As novas senhas não coincidem!" });
      return;
    }
    
    if (auth.currentUser && passwords.newPassword.length >= 6) {
      try {
        await updatePassword(auth.currentUser, passwords.newPassword);
        setMensagem({ tipo: "sucesso", texto: "Senha atualizada com sucesso!" });
        setPasswords({ newPassword: "", confirmPassword: "" }); // Limpa os campos
      } catch (error: any) {
        setMensagem({ tipo: "erro", texto: "Erro ao atualizar senha. Faça login novamente e tente." });
      }
    }
  };

  // ================= 4. SAIR DA CONTA =================
  const handleLogout = async () => {
    try {
      await signOut(auth); // Desloga no Firebase
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Tela de Carregamento enquanto o Firebase busca os dados
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-blue-600 font-semibold flex items-center gap-2">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          Carregando seu painel...
        </div>
      </div>
    );
  }

  // ================= TABS =================

  const renderProfileTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Minha Conta</h2>
        <p className="text-slate-500 text-sm">Gerencie suas informações pessoais e preferências de notificação.</p>
      </div>

      {/* Alerta de Sucesso ou Erro */}
      {mensagem.texto && (
        <div className={`p-4 rounded-xl border font-medium text-sm ${mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {mensagem.texto}
        </div>
      )}

      {/* Imagens de Perfil e Fundo */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-100 to-emerald-100 relative group cursor-pointer">
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Alterar Capa
            </span>
          </div>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 -mt-12 mb-4 relative group cursor-pointer overflow-hidden">
            <img src={`https://ui-avatars.com/api/?name=${profileData.name || 'Usuário'}&background=0D8ABC&color=fff`} alt="Perfil" className="w-full h-full object-cover" />
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Completo</label>
              <input type="text" placeholder="Digite seu nome" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
              <input type="text" placeholder="(00) 00000-0000" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            {/* Campos bloqueados */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5 flex justify-between">
                E-mail <span className="text-xs bg-slate-100 px-2 rounded text-slate-500">Não editável</span>
              </label>
              <input type="email" placeholder="seu@email.com" value={profileData.email} disabled className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5 flex justify-between">
                CPF <span className="text-xs bg-slate-100 px-2 rounded text-slate-500">Não editável</span>
              </label>
              <input type="text" placeholder="000.000.000-00" value={profileData.cpf} disabled className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 cursor-not-allowed" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Biografia / Resumo</label>
              <textarea rows={3} placeholder="Escreva algo sobre você..." value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
            <div className="md:col-span-2 flex justify-end pt-4">
              <button 
                type="button" 
                onClick={handleSaveProfile}
                disabled={salvando}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:bg-blue-400"
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notificações (mantido apenas visual no momento) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Preferências de Notificação
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Canais de Recebimento</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={notificacoes.app} onChange={(e) => setNotificacoes({...notificacoes, app: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-slate-600 text-sm">Notificações no Aplicativo (Push)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={notificacoes.email} onChange={(e) => setNotificacoes({...notificacoes, email: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-slate-600 text-sm">E-mail</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={notificacoes.whatsapp} onChange={(e) => setNotificacoes({...notificacoes, whatsapp: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-slate-600 text-sm">WhatsApp</span>
              </label>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Frequência</p>
            <select 
              value={notificacoes.frequencia}
              onChange={(e) => setNotificacoes({...notificacoes, frequencia: e.target.value})}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="evento">Imediato (A cada evento/mensagem)</option>
              <option value="diario">Resumo Diário</option>
              <option value="programado">Programado (Somente em dias úteis)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Segurança e Acesso</h2>
        <p className="text-slate-500 text-sm">Mantenha sua conta segura e gerencie suas credenciais.</p>
      </div>

      {mensagem.texto && (
        <div className={`p-4 rounded-xl border font-medium text-sm ${mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {mensagem.texto}
        </div>
      )}

      {/* Alterar Senha */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nova Senha</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar Nova Senha</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <button 
            type="button" 
            onClick={handleUpdatePassword}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors w-full md:w-auto mt-2"
          >
            Atualizar Senha
          </button>
        </div>
        
        {/* Política de Senha */}
        <div className="md:w-72 bg-slate-50 p-5 rounded-xl border border-slate-100 h-fit">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Política de Segurança
          </h4>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full"></div>Mínimo de 6 caracteres</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Conformidade e Privacidade</h2>
        <p className="text-slate-500 text-sm">Gerencie seus dados e revise nossos termos (Adequação à LGPD).</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Documentos Legais</h3>
          <p className="text-sm text-slate-500">Você aceitou os termos de uso na criação da sua conta.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* MENU LATERAL (SIDEBAR) */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 md:min-h-screen flex flex-col">
        <div className="p-6 border-b border-slate-100 hidden md:block">
          <a href="/" className="flex items-center gap-2 group">
            <img src="/logowd.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-montserrat font-bold text-lg tracking-tight text-slate-900">
              <span className="text-blue-600">WD</span> Conecta
            </span>
          </a>
        </div>

        <nav className="flex-1 p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "profile" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Minha Conta
          </button>
          <button onClick={() => setActiveTab("security")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "security" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Segurança e Acesso
          </button>
          <button onClick={() => setActiveTab("compliance")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "compliance" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Privacidade e LGPD
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 hidden md:block">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "compliance" && renderComplianceTab()}
        </div>
      </main>

    </div>
  );
}