import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
// Importações do Firebase - Adicionamos o sendPasswordResetEmail
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginPage() {
  const navigate = useNavigate(); 
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Novo estado de mensagem (substituindo o antigo 'erro' para suportar mensagens de sucesso)
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [loading, setLoading] = useState(false);

  // ================= FUNÇÃO DE LOGIN =================
  const handleSubmit = async (e: React.FormEvent) => {          
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" }); // Limpa mensagens anteriores
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Login realizado com sucesso:", user.email);
      navigate("/configuracoes");

    } catch (error: any) {
      console.error("Erro no login:", error.code);
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setMensagem({ tipo: "erro", texto: "E-mail ou senha incorretos." });
      } else if (error.code === 'auth/invalid-email') {
        setMensagem({ tipo: "erro", texto: "Formato de e-mail inválido." });
      } else {
        setMensagem({ tipo: "erro", texto: "Ocorreu um erro ao fazer login. Tente novamente." });
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= FUNÇÃO DE RECUPERAR SENHA =================
  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    // Verifica se o usuário digitou o e-mail antes de clicar em recuperar
    if (!email) {
      setMensagem({ tipo: "erro", texto: "Por favor, digite seu e-mail no campo acima para redefinir a senha." });
      return;
    }

    try {
      // Envia o e-mail de redefinição pelo Firebase
      await sendPasswordResetEmail(auth, email);
      setMensagem({ tipo: "sucesso", texto: "E-mail de redefinição enviado! Verifique sua caixa de entrada e a pasta de spam." });
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error.code);
      if (error.code === 'auth/invalid-email') {
        setMensagem({ tipo: "erro", texto: "Formato de e-mail inválido." });
      } else {
        setMensagem({ tipo: "erro", texto: "Erro ao enviar e-mail de redefinição. Tente novamente." });
      }
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
            className="w-[300px] object-contain drop-shadow-2xl mb-8 animate-pulse"
          />
          <h2 className="text-3xl font-bold text-white text-center mb-4 leading-tight">
            Liberdade para trabalhar. <br />
            Segurança para contratar.
          </h2>
          <p className="text-slate-400 text-center max-w-md">
            Acesse sua conta para continuar conectando cuidado e confiança de forma simples e humana.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-sm">© 2026 WD Conecta. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* ============ LADO DIREITO (FORMULÁRIO) ============ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        
        <a 
          href="/" 
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Voltar
        </a>

        <div className="max-w-md w-full space-y-8 mt-10 lg:mt-0">
          
          <div className="text-center sm:text-left">
            <div className="lg:hidden flex items-center justify-center sm:justify-start gap-2 mb-8">
               <img src="/logowd.png" alt="Logo" className="w-10 h-10 object-contain" />
               <span className="font-montserrat font-bold text-2xl tracking-tight text-slate-900">
                 <span className="text-blue-600">WD</span> Conecta
               </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-2 font-montserrat">
              Bem-vindo de volta
            </h1>
            <p className="text-slate-500 text-base">
              Insira seus dados para acessar a plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                  placeholder="Seu e-mail cadastrado..."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Senha
                </label>
                {/* Alterado de <a href...> para um <button> que chama a nossa função nova */}
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Esqueci a senha
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Renderização do Alerta (Sucesso ou Erro) */}
            {mensagem.texto && (
              <div className={`p-3 rounded-xl text-sm text-center font-medium border ${mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-500 border-red-100'}`}>
                {mensagem.texto}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-base font-semibold text-white transition-all duration-300 
                ${loading 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}`}
            >
              {loading ? "Entrando..." : "Entrar na conta"}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 font-medium">Novo na WD Conecta?</span>
            </div>
          </div>

          {/* Criar Conta Button */}
          <a
            href="/criar-conta"
            className="w-full flex items-center justify-center py-3.5 px-4 border-2 border-slate-200 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300"
          >
            Criar Conta
          </a>
          
        </div>
      </div>
    </div>
  );
}