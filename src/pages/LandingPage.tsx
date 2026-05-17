// src/pages/LandingPage.jsx
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

// ============ DATA ============

const navLinks = [
  { label: "Início", href: "#hero" },
  { label: "Quem Somos", href: "#quem-somos" },
  { label: "Pilares", href: "#pilares" },
  { label: "Missão e Valores", href: "#missao" },
  { label: "Proposta", href: "#proposta" },
];

const pillars = [
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Inovação",
    desc: "Tecnologia de ponta para modernizar e transformar o mercado de cuidadores e profissionais de saúde domiciliar.",
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Cuidado Humano",
    desc: "Valorização dos profissionais e respeito às famílias, promovendo relações de cuidado com dignidade e empatia.",
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Confiança",
    desc: "Relações transparentes com clareza total nos contratos e segurança para todas as partes envolvidas.",
  },
];

const values = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Confiança",
    desc: "Relações transparentes e seguras entre profissionais e famílias.",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Segurança Jurídica",
    desc: "Clareza e respaldo legal em todos os contratos e relações trabalhistas.",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    title: "Inovação",
    desc: "Tecnologia constante para modernizar e simplificar o mercado de cuidadores.",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Respeito",
    desc: "Valorização dos profissionais e dignidade no atendimento às famílias.",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    title: "Crescimento",
    desc: "Oportunidades de renda e desenvolvimento profissional contínuo.",
  },
];

const valueProps = [
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Preço Justo",
    desc: "Valores acessíveis para famílias e remuneração digna para profissionais. Justiça financeira para todos.",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Segurança Jurídica",
    desc: "Contratos claros e respaldo legal para todas as partes envolvidas. Tranquilidade em cada conexão.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Liberdade Profissional",
    desc: "O profissional define seus horários, valores e disponibilidade. Trabalhe como e quando quiser.",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: "Redução de Custos",
    desc: "Sem intermediários abusivos. Conexão direta entre família e profissional com economia real.",
    gradient: "from-amber-400 to-orange-500",
  },
];

const faqs = [
  {
    q: "O que é a WD Conecta?",
    a: "A WD Conecta é uma startup de tecnologia focada em transformar o mercado de cuidadores e profissionais de saúde domiciliar, conectando profissionais e famílias de forma segura e transparente.",
  },
  {
    q: "Como funciona a plataforma?",
    a: "A plataforma permite que profissionais cadastrem seus serviços e famílias encontrem cuidadores qualificados. Tudo com contratos claros, segurança jurídica e comunicação direta.",
  },
  {
    q: "Qual a diferença para outras plataformas?",
    a: "Diferente de intermediários tradicionais, a WD Conecta valoriza o profissional com liberdade de definir seus horários e valores, enquanto famílias pagam preços justos com segurança jurídica completa.",
  },
  {
    q: "A WD Conecta cobra taxas abusivas?",
    a: "Não! Nossa essência é a justiça financeira. Cobramos uma taxa justa que permite manter a plataforma, garantindo remuneração digna para profissionais e preços acessíveis para famílias.",
  },
  {
    q: "Há segurança jurídica nas contratações?",
    a: "Sim! Todos os serviços são formalizados com contratos que protegem tanto o profissional quanto a família, oferecendo respaldo legal completo.",
  },
  {
    q: "Como baixar o aplicativo?",
    a: "O aplicativo estará disponível em breve! Inscreva-se na nossa newsletter ou acompanhe nossas redes sociais para ser o primeiro a saber quando lançarmos.",
  },
];

const testimonials = [
  {
    name: "Maria Silva",
    role: "Família Cuidadora",
    text: "Encontrei uma cuidadora incrível para minha mãe pela WD Conecta. A segurança jurídica e a transparência nos contratos nos deram total tranquilidade.",
    rating: 5,
  },
  {
    name: "Ana Oliveira",
    role: "Cuidadora Profissional",
    text: "Pela primeira vez sinto que tenho liberdade para trabalhar nos meus horários e com valores justos. A WD Conecta valoriza o profissional de verdade.",
    rating: 5,
  },
  {
    name: "Carlos Mendes",
    role: "Família Cuidadora",
    text: "Sem intermediários abusivos, com preço justo e segurança. AWD Conecta conecta de forma humana e profissional. Recomendo demais!",
    rating: 5,
  },
];

// ============ HOOKS ============

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(
      ".fade-in-up, .fade-in-left, .fade-in-right, .scale-in"
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// ============ COMPONENTS ============

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_1px_20px_-4px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      )}
    >
    <div className="container-custom px-4 sm:px-6">
  <div className="flex items-center justify-between h-16 md:h-20">

    {/* Logo */}
    <a href="#hero" className="flex items-center gap-3 group">
      <img
        src="/logowd.png"
        alt="WD Conecta Logo"
        className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
      />
      <span className="font-montserrat font-bold text-xl tracking-tight">
        <span className="gradient-text">WD</span> Conecta
      </span>
    </a>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#475569] hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <a href="/login" className="btn-primary text-sm !py-2 !px-5">
              Entrar / Cadastrar
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "block w-6 h-[2px] bg-[#1e293b] transition-all duration-300",
                  isOpen && "rotate-45 translate-y-[5px]"
                )}
              />
              <span
                className={cn(
                  "block w-6 h-[2px] bg-[#1e293b] transition-all duration-300",
                  isOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block w-6 h-[2px] bg-[#1e293b] transition-all duration-300",
                  isOpen && "-rotate-45 -translate-y-[5px]"
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-base font-medium text-[#475569] hover:text-primary transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/login"
            onClick={() => setIsOpen(false)}
            className="btn-primary text-sm w-full text-center mt-4"
          >
            Entrar / Cadastrar
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container-custom px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 md:py-20">
          <div className="fade-in-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-[#0f172a]">
               para trabalhar.{" "}
              <span className="gradient-text">Segurança</span> para contratar.
            </h1>

            <p className="text-lg sm:text-xl text-[#475569] mb-8 max-w-lg leading-relaxed">
              A WD Conecta equilibra a autonomia profissional com a proteção jurídica
              e a confiança de quem contrata. Inovação tecnológica e justiça financeira.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/login" className="btn-primary text-base">
                Acessar Plataforma
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
              <a href="#quem-somos" className="btn-outline text-base">
                Conheça a WD Conecta
              </a>
            </div>
            
            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-[#64748b]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Segurança jurídica</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Preço justo</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Liberdade profissional</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="fade-in-right relative">
            <div className="relative flex items-center justify-center min-h-[500px]">
              <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 blur-3xl"></div>
              <img
                src="/mascotewd.png"
                alt="Mascote WD"
                className="relative z-10 w-[300px] sm:w-[380px] md:w-[450px] object-contain animate-pulse drop-shadow-2xl"
              />
              <div className="absolute top-8 right-0 hidden md:block bg-white px-4 py-3 rounded-2xl shadow-xl">
                <p className="text-sm font-semibold text-green-600">+Segurança</p>
              </div>
              <div className="absolute bottom-8 left-0 hidden md:block bg-white px-4 py-3 rounded-2xl shadow-xl">
                <p className="text-sm font-semibold text-blue-600">Preço Justo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuemSomos() {
  return (
    <section id="quem-somos" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="fade-in-left order-2 lg:order-1">
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 rounded-2xl p-8 sm:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-primary font-montserrat">2024</div>
                  <div className="text-sm text-[#64748b]">Fundação</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-xl bg-secondary-light text-secondary flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-secondary font-montserrat">BR</div>
                  <div className="text-sm text-[#64748b]">Cobertura</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-purple-500 font-montserrat">Tech</div>
                  <div className="text-sm text-[#64748b]">Inovação</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-amber-500 font-montserrat">100%</div>
                  <div className="text-sm text-[#64748b]">Humanizado</div>
                </div>
              </div>
            </div>
          </div>
          <div className="fade-in-right order-1 lg:order-2">
            <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3">
              Quem Somos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-6">
              Transformando o mercado de cuidadores com tecnologia
            </h2>
            <p className="text-lg text-[#475569] mb-4 leading-relaxed">
              A WD Conecta é uma startup de tecnologia focada em transformar o mercado 
              de cuidadores e profissionais de saúde domiciliar.
            </p>
            <p className="text-[#475569] mb-6 leading-relaxed">
              A essência da WD Conecta é equilibrar a autonomia profissional com a proteção 
              jurídica e a confiança de quem contrata.
            </p>
            <p className="text-[#475569] mb-8 leading-relaxed">
              Combinamos <span className="font-semibold text-primary">inovação tecnológica</span>, 
              <span className="font-semibold text-secondary"> justiça financeira</span> e 
              <span className="font-semibold text-primary"> segurança jurídica</span> para oferecer 
              uma experiência única para todos os envolvidos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  return (
    <section id="pilares" className="section-padding bg-muted">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up">
          <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3">
            Nossos Pilares
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            Os pilares que sustentam nossa plataforma
          </h2>
          <p className="text-lg text-[#475569]">
            Três fundamentos que guiam cada decisão e cada funcionalidade da WD Conecta.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 sm:p-8 card-hover border border-border/50 text-center fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary flex items-center justify-center mb-5 mx-auto group-hover:gradient-primary group-hover:text-white transition-all duration-300">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">{pillar.title}</h3>
              <p className="text-[#475569] leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MissaoVisaoValores() {
  return (
    <section id="missao" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up">
          <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3">
            Missão, Visão e Valores
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            O que nos move e onde queremos chegar
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-8 border border-primary/10 fade-in-left">
            <div className="w-14 h-14 rounded-xl gradient-primary text-white flex items-center justify-center mb-5">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Missão</h3>
            <p className="text-[#475569] leading-relaxed">
              Conectar profissionais e famílias por meio da tecnologia, oferecendo uma plataforma 
              segura, transparente e acessível para contratação de serviços.
            </p>
          </div>
          <div className="bg-gradient-to-br from-secondary/5 to-transparent rounded-2xl p-8 border border-secondary/10 fade-in-right">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-emerald-600 text-white flex items-center justify-center mb-5">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Visão</h3>
            <p className="text-[#475569] leading-relaxed">
              Tornar-se uma das principais plataformas de conexão entre profissionais e clientes 
              do Brasil, promovendo autonomia profissional e segurança nas relações de trabalho.
            </p>
          </div>
        </div>
        <div className="fade-in-up">
          <h3 className="text-2xl font-bold text-[#0f172a] text-center mb-8">Valores</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl bg-muted/50 hover:bg-white hover:shadow-card transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 text-primary flex items-center justify-center flex-shrink-0">
                  {value.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[#0f172a] mb-1">{value.title}</h4>
                  <p className="text-sm text-[#475569]">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PropostaValor() {
  return (
    <section id="proposta" className="section-padding bg-muted">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up">
          <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3">
            Proposta de Valor
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            Por que escolher a WD Conecta?
          </h2>
          <p className="text-lg text-[#475569]">
            Quatro pilares que fazem da nossa plataforma a melhor escolha para profissionais e famílias.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {valueProps.map((prop, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl p-6 sm:p-8 card-hover border border-border/50 overflow-hidden fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-5",
                    prop.gradient
                  )}
                >
                  {prop.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">{prop.title}</h3>
                <p className="text-[#475569] leading-relaxed">{prop.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up">
          <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            Quem já está conectado
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 sm:p-8 card-hover border border-border/50 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[#475569] leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0f172a]">{testimonial.name}</div>
                  <div className="text-xs text-[#64748b]">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ                            () {
 const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding bg-muted">
      <div className="container-custom max-w-3xl">
        <div className="text-center max-w-3xl mx-auto mb-12 fade-in-up">
          <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            Perguntas Frequentes
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-border/50 overflow-hidden card-hover fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-[#0f172a] pr-4 text-sm sm:text-base">
                  {faq.q}
                </span>
                <svg
                  className={cn(
                    "w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300",
                    openIndex === index && "rotate-180"
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-[#475569] leading-relaxed text-sm sm:text-base">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="relative section-padding overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1929] via-[#112240] to-[#0a1628]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3">
            Acesse a plataforma
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Liberdade para trabalhar. <br className="hidden sm:block" />
            Segurança para contratar.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-base hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Entrar / Cadastrar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a1628] border-t border-white/5">
      <div className="container-custom px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#64748b] text-sm">
            © 2026 WD Conecta. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============ APP ============

export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white text-foreground">
      <Header />
      <main>
        <Hero />
        <QuemSomos />
        <Pillars />
        <MissaoVisaoValores />
        <PropostaValor />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}