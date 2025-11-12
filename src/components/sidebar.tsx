"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaBars, FaBell, FaFileExport, FaBoxOpen, FaFileAlt, FaUser, FaHeadset, FaWrench, FaSignOutAlt, FaTruck, FaCheck, FaCheckDouble, FaHistory, FaMoon, FaSun, FaBook, FaClipboardList, FaTimes } from "react-icons/fa";
import { FaCartShopping, FaClipboardUser, FaUsers } from "react-icons/fa6";
import { NotificacaoI } from "@/utils/types/notificacao";
import { useUsuarioStore } from "@/context/usuario";
import { ConviteI } from "@/utils/types/convite";
import { useTranslation } from "react-i18next";
import { usuarioTemPermissao } from "@/utils/permissoes";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

const permissoesCache = new Map<string, { permissoes: Record<string, boolean>; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

const somNotificacaoCache = {
  ultimoSomTocado: 0,
  timeoutId: null as NodeJS.Timeout | null,
  BLOQUEIO_SOM_MS: 60000,
};

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
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const notificacoesNaoLidasRef = useRef<NotificacaoI[]>([]);
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [modoDark, setModoDark] = useState(false);
  const [usuarioInteragiu, setUsuarioInteragiu] = useState(false);
  const [permissoesCarregadas, setPermissoesCarregadas] = useState(false);
  const pathname = usePathname();

  const cores = {
    dark: {
      fundo: "#0A1929",
      texto: "#FFFFFF",
      card: "#0A2A4F",
      borda: "#1E4976",
      primario: "#1976D2",
      secundario: "#00B4D8",
      placeholder: "#9CA3AF",
      hover: "#1E4976",
      sucesso: "#22C55E",
      erro: "#EF4444",
      alerta: "#F59E0B",
      active: "#3B82F6",
    },
    light: {
      fundo: "#f8fafc", 
      texto: "#0F172A",
      card: "#EDEBEB", 
      borda: "#e2e8f0",
      primario: "#1976D2",
      secundario: "#0284C7",
      placeholder: "#6B7280",
      hover: "#f1f5f9", 
      sucesso: "#22C55E",
      erro: "#EF4444",
      alerta: "#F59E0B",
      active: "#3B82F6",
    },
  };

  const temaAtual = modoDark ? cores.dark : cores.light;

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const tocarSomNotificacaoUnica = useCallback(async () => {
    if (!usuarioId || !usuarioInteragiu) {
      return false;
    }

    const somAtivado = localStorage.getItem("somNotificacao") !== "false";
    if (!somAtivado) {
      return false;
    }

    const agora = Date.now();
    const tempoDesdeUltimoSom = agora - somNotificacaoCache.ultimoSomTocado;

    if (tempoDesdeUltimoSom < somNotificacaoCache.BLOQUEIO_SOM_MS) {
      return false;
    }

    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.3;

      const somTocado = await new Promise<boolean>(async (resolve) => {
        try {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
            resolve(true);
          } else {
            resolve(true);
          }
        } catch {
          resolve(false);
        }
      });

      if (somTocado) {
        somNotificacaoCache.ultimoSomTocado = agora;

        if (somNotificacaoCache.timeoutId) {
          clearTimeout(somNotificacaoCache.timeoutId);
        }

        somNotificacaoCache.timeoutId = setTimeout(() => {
          somNotificacaoCache.ultimoSomTocado = 0;
        }, somNotificacaoCache.BLOQUEIO_SOM_MS);

        return true;
      }
    } catch (error) {
      console.error("Erro ao tocar som:", error);
    }

    return false;
  }, [usuarioId, usuarioInteragiu]);

  const carregarPermissoesOtimizado = useCallback(async (userId: string): Promise<Record<string, boolean>> => {
    const cacheKey = `permissoes_${userId}`;
    const cached = permissoesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.permissoes;
    }

    try {
      const permissoesParaVerificar = [
        "usuarios_visualizar", "produtos_visualizar", "vendas_visualizar",
        "clientes_visualizar", "fornecedores_visualizar", "logs_visualizar",
        "exportar_dados", "inventario_visualizar", "pedidos_visualizar",
        "pedidos_criar"
      ];

      const promises = permissoesParaVerificar.map(async (permissao) => {
        try {
          const temPermissao = await usuarioTemPermissao(userId, permissao);
          return { permissao, temPermissao };
        } catch {
          return { permissao, temPermissao: false };
        }
      });

      const resultados = await Promise.all(promises);

      const permissoes: Record<string, boolean> = {};
      resultados.forEach(({ permissao, temPermissao }) => {
        permissoes[permissao] = temPermissao;
      });

      permissoesCache.set(cacheKey, {
        permissoes,
        timestamp: Date.now()
      });

      return permissoes;
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      return {};
    }
  }, []);

  useEffect(() => {
    const carregarUsuarioId = () => {
      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (usuarioSalvo) {
          const id = usuarioSalvo.replace(/"/g, "");
          setUsuarioId(id);
          return id;
        }
      } catch (error) {
        console.error("Erro ao carregar ID do usuário:", error);
      }
      return null;
    };

    const id = carregarUsuarioId();
    if (id) {
      setUsuarioId(id);

      carregarPermissoesOtimizado(id).then(permissoes => {
        setPermissoesUsuario(permissoes);
        setPermissoesCarregadas(true);
      }).catch(error => {
        console.error("Erro ao carregar permissões:", error);
        setPermissoesCarregadas(true);
      });
    }
  }, [carregarPermissoesOtimizado]);

  useEffect(() => {
    const handleInteracao = () => {
      setUsuarioInteragiu(true);
      document.removeEventListener("click", handleInteracao);
      document.removeEventListener("keydown", handleInteracao);
    };

    document.addEventListener("click", handleInteracao);
    document.addEventListener("keydown", handleInteracao);

    return () => {
      document.removeEventListener("click", handleInteracao);
      document.removeEventListener("keydown", handleInteracao);
    };
  }, []);

  const alternarTema = () => {
    if (
      typeof window !== "undefined" &&
      (window as Window & typeof globalThis).alternarTemaGlobal
    ) {
      (window as Window & typeof globalThis).alternarTemaGlobal!();
    }
  };

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);

    const handleThemeChange = (e: CustomEvent) => {
      setModoDark(e.detail.modoDark);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

  const verificarAtivacaoEmpresa = useCallback(async (empresaId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar dados da empresa");
      }
      const empresaData = await response.json();

      const ativada = empresaData.ChaveAtivacao !== null && empresaData.ChaveAtivacao !== undefined;
      setEmpresaAtivada(ativada);
      return ativada;
    } catch {
      setEmpresaAtivada(false);
      return false;
    }
  }, []);

  const verificarNotificacoes = useCallback(async () => {
    if (!usuarioId) return;

    try {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${usuarioId}`);
      if (!resposta.ok) {
        throw new Error("Erro ao buscar notificações");
      }

      const notificacoes: NotificacaoI[] = await resposta.json();

      const notificacoesNaoLidas = notificacoes.filter((n: NotificacaoI) => !n.lida);

      const notificacoesAnteriores = notificacoesNaoLidasRef.current;
      const novasNotificacoes = notificacoesNaoLidas.filter(
        novaNot => !notificacoesAnteriores.some(antigaNot => antigaNot.id === novaNot.id)
      );

      notificacoesNaoLidasRef.current = notificacoesNaoLidas;
      setTemNotificacaoNaoLida(notificacoesNaoLidas.length > 0);

      if (usuarioInteragiu && novasNotificacoes.length > 0) {
        await tocarSomNotificacaoUnica();
      }
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
    }
  }, [usuarioId, tocarSomNotificacaoUnica, usuarioInteragiu]);

  const carregarDadosUsuario = useCallback(async () => {
    if (!usuarioId) return;

    try {
      const respostaUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      if (respostaUsuario.status === 200) {
        const dadosUsuario = await respostaUsuario.json();
        logar(dadosUsuario);
      }

      const respostaEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${usuarioId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (respostaEmpresa.status === 200) {
        const dadosEmpresa = await respostaEmpresa.json();
        setFotoEmpresa(dadosEmpresa.foto || "/contadefault.png");
        setNomeEmpresa(dadosEmpresa.nome);
        setPossuiEmpresa(true);

        if (dadosEmpresa.id) {
          await verificarAtivacaoEmpresa(dadosEmpresa.id);
        }
      } else {
        setPossuiEmpresa(false);
        setEmpresaAtivada(false);
        setFotoEmpresa("/contadefault.png");
        setNomeEmpresa(t("create_company"));
      }

      await verificarNotificacoes();
    } catch {
      setPossuiEmpresa(false);
      setEmpresaAtivada(false);
      setFotoEmpresa("/contadefault.png");
      setNomeEmpresa(t("create_company"));
    }
  }, [usuarioId, logar, verificarNotificacoes, verificarAtivacaoEmpresa, t]);

  useEffect(() => {
    if (!usuarioId) return;

    const carregarTudo = async () => {
      await carregarDadosUsuario();
    };

    carregarTudo();
  }, [usuarioId, carregarDadosUsuario]);

  useEffect(() => {
    if (!usuarioId) return;

    const intervaloNotificacoes = setInterval(() => {
      verificarNotificacoes();
    }, 15000);

    verificarNotificacoes();

    return () => {
      clearInterval(intervaloNotificacoes);
    };
  }, [usuarioId, verificarNotificacoes]);

  const alternarSidebar = () => {
    setEstaAberto(!estaAberto);
  };

  const alternarNotificacoes = () => {
    setMostrarNotificacoes(!mostrarNotificacoes);
  };

  const renderizarLinksComPermissao = () => {
    if (!permissoesCarregadas) {
      return (
        <>
          <SkeletonLink />
          <SkeletonLink />
          <SkeletonLink />
          <SkeletonLink />
          <SkeletonLink />
        </>
      );
    }

    const handleLinkClick = () => {
      setEstaAberto(false);
    };

    return (
      <>
        <LinkSidebar href="/dashboard" icon={<FaFileAlt />} label={t("dashboard")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/dashboard")} />
        {permissoesUsuario.logs_visualizar && <LinkSidebar href="/logs" icon={<FaClipboardUser />} label={t("summary")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/logs")} />}
        {permissoesUsuario.produtos_visualizar && <LinkSidebar href="/produtos" icon={<FaBoxOpen />} label={t("products")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/produtos")} />}
        {permissoesUsuario.inventario_visualizar && <LinkSidebar href="/movimentacoes" icon={<FaHistory />} label={t("inventory")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/movimentacoes")} />}
        {permissoesUsuario.pedidos_visualizar && <LinkSidebar href="/pedidos" icon={<FaClipboardList />} label={t("orders")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/pedidos")} />}
        {permissoesUsuario.vendas_visualizar && <LinkSidebar href="/vendas" icon={<FaCartShopping />} label={t("sells")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/vendas")} />}
        {permissoesUsuario.clientes_visualizar && <LinkSidebar href="/clientes" icon={<FaUsers />} label={t("clients")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/clientes")} />}
        {permissoesUsuario.usuarios_visualizar && <LinkSidebar href="/usuarios" icon={<FaUser />} label={t("users")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/usuarios")} />}
        {permissoesUsuario.fornecedores_visualizar && <LinkSidebar href="/fornecedores" icon={<FaTruck />} label={t("suppliers")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/fornecedores")} />}
        {permissoesUsuario.exportar_dados && <LinkSidebar href="/exportacoes" icon={<FaFileExport />} label={t("exports")} temaAtual={temaAtual} onLinkClick={handleLinkClick} isActive={isLinkActive("/exportacoes")} />}
      </>
    );
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
        style={{
          background: modoDark ? "linear-gradient(135deg, #3B82F6, #0EA5E9)" : "linear-gradient(135deg, #1976D2, #0284C7)",
          color: "#FFFFFF",
        }}
        onClick={alternarSidebar}
      >
        <FaBars />
      </button>

      <aside
        className={`sidebar-scrollbar fixed top-0 h-screen w-64 flex flex-col justify-between rounded-tr-2xl rounded-br-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:relative md:flex ${estaAberto ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: temaAtual.fundo,
          borderRight: `1px solid ${temaAtual.borda}`,
          boxShadow: modoDark ? "8px 0 20px rgba(0, 0, 0, 0.4)" : "8px 0 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div>
          <Link
            href="/"
            className="py-4 flex justify-center items-center gap-2 border-b no-underline"
            style={{
              backgroundColor: modoDark ? temaAtual.card : "#e4ecf4",
              borderColor: temaAtual.borda,
              textDecoration: 'none',
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Image
                className="object-contain filter brightness-0 invert"
                src="/icone.png"
                alt="Logo"
                width={20}
                height={20}
              />
            </div>
            <span className="hidden md:block font-semibold text-sm" style={{ color: temaAtual.texto }}>
              StockControl
            </span>
          </Link>

          <nav className="flex flex-col items-start px-4 py-6 gap-2 text-sm">
            <button
              onClick={alternarNotificacoes}
              className="relative cursor-pointer flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: temNotificacaoNaoLida ? temaAtual.primario + "20" : "transparent",
                color: temaAtual.texto,
              }}
            >
              <span className="text-lg relative">
                <FaBell />
                {temNotificacaoNaoLida && (
                  <>
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-500" />
                  </>
                )}
              </span>
              <span className="text-sm md:inline cursor-pointer">{t("notifications")}</span>
            </button>

            {renderizarLinksComPermissao()}

            <LinkSidebar href="/suporte" icon={<FaHeadset />} label={t("support")} temaAtual={temaAtual} onLinkClick={() => setEstaAberto(false)} isActive={isLinkActive("/suporte")} />
            <LinkSidebar href="/configuracoes" icon={<FaWrench />} label={t("settings")} temaAtual={temaAtual} onLinkClick={() => setEstaAberto(false)} isActive={isLinkActive("/configuracoes")} />
            <LinkSidebar href="/conta" icon={<FaUser />} label={t("account")} temaAtual={temaAtual} onLinkClick={() => setEstaAberto(false)} isActive={isLinkActive("/conta")} />

            <Link
              href="/empresa"
              className="flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 no-underline"
              style={{
                color: temaAtual.texto,
                backgroundColor: isLinkActive("/empresa") ? temaAtual.active + "20" : "transparent",
                textDecoration: 'none',
              }}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setEstaAberto(false);
                }
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2"
                style={{
                  borderColor: temaAtual.primario,
                  background: temaAtual.card
                }}
              >
                <Image
                  src={fotoEmpresa || "/contadefault.png"}
                  alt={t("company_photo")}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-sm md:inline font-medium">
                {nomeEmpresa || t("create_company")}
              </span>
            </Link>

            <LinkSidebar href="/ajuda" icon={<FaBook />} label={t("help_center")} temaAtual={temaAtual} onLinkClick={() => setEstaAberto(false)} isActive={isLinkActive("/ajuda")} />
          </nav>
        </div>

        <div className="flex flex-col items-start px-4 pb-6 gap-3 text-sm">
          <button
            onClick={alternarTema}
            className="flex cursor-pointer items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{ color: temaAtual.texto }}
          >
            <span className="text-lg">
              {modoDark ? <FaMoon className="text-blue-400" /> : <FaSun className="text-yellow-500" />}
            </span>
            <span className="text-sm md:inline cursor-pointer">
              {modoDark ? t("dark_mode") : t("light_mode")}
            </span>
          </button>

          {possuiEmpresa && !empresaAtivada && (
            <LinkSidebar
              href="/ativacao"
              icon={<FaCheckDouble />}
              label={t("activation")}
              temaAtual={temaAtual}
              onLinkClick={() => setEstaAberto(false)}
              isActive={isLinkActive("/ativacao")}
            />
          )}

          <button
            onClick={() => {
              permissoesCache.clear();
              localStorage.removeItem("client_key");
              Cookies.remove("token");
              window.location.href = "/";
            }}
            className="flex cursor-pointer items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{ color: temaAtual.erro }}
          >
            <span className="text-lg">
              <FaSignOutAlt />
            </span>
            <span className="text-sm md:inline cursor-pointer">{t("logout")}</span>
          </button>
        </div>
      </aside>

      {mostrarNotificacoes && usuarioId && (
        <PainelNotificacoes
          estaVisivel={mostrarNotificacoes}
          aoFechar={() => setMostrarNotificacoes(false)}
          nomeEmpresa={nomeEmpresa}
          temaAtual={temaAtual}
          usuarioId={usuarioId}
          onNotificacoesAtualizadas={verificarNotificacoes}
          permissoesUsuario={permissoesUsuario}
        />
      )}
    </>
  );
}

function SkeletonLink() {
  return (
    <div className="flex items-center w-full gap-3 px-3 py-2 rounded-lg animate-pulse">
      <div className="w-5 h-5 bg-gray-600 rounded"></div>
      <div className="h-4 bg-gray-600 rounded flex-1"></div>
    </div>
  );
}

function LinkSidebar({
  href,
  icon,
  label,
  temaAtual,
  onLinkClick,
  isActive = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  temaAtual: {
    fundo: string;
    texto: string;
    card: string;
    borda: string;
    primario: string;
    secundario: string;
    placeholder: string;
    hover: string;
    sucesso: string;
    erro: string;
    alerta: string;
    active: string;
  };
  onLinkClick?: () => void;
  isActive?: boolean;
}) {
  const handleClick = () => {
    if (window.innerWidth < 768 && onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <Link
      href={href}
      className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 no-underline ${isActive ? 'font-semibold' : ''
        }`}
      style={{
        color: temaAtual.texto,
        backgroundColor: isActive ? temaAtual.active + "40" : "transparent",
        textDecoration: 'none',
      }}
      onClick={handleClick}
    >
      <span className="text-lg" style={{ color: isActive ? temaAtual.active : temaAtual.primario }}>
        {icon}
      </span>
      <span className="text-sm md:inline">{label}</span>
    </Link>
  );
}


function PainelNotificacoes({
  estaVisivel,
  aoFechar,
  nomeEmpresa,
  temaAtual,
  usuarioId,
  onNotificacoesAtualizadas,
  permissoesUsuario,
}: {
  estaVisivel: boolean;
  aoFechar: () => void;
  nomeEmpresa: string | null;
  temaAtual: {
    fundo: string;
    texto: string;
    card: string;
    borda: string;
    primario: string;
    secundario: string;
    placeholder: string;
    hover: string;
    sucesso: string;
    erro: string;
    alerta: string;
    active: string;
  };
  usuarioId: string;
  onNotificacoesAtualizadas: () => void;
  permissoesUsuario: Record<string, boolean>;
}) {
  const { t, i18n } = useTranslation("sidebar");
  const panelRef = useRef<HTMLDivElement>(null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoI[]>([]);
  const [mostrarLidas, setMostrarLidas] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (estaVisivel) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [estaVisivel]);

  const traduzirNotificacao = (notificacao: NotificacaoI) => {
    const idioma = i18n.language;

    if (idioma === "en") {
      const descricaoTraduzida = notificacao.descricao
        .replace(/O produto (.+?) está com estoque próximo do limite/, "Product $1 is running low on stock")
        .replace(/unidades restantes/, "units remaining")
        .replace(/QTD Min:/, "Min Qty:")
        .replace(/está com estoque CRÍTICO/, "has CRITICAL stock level")
        .replace(/É necessário repor urgentemente!/, "Urgent restocking required!")
        .replace(/está com estoque ZERADO/, "is OUT OF STOCK")
        .replace(/Reposição IMEDIATA necessária!/, "IMMEDIATE restocking required!")
        .replace(/Alerta para o produto/, "Alert for product");

      if (notificacao.titulo.includes("Alerta de Estoque")) {
        return { ...notificacao, titulo: "Stock Alert", descricao: descricaoTraduzida };
      }
      if (notificacao.titulo.includes("Estoque Crítico")) {
        return { ...notificacao, titulo: "Critical Stock", descricao: descricaoTraduzida };
      }
      if (notificacao.titulo.includes("Estoque Zerado")) {
        return { ...notificacao, titulo: "Out of Stock", descricao: descricaoTraduzida };
      }

      return { ...notificacao, descricao: descricaoTraduzida };
    }

    return notificacao;
  };

  const extrairProdutoIdDaNotificacao = (notificacao: NotificacaoI): number | null => {
    try {
      const descricao = notificacao.descricao;

      const idMatch1 = descricao.match(/Produto ID:\s*(\d+)/i);
      if (idMatch1 && idMatch1[1]) {
        return parseInt(idMatch1[1]);
      }

      const todosNumeros = descricao.match(/\d+/g);
      if (todosNumeros && todosNumeros.length > 0) {
        for (const numeroStr of todosNumeros) {
          const numero = parseInt(numeroStr);
          if (numero > 0 && numero < 100000) {
            return numero;
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleFazerPedido = (notificacao: NotificacaoI) => {
    const produtoId = extrairProdutoIdDaNotificacao(notificacao);

    if (produtoId) {
      aoFechar();
      router.push(`/pedidos?produto=${produtoId}&abrirModal=true`);
    } else {
      const primeiraLinha = notificacao.descricao.split("\n")[0];
      const palavras = primeiraLinha.split(" ");
      const possivelNomeProduto = palavras.slice(2, -2).join(" ");

      aoFechar();
      router.push("/pedidos?abrirModal=true");

      setTimeout(() => {
        alert(`Redirecionando para pedidos. Produto: ${possivelNomeProduto || "Não identificado"}`);
      }, 1000);
    }
  };

  const marcarTodasComoLidas = useCallback(async () => {
    if (!usuarioId) return;

    const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/marcar-todas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId }),
    });

    if (!resposta.ok) {
      throw new Error("Falha ao marcar notificações como lidas");
    }

    const notificacoesAtualizadas = await buscarNotificacoes();
    setNotificacoes(notificacoesAtualizadas);

    onNotificacoesAtualizadas();
  }, [usuarioId, onNotificacoesAtualizadas]);

  const alternarMostrarLidas = useCallback(() => {
    setMostrarLidas(!mostrarLidas);
  }, [mostrarLidas]);

  const buscarNotificacoes = useCallback(async (): Promise<NotificacaoI[]> => {
    if (!usuarioId) return [];

    try {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${usuarioId}`);

      if (!resposta.ok) {
        throw new Error("Erro ao buscar notificações");
      }

      const todasNotificacoes: NotificacaoI[] = await resposta.json();

      const notificacoesFiltradas = todasNotificacoes.filter((n) => {
        if (mostrarLidas) {
          return n.lida;
        } else {
          return !n.lida;
        }
      });

      notificacoesFiltradas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return mostrarLidas ? notificacoesFiltradas.slice(0, 15) : notificacoesFiltradas;
    } catch {
      return [];
    }
  }, [usuarioId, mostrarLidas]);

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
  }, [estaVisivel, usuarioId, mostrarLidas, aoFechar, buscarNotificacoes]);

  const responderConvite = useCallback(
    async (convite: ConviteI) => {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/convite/${usuarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ empresaId: convite.empresaId }),
      });

      if (resposta.ok) {
        window.location.href = "/empresa";
      }
    },
    [usuarioId]
  );

  const deletarNotificacao = useCallback(
    async (id: string) => {
      if (!usuarioId) return;

      try {
        await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${id}?usuarioId=${usuarioId}`, {
          method: "DELETE",
        });

        setNotificacoes((prev) => prev.filter((n) => n.id !== id));
        onNotificacoesAtualizadas();
      } catch { }
    },
    [usuarioId, onNotificacoesAtualizadas]
  );

  const formatarData = (dataString: string | Date) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutos < 1) return t("agora");
    if (diffMinutos < 60) return `${diffMinutos}${t("min")}`;
    if (diffHoras < 24) return `${diffHoras}${t("h")}`;
    if (diffDias === 1) return t("ontem");
    if (diffDias < 7) return `${diffDias}${t("d")}`;

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getEmojiPorTipo = (titulo: string) => {
    if (titulo.includes("Crítico") || titulo.includes("CRÍTICO") || titulo.includes("Critical")) {
      return "🔴";
    } else if (titulo.includes("Alerta") || titulo.includes("ALERTA") || titulo.includes("Alert")) {
      return "🟡";
    } else if (titulo.includes("Zerado") || titulo.includes("ZERADO") || titulo.includes("Out of Stock")) {
      return "⚫";
    }
    return "ℹ️";
  };

  const getCorPorTipo = (titulo: string) => {
    if (titulo.includes("Crítico") || titulo.includes("CRÍTICO") || titulo.includes("Critical")) {
      return temaAtual.erro;
    } else if (titulo.includes("Alerta") || titulo.includes("ALERTA") || titulo.includes("Alert")) {
      return temaAtual.alerta;
    } else if (titulo.includes("Zerado") || titulo.includes("ZERADO") || titulo.includes("Out of Stock")) {
      return "#6B7280";
    }
    return temaAtual.primario;
  };

  const NotificacaoItem = ({ notificacao, index }: { notificacao: NotificacaoI; index: number }) => {
    const notificacaoTraduzida = traduzirNotificacao(notificacao);

    if (notificacao.convite) {
      return (
        <div
          className={`p-4 rounded-xl mb-3 border-l-4 transform transition-all duration-300 hover:scale-[1.02] ${isAnimating ? 'animate-slide-in' : ''
            }`}
          style={{
            animationDelay: `${index * 100}ms`,
            background: `linear-gradient(135deg, ${temaAtual.card} 0%, ${temaAtual.hover}20 100%)`,
            borderLeftColor: temaAtual.sucesso,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: temaAtual.texto }}>
                  {t("invite_title")}
                </h3>
                <p className="text-xs opacity-80" style={{ color: temaAtual.texto }}>
                  {t("invite_description")} {notificacao.convite?.empresa?.nome || t("unknown_company")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs opacity-70" style={{ color: temaAtual.texto }}>
              {formatarData(notificacao.createdAt)}
            </span>
            <button
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "white",
              }}
              onClick={() => notificacao.convite && responderConvite(notificacao.convite)}
            >
              {t("accept")}
            </button>
          </div>
        </div>
      );
    }

    const descricao = notificacaoTraduzida.descricao;
    const isNotificacaoEstoque = descricao.includes("\n");

    if (isNotificacaoEstoque) {
      const titulo = notificacaoTraduzida.titulo;
      const linhas = descricao.split("\n");
      const emojiTipo = getEmojiPorTipo(titulo);
      const corTipo = getCorPorTipo(titulo);

      return (
        <div
          className={`p-4 rounded-xl mb-3 border-l-4 transform transition-all duration-300 hover:scale-[1.02] ${isAnimating ? 'animate-slide-in' : ''
            }`}
          style={{
            animationDelay: `${index * 100}ms`,
            background: `linear-gradient(135deg, ${temaAtual.card} 0%, ${corTipo}10 100%)`,
            borderLeftColor: corTipo,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg">
                {emojiTipo}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-2" style={{ color: temaAtual.texto }}>
                  {titulo}
                </h3>
                <div className="space-y-2">
                  {linhas.map((linha, linhaIndex) => (
                    <div key={linhaIndex} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: corTipo }}
                      />
                      <span style={{ color: temaAtual.texto }}>{linha}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {!notificacao.empresaId && (
              <button
                onClick={() => deletarNotificacao(notificacao.id)}
                className="opacity-50 hover:opacity-100 transition-opacity duration-200 hover:text-red-500"
                style={{ color: temaAtual.texto }}
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: temaAtual.borda }}>
            <div className="flex items-center gap-4">
              <span className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full ${notificacao.lida ? 'bg-green-500/20 text-green-600' : 'bg-blue-500/20 text-blue-600'
                }`}>
                {notificacao.lida ? <FaCheck className="text-xs" /> : <FaCheckDouble className="text-xs" />}
                {notificacao.lida ? t("read") : t("unread")}
              </span>
              <span className="text-xs opacity-70" style={{ color: temaAtual.texto }}>
                {formatarData(notificacao.createdAt)}
              </span>
            </div>

            {permissoesUsuario.pedidos_criar && (
              <button
                onClick={() => handleFazerPedido(notificacao)}
                className="px-3 cursor-pointer py-1 text-xs rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #0EA5E9)",
                  color: "#FFFFFF"
                }}
              >
                <FaClipboardList size={10} />
                {t("fazerPedido") || "Fazer Pedido"}
              </button>
            )}
          </div>
        </div>
      );
    }

    const partesDescricao = descricao.split(": ");
    const nomeRemetente = partesDescricao[0]?.replace("Enviado por", "").trim() || "Desconhecido";
    const mensagem = partesDescricao.slice(1).join(": ").trim();
    const titulo = notificacaoTraduzida.titulo;

    return (
      <div
        className={`p-4 rounded-xl mb-3 border-l-4 transform transition-all duration-300 hover:scale-[1.02] ${isAnimating ? 'animate-slide-in' : ''
          }`}
        style={{
          animationDelay: `${index * 100}ms`,
          background: `linear-gradient(135deg, ${temaAtual.card} 0%, ${temaAtual.primario}10 100%)`,
          borderLeftColor: temaAtual.primario,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <FaBell className="text-white text-sm" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1" style={{ color: temaAtual.texto }}>
                {titulo}
              </h3>
              <p className="text-xs opacity-90 mb-2" style={{ color: temaAtual.texto }}>
                {mensagem}
              </p>
              <div className="flex items-center gap-2 text-xs opacity-70">
                <FaUser className="text-xs" />
                <span style={{ color: temaAtual.texto }}>{nomeRemetente}</span>
              </div>
            </div>
          </div>
          {!notificacao.empresaId && (
            <button
              onClick={() => deletarNotificacao(notificacao.id)}
              className="opacity-50 hover:opacity-100 transition-opacity duration-200 hover:text-red-500"
              style={{ color: temaAtual.texto }}
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: temaAtual.borda }}>
          <span className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full ${notificacao.lida ? 'bg-green-500/20 text-green-600' : 'bg-blue-500/20 text-blue-600'
            }`}>
            {notificacao.lida ? <FaCheck className="text-xs" /> : <FaCheckDouble className="text-xs" />}
            {notificacao.lida ? t("read") : t("unread")}
          </span>
          <span className="text-xs opacity-70" style={{ color: temaAtual.texto }}>
            {formatarData(notificacao.createdAt)}
          </span>
        </div>
      </div>
    );
  };
  return (
    <div
      ref={panelRef}
      className={`fixed top-4 left-4 w-96 max-w-[calc(100vw-2rem)] max-h-[80vh] flex flex-col shadow-2xl rounded-2xl backdrop-blur-sm z-50 ${estaVisivel ? '' : 'hidden'
        }`}
      style={{
        background: `linear-gradient(135deg, ${temaAtual.card} 0%, ${temaAtual.fundo} 100%)`,
        border: `1px solid ${temaAtual.borda}`,
        color: temaAtual.texto,
        animation: estaVisivel ? 'slideInFromLeft 0.5s ease-out forwards' : 'none',
      }}
    >
      <style jsx>{`
      @keyframes slideInFromLeft {
        from {
          opacity: 0;
          transform: translateX(-100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @media (max-width: 420px) {
        .notificacao-mobile {
          padding: 0.75rem;
        }
        .notificacao-mobile .texto-mobile {
          font-size: 0.75rem;
        }
        .notificacao-mobile .titulo-mobile {
          font-size: 0.875rem;
        }
      }
    `}</style>
      <div className="p-6 border-b notificacao-mobile" style={{ borderColor: temaAtual.borda }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <FaBell className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold titulo-mobile">{t("notifications")}</h2>
              <p className="text-xs opacity-70 texto-mobile">
                {notificacoes.length} {notificacoes.length === 1 ? t("notification") : t("notifications_count")}
              </p>
            </div>
          </div>
          <button
            onClick={aoFechar}
            className="w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-red-500/10 hover:text-red-500"
            style={{ color: temaAtual.texto }}
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          {!mostrarLidas && notificacoes.some(n => !n.lida) && (
            <button
              onClick={marcarTodasComoLidas}
              className="flex-1 cursor-pointer px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #0EA5E9)",
                color: "white",
              }}
            >
              <FaCheckDouble className="text-xs" />
              {t("marcarLidas")}
            </button>
          )}
          <button
            onClick={alternarMostrarLidas}
            className="flex-1 px-3 cursor-pointer py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 border flex items-center justify-center gap-2"
            style={{
              borderColor: temaAtual.primario,
              color: temaAtual.primario,
              background: `${temaAtual.primario}10`,
            }}
          >
            <FaHistory className="text-xs" />
            {mostrarLidas ? t("mostrarTodas") : t("mostrarLidas")}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 notificacao-mobile">
        {mostrarLidas && (
          <div className="text-center py-3 mb-3 rounded-lg text-xs italic" style={{ background: temaAtual.hover, color: temaAtual.primario }}>
            {t("empresa_nao_pode_ser_deletada", { nomeEmpresa })}
          </div>
        )}

        {notificacoes.length > 0 ? (
          <div className="space-y-2">
            {notificacoes.map((notificacao, index) => (
              <div key={notificacao.id} className="notificacao-mobile">
                <NotificacaoItem notificacao={notificacao} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 notificacao-mobile">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: temaAtual.hover }}>
              <FaBell className="text-2xl opacity-50" style={{ color: temaAtual.texto }} />
            </div>
            <p className="text-sm opacity-70 mb-2 texto-mobile" style={{ color: temaAtual.texto }}>
              {mostrarLidas ? t("semNotificacoesLidas") : t("NenhumaNotificacao")}
            </p>
            <p className="text-xs opacity-50 texto-mobile" style={{ color: temaAtual.texto }}>
              {t("novas_notificacoes_aparecerao_aqui")}
            </p>
          </div>
        )}
      </div>
      <div className="p-4 border-t text-center" style={{ borderColor: temaAtual.borda }}>
        <p className="text-xs opacity-50" style={{ color: temaAtual.texto }}>
          {t("gerenciar_notificacoes_configuracoes")}
        </p>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}