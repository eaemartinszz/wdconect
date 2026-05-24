// src/pages/CriarConta.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

export default function CriarConta() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // ================= FORM =================
  const [formData, setFormData] = useState({
    accountType: "family",

    name: "",
    cpf: "",
    telefone: "",
    email: "",
    password: "",

    // PROFISSIONAL
    carterinha: "",
    especialidade: "",
    cidade: "",
  });

  // ================= HANDLE INPUT =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= CPF MASK =================
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setFormData({
      ...formData,
      cpf: value,
    });
  };

  // ================= PHONE MASK =================
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");

    setFormData({
      ...formData,
      telefone: value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErro("");

    if (formData.cpf.length < 14) {
      setErro("Digite um CPF válido.");
      return;
    }

    setLoading(true);

    try {
      // ================= AUTH =================
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

      const user = userCredential.user;

      // ================= FIRESTORE =================
      const userData: any = {
        nome: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        tipoConta: formData.accountType,
        dataCriacao: new Date().toISOString(),
        lgpdAceito: false,
      };

      // ================= DADOS PROFISSIONAL =================
      if (formData.accountType === "professional") {
        userData.carterinha = formData.carterinha;
        userData.especialidade = formData.especialidade;
        userData.cidade = formData.cidade;
      }

      await setDoc(
        doc(db, "usuarios", user.uid),
        userData
      );

      navigate("/configuracoes");

    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está em uso.");
      } else if (error.code === "auth/weak-password") {
        setErro("A senha precisa ter pelo menos 6 caracteres.");
      } else {
        setErro("Erro ao criar conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">

      {/* ================= LEFT SIDE ================= */}
      <div className="hidden lg:flex flex-col relative w-1/2 bg-gradient-to-br from-[#0c1929] via-[#112240] to-[#0a1628] overflow-hidden p-12 justify-between">

        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <a href="/" className="flex items-center gap-3 w-max">
            <img
              src="/logowd.png"
              alt="logo"
              className="w-10 h-10 object-contain"
            />

            <span className="text-2xl font-black text-white">
              <span className="text-blue-400">WD</span> Conecta
            </span>
          </a>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1">

          <img
            src="/mascotewd.png"
            alt="Mascote"
            className="w-[300px] object-contain mb-8"
          />

          <h2 className="text-4xl font-black text-white text-center leading-tight">
            Entre para a plataforma
            <br />
            WD Conecta
          </h2>

          <p className="text-slate-400 text-center mt-5 max-w-md">
            Crie sua conta gratuitamente e conecte-se com
            profissionais qualificados.
          </p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm">
          © 2026 WD Conecta
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">

        <div className="max-w-md w-full">

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src="/logowd.png"
              alt="logo"
              className="w-10 h-10"
            />

            <span className="text-2xl font-black text-slate-900">
              <span className="text-blue-600">WD</span> Conecta
            </span>
          </div>

          {/* TITLE */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900">
              Criar Conta
            </h1>

            <p className="text-slate-500 mt-2">
              Preencha os dados abaixo para continuar.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* ACCOUNT TYPE */}
            <div className="grid grid-cols-2 gap-4">

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    accountType: "family",
                  })
                }
                className={`p-4 rounded-2xl border-2 transition-all ${
                  formData.accountType === "family"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200"
                }`}
              >
                <div className="font-bold">
                  Sou Família
                </div>

                <div className="text-xs mt-1 opacity-70">
                  Quero contratar
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    accountType: "professional",
                  })
                }
                className={`p-4 rounded-2xl border-2 transition-all ${
                  formData.accountType === "professional"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200"
                }`}
              >
                <div className="font-bold">
                  Profissional
                </div>

                <div className="text-xs mt-1 opacity-70">
                  Quero trabalhar
                </div>
              </button>
            </div>

            {/* NOME */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nome Completo
              </label>

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* CPF + TELEFONE */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  CPF
                </label>

                <input
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Telefone
                </label>

                <input
                  type="text"
                  required
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* PROFISSIONAL */}
            {formData.accountType === "professional" && (
              <>

                {/* CARTERINHA */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Carteirinha Profissional
                  </label>

                  <input
                    type="text"
                    name="carterinha"
                    required
                    value={formData.carterinha}
                    onChange={handleChange}
                    placeholder="COREN, CRM, etc"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ESPECIALIDADE */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Especialidade
                  </label>

                  <input
                    type="text"
                    name="especialidade"
                    required
                    value={formData.especialidade}
                    onChange={handleChange}
                    placeholder="Ex: Técnico de Enfermagem"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* CIDADE */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Cidade
                  </label>

                  <input
                    type="text"
                    name="cidade"
                    required
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                E-mail
              </label>

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SENHA */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Senha
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500"
                >
                  {showPassword
                    ? "Ocultar"
                    : "Mostrar"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
                {erro}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-14 rounded-2xl text-white font-bold text-lg transition-all shadow-xl ${
                loading
                  ? "bg-blue-400"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.01] hover:shadow-blue-300"
              }`}
            >
              {loading
                ? "Criando conta..."
                : "Criar conta grátis"}
            </button>
          </form>

          {/* LOGIN */}
          <div className="text-center mt-6 text-sm text-slate-500">
            Já possui conta?{" "}
            <a
              href="/login"
              className="text-blue-600 font-bold"
            >
              Fazer login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}