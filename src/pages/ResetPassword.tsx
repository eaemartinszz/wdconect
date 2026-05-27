//*
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebaseConfig";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Captura os parâmetros que o Firebase injeta na URL automaticamente
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Valida se o link do e-mail ainda é seguro e válido assim que a página abre
  useEffect(() => {
    if (!oobCode) {
      toast.error("Código de redefinição inválido ou ausente.");
      setVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setIsValidCode(true);
        setVerifying(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Este link expirou ou já foi utilizado.");
        setVerifying(false);
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(false);
    setLoading(true);

    try {
      // Executa a troca de senha definitiva no Firebase
      await confirmPasswordReset(auth, oobCode!, newPassword);
      toast.success("Senha alterada com sucesso! Redirecionando...");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao salvar nova senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c1929] text-white">
        <p className="text-lg font-medium animate-pulse">Verificando segurança do link...</p>
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c1929] p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Link Inválido ou Expirado</h1>
        <p className="text-slate-400 max-w-sm mb-6">Por favor, volte à tela de login e solicite uma nova redefinição de senha.</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          Voltar para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans text-slate-900 p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-[#0f172a] mb-2 font-montserrat">
            Criar nova senha
          </h1>
          <p className="text-slate-500 text-base">
            Insira sua nova senha de acesso abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nova Senha</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              placeholder="No mínimo 6 caracteres..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirme a Nova Senha</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              placeholder="Digite a senha novamente..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl text-base font-semibold text-white transition-all duration-300 
              ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-500/20"}`}
          >
            {loading ? "Salvando..." : "Atualizar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}