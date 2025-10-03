"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaBars, FaBell, FaFileExport, FaBoxOpen, FaFileAlt, FaUser, FaHeadset, FaWrench, FaSignOutAlt, FaTruck, FaCheck, FaCheckDouble, FaHistory, FaMoon, FaSun, FaBook, FaClipboardList } from "react-icons/fa";
import { FaCartShopping, FaClipboardUser, FaUsers } from "react-icons/fa6";
import { NotificacaoI } from "@/utils/types/notificacao";
import { useUsuarioStore } from "@/context/usuario";
import { ConviteI } from "@/utils/types/convite";
import { useTranslation } from "react-i18next";
import { usuarioTemPermissao } from "@/utils/permissoes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  const cores = {
    azulEscuro: "#0A1929",
    azulMedio: "#132F4C",
    azulClaro: "#1E4976",
    azulBrilhante: "#1976D2",
    azulNeon: "#00B4D8",
    cinzaEscuro: "#1A2027",
  };

  useEffect(() => {
    const handleInteracao = () => {
      setUsuarioInteragiu(true);
      document.removeEventListener('click', handleInteracao);
      document.removeEventListener('keydown', handleInteracao);
    };

    document.addEventListener('click', handleInteracao);
    document.addEventListener('keydown', handleInteracao);

    return () => {
      document.removeEventListener('click', handleInteracao);
      document.removeEventListener('keydown', handleInteracao);
    };
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
      } catch { }
      return null;
    };

    const id = carregarUsuarioId();
    if (id) {
      setUsuarioId(id);
    }
  }, []);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
    aplicarTema(ativo);
  }, []);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.classList.add("dark");
      root.style.setProperty("--cor-fundo", "#0A1929");
      root.style.setProperty("--cor-texto", "#FFFFFF");
      document.body.style.backgroundColor = "#0A1929";
      document.body.style.color = "#cccccc";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#cccccc");
      root.style.setProperty("--cor-texto", "#0F172A");
      document.body.style.backgroundColor = "#cccccc";
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
    } catch {
      setEmpresaAtivada(false);
      return false;
    }
  }, []);

  const tocarSomNotificacao = useCallback(async (notificacaoId: string) => {
    if (!usuarioId || !usuarioInteragiu) {
      return;
    }

    const somAtivado = localStorage.getItem("somNotificacao") !== "false";
    if (!somAtivado) {
      return;
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
        await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${notificacaoId}/marcar-som-tocado`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuarioId }),
        });
      }

    } catch { }
  }, [usuarioId, usuarioInteragiu]);


  const agruparNotificacoesInteligente = (notificacoes: NotificacaoI[]): { chave: string; notificacoes: NotificacaoI[] }[] => {
    if (notificacoes.length === 0) return [];

    const notificacoesOrdenadas = [...notificacoes].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const grupos: NotificacaoI[][] = [];
    let grupoAtual: NotificacaoI[] = [notificacoesOrdenadas[0]];

    for (let i = 1; i < notificacoesOrdenadas.length; i++) {
      const notificacaoAtual = notificacoesOrdenadas[i];
      const notificacaoAnterior = notificacoesOrdenadas[i - 1];

      const diferencaTempo = new Date(notificacaoAtual.createdAt).getTime() - new Date(notificacaoAnterior.createdAt).getTime();

      if (diferencaTempo < 2 * 60 * 1000) {
        grupoAtual.push(notificacaoAtual);
      } else {
        grupos.push([...grupoAtual]);
        grupoAtual = [notificacaoAtual];
      }
    }

    grupos.push(grupoAtual);

    return grupos.map((notificacoesGrupo, index) => ({
      chave: `lote-${index + 1}`,
      notificacoes: notificacoesGrupo
    }));
  };

  const marcarSomTocado = async (notificacaoId: string) => {
    if (!usuarioId) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${notificacaoId}/marcar-som-tocado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarioId }),
      });
    } catch { }
  };

  const verificarNotificacoes = useCallback(async () => {
    if (!usuarioId) return;

    try {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${usuarioId}`);
      if (!resposta.ok) {
        throw new Error("Erro ao buscar notificações");
      }

      const notificacoes: NotificacaoI[] = await resposta.json();

      const notificacoesNaoLidas = notificacoes.filter((n: NotificacaoI) => !n.lida);

      notificacoesNaoLidasRef.current = notificacoesNaoLidas;
      setTemNotificacaoNaoLida(notificacoesNaoLidas.length > 0);

      if (usuarioInteragiu) {
        const notificacoesParaTocarSom = notificacoesNaoLidas.filter((n: NotificacaoI) => {
          if (n.empresaId) {
            return !n.somTocado;
          }
          return !n.lida;
        });

        if (notificacoesParaTocarSom.length > 0) {
          const notificacoesAgrupadas = agruparNotificacoesInteligente(notificacoesParaTocarSom);

          for (const grupo of notificacoesAgrupadas) {
            await tocarSomNotificacao(grupo.notificacoes[0].id);

            for (const notificacao of grupo.notificacoes) {
              await marcarSomTocado(notificacao.id);
            }

            if (notificacoesAgrupadas.length > 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
      }

    } catch { }
  }, [usuarioId, tocarSomNotificacao, usuarioInteragiu]);

  const carregarPermissoes = useCallback(async () => {
    if (!usuarioId) return;

    try {
      const permissoesParaVerificar = ["usuarios_visualizar", "produtos_visualizar", "vendas_visualizar", "clientes_visualizar", "fornecedores_visualizar", "logs_visualizar", "exportar_dados", "inventario_visualizar", "pedidos_visualizar", 'pedidos_criar'];

      const permissoes: Record<string, boolean> = {};
      for (const permissao of permissoesParaVerificar) {
        try {
          const temPermissao = await usuarioTemPermissao(usuarioId, permissao);
          permissoes[permissao] = temPermissao;
        } catch {
          permissoes[permissao] = false;
        }
      }

      setPermissoesUsuario(permissoes);
    } catch { }
  }, [usuarioId]);

  const carregarDadosUsuario = useCallback(async () => {
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
      await carregarPermissoes();
    };

    carregarTudo();
  }, [usuarioId, carregarDadosUsuario, carregarPermissoes]);

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

  return (
    <>
      <button className="md:hidden fixed top-4 left-4 z-50 text-white bg-[#1976D2] p-3 rounded-full shadow-lg hover:bg-[#1565C0] transition-colors" onClick={alternarSidebar}>
        <FaBars />
      </button>

      <aside
        className={`sidebar-scrollbar fixed top-0 h-screen w-64 flex flex-col justify-between rounded-tr-2xl rounded-br-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:relative md:flex ${estaAberto ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: cores.azulEscuro,
          borderRight: `3px solid transparent`,
          backgroundImage: `linear-gradient(${cores.azulEscuro}, ${cores.azulEscuro}), 
              linear-gradient(135deg, ${cores.azulBrilhante}, ${cores.azulNeon})`,
          backgroundOrigin: "border-box",
          backgroundClip: "content-box, border-box",
          boxShadow: "8px 0 20px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div>
          <Link
            href="/"
            className="py-4 flex justify-center items-center gap-2 border-b"
            style={{
              backgroundColor: cores.azulEscuro,
              borderColor: cores.azulBrilhante,
              borderBottomWidth: "2px",
            }}
          >
            <Image className="object-contain filter brightness-0 invert" src="/icone.png" alt="Logo" width={28} height={28} />
            <span className="hidden md:block text-white font-mono text-sm">StockControl</span>
          </Link>

          <nav className="flex flex-col items-start px-4 py-6 gap-3 text-white text-sm">
            <button onClick={alternarNotificacoes} className="relative flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C] text-white text-sm" style={{ backgroundColor: temNotificacaoNaoLida ? cores.azulBrilhante + "20" : "transparent" }}>
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
            {permissoesUsuario.logs_visualizar && <LinkSidebar href="/logs" icon={<FaClipboardUser />} label={t("summary")} cores={cores} />}
            {permissoesUsuario.produtos_visualizar && <LinkSidebar href="/produtos" icon={<FaBoxOpen />} label={t("products")} cores={cores} />}
            {permissoesUsuario.inventario_visualizar && <LinkSidebar href="/inventario" icon={<FaHistory />} label={t("inventory")} cores={cores} />}
            {permissoesUsuario.pedidos_visualizar && <LinkSidebar href="/pedidos" icon={<FaClipboardList />} label={t("orders")} cores={cores} />}
            {permissoesUsuario.vendas_visualizar && <LinkSidebar href="/vendas" icon={<FaCartShopping />} label={t("sells")} cores={cores} />}
            {permissoesUsuario.clientes_visualizar && <LinkSidebar href="/clientes" icon={<FaUsers />} label={t("clients")} cores={cores} />}
            {permissoesUsuario.usuarios_visualizar && <LinkSidebar href="/usuarios" icon={<FaUser />} label={t("users")} cores={cores} />}
            {permissoesUsuario.fornecedores_visualizar && <LinkSidebar href="/fornecedores" icon={<FaTruck />} label={t("suppliers")} cores={cores} />}
            {permissoesUsuario.exportar_dados && <LinkSidebar href="/exportacoes" icon={<FaFileExport />} label={t("exports")} cores={cores} />}

            <LinkSidebar href="/suporte" icon={<FaHeadset />} label={t("support")} cores={cores} />
            <LinkSidebar href="/configuracoes" icon={<FaWrench />} label={t("settings")} cores={cores} />
            <LinkSidebar href="/conta" icon={<FaUser />} label={t("account")} cores={cores} />

            <Link href="/empresa" className="flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden border" style={{ borderColor: cores.azulClaro, borderWidth: "1.8px", background: "#fff" }}>
                <Image
                  src={fotoEmpresa || "/contadefault.png"}
                  alt={t("company_photo")}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-sm md:inline ml-1">{nomeEmpresa || t("create_company")}</span>
            </Link>

            <LinkSidebar href="/ajuda" icon={<FaBook />} label={t("help_center")} cores={cores} />
          </nav>
        </div>

        <div className="flex flex-col items-start px-4 pb-6 gap-4 text-white text-sm">
          <button onClick={alternarTema} className="flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C] text-white text-sm">
            <span className="text-lg">{modoDark ? <FaMoon /> : <FaSun />}</span>
            <span className="text-sm md:inline cursor-pointer">{modoDark ? t("dark_mode") : t("light_mode")}</span>
          </button>

          {possuiEmpresa && !empresaAtivada && <LinkSidebar href="/ativacao" icon={<FaCheckDouble />} label={t("activation")} cores={cores} />}

          <button
            onClick={() => {
              localStorage.removeItem("client_key");
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

      {mostrarNotificacoes && usuarioId && (
        <PainelNotificacoes
          estaVisivel={mostrarNotificacoes}
          aoFechar={() => setMostrarNotificacoes(false)}
          nomeEmpresa={nomeEmpresa}
          cores={cores}
          usuarioId={usuarioId}
          onNotificacoesAtualizadas={verificarNotificacoes}
          permissoesUsuario={permissoesUsuario}
        />
      )}
    </>
  );
}

function LinkSidebar({
  href,
  icon,
  label,
  cores,
}: {
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
    <Link href={href} className="flex items-center w-full gap-3 px-3 py-2 rounded-lg transition hover:bg-[#132F4C]">
      <span className="text-lg" style={{ color: cores.azulNeon }}>
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
  cores,
  usuarioId,
  onNotificacoesAtualizadas,
  permissoesUsuario,
}: {
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
  usuarioId: string;
  onNotificacoesAtualizadas: () => void;
  permissoesUsuario: Record<string, boolean>;
}) {
  const [modoDark, setModoDark] = useState(false);
  const { t, i18n } = useTranslation("sidebar");
  const panelRef = useRef<HTMLDivElement>(null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoI[]>([]);
  const [mostrarLidas, setMostrarLidas] = useState(false);
  const router = useRouter();

  const traduzirNotificacao = (notificacao: NotificacaoI) => {
    const idioma = i18n.language;

    if (idioma === 'en') {
      const descricaoTraduzida = notificacao.descricao
        .replace(/O produto (.+?) está com estoque próximo do limite/, 'Product $1 is running low on stock')
        .replace(/unidades restantes/, 'units remaining')
        .replace(/QTD Min:/, 'Min Qty:')
        .replace(/está com estoque CRÍTICO/, 'has CRITICAL stock level')
        .replace(/É necessário repor urgentemente!/, 'Urgent restocking required!')
        .replace(/está com estoque ZERADO/, 'is OUT OF STOCK')
        .replace(/Reposição IMEDIATA necessária!/, 'IMMEDIATE restocking required!')
        .replace(/Alerta para o produto/, 'Alert for product');

      if (notificacao.titulo.includes('Alerta de Estoque')) {
        return { ...notificacao, titulo: 'Stock Alert', descricao: descricaoTraduzida };
      }
      if (notificacao.titulo.includes('Estoque Crítico')) {
        return { ...notificacao, titulo: 'Critical Stock', descricao: descricaoTraduzida };
      }
      if (notificacao.titulo.includes('Estoque Zerado')) {
        return { ...notificacao, titulo: 'Out of Stock', descricao: descricaoTraduzida };
      }

      return { ...notificacao, descricao: descricaoTraduzida };
    }

    return notificacao;
  };

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
  }, []);

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
      const primeiraLinha = notificacao.descricao.split('\n')[0];
      const palavras = primeiraLinha.split(' ');
      const possivelNomeProduto = palavras.slice(2, -2).join(' ');

      aoFechar();

      router.push('/pedidos?abrirModal=true');

      setTimeout(() => {
        alert(`Redirecionando para pedidos. Produto: ${possivelNomeProduto || 'Não identificado'}`);
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

  const responderConvite = useCallback(async (convite: ConviteI) => {
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
  }, [usuarioId]);

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

  const getEmojiPorTipo = (titulo: string) => {
    if (titulo.includes('Crítico') || titulo.includes('CRÍTICO') || titulo.includes('Critical')) {
      return '🔴';
    } else if (titulo.includes('Alerta') || titulo.includes('ALERTA') || titulo.includes('Alert')) {
      return '🟡';
    } else if (titulo.includes('Zerado') || titulo.includes('ZERADO') || titulo.includes('Out of Stock')) {
      return '⚫';
    }
    return 'ℹ️';
  };

  const tabelaNotificacoes = notificacoes.map((notificacao) => {
    const notificacaoTraduzida = traduzirNotificacao(notificacao);
    if (notificacao.convite) {
      return (
        <div
          key={notificacao.id}
          className="flex flex-col gap-2 p-4 rounded-lg mb-2"
          style={{
            background: modoDark
              ? "linear-gradient(135deg, #132F4C 0%, #1A3A5A 100%)"
              : "#ececec",
            border: `1px solid ${cores.azulBrilhante}`,
            color: textColor,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">{t("invite_title")}</h3>
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

          <div className="flex gap-2 mt-2">
            <button
              className="py-2 px-4 rounded-lg transition-colors flex-1"
              style={{
                backgroundColor: cores.azulBrilhante,
                color: "white",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cores.azulNeon)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cores.azulBrilhante)}
              onClick={() => notificacao.convite && responderConvite(notificacao.convite)}
            >
              {t("accept")}
            </button>
          </div>
        </div>
      );
    }

    const descricao = notificacaoTraduzida.descricao;
    const isNotificacaoEstoque = descricao.includes('\n');
    if (isNotificacaoEstoque) {
      const titulo = notificacaoTraduzida.titulo;
      const linhas = descricao.split('\n');
      const emojiTipo = getEmojiPorTipo(titulo);

      return (
        <div
          key={notificacao.id}
          className="flex flex-col gap-3 p-4 rounded-lg mb-2"
          style={{
            background: modoDark
              ? "linear-gradient(135deg, #132F4C 0%, #1A3A5A 100%)"
              : "#ececec",
            border: `1px solid ${cores.azulBrilhante}`,
            color: textColor,
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">{emojiTipo}</span>
              <h3 className="font-bold text-base">{titulo}</h3>
            </div>
            {!notificacao.empresaId && (
              <button onClick={() => deletarNotificacao(notificacao.id)} className={`hover:text-[#00B4D8]`} style={{ color: closeButtonColor }}>
                ✕
              </button>
            )}
          </div>
          <div className="space-y-2 text-sm">
            {linhas.map((linha, index) => {
              let emoji = '';
              let texto = linha;

              if (linha.includes('unidades restantes')) {
                emoji = '📦';
              } else if (linha.includes('QTD Min:')) {
                emoji = '⚡';
                texto = texto.replace('QTD Min:', 'Mínimo:');
              } else if (linha.includes('urgentemente') || linha.includes('IMEDIATA')) {
                emoji = '🚨';
              } else if (linha.includes('produto')) {
                emoji = '📋';
              }

              return (
                <div key={index} className="flex items-start gap-2">
                  {emoji && <span className="flex-shrink-0">{emoji}</span>}
                  <span className={linha.includes('🚨') || linha.includes('⚡') ? 'font-semibold' : ''}>
                    {texto}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col text-xs mt-2 gap-1" style={{ color: cores.azulBrilhante }}>
            <span>
              {t("Data")}: {formatarData(notificacao.createdAt)}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs flex items-center gap-1">
              {notificacao.lida ? <FaCheck color={cores.azulBrilhante} /> : <FaCheckDouble color={cores.azulNeon} />}
              {notificacao.lida ? t("read") : t("unread")}
            </span>

            {permissoesUsuario.pedidos_criar && (
              <button
                onClick={() => handleFazerPedido(notificacao)}
                className="px-3 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                style={{
                  backgroundColor: cores.azulBrilhante,
                  color: "#FFFFFF"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cores.azulNeon)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cores.azulBrilhante)}
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
        key={notificacao.id}
        className="flex flex-col gap-2 p-4 rounded-lg mb-2"
        style={{
          background: modoDark
            ? "linear-gradient(135deg, #132F4C 0%, #1A3A5A 100%)"
            : "#ececec",
          border: `1px solid ${cores.azulBrilhante}`,
          color: textColor,
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{titulo}</h3>
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

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs flex items-center gap-1">
            {notificacao.lida ? <FaCheck color={cores.azulBrilhante} /> : <FaCheckDouble color={cores.azulNeon} />}
            {notificacao.lida ? t("read") : t("unread")}
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
        color: textColor,
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
                color: "white",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cores.azulNeon)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cores.azulBrilhante)}
            >
              {t("marcarLidas")}
            </button>
          )}
          <button
            onClick={alternarMostrarLidas}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{
              backgroundColor: cores.azulBrilhante,
              color: "white",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cores.azulNeon)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cores.azulBrilhante)}
          >
            {mostrarLidas ? t("mostrarTodas") : t("mostrarLidas")}
          </button>
          <button onClick={aoFechar} className={`hover:text-[#00B4D8] transition-colors`} style={{ color: closeButtonColor }}>
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
