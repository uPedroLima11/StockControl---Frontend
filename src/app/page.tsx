"use client";
import Image from "next/image";
import Link from "next/link";
import { Link as ScrollLink } from 'react-scroll';
import { useEffect, useState, useRef } from "react";
import { FaCloud, FaLock, FaUserShield, FaWhatsapp, FaArrowRight, FaCheck, FaPlay, FaPause, FaTimes, FaTruck } from "react-icons/fa";
import { MdOutlineLibraryBooks, MdInventory } from "react-icons/md";
import { HiOutlineChartBar, HiOutlineTrendingUp } from "react-icons/hi";
import { BiPackage, BiUserCheck } from "react-icons/bi";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function Home() {
  const [visivel, setVisivel] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    clientes: 0,
    produtos: 0,
    transacoes: 0,
    eficiencia: 0
  });
  const [recursoAtivo, setRecursoAtivo] = useState(0);
  const [videoExecutando, setVideoExecutando] = useState(true);
  const referenciaVideo = useRef<HTMLVideoElement>(null);

  const recursos = [
    {
      icone: <MdInventory className="text-3xl" />,
      titulo: "Gestão Inteligente de Estoque",
      descricao: "Controle completo do seu inventário com alertas automáticos de reposição",
      cor: "from-blue-500 to-cyan-500"
    },
    {
      icone: <HiOutlineTrendingUp className="text-3xl" />,
      titulo: "Análises em Tempo Real",
      descricao: "Dashboards interativos com os principais indicadores do seu negócio",
      cor: "from-purple-500 to-pink-500"
    },
    {
      icone: <BiUserCheck className="text-3xl" />,
      titulo: "Controle de Permissões",
      descricao: "Defina níveis de acesso para diferentes usuários da sua equipe",
      cor: "from-green-500 to-emerald-500"
    },
    {
      icone: <HiOutlineChartBar className="text-3xl" />,
      titulo: "Relatórios Detalhados",
      descricao: "Exporte dados e gere relatórios personalizados para tomada de decisão",
      cor: "from-orange-500 to-red-500"
    },
    {
      icone: <FaTruck className="text-3xl" />,
      titulo: "Pedidos de Estoque Automatizados",
      descricao: "Faça pedidos automáticos aos fornecedores quando o estoque estiver baixo",
      cor: "from-orange-500 to-red-500"
    }
  ];

  const funcionalidades = [
    {
      icone: <MdOutlineLibraryBooks />,
      titulo: "Registro Completo",
      descricao: "Controle total de todas as movimentações do estoque"
    },
    {
      icone: <FaCloud />,
      titulo: "Acesso em Nuvem",
      descricao: "Acesse de qualquer lugar, a qualquer momento"
    },
    {
      icone: <BiPackage />,
      titulo: "Gestão de Produtos",
      descricao: "Cadastro e organização completa dos seus produtos"
    },
    {
      icone: <HiOutlineChartBar />,
      titulo: "Exportação de Dados",
      descricao: "Relatórios personalizados em diversos formatos"
    },
    {
      icone: <FaLock />,
      titulo: "Segurança Máxima",
      descricao: "Seus dados protegidos com criptografia avançada"
    },
    {
      icone: <FaUserShield />,
      titulo: "Controle de Acesso",
      descricao: "Permissões personalizadas para cada usuário"
    }
  ];

  useEffect(() => {
    const estilo = document.createElement("style");
    estilo.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-glow {
        animation: glow 3s ease-in-out infinite;
      }
      
      html::-webkit-scrollbar {
        width: 10px;
      }
      
      html::-webkit-scrollbar-track {
        background: #0A1929;
      }
      
      html::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #1976D2, #00B4D8);
        border-radius: 5px;
      }
      
      html::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #1565C0, #0096C7);
      }
    `;
    document.head.appendChild(estilo);

    setVisivel(true);

    const animarNumeros = () => {
      const duracao = 2000;
      const passos = 60;
      const duracaoPasso = duracao / passos;

      const estatisticasAlvo = {
        clientes: 250,
        produtos: 10000,
        transacoes: 50000,
        eficiencia: 98
      };

      Object.keys(estatisticasAlvo).forEach(chave => {
        let atual = 0;
        const alvo = estatisticasAlvo[chave as keyof typeof estatisticasAlvo];
        const incremento = alvo / passos;

        const temporizador = setInterval(() => {
          atual += incremento;
          if (atual >= alvo) {
            atual = alvo;
            clearInterval(temporizador);
          }
          setEstatisticas(prev => ({
            ...prev,
            [chave]: Math.floor(atual)
          }));
        }, duracaoPasso);
      });
    };

    setTimeout(animarNumeros, 1000);

    const intervaloRecurso = setInterval(() => {
      if (videoExecutando) {
        setRecursoAtivo(prev => (prev + 1) % recursos.length);
      }
    }, 4000);

    return () => {
      clearInterval(intervaloRecurso);
      document.head.removeChild(estilo);
    };
  }, [videoExecutando]);

  const alternarVideo = () => {
    if (referenciaVideo.current) {
      if (videoExecutando) {
        referenciaVideo.current.pause();
      } else {
        referenciaVideo.current.play();
      }
      setVideoExecutando(!videoExecutando);
    }
  };

  const propsScroll = {
    spy: true,
    smooth: true,
    offset: -80,
    duration: 800
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0F1E35] to-[#132F4C] ${poppins.className}`}>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1929] via-transparent to-[#0A1929] z-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-6xl mx-auto mt-24 sm:mt-0">
          <div className={`transition-all duration-1000 transform ${visivel ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
              Controle Seu
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Estoque</span>
              <br />
              Como Nunca
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto px-2 sm:px-0">
              Sistema completo de gestão empresarial que transforma a maneira como você controla
              estoque, vendas e operações do seu negócio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/registro"
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 flex items-center gap-3 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                <span className="relative z-10">Comece Agora</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>

              <ScrollLink
                to="pricing"
                {...propsScroll}
                className="border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:border-blue-400 group relative overflow-hidden cursor-pointer"
              >
                <span className="relative z-10">Ver Planos</span>
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-y-[-2px] transition-all duration-500 animate-bounce">
                  ↓
                </span>
              </ScrollLink>
            </div>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 transition-all duration-1000 delay-500 ${visivel ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {[
              { valor: estatisticas.clientes, label: 'Clientes Ativos', sufixo: '+' },
              { valor: estatisticas.produtos, label: 'Produtos Gerenciados', sufixo: '+' },
              { valor: estatisticas.transacoes, label: 'Transações/Mês', sufixo: '+' },
              { valor: estatisticas.eficiencia, label: 'Eficiência', sufixo: '%' }
            ].map((estatistica, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {estatistica.valor}{estatistica.sufixo}
                </div>
                <div className="text-blue-300 text-sm">{estatistica.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-blue-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tudo que você precisa em
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> um só lugar</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ferramentas poderosas para transformar a gestão do seu negócio
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-8 border border-blue-500/20">
                <div className={`transition-all duration-500 transform ${visivel ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                  <div className={`text-4xl mb-4 bg-gradient-to-r ${recursos[recursoAtivo].cor} bg-clip-text text-transparent`}>
                    {recursos[recursoAtivo].icone}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {recursos[recursoAtivo].titulo}
                  </h3>
                  <p className="text-gray-300 text-lg mb-6">
                    {recursos[recursoAtivo].descricao}
                  </p>
                  <ul className="space-y-3">
                    {['Controle em tempo real', 'Alertas automáticos', 'Relatórios detalhados', 'Integração total'].map((item, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <FaCheck className="text-green-400 mr-3 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex justify-center mt-8 space-x-3">
                {recursos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setRecursoAtivo(index);
                      setVideoExecutando(false);
                      setTimeout(() => setVideoExecutando(true), 5000);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${recursoAtivo === index
                      ? 'bg-blue-500 w-8'
                      : 'bg-blue-500/30 hover:bg-blue-500/50'
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900/50 to-blue-900/30 rounded-2xl overflow-hidden border border-blue-500/20">
                <div className="relative aspect-video">
                  <video
                    ref={referenciaVideo}
                    className="w-full h-full object-cover"
                    poster="/dashboard-preview.png"
                    muted
                    loop
                    autoPlay
                    playsInline 
                    preload="metadata"
                  >
                    <source src="/dashboard_preview.mp4" type="video/mp4" />
                  </video>
                  <button
                    onClick={alternarVideo}
                    className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                  >
                    {videoExecutando ? <FaPause /> : <FaPlay />}
                  </button>
                </div>
                <div className="p-6">
                  <h4 className="text-white font-semibold mb-2">Dashboard Interativo</h4>
                  <p className="text-gray-400 text-sm">
                    Visualize todos os dados do seu negócio em tempo real
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {funcionalidades.map((funcionalidade, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:from-blue-500/10 hover:to-cyan-500/10 p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105"
              >
                <div className="text-blue-400 text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {funcionalidade.icone}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{funcionalidade.titulo}</h3>
                <p className="text-gray-400">{funcionalidade.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-[#132F4C] to-[#0A1929]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Do
              <span className="text-red-400"> caos </span>
              ao
              <span className="text-green-400"> controle total</span>
            </h2>
            <p className="text-xl text-gray-300">
              Descubra como o StockControl transforma completamente sua gestão
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-8 border border-red-500/20 h-full transition-all duration-500 group-hover:scale-105">
                <div className="text-5xl mb-6">😵</div>
                <h3 className="font-bold text-2xl mb-6 text-red-400">Antes do StockControl</h3>
                <ul className="space-y-4 text-gray-300 text-left">
                  <li className="flex items-center">
                    <FaTimes className="text-red-400 mr-4 flex-shrink-0" />
                    Planilhas desatualizadas e conflitantes
                  </li>
                  <li className="flex items-center">
                    <FaTimes className="text-red-400 mr-4 flex-shrink-0" />
                    Surpresas com estoque zerado perdendo vendas
                  </li>
                  <li className="flex items-center">
                    <FaTimes className="text-red-400 mr-4 flex-shrink-0" />
                    Horas fechando planilhas manualmente
                  </li>
                  <li className="flex items-center">
                    <FaTimes className="text-red-400 mr-4 flex-shrink-0" />
                    Dúvidas sobre o que e quando repor
                  </li>
                  <li className="flex items-center">
                    <FaTimes className="text-red-400 mr-4 flex-shrink-0" />
                    Clientes sem cadastro organizado
                  </li>
                  <li className="flex items-center">
                    <FaTimes className="text-red-400 mr-4 flex-shrink-0" />
                    Pedidos feitos por WhatsApp sem controle
                  </li>
                  <li className="flex items-center">
                    <FaTimes className="text-red-400 mr-4 flex-shrink-0" />
                    Dificuldade para exportar dados para análise
                  </li>
                  <li className="flex items-center">
                    <FaTimes className="text-red-400 mr-4 flex-shrink-0" />
                    Sem histórico de movimentações do estoque
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-8 border border-green-500/20 h-full transition-all duration-500 group-hover:scale-105">
                <div className="text-5xl mb-6">😎</div>
                <h3 className="font-bold text-2xl mb-6 text-green-400">Com StockControl</h3>
                <ul className="space-y-4 text-gray-300 text-left">
                  <li className="flex items-center">
                    <FaCheck className="text-green-400 mr-4 flex-shrink-0" />
                    Dashboard em tempo real sempre atualizado
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-400 mr-4 flex-shrink-0" />
                    Alertas automáticos de estoque baixo
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-400 mr-4 flex-shrink-0" />
                    Processos 100% automatizados
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-400 mr-4 flex-shrink-0" />
                    Relatórios inteligentes de reposição
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-400 mr-4 flex-shrink-0" />
                    Cadastro completo de clientes e histórico
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-400 mr-4 flex-shrink-0" />
                    Sistema de pedidos integrado com fornecedores
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-400 mr-4 flex-shrink-0" />
                    Exportação em Excel com 1 clique
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-400 mr-4 flex-shrink-0" />
                    Histórico completo de todas as movimentações
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-white mb-6">
                E muito mais...
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-gray-300">
                <div className="flex items-center justify-center gap-3">
                  <BiPackage className="text-blue-400 text-xl" />
                  <span>Gestão completa de produtos</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <FaUserShield className="text-blue-400 text-xl" />
                  <span>Controle de usuários e permissões</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <HiOutlineChartBar className="text-blue-400 text-xl" />
                  <span>Relatórios de vendas e desempenho</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <FaTruck className="text-blue-400 text-xl" />
                  <span>Cadastro de fornecedores</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <MdInventory className="text-blue-400 text-xl" />
                  <span>Inventário automatizado</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <FaCloud className="text-blue-400 text-xl" />
                  <span>Acesso em nuvem 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Conheça os
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> criadores</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Desenvolvido por especialistas apaixonados por transformar a gestão empresarial
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="group text-center">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 group-hover:scale-105">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <Image
                    src="/pedrolima.jpg"
                    alt="Pedro Lima"
                    width={160}
                    height={160}
                    quality={100}
                    className="relative w-40 h-40 object-cover rounded-full mx-auto border-4 border-blue-500/50"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pedro Lima</h3>
                <p className="text-blue-400 mb-4">Full-Stack Developer & UI/UX Specialist</p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Especialista em desenvolvimento de sistemas complexos e experiências de usuário intuitivas.
                  Foca em criar soluções que são tanto poderosas quanto fáceis de usar.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://www.linkedin.com/in/upedrolima/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/uPedroLima11"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="group text-center">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 group-hover:scale-105">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <Image
                    src="/pedrosiqueira.jpg"
                    alt="Pedro Siqueira"
                    width={160}
                    quality={100}
                    height={160}
                    className="relative w-40 h-40 object-cover rounded-full mx-auto border-4 border-cyan-500/50"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pedro Siqueira</h3>
                <p className="text-cyan-400 mb-4">Backend Architect & DevOps Engineer</p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Especialista em arquitetura de sistemas escaláveis e infraestrutura cloud.
                  Garante que o StockControl tenha performance excepcional e segurança de nível enterprise.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://www.linkedin.com/in/phasiqueira/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/PedroHSiqueira"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Pedros&apos; TI</h3>
              <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                Uma equipe jovem e inovadora focada em criar soluções de tecnologia que realmente fazem a diferença
                para pequenas e médias empresas. Acreditamos que tecnologia boa é tecnologia que resolve problemas reais.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400" />
                  <span>+2 anos de experiência</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400" />
                  <span>+50 projetos entregues</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400" />
                  <span>Tecnologia de ponta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-[#0A1929] to-[#132F4C]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Experimente e depois decida
            </h2>
            <p className="text-xl text-gray-300">
              Teste todas as funcionalidades gratuitamente antes de assinar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-8 border border-blue-500/20 h-full flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
                    🚀 PERFEITO PARA EXPERIMENTAR
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Teste Grátis
                  </h3>
                  <div className="text-4xl font-bold text-white mb-1">
                    R$ 0
                    <span className="text-lg"> /7 dias</span>
                  </div>
                  <p className="text-gray-400">
                    Sistema completo para você testar
                  </p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    "Acesso a TODAS as funcionalidades",
                    "Sistema 100% completo liberado",
                    "Dashboard e relatórios completos",
                    "Gestão de produtos e estoque",
                    "Controle de vendas e clientes",
                    "Permissões de usuários",
                    "Exportação de dados",
                    "Suporte durante o período de teste"
                  ].map((funcionalidade, index) => (
                    <li key={index} className="flex items-center">
                      <FaCheck className="text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{funcionalidade}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://wa.me/+5553981185633"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 text-center block"
                >
                  Solicitar Teste Grátis
                </a>

                <div className="text-center mt-4">
                  <p className="text-blue-300 text-sm">
                    ⚡ Entre em contato para criar sua conta teste
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 border-2 border-blue-400 shadow-2xl shadow-blue-500/25 h-full flex flex-col">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold">
                  MAIS ESCOLHIDO
                </div>

                <div className="text-center mb-8 mt-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Plano Completo
                  </h3>
                  <div className="text-4xl font-bold text-white mb-1">
                    R$ 79
                    <span className="text-lg"> /mês</span>
                  </div>
                  <p className="text-blue-100">
                    Continue com acesso ilimitado
                  </p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    "Todas as funcionalidades do teste",
                    "Acesso contínuo e ilimitado",
                    "Dados salvos do período de teste",
                    "Atualizações gratuitas forever",
                    "Suporte prioritário 24/7",
                    "Backup automático diário",
                    "Segurança enterprise",
                    "Multi-usuários ilimitados"
                  ].map((funcionalidade, index) => (
                    <li key={index} className="flex items-center">
                      <FaCheck className="text-white mr-3 flex-shrink-0" />
                      <span className="text-white">{funcionalidade}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/registro"
                  className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 text-center block"
                >
                  Começar Agora
                </Link>

                <div className="text-center mt-4">
                  <p className="text-blue-100 text-sm">
                    💎 Upgrade direto do teste • Sem recontratação
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 max-w-2xl mx-auto">
              O teste de 7 dias oferece o sistema completo exatamente como na versão paga.
              Se decidir continuar, seus dados serão mantidos e você terá acesso contínuo.
            </p>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ainda com dúvidas?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Fale diretamente com nossa equipe de especialistas
          </p>

          <a
            href="https://wa.me/+5553981185633"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-green-500/25"
          >
            <FaWhatsapp size={24} />
            Falar no WhatsApp
          </a>
        </div>
      </section>
      <footer className="bg-[#0A1929] border-t border-blue-500/20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Image src="/icone.png" alt="Logo StockControl" width={40} height={40} className="mr-3 filter brightness-0 invert" />
                <span className="text-white text-xl font-bold">StockControl</span>
              </div>
              <p className="text-gray-400">
                Sistema completo de gestão empresarial para otimizar seu negócio.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <ScrollLink
                    to="features"
                    {...propsScroll}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    Recursos
                  </ScrollLink>
                </li>
                <li>
                  <ScrollLink
                    to="pricing"
                    {...propsScroll}
                    className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                  >
                    Planos
                  </ScrollLink>
                </li>
                <li><Link href="/demo" className="hover:text-blue-400 transition-colors">Demonstração</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://wa.me/5553981185633" className="hover:text-blue-400 transition-colors">Contato</a></li>
                <li><Link href="/ajuda" className="hover:text-blue-400 transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/documentacao" className="hover:text-blue-400 transition-colors">Documentação</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/politica-privacidade" className="hover:text-blue-400 transition-colors">Privacidade</Link></li>
                <li><Link href="/termos-uso" className="hover:text-blue-400 transition-colors">Termos</Link></li>
                <li><Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-500/20 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 StockControl. Desenvolvido com ❤️ por{" "}
              <a href="https://www.linkedin.com/in/upedrolima/" className="text-blue-400 hover:text-blue-300">
                Pedro Lima
              </a>{" "}
              e{" "}
              <a href="https://www.linkedin.com/in/phasiqueira/" className="text-blue-400 hover:text-blue-300">
                Pedro Siqueira
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}