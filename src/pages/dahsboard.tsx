import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importação para o redirecionamento

export default function DashboardSettings() {
  const navigate = useNavigate(); // 2. Inicialização do hook de rotas
  const [activeTab, setActiveTab] = useState("profile");

  // 3. Estados limpos (sem dados simulados)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    bio: "",
  });

  const [notificacoes, setNotificacoes] = useState({
    app: true,
    email: true,
    whatsapp: false,
    frequencia: "evento", // evento, diario, programado
  });

  // 4. Função para o botão Sair da conta
  const handleLogout = () => {
    // Aqui você pode limpar os dados do usuário (ex: localStorage.removeItem('token'))
    navigate("/login"); // Redireciona para a página de login
  };

  // ================= TABS =================

  const renderProfileTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Minha Conta</h2>
        <p className="text-slate-500 text-sm">Gerencie suas informações pessoais e preferências de notificação.</p>
      </div>

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
            {/* Adicionado um fallback "Usuário" caso o nome esteja vazio */}
            <img src={`https://ui-avatars.com/api/?name=${profileData.name || 'Usuário'}&background=0D8ABC&color=fff`} alt="Perfil" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
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
              <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notificações */}
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
            <p className="text-xs text-slate-500 mt-2">
              Mensagens de segurança (como troca de senha) são sempre enviadas imediatamente, independente da configuração.
            </p>
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

      {/* Alterar Senha */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha Atual</label>
            <input type="password" placeholder="••••••••" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nova Senha</label>
            <input type="password" placeholder="••••••••" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar Nova Senha</label>
            <input type="password" placeholder="••••••••" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="button" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors w-full md:w-auto mt-2">
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
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              Mínimo de 8 caracteres
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              Pelo menos 1 letra maiúscula
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              Pelo menos 1 número
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              Um caractere especial (@, !, #, etc)
            </li>
          </ul>
        </div>
      </div>

      {/* Exclusão de Conta */}
      <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
        <h3 className="text-lg font-bold text-red-700 mb-2">Excluir Conta</h3>
        <p className="text-sm text-red-600/80 mb-4 max-w-3xl">
          Ao manter sua conta ativa, você preserva seu histórico de conexões, avaliações positivas que aumentam sua credibilidade (para profissionais) e evita processos de verificação futuros. Tem certeza que deseja encerrar sua jornada conosco?
        </p>
        <button type="button" className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm">
          Solicitar Exclusão de Conta
        </button>
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
        {/* Documentos Legais */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Documentos Legais</h3>
          
          <a href="#" className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Termos de Uso</p>
                <p className="text-xs text-slate-500">Atualizado em Março de 2026</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          <a href="#" className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Política de Privacidade</p>
                <p className="text-xs text-slate-500">Atualizado em Março de 2026</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Controles LGPD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            Controles LGPD
          </h3>
          
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-4">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Portabilidade de Dados</h4>
              <p className="text-xs text-slate-500 mb-3">
                Faça o download de uma cópia de todos os seus dados pessoais associados à sua conta.
              </p>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Solicitar Arquivo
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-4">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Revogar Consentimentos</h4>
              <p className="text-xs text-slate-500 mb-3">
                Gerencie permissões de cookies de terceiros e compartilhamento de dados analíticos.
              </p>
              <button className="text-sm font-medium text-amber-600 hover:text-amber-700">
                Gerenciar Preferências
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* MENU LATERAL (SIDEBAR) */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 md:min-h-screen flex flex-col">
        {/* Header do Menu */}
        <div className="p-6 border-b border-slate-100 hidden md:block">
          <a href="/" className="flex items-center gap-2 group">
            <img src="/logowd.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-montserrat font-bold text-lg tracking-tight text-slate-900">
              <span className="text-blue-600">WD</span> Conecta
            </span>
          </a>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "profile" 
              ? "bg-blue-50 text-blue-700" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Minha Conta
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "security" 
              ? "bg-blue-50 text-blue-700" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Segurança e Acesso
          </button>

          <button
            onClick={() => setActiveTab("compliance")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "compliance" 
              ? "bg-blue-50 text-blue-700" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Privacidade e LGPD
          </button>
        </nav>

        {/* Footer do Menu */}
        <div className="p-4 border-t border-slate-100 hidden md:block">
          {/* Adicionado a chamada da função handleLogout no onClick do botão */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
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