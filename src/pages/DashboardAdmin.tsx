
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Firebase
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// ================= INTERFACES =================
interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  tipoConta: string;
  telefone?: string;
  especialidade?: string;
  cidade?: string;
  verificado?: boolean;
}

interface AgendamentoAdmin {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  familiaId: string;
  familia: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
  valor: string;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DO ADMIN =================
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [emailAdmin, setEmailAdmin] = useState("");
  const [senhaAdmin, setSenhaAdmin] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // E-mails com permissão "Hardcoded" (À prova de falhas)
  const EMAILS_PERMITIDOS = ["gabiespin34@gmail.com", "victor.piaget1906@gmail.com"];

  // Estados do Dashboard
  const [activeTab, setActiveTab] = useState<"overview" | "cuidadores" | "atendimentos">("overview");
  const [loadingDados, setLoadingDados] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdmin[]>([]);
  
  // Estado para o Popup do Cuidador
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<UsuarioAdmin | null>(null);

  // ================= INTELIGÊNCIA FINANCEIRA & KPIs =================
  const profissionais = usuarios.filter((u) => u.tipoConta === "professional");
  
  const parseValor = (valorStr: string) => {
    if (!valorStr) return 0;
    const num = valorStr.replace(/\D/g, "");
    return Number(num);
  };

  // Calcula o Faturamento Total apenas de serviços Confirmados ou Concluídos
  const faturamentoTotal = agendamentos
    .filter(a => a.status === "Concluído" || a.status === "Confirmado")
    .reduce((acc, a) => acc + parseValor(a.valor), 0);

  // Calcula os 30% da Plataforma e os 70% do Profissional
  const receitaWD = faturamentoTotal * 0.30;
  const repasseProfissionais = faturamentoTotal * 0.70;

  // Formatação de Moeda
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // ================= VERIFICAÇÃO DE SESSÃO =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email && EMAILS_PERMITIDOS.includes(user.email)) {
        setIsAdminAuth(true);
        buscarDadosGerais();
      } else {
        setIsAdminAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ================= LOGIN EXCLUSIVO ADMIN =================
  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!EMAILS_PERMITIDOS.includes(emailAdmin.toLowerCase())) {
      toast.error("E-mail não autorizado para acesso ao painel.");
      return;
    }

    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailAdmin, senhaAdmin);
      toast.success("Acesso de Administrador concedido!");
    } catch (error) {
      toast.error("Credenciais inválidas. Verifique e-mail e senha.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdminAuth(false);
    navigate("/");
  };

  // ================= BUSCAR DADOS =================
  const buscarDadosGerais = async () => {
    setLoadingDados(true);
    try {
      const usersSnap = await getDocs(collection(db, "usuarios"));
      const usersList: UsuarioAdmin[] = [];
      usersSnap.forEach((d) => usersList.push({ id: d.id, ...d.data() } as UsuarioAdmin));
      setUsuarios(usersList);

      const agendaSnap = await getDocs(collection(db, "agendamentos"));
      const agendaList: AgendamentoAdmin[] = [];
      agendaSnap.forEach((d) => agendaList.push({ id: d.id, ...d.data() } as AgendamentoAdmin));
      setAgendamentos(agendaList);
    } catch (error) {
      toast.error("Erro ao carregar dados do sistema.");
    } finally {
      setLoadingDados(false);
    }
  };

  // ================= AÇÕES ADMINISTRATIVAS =================
  const verificarProfissional = async (id: string, estadoAtual: boolean) => {
    try {
      await updateDoc(doc(db, "usuarios", id), { verificado: !estadoAtual });
      toast.success(`Profissional ${!estadoAtual ? 'verificado' : 'desmarcado'} com sucesso!`);
      buscarDadosGerais();
      setProfissionalSelecionado(null);
    } catch (error) {
      toast.error("Erro ao alterar verificação.");
    }
  };

  const deletarAgendamento = async (id: string) => {
    if (!window.confirm("Atenção (Admin): Deseja deletar permanentemente este agendamento do banco de dados?")) return;
    try {
      await deleteDoc(doc(db, "agendamentos", id));
      toast.success("Agendamento excluído da base.");
      buscarDadosGerais();
    } catch (error) {
      toast.error("Erro ao excluir registro.");
    }
  };

  // ================= EXPORTAR PARA EXCEL (CSV) =================
  const exportarParaExcel = (dados: any[], nomeFicheiro: string) => {
    if (dados.length === 0) {
      toast.error("Nenhum dado para exportar.");
      return;
    }

    const separador = ";";
    const chaves = Object.keys(dados[0]);
    
    const cabecalho = chaves.join(separador);
    const linhas = dados.map(linha => {
      return chaves.map(chave => {
        let valor = linha[chave] || "";
        valor = String(valor).replace(/(\r\n|\n|\r)/gm, " ");
        return `"${valor}"`;
      }).join(separador);
    });

    const csvContent = [cabecalho, ...linhas].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${nomeFicheiro}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${nomeFicheiro}.csv baixado com sucesso!`);
  };

  const handleExportarCuidadores = () => {
    const formatados = profissionais.map(p => ({
      ID: p.id,
      Nome: p.nome,
      Telefone: p.telefone || "Não informado",
      Especialidade: p.especialidade || "Não informada",
      Cidade: p.cidade || "Não informada",
      Status: p.verificado ? "Verificado" : "Pendente"
    }));
    exportarParaExcel(formatados, "WDConecta_Cuidadores");
  };

  const handleExportarAtendimentos = () => {
    const formatados = agendamentos.map(a => {
      const valorNumerico = parseValor(a.valor);
      return {
        ID_Agendamento: a.id,
        Familia: a.familia,
        Cuidador: a.profissionalNome,
        Servico: a.servico,
        Data: a.data,
        Hora: a.hora,
        Status: a.status,
        Valor_Total: a.valor,
        Receita_WD_30: formatarMoeda(valorNumerico * 0.30),
        Repasse_Cuidador_70: formatarMoeda(valorNumerico * 0.70)
      };
    });
    exportarParaExcel(formatados, "WDConecta_Atendimentos_Financeiro");
  };

  // ================= TELA DE LOGIN ISOLADA =================
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#07111F] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-sm bg-[#101C2C] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">WD <span className="text-red-500">Admin</span></h1>
            <p className="text-slate-400 text-sm mt-1 text-center">Acesso restrito à equipa fundadora.</p>
          </div>

          <form onSubmit={handleLoginAdmin} className="space-y-4">
            <div>
              <input 
                type="email" 
                required 
                value={emailAdmin} 
                onChange={(e) => setEmailAdmin(e.target.value)}
                className="w-full bg-[#0B1523] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 text-sm" 
                placeholder="E-mail admin"
              />
            </div>
            <div className="relative">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                required 
                value={senhaAdmin} 
                onChange={(e) => setSenhaAdmin(e.target.value)}
                className="w-full bg-[#0B1523] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white outline-none focus:border-red-500 text-sm" 
                placeholder="Senha"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
              >
                {mostrarSenha ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full py-3.5 mt-2 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loginLoading ? "A Entrar..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= TABS COMPONENTS (DASHBOARD ADMIN) =================
  const renderOverview = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Visão Geral & Financeiro</h1>
      </div>
      
      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#101C2C] border border-white/10 p-5 md:p-6 rounded-3xl">
          <p className="text-slate-400 text-xs md:text-sm font-bold uppercase mb-2">Total Usuários</p>
          <p className="text-3xl md:text-4xl font-black text-white">{usuarios.length}</p>
        </div>
        <div className="bg-[#101C2C] border border-white/10 p-5 md:p-6 rounded-3xl">
          <p className="text-slate-400 text-xs md:text-sm font-bold uppercase mb-2">Cuidadores</p>
          <p className="text-3xl md:text-4xl font-black text-cyan-400">{profissionais.length}</p>
        </div>
        <div className="bg-[#101C2C] border border-white/10 p-5 md:p-6 rounded-3xl sm:col-span-2 md:col-span-1">
          <p className="text-slate-400 text-xs md:text-sm font-bold uppercase mb-2">Atendimentos Efetuados</p>
          <p className="text-3xl md:text-4xl font-black text-white">
            {agendamentos.filter(a => a.status === "Concluído" || a.status === "Confirmado").length}
          </p>
        </div>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-3xl">
          <p className="text-slate-400 text-xs md:text-sm font-bold uppercase mb-2">Faturamento Bruto (100%)</p>
          <p className="text-2xl md:text-3xl font-black text-white">{formatarMoeda(faturamentoTotal)}</p>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 p-5 md:p-6 rounded-3xl shadow-[0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-20 h-20 bg-red-500/20 rounded-full blur-2xl"></div>
          <p className="text-red-300 text-xs md:text-sm font-bold uppercase mb-2">Receita WD Conecta (30%)</p>
          <p className="text-3xl md:text-4xl font-black text-red-400">{formatarMoeda(receitaWD)}</p>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 md:p-6 rounded-3xl">
          <p className="text-emerald-300 text-xs md:text-sm font-bold uppercase mb-2">Repasse Profissionais (70%)</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-400">{formatarMoeda(repasseProfissionais)}</p>
        </div>
      </div>
    </div>
  );

  const renderCuidadores = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Controle de Cuidadores</h1>
        <button onClick={handleExportarCuidadores} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 sm:py-2 rounded-xl text-sm font-bold transition-colors">
          Exportar Excel
        </button>
      </div>
      <div className="bg-[#101C2C] border border-white/10 rounded-3xl overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-xs md:text-sm uppercase">
              <th className="p-4">Nome</th>
              <th className="p-4">Contato</th>
              <th className="p-4 text-center">Status Confiança</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {profissionais.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors text-sm md:text-base">
                <td className="p-4 text-white font-bold">{p.nome}</td>
                <td className="p-4 text-slate-300">{p.telefone || "N/A"}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.verificado ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"}`}>
                    {p.verificado ? "Verificado" : "Pendente"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => setProfissionalSelecionado(p)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    Ver Perfil
                  </button>
                </td>
              </tr>
            ))}
            {profissionais.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum cuidador registado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAtendimentos = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Radar de Atendimentos</h1>
        <button onClick={handleExportarAtendimentos} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 sm:py-2 rounded-xl text-sm font-bold transition-colors">
          Exportar Financeiro (Excel)
        </button>
      </div>
      <div className="bg-[#101C2C] border border-white/10 rounded-3xl overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-xs md:text-sm uppercase">
              <th className="p-4">Conexão</th>
              <th className="p-4">Faturamento Bruto</th>
              <th className="p-4 border-l border-white/5 text-red-300 bg-red-900/10">Lucro WD (30%)</th>
              <th className="p-4 border-l border-white/5 text-emerald-300 bg-emerald-900/10">Pagar Prof. (70%)</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm md:text-base">
            {agendamentos.map(a => {
              const valorNumerico = parseValor(a.valor);
              const wdLucro = valorNumerico * 0.30;
              const profRepasse = valorNumerico * 0.70;

              return (
                <tr key={a.id} className="hover:bg-white/5">
                  <td className="p-4">
                    <p className="text-white text-xs md:text-sm">F: {a.familia}</p>
                    <p className="text-cyan-400 text-xs md:text-sm mt-1">P: {a.profissionalNome}</p>
                  </td>
                  <td className="p-4 text-white font-bold">{formatarMoeda(valorNumerico)}</td>
                  
                  {/* Divisão Financeira Visual */}
                  <td className="p-4 border-l border-white/5 bg-red-900/5 text-red-400 font-bold">
                    {formatarMoeda(wdLucro)}
                  </td>
                  <td className="p-4 border-l border-white/5 bg-emerald-900/5 text-emerald-400 font-bold">
                    {formatarMoeda(profRepasse)}
                  </td>
                  
                  <td className="p-4 text-center text-xs">
                    <span className={`px-2 py-1 rounded-full ${a.status === 'Confirmado' || a.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => deletarAgendamento(a.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-lg transition-colors">
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
            {agendamentos.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum atendimento registado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loadingDados) return <div className="min-h-screen bg-[#07111F] flex items-center justify-center text-white">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-[#07111F] flex flex-col md:flex-row text-white font-sans relative">
      
      {/* ================= NAVEGAÇÃO MOBILE (TOP BAR) ================= */}
      <div className="md:hidden bg-[#0B1523] border-b border-white/10 p-4 sticky top-0 z-40 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="font-black text-xl tracking-tight text-white">WD <span className="text-red-500">Admin</span></h1>
          <button onClick={handleLogout} className="text-red-400 text-sm font-bold bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
            Sair
          </button>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1 snap-x no-scrollbar">
          <button onClick={() => setActiveTab("overview")} className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === "overview" ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:bg-white/5"}`}>Visão Geral</button>
          <button onClick={() => setActiveTab("cuidadores")} className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === "cuidadores" ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:bg-white/5"}`}>Cuidadores</button>
          <button onClick={() => setActiveTab("atendimentos")} className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === "atendimentos" ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:bg-white/5"}`}>Radar & Financeiro</button>
        </div>
      </div>

      {/* ================= SIDEBAR DESKTOP ================= */}
      <aside className="w-72 bg-[#0B1523] border-r border-white/10 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-7 border-b border-white/10">
          <h1 className="font-black text-2xl tracking-tight">WD <span className="text-red-500">Admin</span></h1>
        </div>
        <nav className="flex-1 p-5 space-y-2">
          <button onClick={() => setActiveTab("overview")} className={`w-full text-left px-5 py-4 rounded-2xl transition-colors ${activeTab === "overview" ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:bg-white/5"}`}>Visão Geral</button>
          <button onClick={() => setActiveTab("cuidadores")} className={`w-full text-left px-5 py-4 rounded-2xl transition-colors ${activeTab === "cuidadores" ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:bg-white/5"}`}>Cuidadores</button>
          <button onClick={() => setActiveTab("atendimentos")} className={`w-full text-left px-5 py-4 rounded-2xl transition-colors ${activeTab === "atendimentos" ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:bg-white/5"}`}>Radar & Financeiro</button>
        </nav>
        <div className="p-5">
          <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400 py-3 rounded-2xl font-bold">Sair do Painel</button>
        </div>
      </aside>

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto h-[calc(100vh-120px)] md:h-screen">
        <div className="max-w-6xl mx-auto">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "cuidadores" && renderCuidadores()}
          {activeTab === "atendimentos" && renderAtendimentos()}
        </div>
      </main>

      {/* ================= POPUP / MODAL DE PERFIL ================= */}
      {profissionalSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#101C2C] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setProfissionalSelecionado(null)} 
              className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>
            
            <h2 className="text-xl md:text-2xl font-black text-white mb-6 border-b border-white/10 pb-4">
              Perfil do Cuidador
            </h2>
            
            <div className="space-y-4 text-sm md:text-base mb-8">
              <div className="bg-[#0B1523] p-4 rounded-xl border border-white/5">
                <p><span className="text-slate-400 text-xs md:text-sm uppercase font-bold block mb-1">Nome</span> <span className="text-white font-medium">{profissionalSelecionado.nome}</span></p>
              </div>
              <div className="bg-[#0B1523] p-4 rounded-xl border border-white/5 overflow-hidden">
                <p><span className="text-slate-400 text-xs md:text-sm uppercase font-bold block mb-1">E-mail</span> <span className="text-white font-medium truncate block">{profissionalSelecionado.email}</span></p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0B1523] p-4 rounded-xl border border-white/5">
                  <p><span className="text-slate-400 text-xs md:text-sm uppercase font-bold block mb-1">Telefone</span> <span className="text-white font-medium">{profissionalSelecionado.telefone || "Não informado"}</span></p>
                </div>
                <div className="bg-[#0B1523] p-4 rounded-xl border border-white/5">
                  <p><span className="text-slate-400 text-xs md:text-sm uppercase font-bold block mb-1">Cidade</span> <span className="text-white font-medium">{profissionalSelecionado.cidade || "Não informada"}</span></p>
                </div>
              </div>
              <div className="bg-[#0B1523] p-4 rounded-xl border border-white/5">
                <p><span className="text-slate-400 text-xs md:text-sm uppercase font-bold block mb-1">Especialidade</span> <span className="text-cyan-400 font-medium">{profissionalSelecionado.especialidade || "Não informada"}</span></p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => verificarProfissional(profissionalSelecionado.id, !!profissionalSelecionado.verificado)}
                className={`flex-1 py-3 md:py-3.5 rounded-xl font-black transition-all ${
                  profissionalSelecionado.verificado 
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                }`}
              >
                {profissionalSelecionado.verificado ? "Remover Verificação" : "Aceitar e Verificar"}
              </button>
              <button 
                onClick={() => setProfissionalSelecionado(null)} 
                className="flex-1 py-3 md:py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

