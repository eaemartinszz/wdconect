// src/pages/CriarConta.jsx
import { useState } from "react";

export default function CriarConta() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    accountType: "family", // 'family' ou 'professional'
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Criando conta com:", formData);
    // Lógica de cadastro aqui
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      
      {/* ============ LADO ESQUERDO (BRANDING) ============ */}
      <div className="hidden lg:flex flex-col relative w-1/2 bg-gradient-to-br from-[#0c1929] via-[#112240] to-[#0a1628] overflow-hidden p-12 justify-between">
        {/* Efeitos de Fundo */}
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
        
        {/* Botão Voltar (Mobile & Desktop) */}
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
          
          {/* Cabeçalho do Form */}
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

            {/* Inputs */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

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
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-slate-900 transition-all sm:text-sm"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:-translate-y-0.5 mt-4"
            >
              Criar conta grátis
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