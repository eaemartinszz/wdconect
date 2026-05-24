// ============================
// CONECTAR PAGE COMPLETA
// ============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// FIREBASE
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

interface Usuario {
  id: string;
  nome: string;
  tipoConta: string;
  telefone?: string;
  photoURL?: string;
  bio?: string;
  especialidade?: string;
  cidade?: string;
}

interface Plano {
  id: number;
  nome: string;
  valor: string;
  descricao: string;
  horario: string;
  tipo: "diurno" | "noturno" | "integral";
  destaque?: boolean;
}

export default function ConectarPage() {
  const navigate = useNavigate();

  const [profissionais, setProfissionais] = useState<Usuario[]>([]);
  const [loadingProfissionais, setLoadingProfissionais] =
    useState(true);

  const [planoSelecionado, setPlanoSelecionado] =
    useState<Plano | null>(null);

  const [profissionalSelecionado, setProfissionalSelecionado] =
    useState<Usuario | null>(null);

  const [diaSelecionado, setDiaSelecionado] =
    useState<string>("");

  const [diasOcupados, setDiasOcupados] = useState<string[]>(
    []
  );

  const [pagamentoLiberado, setPagamentoLiberado] =
    useState(false);

  // ================= PLANOS =================
  const planos: Plano[] = [
    {
      id: 1,
      nome: "8H DIURNO",
      valor: "R$170",
      descricao:
        "Plantão de 8 horas no período diurno.",
      horario: "07:00 às 15:00",
      tipo: "diurno",
    },
    {
      id: 2,
      nome: "8H NOTURNO",
      valor: "R$200",
      descricao:
        "Plantão de 8 horas no período noturno.",
      horario: "19:00 às 03:00",
      tipo: "noturno",
    },
    {
      id: 3,
      nome: "12H NOTURNO",
      valor: "R$230",
      descricao:
        "Plantão premium de 12 horas noturno.",
      horario: "19:00 às 07:00",
      tipo: "noturno",
      destaque: true,
    },
    {
      id: 4,
      nome: "12H DIURNO",
      valor: "R$215",
      descricao:
        "Plantão completo de 12 horas diurno.",
      horario: "07:00 às 19:00",
      tipo: "diurno",
    },
    {
      id: 5,
      nome: "INTEGRAL",
      valor: "R$400",
      descricao:
        "Acesso integral com cobertura total.",
      horario: "24 horas disponíveis",
      tipo: "integral",
    },
  ];

  // ================= AUTH =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          buscarProfissionais();
        } else {
          navigate("/login");
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // ================= BUSCAR PROFISSIONAIS =================
  const buscarProfissionais = async () => {
    try {
      const q = query(
        collection(db, "usuarios"),
        where("tipoConta", "==", "professional")
      );

      const querySnapshot = await getDocs(q);

      const lista: Usuario[] = [];

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          ...doc.data(),
        } as Usuario);
      });

      setProfissionais(lista);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProfissionais(false);
    }
  };

  // ================= GERAR DIAS =================
  const gerarDias = () => {
    const dias = [];

    for (let i = 0; i < 15; i++) {
      const data = new Date();

      data.setDate(data.getDate() + i);

      dias.push(
        data.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
        })
      );
    }

    return dias;
  };

  // ================= BUSCAR DIAS OCUPADOS =================
  useEffect(() => {
    const buscarDias = async () => {
      if (!profissionalSelecionado) return;

      const q = query(
        collection(db, "agendamentos"),
        where(
          "profissionalId",
          "==",
          profissionalSelecionado.id
        )
      );

      const querySnapshot = await getDocs(q);

      const ocupados: string[] = [];

      querySnapshot.forEach((doc) => {
        ocupados.push(doc.data().dia);
      });

      setDiasOcupados(ocupados);
    };

    buscarDias();
  }, [profissionalSelecionado]);

  // ================= PAGAMENTO =================
  const handlePagamento = async () => {
    if (
      !planoSelecionado ||
      !profissionalSelecionado ||
      !diaSelecionado
    ) {
      alert("Selecione todas as opções.");
      return;
    }

    try {
      await addDoc(collection(db, "agendamentos"), {
        profissionalId: profissionalSelecionado.id,
        profissionalNome: profissionalSelecionado.nome,
        usuarioId: auth.currentUser?.uid,
        plano: planoSelecionado.nome,
        valor: planoSelecionado.valor,
        horarioPlano: planoSelecionado.horario,
        dia: diaSelecionado,
        status: "confirmado",
        createdAt: serverTimestamp(),
      });

      setPagamentoLiberado(true);

      alert("Pagamento aprovado!");
    } catch (error) {
      console.error(error);

      alert("Erro ao finalizar agendamento.");
    }
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-white overflow-hidden">

      {/* BG */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-2xl bg-[#07111F]/80">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate("/configuracoes")}
              className="h-11 px-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold"
            >
              ← Dashboard
            </button>

            <div>
              <h1 className="text-2xl font-black">
                WD{" "}
                <span className="text-cyan-400">
                  Conecta
                </span>
              </h1>

              <p className="text-sm text-slate-400">
                Plataforma Premium
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-sm font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistema online
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-10">

        <div className="max-w-4xl">

          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
            ✨ Atendimento profissional premium
          </div>

          <h2 className="text-5xl md:text-7xl font-black leading-[1.05]">
            Escolha seu
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              plano ideal
            </span>
          </h2>

          <p className="text-slate-400 text-lg mt-8 leading-relaxed max-w-2xl">
            Selecione um plano, escolha um profissional
            e reserve um dia disponível em tempo real.
          </p>
        </div>
      </section>

      {/* PLANOS */}
      <section className="max-w-7xl mx-auto px-6 pb-20">

        <h3 className="text-3xl font-black mb-8">
          Escolha seu plano
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-7">

          {planos.map((plano) => {
            const ativo =
              planoSelecionado?.id === plano.id;

            return (
              <div
                key={plano.id}
                onClick={() => {
                  setPlanoSelecionado(plano);

                  setProfissionalSelecionado(null);

                  setDiaSelecionado("");

                  setPagamentoLiberado(false);
                }}
                className={`relative overflow-hidden rounded-[32px] border cursor-pointer transition-all duration-500 p-8 ${
                  ativo
                    ? "border-cyan-400 bg-gradient-to-b from-cyan-500 to-blue-700 scale-[1.03]"
                    : "border-white/10 bg-white/5 hover:border-cyan-400/30"
                }`}
              >

                {plano.destaque && (
                  <div className="absolute top-5 right-5 bg-cyan-400 text-black text-xs font-black px-3 py-1 rounded-full">
                    MAIS ESCOLHIDO
                  </div>
                )}

                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl mb-8">
                  ⚡
                </div>

                <h3 className="text-2xl font-black mb-3">
                  {plano.nome}
                </h3>

                <p className="text-slate-200 text-sm leading-relaxed mb-5">
                  {plano.descricao}
                </p>

                <div className="bg-black/20 border border-white/10 rounded-2xl p-4 mb-7">

                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">
                    Horário do plantão
                  </p>

                  <p className="text-cyan-300 font-bold text-lg">
                    {plano.horario}
                  </p>
                </div>

                <div className="text-5xl font-black">
                  {plano.valor}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PROFISSIONAIS */}
      {planoSelecionado && (
        <section className="max-w-7xl mx-auto px-6 pb-20">

          <div className="mb-10">

            <h3 className="text-3xl font-black">
              Escolha um profissional
            </h3>

            <p className="text-slate-400 mt-2">
              Profissionais disponíveis para o plano selecionado.
            </p>
          </div>

          {loadingProfissionais ? (
            <div className="py-20 text-center">
              Carregando profissionais...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

              {profissionais.map((prof) => {
                const ativo =
                  profissionalSelecionado?.id ===
                  prof.id;

                return (
                  <div
                    key={prof.id}
                    onClick={() => {
                      setProfissionalSelecionado(
                        prof
                      );

                      setDiaSelecionado("");

                      setPagamentoLiberado(false);
                    }}
                    className={`group overflow-hidden rounded-[32px] border cursor-pointer transition-all duration-300 ${
                      ativo
                        ? "border-cyan-400 bg-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-cyan-400/30"
                    }`}
                  >

                    <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

                    <div className="px-7 relative">

                      <img
                        src={
                          prof.photoURL ||
                          `https://ui-avatars.com/api/?name=${prof.nome}&background=0D8ABC&color=fff`
                        }
                        className="w-24 h-24 rounded-3xl object-cover border-4 border-[#07111F] -mt-12"
                      />
                    </div>

                    <div className="p-7 pt-4">

                      <h3 className="text-2xl font-black">
                        {prof.nome}
                      </h3>

                      <p className="text-cyan-400 font-semibold mt-1">
                        {prof.especialidade ||
                          "Profissional WD"}
                      </p>

                      <p className="text-slate-300 text-sm mt-5 leading-relaxed min-h-[70px]">
                        {prof.bio ||
                          "Profissional disponível para atendimento imediato."}
                      </p>

                      <button
                        className={`w-full mt-7 h-12 rounded-2xl font-bold transition-all ${
                          ativo
                            ? "bg-cyan-400 text-black"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        {ativo
                          ? "Selecionado"
                          : "Selecionar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* CALENDÁRIO */}
      {profissionalSelecionado && (
        <section className="max-w-7xl mx-auto px-6 pb-20">

          <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl p-10">

            <div className="flex items-center justify-between mb-10">

              <div>
                <h3 className="text-3xl font-black">
                  Agenda disponível
                </h3>

                <p className="text-slate-400 mt-2">
                  Selecione um dia disponível para reservar.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-sm font-bold">
                ● Atualização em tempo real
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-5">

              {gerarDias().map((dia) => {
                const ocupado =
                  diasOcupados.includes(dia);

                const ativo =
                  diaSelecionado === dia;

                return (
                  <button
                    key={dia}
                    disabled={ocupado}
                    onClick={() =>
                      setDiaSelecionado(dia)
                    }
                    className={`h-28 rounded-3xl border transition-all font-bold p-4 ${
                      ocupado
                        ? "bg-red-500/10 border-red-500/20 text-red-300 cursor-not-allowed"
                        : ativo
                        ? "bg-cyan-400 border-cyan-400 text-black scale-[1.03]"
                        : "border-white/10 bg-white/5 hover:border-cyan-400/30"
                    }`}
                  >

                    <div className="flex flex-col items-center justify-center h-full">

                      <span className="text-lg capitalize">
                        {dia}
                      </span>

                      <span className="mt-3 text-xs font-semibold opacity-80">
                        {ocupado
                          ? "INDISPONÍVEL"
                          : "DISPONÍVEL"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PAGAMENTO */}
      {diaSelecionado && (
        <section className="max-w-4xl mx-auto px-6 pb-24">

          <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-2xl p-10">

            <h3 className="text-4xl font-black mb-10">
              Finalizar agendamento
            </h3>

            {!pagamentoLiberado ? (
              <>
                <div className="space-y-5 mb-10">

                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-slate-400">
                      Plano
                    </span>

                    <span className="font-bold">
                      {planoSelecionado?.nome}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-slate-400">
                      Horário do plantão
                    </span>

                    <span className="font-bold text-cyan-300">
                      {planoSelecionado?.horario}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-slate-400">
                      Profissional
                    </span>

                    <span className="font-bold">
                      {profissionalSelecionado?.nome}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-slate-400">
                      Dia reservado
                    </span>

                    <span className="font-bold">
                      {diaSelecionado}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      Valor
                    </span>

                    <span className="text-4xl font-black text-cyan-400">
                      {planoSelecionado?.valor}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePagamento}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-xl font-black hover:scale-[1.01] transition-all"
                >
                  Confirmar pagamento
                </button>
              </>
            ) : (
              <div className="text-center py-10">

                <div className="text-7xl mb-5">
                  ✅
                </div>

                <h3 className="text-4xl font-black text-emerald-400 mb-4">
                  Agendamento confirmado
                </h3>

                <p className="text-slate-300 text-lg">
                  O dia selecionado foi reservado automaticamente no calendário do profissional.
                </p>

               <button
  onClick={() => {
    if (!profissionalSelecionado?.telefone) {
      alert("Profissional sem WhatsApp cadastrado.");
      return;
    }

    const numeroLimpo =
      profissionalSelecionado.telefone.replace(
        /\D/g,
        ""
      );

    const mensagem = encodeURIComponent(
      `Olá ${profissionalSelecionado.nome}, seu atendimento foi contratado pela plataforma WD Conecta.`
    );

    window.open(
      `https://wa.me/55${numeroLimpo}?text=${mensagem}`,
      "_blank"
    );
  }}
  className="mt-10 w-full h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-[1.01] transition-all text-white font-black text-lg shadow-[0_10px_40px_rgba(34,197,94,0.35)] flex items-center justify-center gap-3"
>
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.44 0 .08 5.36.08 11.96c0 2.12.56 4.18 1.6 5.98L0 24l6.22-1.63a11.9 11.9 0 0 0 5.82 1.48h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.24-6.2-3.49-8.41z" />
  </svg>

  Conversar no WhatsApp
</button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}