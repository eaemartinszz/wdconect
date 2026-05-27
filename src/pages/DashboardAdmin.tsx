import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Firebase
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
  criadoEm?: any;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "cuidadores" | "atendimentos">("overview");
  const [loading, setLoading] = useState(true);

  // Estados de Dados
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdmin[]>([]);

  // KPIs Calculados
  const profissionais = usuarios.filter((u) => u.tipoConta === "professional");
  const familias = usuarios.filter((u) => u.tipoConta === "family");
  
  // Função auxiliar para converter "R$170" em número
  const parseValor = (valorStr: string) => {
    if (!valorStr) return 0;
    const num = valorStr.replace(/\D/g, "");
    return Number(num);
  };

  const faturamentoTotal = agendamentos
    .filter(a => a.status === "Concluído" || a.status === "Confirmado")
    .reduce((acc, a) => acc + parseValor(a.valor), 0);

  // ================= VERIFICAÇÃO E CARREGAMENTO =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Idealmente, você verificaria aqui se o user.uid é o SEU UID de desenvolvedor/admin
      if (user) {
        buscarDadosGerais();
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const buscarDadosGerais = async () => {
    setLoading(true);
    try {
      // 1. Buscar todos os utilizadores
      const usersSnap = await getDocs(collection(db, "usuarios"));
      const usersList: UsuarioAdmin[] = [];
      usersSnap.forEach((d) => usersList.push({ id: d.id, ...d.data() } as UsuarioAdmin));
      setUsuarios(usersList);

      // 2. Buscar todos os agendamentos
      const agendaSnap = await getDocs(collection(db, "agendamentos"));
      const agendaList: AgendamentoAdmin[] = [];
      agendaSnap.forEach((d) => agendaList.push({ id: d.id, ...d.data() } as AgendamentoAdmin));
      setAgendamentos(agendaList);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados do sistema.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ================= AÇÕES ADMINISTRATIVAS =================
  const verificarProfissional = async (id: string, estadoAtual: boolean) => {
    try {
      await updateDoc(doc(db, "usuarios", id), { verificado: !estadoAtual });
      toast.success(`Profissional ${!estadoAtual ? 'verificado' : 'desmarcado'} com sucesso!`);
      buscarDadosGerais(); // Atualiza a lista
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

    const separador = ";"; // Ponto e vírgula resolve problemas de colunas no Excel PT-BR
    const chaves = Object.keys(dados[0]);
    
    const cabecalho = chaves.join(separador);
    const linhas = dados.map(linha => {
      return chaves.map(chave => {
        let valor = linha[chave] || "";
        // Remove quebras de linha e envolve em aspas para não quebrar o CSV
        valor = String(valor).replace(/(\r\n|\n|\r)/gm, " ");
        return `"${valor}"`;
      }).join(separador);
    });

    const csvContent = [cabecalho, ...linhas].join("\n");
    // O prefixo \uFEFF força o Excel a reconhecer o UTF-8 (acentos funcionam perfeitamente)
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

  // Prepara dados formatados para o Excel
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
    const formatados = agendamentos.map(a => ({
      ID_Agendamento: a.id,
      Familia: a.familia,
      Cuidador: a.profissionalNome,
      Servico: a.servico,
      Data: a.data,
      Hora: a.hora,
      Status: a.status,
      Valor: a.valor
    }));
    exportarParaExcel(formatados, "WDConecta_Atendimentos");
  };

  // ================= TABS COMPONENTS =================

  const renderOverview = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Visão Geral</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Métricas em tempo real da plataforma WD Conecta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#101C2C] border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total de Usuários</p>
          <p className="text-4xl font-black text-white">{usuarios.length}</p>
        </div>
        
        <div className="bg-[#101C2C] border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Cuidadores Ativos</p>
          <p className="text-4xl font-black text-cyan-400">{profissionais.length}</p>
        </div>

        <div className="bg-[#101C2C] border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Atendimentos Gerados</p>
          <p className="text-4xl font-black text-white">{agendamentos.length}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 border border-emerald-500/50 p-6 rounded-3xl shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-2">Volume Financeiro (R$)</p>
          <p className="text-4xl font-black text-white">
            {faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
    </div>
  );

  const renderCuidadores = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Controle de Cuidadores</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Gira, audite e aprove perfis na plataforma.</p>
        </div>
        <button onClick={handleExportarCuidadores} className="bg-emerald-500 hover:bg-emerald-400 text-[#07111F] px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar para Excel
        </button>
      </div>

      <div className="bg-[#101C2C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold">Nome</th>
              <th className="p-4 font-bold">Contato</th>
              <th className="p-4 font-bold">Especialidade / Cidade</th>
              <th className="p-4 font-bold text-center">Status Confiança</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {profissionais.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-white">{p.nome}</p>
                  <p className="text-xs text-slate-500">{p.id}</p>
                </td>
                <td className="p-4 text-slate-300 text-sm">{p.telefone || "Não informado"}</td>
                <td className="p-4 text-sm">
                  <p className="text-cyan-400 font-semibold">{p.especialidade || "Geral"}</p>
                  <p className="text-slate-400 text-xs">{p.cidade || "Local não def."}</p>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => verificarProfissional(p.id, !!p.verificado)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      p.verificado 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30" 
                      : "bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30"
                    }`}
                  >
                    {p.verificado ? "✓ Verificado (Remover)" : "⚠ Pendente (Aprovar)"}
                  </button>
                </td>
              </tr>
            ))}
            {profissionais.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum profissional cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAtendimentos = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Radar de Atendimentos</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Todos os serviços negociados na plataforma.</p>
        </div>
        <button onClick={handleExportarAtendimentos} className="bg-emerald-500 hover:bg-emerald-400 text-[#07111F] px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar para Excel
        </button>
      </div>

      <div className="bg-[#101C2C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold">Conexão (Família ↔ Profissional)</th>
              <th className="p-4 font-bold">Serviço & Data</th>
              <th className="p-4 font-bold">Valor</th>
              <th className="p-4 font-bold text-center">Status</th>
              <th className="p-4 font-bold text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {agendamentos.map(a => (
              <tr key={a.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-white text-sm">F: {a.familia}</p>
                  <p className="text-cyan-400 font-semibold text-sm mt-1">P: {a.profissionalNome}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-white text-sm">{a.servico}</p>
                  <p className="text-slate-400 text-xs mt-1">{a.data} às {a.hora}</p>
                </td>
                <td className="p-4 text-emerald-400 font-bold text-sm">{a.valor}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    a.status === 'Confirmado' ? 'bg-emerald-500/20 text-emerald-400' :
                    a.status === 'Reagendado' ? 'bg-orange-500/20 text-orange-400' :
                    a.status === 'Cancelado' ? 'bg-red-500/20 text-red-400' :
                    a.status === 'Concluído' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => deletarAgendamento(a.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-lg transition-colors" title="Excluir do Banco">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </td>
              </tr>
            ))}
            {agendamentos.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum atendimento registado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-[#07111F] flex items-center justify-center text-white">Carregando painel de desenvolvedor...</div>;

  return (
    <div className="min-h-screen bg-[#07111F] flex flex-col md:flex-row text-white font-sans relative overflow-x-hidden">
      
      {/* BG EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between bg-[#0B1523] p-4 border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <h1 className="font-black text-lg text-white">WD <span className="text-red-500">Admin</span></h1>
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
          <h1 className="font-black text-2xl text-white tracking-tight">WD <span className="text-red-500">Admin</span></h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Developer View</p>
        </div>

        <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
          <button onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }} className={`w-full text-left px-5 py-4 rounded-2xl transition flex items-center gap-3 text-sm ${activeTab === "overview" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
             Visão Geral
          </button>
          <button onClick={() => { setActiveTab("cuidadores"); setIsMobileMenuOpen(false); }} className={`w-full text-left px-5 py-4 rounded-2xl transition flex items-center gap-3 text-sm ${activeTab === "cuidadores" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
             Cuidadores
          </button>
          <button onClick={() => { setActiveTab("atendimentos"); setIsMobileMenuOpen(false); }} className={`w-full text-left px-5 py-4 rounded-2xl transition flex items-center gap-3 text-sm ${activeTab === "atendimentos" ? "bg-white/10 border border-white/10 font-bold text-white" : "hover:bg-white/5 text-slate-300"}`}>
             Atendimentos Gerados
          </button>
        </nav>

        <div className="p-5 border-t border-white/10">
          <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-3 rounded-2xl font-semibold transition-colors text-sm">
            Sair do Painel Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto z-10 w-full h-[calc(100vh-73px)] md:h-screen">
        <div className="max-w-6xl mx-auto w-full">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "cuidadores" && renderCuidadores()}
          {activeTab === "atendimentos" && renderAtendimentos()}
        </div>
      </main>

    </div>
  );
}