"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaBell, FaFileExport, FaBoxOpen, FaFileAlt, FaUser, FaHeadset, FaWrench, FaSignOutAlt, FaTruck, FaCheck, FaCheckDouble, FaHistory, FaMoon, FaSun } from "react-icons/fa";
import { FaCartShopping, FaClipboardUser, FaUsers } from "react-icons/fa6";

import { NotificacaoI } from "@/utils/types/notificacao";
import { useUsuarioStore } from "@/context/usuario";
import { ConviteI } from "@/utils/types/convite";
import { useTranslation } from "react-i18next";
import { usuarioTemPermissao } from "@/utils/permissoes";

export default function Sidebar() {
  const { t } = useTranslation("sidebar");
  const [estaAberto, setEstaAberto] = useState(false);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);
  const [temNotificacaoNaoLida, setTemNotificacaoNaoLida] = useState(false);
  const [possuiEmpresa, setPossuiEmpresa] = useState(false);
  const [empresaAtivada, setEmpresaAtivada] = useState(false);
  const { logar } = useUsuarioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioInicializado, setAudioInicializado] = useState(false);
  const notificacoesNaoLidasRef = useRef<NotificacaoI[]>([]);
  const idsNotificacoesTocadasRef = useRef<Set<string>>(new Set());
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [ultimaVerificacao, setUltimaVerificacao] = useState<number>(0);
  const [modoDark, setModoDark] = useState(false);



  const cores = {
    azulEscuro: "#0A1929",
    azulMedio: "#132F4C",
    azulClaro: "#1E4976",
    azulBrilhante: "#1976D2",
    azulNeon: "#00B4D8",
    cinzaEscuro: "#1A2027",
  };

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
  }, []);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.classList.add("dark");
      root.style.setProperty("--cor-fundo", "#0A1929");
      root.style.setProperty("--cor-texto", "#FFFFFF");
      document.body.style.backgroundColor = "#0A1929";
      document.body.style.color = "#FFFFFF";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#F8FAFC");
      root.style.setProperty("--cor-texto", "#0F172A");
      document.body.style.backgroundColor = "#F8FAFC";
      document.body.style.color = "#0F172A";
    }
  };

  const alternarTema = () => {
    const novoTema = !modoDark;
    setModoDark(novoTema);
    localStorage.setItem("modoDark", String(novoTema));
    aplicarTema(novoTema);
    window.location.reload();
  };


  const verificarAtivacaoEmpresa = useCallback(async (empresaId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar dados da empresa");
      }
      const empresaData = await response.json();

      const ativada = empresaData.ChaveAtivacao !== null && empresaData.ChaveAtivacao !== undefined;
      setEmpresaAtivada(ativada);
      return ativada;
    } catch (error) {
      console.error("Erro ao verificar ativação da empresa:", error);
      setEmpresaAtivada(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('aside');
      const menuButton = document.querySelector('button.md\\:hidden');

      if (window.innerWidth < 768 &&
        estaAberto &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)) {
        setEstaAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [estaAberto]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-thumb {
        background: ${cores.azulClaro};
        border-radius: 3px;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${cores.azulBrilhante};
      }
      
      .sidebar-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: ${cores.azulClaro} transparent;
      }
      
      .sidebar-scrollbar {
        -ms-overflow-style: -ms-autohiding-scrollbar;
      }
      
     @media (max-width: 768px) {
  .sidebar-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .sidebar-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .sidebar-scrollbar::-webkit-scrollbar-thumb {
    background: ${cores.azulBrilhante};
    border-radius: 2px;
  }
  
  .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
    background: ${cores.azulNeon};
  }
  
  .sidebar-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: ${cores.azulBrilhante} transparent;
  }
}
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [cores.azulClaro, cores.azulBrilhante]);

  const limparNotificacoesLidas = useCallback(async (idUsuario: string) => {
    try {
      const idsSalvos = localStorage.getItem(`idsNotificacoesSom_${idUsuario}`);
      if (idsSalvos) {
        const idsArray = JSON.parse(idsSalvos);
        const idsLimitadas = idsArray.slice(-50);
        localStorage.setItem(`idsNotificacoesSom_${idUsuario}`, JSON.stringify(idsLimitadas));
      }

      localStorage.removeItem(`idsNotificacoesTocadas_${idUsuario}`);

      console.log('IDs antigas limpas, mantendo histórico recente');
    } catch (erro) {
      console.error("Erro ao limpar notificações lidas:", erro);
    }
  }, []);

  const verificarEstoque = async () => {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) {
        console.log("Nenhum usuário logado encontrado");
        return;
      }


      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/verificar-estoque-empresa`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!resposta.ok) {
        const errorData = await resposta.json().catch(() => ({}));
        throw new Error(`Erro HTTP ${resposta.status}: ${errorData.message || 'Erro desconhecido'}`);
      }

      const dados = await resposta.json();
      console.log("Verificação de estoque concluída:", dados);
    } catch (erro) {
      console.error("Erro detalhado ao verificar estoque:", erro);
    }
  };

  const inicializarAudio = useCallback(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio("/notification-sound.mp3");
      audioRef.current.volume = 0.3;
      audioRef.current.load();
      setAudioInicializado(true);
    }
  }, []);

  const tocarSomNotificacao = useCallback(async () => {
    if (!audioRef.current) {
      inicializarAudio();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const somAtivado = localStorage.getItem("somNotificacao") !== "false";
    if (!somAtivado) {
      return;
    }

    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.3;

      await audio.play();
    } catch (erro) {
      console.error("Erro ao reproduzir som:", erro);

      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch (fallbackError) {
          console.error("Erro no fallback também:", fallbackError);
        }
      }
    }
  }, [inicializarAudio, audioInicializado]);

  const verificarNotificacoes = useCallback(async (idUsuario: string) => {
    try {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${idUsuario}`);
      const notificacoes: NotificacaoI[] = await resposta.json();

      const notificacoesFiltradas = notificacoes.filter(n => {
        if (!n.empresaId) {
          return n.usuarioId === idUsuario;
        }
        return true;
      });

      const notificacoesNaoLidas = notificacoesFiltradas.filter((n: NotificacaoI) => {
        if (n.empresaId) {
          return !n.NotificacaoLida || n.NotificacaoLida.length === 0 ||
            !n.NotificacaoLida.some(nl => nl.usuarioId === idUsuario);
        }
        return !n.lida;
      });

      notificacoesNaoLidasRef.current = notificacoesNaoLidas;
      setTemNotificacaoNaoLida(notificacoesNaoLidas.length > 0);

      const todasOrdenadas = [...notificacoes].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const notificacaoMaisRecente = todasOrdenadas[0];

      if (!notificacaoMaisRecente) return;
      const ultimaIdSom = localStorage.getItem(`ultimaNotificacaoSom_${idUsuario}`);
      if (ultimaIdSom !== notificacaoMaisRecente.id) {

        setTimeout(async () => {
          await tocarSomNotificacao();
          localStorage.setItem(`ultimaNotificacaoSom_${idUsuario}`, notificacaoMaisRecente.id);
        }, 300);
      }
    } catch (erro) {
      console.error("Erro ao verificar notificações:", erro);
    }
  }, [tocarSomNotificacao, ultimaVerificacao]);


  useEffect(() => {
    const carregarPermissoes = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (usuarioSalvo) {
        const usuarioId = usuarioSalvo.replace(/"/g, "");

        const permissoesParaVerificar = [
          "usuarios_visualizar",
          "produtos_visualizar",
          "vendas_visualizar",
          "clientes_visualizar",
          "fornecedores_visualizar",
          "logs_visualizar",
          "exportar_dados",
          "inventario_visualizar"
        ];

        const permissoes: Record<string, boolean> = {};
        for (const permissao of permissoesParaVerificar) {
          const temPermissao = await usuarioTemPermissao(usuarioId, permissao);
          permissoes[permissao] = temPermissao;
        }

        setPermissoesUsuario(permissoes);
      }
    };

    carregarPermissoes();
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;

      const usuarioId = usuarioSalvo.replace(/"/g, "");

      try {
        const respostaUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
        if (respostaUsuario.status === 200) {
          const dadosUsuario = await respostaUsuario.json();
          logar(dadosUsuario);
        }

        const respostaEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${usuarioId}`);
        if (respostaEmpresa.status === 200) {
          const dadosEmpresa = await respostaEmpresa.json();
          setFotoEmpresa(dadosEmpresa.foto);
          setNomeEmpresa(dadosEmpresa.nome);
          setPossuiEmpresa(true);

          if (dadosEmpresa.id) {
            await verificarAtivacaoEmpresa(dadosEmpresa.id);
          }
        } else {
          setPossuiEmpresa(false);
          setEmpresaAtivada(false);
        }

        await verificarNotificacoes(usuarioId);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        setPossuiEmpresa(false);
        setEmpresaAtivada(false);
      }
    };

    carregarDados();
  }, [logar, verificarNotificacoes, verificarAtivacaoEmpresa]);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("client_key");
    const usuarioId = usuarioSalvo?.replace(/"/g, "");

    if (usuarioId) {
      const idsSalvos = localStorage.getItem(`idsNotificacoesTocadas_${usuarioId}`);
      if (idsSalvos) {
        try {
          const idsArray = JSON.parse(idsSalvos);
          idsNotificacoesTocadasRef.current = new Set(idsArray);
        } catch (error) {
          console.error("Erro ao carregar IDs de notificações:", error);
          idsNotificacoesTocadasRef.current = new Set();
          localStorage.setItem(`idsNotificacoesTocadas_${usuarioId}`, JSON.stringify([]));
        }
      } else {
        idsNotificacoesTocadasRef.current = new Set();
        localStorage.setItem(`idsNotificacoesTocadas_${usuarioId}`, JSON.stringify([]));
      }

      const timestampSalvo = localStorage.getItem(`ultimaVerificacao_${usuarioId}`);
      if (timestampSalvo) {
        setUltimaVerificacao(Number(timestampSalvo));
      }
    }

    const intervaloEstoque = setInterval(verificarEstoque, 60 * 60 * 1000);
    verificarEstoque();

    async function carregarDados() {
      if (!usuarioId) return;

      try {
        const respostaUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
        if (respostaUsuario.status === 200) {
          const dadosUsuario = await respostaUsuario.json();
          logar(dadosUsuario);
        }

        const respostaEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${usuarioId}`);
        if (respostaEmpresa.status === 200) {
          const dadosEmpresa = await respostaEmpresa.json();
          setFotoEmpresa(dadosEmpresa.foto);
          setNomeEmpresa(dadosEmpresa.nome);
          setPossuiEmpresa(true);
        } else {
          setPossuiEmpresa(false);
        }

        await verificarNotificacoes(usuarioId);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
      }
    }

    carregarDados();

    const intervaloNotificacoes = setInterval(() => {
      if (usuarioId) verificarNotificacoes(usuarioId);
    }, 10000);

    return () => {
      clearInterval(intervaloEstoque);
      clearInterval(intervaloNotificacoes);
    };

  }, [logar, verificarNotificacoes]);

  const alternarSidebar = () => {
    inicializarAudio();
    setEstaAberto(!estaAberto);
  };

  const alternarNotificacoes = () => {
    inicializarAudio();
    setMostrarNotificacoes(!mostrarNotificacoes);

    if (!mostrarNotificacoes) {
      const usuarioSalvo = localStorage.getItem("client_key");
      const usuarioId = usuarioSalvo?.replace(/"/g, "");

      if (usuarioId && notificacoesNaoLidasRef.current.length > 0) {
        const novosIds = new Set(idsNotificacoesTocadasRef.current);
        notificacoesNaoLidasRef.current.forEach(notificacao => {
          novosIds.add(notificacao.id);
        });

        idsNotificacoesTocadasRef.current = novosIds;
        localStorage.setItem(`idsNotificacoesTocadas_${usuarioId}`, JSON.stringify(Array.from(novosIds)));
      }
    }
  };

  return (
    <>
      <></>
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-[#1976D2] p-3 rounded-full shadow-lg hover:bg-[#1565C0] transition-colors"
        onClick={alternarSidebar}
      >
        <FaBars />
      </button>
      <aside
        className={`sidebar-scrollbar fixed top-0 h-screen w-64 flex flex-col justify-between rounded-tr-2xl rounded-br-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:relative md:flex ${estaAberto ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: cores.azulEscuro,
          borderRight: `3px solid transparent`,
          backgroundImage: `linear-gradient(${cores.azulEscuro}, ${cores.azulEscuro}), 
                      linear-gradient(135deg, ${cores.azulBrilhante}, ${cores.azulNeon})`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
          boxShadow: "8px 0 20px rgba(0, 0, 0, 0.4)"
        }}
      >
        <div>
          <Link
            href="/"
            className="py-4 flex justify-center items-center gap-2 border-b"
            style={{
              backgroundColor: cores.azulEscuro,
              borderColor: cores.azulBrilhante,
              borderBottomWidth: "2px"
            }}
            onClick={() => setTimeout(() => window.location.reload(), 500)}
          >
            <Image src="/icone.png" alt="Logo" width={28} height={28} />
            <span className="hidden md:block text-white font-mono text-sm">StockControl</span>
          </Link>

          <nav className="flex flex-col items-start px-4 py-6 gap-3 text-white text-sm">
            <button
              onClick={alternarNotificacoes}
              className="relative flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C] text-white text-sm"
              style={{ backgroundColor: temNotificacaoNaoLida ? cores.azulBrilhante + "20" : "transparent" }}
            >
              <span className="text-lg relative">
                <FaBell />
                {temNotificacaoNaoLida && (
                  <>
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#00B4D8] animate-ping" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#00B4D8]" />
                  </>
                )}
              </span>
              <span className="text-sm md:inline cursor-pointer">{t("notifications")}</span>
            </button>
            <LinkSidebar href="/dashboard" icon={<FaFileAlt />} label={t("dashboard")} cores={cores} />
            {permissoesUsuario.logs_visualizar && (
              <LinkSidebar href="/logs" icon={<FaClipboardUser />} label={t("summary")} cores={cores} />
            )}
            {permissoesUsuario.produtos_visualizar && (
              <LinkSidebar href="/produtos" icon={<FaBoxOpen />} label={t("products")} cores={cores} />
            )}

            {permissoesUsuario.inventario_visualizar && (
              <LinkSidebar href="/inventario" icon={<FaHistory />} label={t("inventory")} cores={cores} />
            )}

            <LinkSidebar href="/vendas" icon={<FaCartShopping />} label={t("sells")} cores={cores} />

            {permissoesUsuario.clientes_visualizar && (
              <LinkSidebar href="/clientes" icon={<FaUsers />} label={t("clients")} cores={cores} />
            )}
            {permissoesUsuario.usuarios_visualizar && (
              <LinkSidebar href="/usuarios" icon={<FaUser />} label={t("users")} cores={cores} />
            )}
            {permissoesUsuario.fornecedores_visualizar && (
              <LinkSidebar href="/fornecedores" icon={<FaTruck />} label={t("suppliers")} cores={cores} />
            )}
            {permissoesUsuario.exportar_dados && (
              <LinkSidebar href="/exportacoes" icon={<FaFileExport />} label={t("exportacoes")} cores={cores} />
            )}
            <LinkSidebar href="/suporte" icon={<FaHeadset />} label={t("support")} cores={cores} />
            <LinkSidebar href="/configuracoes" icon={<FaWrench />} label={t("settings")} cores={cores} />
            <LinkSidebar href="/conta" icon={<FaUser />} label={t("account")} cores={cores} />

            <Link
              href="/empresa"
              className="flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C]"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden border" style={{ borderColor: cores.azulClaro, borderWidth: "1.8px", background: "#fff" }}>
                <Image
                  src={fotoEmpresa || "/contadefault.png"}
                  alt="Foto da Empresa"
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    minWidth: "100%",
                    minHeight: "100%",
                    background: "#fff",
                    padding: 0
                  }}
                  quality={100}
                  priority
                />
              </div>
              <span className="text-sm md:inline ml-1">{nomeEmpresa || t("create_company")}</span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-start px-4 pb-6 gap-4 text-white text-sm">
          <button
            onClick={alternarTema}
            className="flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C] text-white text-sm"
          >
            <span className="text-lg">
              {modoDark ? <FaMoon /> : <FaSun />}
            </span>
            <span className="text-sm md:inline cursor-pointer">
              {modoDark ? t("dark_mode") : t("light_mode")}
            </span>
          </button>

          {possuiEmpresa && !empresaAtivada && (
            <LinkSidebar href="/ativacao" icon={<FaCheckDouble />} label={t("activation")} cores={cores} />
          )}

          <button
            onClick={() => {
              localStorage.removeItem("client_key");
              const usuarioSalvo = localStorage.getItem("client_key");
              if (usuarioSalvo) {
                const usuarioId = usuarioSalvo.replace(/"/g, "");
                localStorage.removeItem(`idsNotificacoesTocadas_${usuarioId}`);
                localStorage.removeItem(`idsNotificacoesSom_${usuarioId}`);
                localStorage.removeItem(`ultimaNotificacaoSom_${usuarioId}`);
                localStorage.removeItem(`ultimaVerificacao_${usuarioId}`);
              }
              window.location.href = "/";
            }}
            className="flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C] text-white text-sm"
          >
            <span className="text-lg">
              <FaSignOutAlt />
            </span>
            <span className="text-sm md:inline cursor-pointer">{t("logout")}</span>
          </button>
        </div>
      </aside>

      {mostrarNotificacoes && (
        <PainelNotificacoes
          estaVisivel={mostrarNotificacoes}
          aoFechar={() => setMostrarNotificacoes(false)}
          nomeEmpresa={nomeEmpresa}
          cores={cores}
          onMarcarTodasComoLidas={() => {
            const usuarioSalvo = localStorage.getItem("client_key");
            const usuarioId = usuarioSalvo?.replace(/"/g, "");
            if (usuarioId) {
              limparNotificacoesLidas(usuarioId);
            }
          }}
        />
      )}
    </>
  );
}

function LinkSidebar({ href, icon, label, cores }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  cores: {
    azulEscuro: string;
    azulMedio: string;
    azulClaro: string;
    azulBrilhante: string;
    azulNeon: string;
    cinzaEscuro: string;
  };
}) {

  return (
    <Link
      href={href}
      className="flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C]"
    >
      <span className="text-lg" style={{ color: cores.azulNeon }}>{icon}</span>
      <span className="text-sm md:inline">{label}</span>
    </Link>
  );
}

function PainelNotificacoes({ estaVisivel, aoFechar, nomeEmpresa, cores, onMarcarTodasComoLidas }: {
  estaVisivel: boolean;
  aoFechar: () => void;
  nomeEmpresa: string | null;
  cores: {
    azulEscuro: string;
    azulMedio: string;
    azulClaro: string;
    azulBrilhante: string;
    azulNeon: string;
    cinzaEscuro: string;
  };
  onMarcarTodasComoLidas: () => void;
}) {

  const [modoDark, setModoDark] = useState(false);
  const { t } = useTranslation("sidebar");
  const panelRef = useRef<HTMLDivElement>(null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoI[]>([]);
  const [mostrarLidas, setMostrarLidas] = useState(false);
  const { usuario } = useUsuarioStore();

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    if (!usuario?.id) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/marcar-lidas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id }),
      });

      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacoes-lidas/marcar-todas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id }),
      });

      if (!resposta.ok) {
        throw new Error('Falha ao marcar notificações como lidas');
      }

      const notificacoesAtualizadas = await buscarNotificacoes();
      setNotificacoes(notificacoesAtualizadas);

      onMarcarTodasComoLidas();

    } catch (erro) {
      console.error("Erro ao marcar notificações como lidas:", erro);
    }
  }, [usuario?.id, onMarcarTodasComoLidas]);

  const alternarMostrarLidas = useCallback(() => {
    setMostrarLidas(!mostrarLidas);
  }, [mostrarLidas]);

  const buscarNotificacoes = useCallback(async (): Promise<NotificacaoI[]> => {
    if (!usuario?.id) return [];

    try {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${usuario.id}`);
      const todasNotificacoes: NotificacaoI[] = await resposta.json();

      const notificacoesFiltradas = todasNotificacoes.filter(n => {
        if (!n.empresaId) {
          return n.usuarioId === usuario.id;
        }
        return true;
      });

      const notificacoesComStatus = notificacoesFiltradas.map(n => ({
        ...n,
        lida: n.empresaId
          ? n.NotificacaoLida?.some(nl => nl.usuarioId === usuario.id) || false
          : n.lida
      }));

      notificacoesComStatus.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const notificacoesResultado = notificacoesComStatus.filter(n => {
        if (mostrarLidas) {
          return n.lida;
        } else {
          return !n.lida;
        }
      });

      return mostrarLidas ? notificacoesResultado.slice(0, 15) : notificacoesResultado;

    } catch (erro) {
      console.error("Erro ao buscar as notificações:", erro);
      return [];
    }
  }, [usuario?.id, mostrarLidas]);

  useEffect(() => {
    async function carregarNotificacoes() {
      const notificacoes = await buscarNotificacoes();
      setNotificacoes(notificacoes);
    }

    if (estaVisivel) {
      carregarNotificacoes();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        aoFechar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [estaVisivel, usuario, mostrarLidas, aoFechar, buscarNotificacoes]);


  const responderConvite = useCallback(async (id: string, convite: ConviteI) => {
    const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/convite/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ empresaId: convite.empresaId }),
    });

    if (resposta.ok) {
      window.location.href = "/empresa";
    }
  }, []);

  const deletarNotificacao = useCallback(async (id: string) => {
    if (!usuario?.id) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${id}?usuarioId=${usuario.id}`, {
        method: "DELETE"
      });

      setNotificacoes(prev => prev.filter(n => n.id !== id));
    } catch (erro) {
      console.error("Erro ao deletar notificação:", erro);
    }
  }, [usuario?.id]);

  const formatarData = (dataString: string | Date) => {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const bgColor = modoDark ? "#0F1E35" : "#FFFFFF";
  const textColor = modoDark ? "#FFFFFF" : "#000000";
  const closeButtonColor = modoDark ? "#FFFFFF" : "#6B7280";
  const borderColor = modoDark ? "#1E4976" : cores.azulBrilhante;

  const tabelaNotificacoes = notificacoes.map((notificacao) => {
    const estaLida = notificacao.empresaId
      ? notificacao.NotificacaoLida?.some(nl => nl.usuarioId === usuario?.id)
      : notificacao.lida;

    if (notificacao.convite) {
      return (
        <div
          key={notificacao.id}
          className="flex flex-col gap-2 p-4 rounded-lg mb-2"
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            color: textColor
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">{t("invite_title")}</h3>
            <button onClick={() => deletarNotificacao(notificacao.id)} className={`hover:text-[#00B4D8]`} style={{ color: closeButtonColor }}>
              ✕
            </button>
          </div>

          <p>
            {t("invite_description")} {notificacao.convite?.empresa?.nome || t("unknown_company")}.
          </p>

          <div className="flex justify-between items-center text-xs" style={{ color: cores.azulBrilhante }}>
            <span>
              {t("from")}: {notificacao.convite?.empresa?.nome || t("unknown_company")}
            </span>
            <span>{formatarData(notificacao.createdAt)}</span>
          </div>

          <button
            className="py-2 px-4 rounded-lg mt-2 transition-colors"
            style={{
              backgroundColor: cores.azulBrilhante,
              color: "white"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = cores.azulNeon}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = cores.azulBrilhante}
            onClick={() => notificacao.convite && responderConvite(usuario?.id || "", notificacao.convite)}
          >
            {t("accept")}
          </button>
        </div>
      );
    }

    const descricao = notificacao.descricao;
    const partesDescricao = descricao.split(": ");
    const nomeRemetente = partesDescricao[0]?.replace("Enviado por", "").trim() || "Desconhecido";
    const mensagem = partesDescricao.slice(1).join(": ").trim();

    return (
      <div
        key={notificacao.id}
        className="flex flex-col gap-2 p-4 rounded-lg mb-2"
        style={{
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          color: textColor
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{notificacao.titulo}</h3>
          {!notificacao.empresaId && (
            <button onClick={() => deletarNotificacao(notificacao.id)} className={`hover:text-[#00B4D8]`} style={{ color: closeButtonColor }}>
              ✕
            </button>
          )}
        </div>

        <p>{mensagem}</p>

        <div className="flex flex-col text-xs mt-2 gap-1" style={{ color: cores.azulBrilhante }}>
          <span>
            {t("from")}: {nomeRemetente}
          </span>
          <span>
            {t("Data")}: {formatarData(notificacao.createdAt)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs flex items-center gap-1">
            {estaLida ? <FaCheck color={cores.azulBrilhante} /> : <FaCheckDouble color={cores.azulNeon} />}
            {estaLida ? t("read") : t("unread")}
          </span>
        </div>
      </div>
    );
  });

  return (
    <div
      ref={panelRef}
      className={`fixed w-80 p-4 shadow-lg rounded-b-xl transition-all duration-300 z-50 ${estaVisivel ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      style={{
        backgroundColor: bgColor,
        borderTop: `2px solid ${cores.azulBrilhante}`,
        boxShadow: modoDark ? "0 4px 25px rgba(25, 118, 210, 0.25)" : "0 4px 20px rgba(0, 0, 0, 0.2)",
        color: textColor
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{t("notifications")}</h2>
        <div className="flex gap-2">
          {!mostrarLidas && (
            <button
              onClick={marcarTodasComoLidas}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{
                backgroundColor: cores.azulBrilhante,
                color: "white"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = cores.azulNeon}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = cores.azulBrilhante}
            >
              {t("marcarLidas")}
            </button>
          )}
          <button
            onClick={alternarMostrarLidas}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{
              backgroundColor: cores.azulBrilhante,
              color: "white"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = cores.azulNeon}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = cores.azulBrilhante}
          >
            {mostrarLidas ? t("mostrarTodas") : t("mostrarLidas")}
          </button>
          <button
            onClick={aoFechar}
            className={`hover:text-[#00B4D8] transition-colors`}
            style={{ color: closeButtonColor }}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
        {mostrarLidas && (
          <div className="text-center py-2 italic text-xs" style={{ color: cores.azulBrilhante }}>
            {t("empresa_nao_pode_ser_deletada", { nomeEmpresa })}
          </div>
        )}
        {notificacoes.length > 0 ? (
          tabelaNotificacoes
        ) : (
          <p className="text-center py-4" style={{ color: cores.azulBrilhante }}>
            {mostrarLidas ? t("semNotificacoesLidas") : t("NenhumaNotificacao")}
          </p>
        )}
      </div>
    </div>
  );
}