import { useEffect, useState } from "react";
import { cn } from "./utils/cn";

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
            <a href="#cta" className="btn-primary text-sm !py-2 !px-5">
              Baixar App
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
            href="#cta"
            onClick={() => setIsOpen(false)}
            className="btn-primary text-sm w-full text-center mt-4"
          >
            Baixar App
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container-custom px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 md:py-20">
          {/* Left Content */}
          <div className="fade-in-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-primary text-sm font-semibold mb-6">
             
              
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-[#0f172a]">
              Liberdade para trabalhar.{" "}
              <span className="gradient-text">Segurança</span> para contratar.
            </h1>

            <p className="text-lg sm:text-xl text-[#475569] mb-8 max-w-lg leading-relaxed">
              A WD Conecta equilibra a autonomia profissional com a proteção jurídica
              e a confiança de quem contrata. Inovação tecnológica e justiça financeira.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#cta" className="btn-primary text-base">
                Baixar App (em breve)
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="relative">
              <div className="fade-in-right relative">
  <div className="relative flex items-center justify-center min-h-[500px]">

    {/* Glow atrás */}
    <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 blur-3xl"></div>

    {/* Mascote */}
    <img
      src="/mascotewd.png"
      alt="Mascote WD"
      className="relative z-10 w-[300px] sm:w-[380px] md:w-[450px] object-contain animate-pulse drop-shadow-2xl"
    />

    {/* Card topo */}
    <div className="absolute top-8 right-0 hidden md:block bg-white px-4 py-3 rounded-2xl shadow-xl">
      <p className="text-sm font-semibold text-green-600">
        +Segurança
      </p>
    </div>

    {/* Card baixo */}
    <div className="absolute bottom-8 left-0 hidden md:block bg-white px-4 py-3 rounded-2xl shadow-xl">
      <p className="text-sm font-semibold text-blue-600">
        Preço Justo
      </p>
    </div>

  </div>
</div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-pulse hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 hidden sm:block">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                  </svg>
                </div>
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
          {/* Left Image */}
          <div className="fade-in-left order-2 lg:order-1">
            <div className="relative">
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
          </div>

          {/* Right Content */}
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

        {/* Missão e Visão */}
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

        {/* Valores */}
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
            Quatro pilares que fazem da nossa plataforma a melhor escolha para 
            profissionais e famílias.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {valueProps.map((prop, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl p-6 sm:p-8 card-hover border border-border/50 overflow-hidden fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
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
          <p className="text-lg text-[#475569]">
            Veja o que profissionais e famílias dizem sobre a WD Conecta.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 sm:p-8 card-hover border border-border/50 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#475569] leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
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

function FAQ() {
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
          <p className="text-lg text-[#475569]">
            Tire suas principais dúvidas sobre a WD Conecta.
          </p>
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1929] via-[#112240] to-[#0a1628]" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3">
            Baixe o App
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Liberdade para trabalhar. <br className="hidden sm:block" />
            Segurança para contratar.
          </h2>
          <p className="text-lg sm:text-xl text-[#94a3b8] mb-10 max-w-2xl mx-auto leading-relaxed">
            O aplicativo WD Conecta estará disponível em breve! Cadastre-se para 
            ser notificado quando lançarmos e comece a transformar sua experiência 
            de contratação de cuidadores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-base hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Baixar App (em breve)
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold text-base border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Fale Conosco
            </a>
          </div>

          <p className="mt-6 text-sm text-[#64748b]">
            Em breve disponível para iOS e Android • Segurança e transparência garantidas
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a1628] border-t border-white/5">
      <div className="container-custom px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#hero" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <span className="font-montserrat font-bold text-xl tracking-tight text-white">
                <span className="text-primary">WD</span> Conecta
              </span>
            </a>
            <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xs">
              Conectando profissionais e famílias com segurança jurídica, 
              tecnologia e preço justo.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#94a3b8] hover:bg-primary hover:text-white transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#94a3b8] hover:bg-primary hover:text-white transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#94a3b8] hover:bg-primary hover:text-white transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Sobre */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Sobre
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#quem-somos" className="text-[#94a3b8] text-sm hover:text-primary transition-colors">
                  Quem Somos
                </a>
              </li>
              <li>
                <a href="#pilares" className="text-[#94a3b8] text-sm hover:text-primary transition-colors">
                  Pilares
                </a>
              </li>
              <li>
                <a href="#missao" className="text-[#94a3b8] text-sm hover:text-primary transition-colors">
                  Missão e Valores
                </a>
              </li>
              <li>
                <a href="#proposta" className="text-[#94a3b8] text-sm hover:text-primary transition-colors">
                  Proposta de Valor
                </a>
              </li>
            </ul>
          </div>

          {/* Para Quem */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Para Quem?
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#94a3b8] text-sm hover:text-primary transition-colors">
                  Cuidadores
                </a>
              </li>
              <li>
                <a href="#" className="text-[#94a3b8] text-sm hover:text-primary transition-colors">
                  Famílias
                </a>
              </li>
              <li>
                <a href="#" className="text-[#94a3b8] text-sm hover:text-primary transition-colors">
                  Profissionais de Saúde
                </a>
              </li>
              <li>
                <a href="#faq" className="text-[#94a3b8] text-sm hover:text-primary transition-colors">
                  Dúvidas
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Contato
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contato@wdconecta.com.br" className="text-[#94a3b8] text-sm hover:text-primary transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  contato@wdconecta.com.br
                </a>
              </li>
              <li>
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-sm hover:text-primary transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li className="text-[#94a3b8] text-sm flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Brasil
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#64748b] text-sm">
            © 2026 WD Conecta. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#64748b] text-sm hover:text-primary transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-[#64748b] text-sm hover:text-primary transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============ APP ============

export default function App() {
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
