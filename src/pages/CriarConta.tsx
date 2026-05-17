// src/pages/CriarConta.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Importações do Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function CriarConta() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    accountType: "family", // 'family' ou 'professional'
    name: "",
    email: "",
    password: "",
    carterinha: "", // Novo campo para o registro profissional
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try { 
      // 1. Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // 2. Prepara os dados que vão para o Banco de Dados (Firestore)
    const userData: { nome: string; email: string; tipoConta: string; dataCriacao: Date; carterinha?: string } = {
  nome: formData.name,
  email: formData.email,
  tipoConta: formData.accountType,
  dataCriacao: new Date(),
};

      // Se for profissional, adiciona a carteirinha no objeto
      if (formData.accountType === "professional") {
        userData.carterinha = formData.carterinha;
      }

      // 3. Salva os dados extras no Firestore na coleção "usuarios"
      // Usamos o user.uid como ID do documento para vincular a conta de auth com os dados
      await setDoc(doc(db, "usuarios", user.uid), userData);

      console.log("Conta criada com sucesso:", user.uid);
      
      // 4. Redireciona o usuário (ajuste a rota conforme necessário)
      navigate("/configuracoes");

    }  catch (error: any) {
      console.error("Erro ao criar conta:", error.code);
      if (error.code === 'auth/email-already-in-use') {
        setErro("Este e-mail já está cadastrado.");
      } else if (error.code === 'auth/weak-password') {
        setErro("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setErro("Ocorreu um erro ao criar a conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      
      {/* ============ LADO ESQUERDO (BRANDING) ============ */}
      <div className="hidden lg:flex flex-col relative w-1/2 bg-gradient-to-br from-[#0c1929] via-[#112240] to-[#0a1628] overflow-hidden p-12 justify-between">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <a href="/" className="flex items-center gap-3 group w-max">
            <img src="/logowd.png" alt="Logo" className="w-6 h-6 object-contain group-hover:animate-pulse" />            
            <span className="font-montserrat font-bold text-2xl tracking-tight text-white">
              <span className="text-blue-400">WD</span> Conecta
            </span>
          </a>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
          <img
            src="/mascotewd.png"
            alt="Mascote WD"
            className="w-[280px] object-contain drop-shadow-2xl mb-8 animate-pulse"
          />
          <h2 className="text-3xl font-bold text-white text-center mb-4 leading-tight">
            Junte-se à revolução <br /> do cuidado domiciliar.
          </h2>
          <p className="text-slate-400 text-center max-w-md">
            Crie sua conta em menos de 2 minutos e comece a se conectar com segurança e transparência.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-sm">© 2026 WD Conecta. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* ============ LADO DIREITO (FORMULÁRIO) ============ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        
        <a 
          href="/login" 
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Voltar
        </a>

        <div className="max-w-md w-full space-y-6 mt-12 lg:mt-0 py-8">
          
          <div className="text-center sm:text-left">
            <div className="lg:hidden flex items-center justify-center sm:justify-start gap-2 mb-8">
               <img src="/logowd.png" alt="Logo" className="w-10 h-10 object-contain" />
               <span className="font-montserrat font-bold text-2xl tracking-tight text-slate-900">
                 <span className="text-blue-600">WD</span> Conecta
               </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-2 font-montserrat">
              Criar uma conta
            </h1>
            <p className="text-slate-500 text-base">
              Como você deseja usar a plataforma?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Seletor de Tipo de Conta */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: "family" })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.accountType === "family"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"
                }`}
              >
                <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="font-semibold text-sm">Sou Família</span>
                <span className="text-xs opacity-75">Quero contratar</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: "professional" })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.accountType === "professional"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"
                }`}
              >
                <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="font-semibold text-sm">Profissional</span>
                <span className="text-xs opacity-75">Quero trabalhar</span>
              </button>
            </div>

            {/* Inputs Base */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            {/* Renderização Condicional: Campo de Carteirinha para Profissionais */}
            {formData.accountType === "professional" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label htmlFor="carterinha" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nº da Carteirinha (COREN, CRM, etc)
                </label>
                <div className="relative">
                  <input
                    id="carterinha"
                    name="carterinha"
                    type="text"
                    required={formData.accountType === "professional"}
                    value={formData.carterinha}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                    placeholder="Ex: COREN-SP 123456"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-base font-semibold text-white transition-all duration-300 mt-4 
                ${loading 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}`}
            >
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 text-sm text-slate-500">
            Já tem uma conta?{" "}
            <a href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Fazer login
            </a>
          </div>
          
        </div>
      </div>
    </div>
  );
}