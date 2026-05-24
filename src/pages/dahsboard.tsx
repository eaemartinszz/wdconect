import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Firebase
import { auth, db, storage } from "../firebaseConfig";
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
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function DashboardSettings() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [deletandoConta, setDeletandoConta] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [mensagem, setMensagem] = useState({
    tipo: "",
    texto: "",
  });

  const [userUid, setUserUid] = useState<string | null>(null);

  // ================= LGPD =================
  const [showLgpdPopup, setShowLgpdPopup] = useState(false);
  const [lgpdChecked, setLgpdChecked] = useState(false);
  const [salvandoLgpd, setSalvandoLgpd] = useState(false);

  // ================= PERFIL =================
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    bio: "",
    photoURL: "",
    coverURL: "",
  });

  // ================= SENHA =================
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ================= NOTIFICAÇÕES =================
  const [notificacoes, setNotificacoes] = useState({
    app: true,
    email: true,
    whatsapp: false,
    frequencia: "evento",
  });

  // ================= BUSCAR DADOS =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);

        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            setProfileData({
              name: data.nome || "",
              email: user.email || "",
              cpf: data.cpf || "",
              phone: data.telefone || "",
              bio: data.bio || "",
              photoURL: data.photoURL || "",
              coverURL: data.coverURL || "",
            });

            if (!data.lgpdAceito) {
              setShowLgpdPopup(true);
            }
          } else {
            setShowLgpdPopup(true);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ================= UPLOAD FOTO =================
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !userUid) return;

    setUploadingImage(true);

    try {
      const storageRef = ref(storage, `profile_pictures/${userUid}`);

      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      setProfileData((prev) => ({
        ...prev,
        photoURL: downloadURL,
      }));

      await setDoc(
        doc(db, "usuarios", userUid),
        {
          photoURL: downloadURL,
        },
        { merge: true }
      );

      setMensagem({
        tipo: "sucesso",
        texto: "Foto atualizada com sucesso!",
      });
    } catch (error) {
      console.error(error);

      setMensagem({
        tipo: "erro",
        texto: "Erro ao enviar imagem.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // ================= UPLOAD CAPA =================
  const handleCoverUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !userUid) return;

    setUploadingCover(true);

    try {
      const storageRef = ref(storage, `cover_pictures/${userUid}`);

      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      setProfileData((prev) => ({
        ...prev,
        coverURL: downloadURL,
      }));

      await setDoc(
        doc(db, "usuarios", userUid),
        {
          coverURL: downloadURL,
        },
        { merge: true }
      );

      setMensagem({
        tipo: "sucesso",
        texto: "Capa atualizada com sucesso!",
      });
    } catch (error) {
      console.error(error);

      setMensagem({
        tipo: "erro",
        texto: "Erro ao enviar capa.",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  // ================= LGPD =================
  const handleAcceptLGPD = async () => {
    if (!userUid || !lgpdChecked) return;

    setSalvandoLgpd(true);

    try {
      await setDoc(
        doc(db, "usuarios", userUid),
        {
          lgpdAceito: true,
          lgpdDataAceite: new Date().toISOString(),
        },
        { merge: true }
      );

      setShowLgpdPopup(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSalvandoLgpd(false);
    }
  };

  // ================= SALVAR PERFIL =================
  const handleSaveProfile = async () => {
    if (!userUid) return;

    setSalvando(true);

    try {
      await setDoc(
        doc(db, "usuarios", userUid),
        {
          nome: profileData.name,
          telefone: profileData.phone,
          bio: profileData.bio,
        },
        { merge: true }
      );

      setMensagem({
        tipo: "sucesso",
        texto: "Perfil atualizado!",
      });
    } catch (error) {
      console.error(error);

      setMensagem({
        tipo: "erro",
        texto: "Erro ao salvar perfil.",
      });
    } finally {
      setSalvando(false);
    }
  };

  // ================= SENHA =================
  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMensagem({
        tipo: "erro",
        texto: "As senhas não coincidem.",
      });

      return;
    }

    if (auth.currentUser) {
      try {
        await updatePassword(
          auth.currentUser,
          passwords.newPassword
        );

        setMensagem({
          tipo: "sucesso",
          texto: "Senha atualizada!",
        });

        setPasswords({
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error(error);

        setMensagem({
          tipo: "erro",
          texto: "Faça login novamente.",
        });
      }
    }
  };

  // ================= DELETAR CONTA =================
  const handleDeleteAccount = async () => {
    const confirmar = window.confirm(
      "Deseja realmente excluir sua conta?"
    );

    if (!confirmar || !auth.currentUser || !userUid) return;

    setDeletandoConta(true);

    try {
      await deleteDoc(doc(db, "usuarios", userUid));

      await deleteUser(auth.currentUser);

      navigate("/login");
    } catch (error: any) {
      console.error(error);

      setMensagem({
        tipo: "erro",
        texto: "Faça login novamente antes de excluir.",
      });
    } finally {
      setDeletandoConta(false);
    }
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await signOut(auth);

    navigate("/login");
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111F] flex items-center justify-center text-white">
        Carregando painel...
      </div>
    );
  }

  // ================= PROFILE TAB =================
  const renderProfileTab = () => (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Minha Conta
        </h1>

        <p className="text-slate-400 mt-1">
          Gerencie suas informações pessoais.
        </p>
      </div>

      {mensagem.texto && (
        <div
          className={`rounded-2xl p-4 border ${
            mensagem.tipo === "sucesso"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {/* CARD */}
      <div className="bg-[#101C2C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

        {/* CAPA */}
        <label
          htmlFor="upload-cover"
          className="h-52 block relative cursor-pointer group"
        >
          {profileData.coverURL ? (
            <img
              src={profileData.coverURL}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0EA5E9] via-[#2563EB] to-[#7C3AED]" />
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full text-white text-sm font-semibold">
              Alterar capa
            </div>

          </div>
        </label>

        <input
          type="file"
          id="upload-cover"
          className="hidden"
          accept="image/*"
          onChange={handleCoverUpload}
        />

        {/* CONTEÚDO */}
        <div className="p-8 relative">

          {/* FOTO */}
          <div className="-mt-24 mb-6">

            <label
              htmlFor="upload-photo"
              className="relative group cursor-pointer w-32 h-32 rounded-full border-[5px] border-[#101C2C] overflow-hidden block shadow-2xl"
            >
              <img
                src={
                  profileData.photoURL ||
                  `https://ui-avatars.com/api/?name=${profileData.name}`
                }
                alt=""
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm font-semibold">
                Editar
              </div>
            </label>

            <input
              type="file"
              id="upload-photo"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* FORM */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Nome Completo
              </label>

              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    name: e.target.value,
                  })
                }
                className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Telefone
              </label>

              <input
                type="text"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    phone: e.target.value,
                  })
                }
                className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-500 mb-2 block">
                E-mail
              </label>

              <input
                disabled
                type="email"
                value={profileData.email}
                className="w-full bg-[#0B1523] border border-white/5 rounded-2xl px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-500 mb-2 block">
                CPF
              </label>

              <input
                disabled
                type="text"
                value={profileData.cpf}
                className="w-full bg-[#0B1523] border border-white/5 rounded-2xl px-4 py-3 text-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-slate-300 mb-2 block">
                Biografia
              </label>

              <textarea
                rows={4}
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    bio: e.target.value,
                  })
                }
                className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none resize-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={salvando}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-semibold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  // ================= SECURITY TAB =================
  const renderSecurityTab = () => (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Segurança
        </h1>

        <p className="text-slate-400 mt-1">
          Atualize sua senha e gerencie sua conta.
        </p>
      </div>

      <div className="bg-[#101C2C] border border-white/10 rounded-3xl p-8">

        <div className="grid gap-5">

          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Nova Senha
            </label>

            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  newPassword: e.target.value,
                })
              }
              className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Confirmar Senha
            </label>

            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full bg-[#0B1523] border border-white/10 rounded-2xl px-4 py-3 text-white"
            />
          </div>

          <button
            onClick={handleUpdatePassword}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-2xl mt-2"
          >
            Atualizar Senha
          </button>

        </div>
      </div>

      {/* ZONA DE PERIGO */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8">

        <h2 className="text-xl font-bold text-red-400 mb-3">
          Zona de Perigo
        </h2>

        <p className="text-red-200/80 text-sm mb-5">
          Excluir sua conta removerá permanentemente todos os seus dados.
        </p>

        <button
          onClick={handleDeleteAccount}
          disabled={deletandoConta}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold"
        >
          {deletandoConta
            ? "Excluindo..."
            : "Excluir Conta"}
        </button>
      </div>
    </div>
  );

  // ================= COMPLIANCE =================
  const renderComplianceTab = () => (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Privacidade e LGPD
        </h1>

        <p className="text-slate-400 mt-1">
          Informações relacionadas à privacidade.
        </p>
      </div>

      <div className="bg-[#101C2C] border border-white/10 rounded-3xl p-8">
        <p className="text-slate-300 leading-relaxed">
          Seus dados são protegidos conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07111F] flex text-white">

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0B1523] border-r border-white/10 hidden md:flex flex-col">

        {/* LOGO */}
        <div className="p-7 border-b border-white/10">
          <div className="flex items-center gap-3">

            <img
              src="/logowd.png"
              alt=""
              className="w-10 h-10"
            />

            <div>
              <h1 className="font-bold text-xl">
                WD Conecta
              </h1>

              <p className="text-xs text-slate-400">
                Dashboard Premium
              </p>
            </div>

          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 p-5 space-y-2">

          <button
            onClick={() => navigate("/conectar")}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/20"
          >
            Conexões e Chat
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-5 py-4 rounded-2xl transition ${
              activeTab === "profile"
                ? "bg-white/10 border border-white/10"
                : "hover:bg-white/5"
            }`}
          >
            Minha Conta
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-5 py-4 rounded-2xl transition ${
              activeTab === "security"
                ? "bg-white/10 border border-white/10"
                : "hover:bg-white/5"
            }`}
          >
            Segurança
          </button>

          <button
            onClick={() => setActiveTab("compliance")}
            className={`w-full text-left px-5 py-4 rounded-2xl transition ${
              activeTab === "compliance"
                ? "bg-white/10 border border-white/10"
                : "hover:bg-white/5"
            }`}
          >
            LGPD
          </button>

        </div>

        {/* LOGOUT */}
        <div className="p-5 border-t border-white/10">

          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 py-3 rounded-2xl font-semibold"
          >
            Sair da Conta
          </button>

        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">

        <div className="max-w-5xl mx-auto">

          {activeTab === "profile" && renderProfileTab()}

          {activeTab === "security" && renderSecurityTab()}

          {activeTab === "compliance" && renderComplianceTab()}

        </div>

      </main>

      {/* MODAL LGPD */}
      {showLgpdPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-5">

          <div className="bg-[#101C2C] border border-white/10 rounded-3xl max-w-xl w-full p-8">

            <h2 className="text-3xl font-bold mb-4">
              Termos e Privacidade
            </h2>

            <p className="text-slate-300 leading-relaxed mb-6">
              Para continuar utilizando a plataforma,
              você precisa aceitar os termos de uso e
              política de privacidade da plataforma.
            </p>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">

              <input
                type="checkbox"
                checked={lgpdChecked}
                onChange={(e) =>
                  setLgpdChecked(e.target.checked)
                }
                className="mt-1"
              />

              <span className="text-slate-300 text-sm">
                Li e concordo com os termos e política de privacidade.
              </span>

            </label>

            <div className="flex gap-4">

              <button
                onClick={handleAcceptLGPD}
                disabled={!lgpdChecked || salvandoLgpd}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-2xl font-semibold"
              >
                {salvandoLgpd
                  ? "Salvando..."
                  : "Aceitar e Continuar"}
              </button>

              <button
                onClick={handleLogout}
                className="px-6 bg-white/5 border border-white/10 rounded-2xl"
              >
                Sair
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}