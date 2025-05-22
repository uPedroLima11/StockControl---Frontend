"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaBell, FaBoxOpen, FaFileAlt, FaUser, FaHeadset, FaWrench, FaSignOutAlt, FaTruck, FaCheck, FaCheckDouble } from "react-icons/fa";
import { FaCartShopping, FaClipboardUser } from "react-icons/fa6";

import { NotificacaoI } from "@/utils/types/notificacao";
import { useUsuarioStore } from "@/context/usuario";
import { ConviteI } from "@/utils/types/convite";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { t } = useTranslation("sidebar");
  const [estaAberto, setEstaAberto] = useState(false);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);
  const [temNotificacaoNaoLida, setTemNotificacaoNaoLida] = useState(false);
  const [possuiEmpresa, setPossuiEmpresa] = useState(false);
  const { logar } = useUsuarioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioInicializado, setAudioInicializado] = useState(false);

  const verificarEstoque = async () => {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;

      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/verificar-estoque-empresa`, {
        method: 'POST'
      });
      console.log("Verificação de estoque:", await resposta.json());
    } catch (erro) {
      console.error("Erro ao verificar estoque:", erro);
    }
  };

  const inicializarAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/notification-sound.mp3");
      audioRef.current.volume = 0.3;
      setAudioInicializado(true);
    }
  };

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("client_key");
    const usuarioId = usuarioSalvo?.replace(/"/g, "");

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

    async function verificarNotificacoes(idUsuario: string) {
      try {
        const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${idUsuario}`);
        const notificacoes = await resposta.json();

        const temNaoLidas = notificacoes.some((n: NotificacaoI) => {
          if (n.empresaId) {
            return n.NotificacaoLida?.length === 0;
          }
          return !n.lida;
        });

        setTemNotificacaoNaoLida(temNaoLidas);

        if (temNaoLidas && audioInicializado) {
          const somAtivado = localStorage.getItem("somNotificacao") !== "false";
          if (somAtivado && audioRef.current) {
            try {
              await audioRef.current.play();
            } catch (erro) {
              console.error("Erro ao reproduzir som:", erro);
            }
          }
        }
      } catch (erro) {
        console.error("Erro ao verificar notificações:", erro);
      }
    }

    carregarDados();

    const intervaloNotificacoes = setInterval(() => {
      if (usuarioId) verificarNotificacoes(usuarioId);
    }, 30000);

    return () => {
      clearInterval(intervaloEstoque);
      clearInterval(intervaloNotificacoes);
    };
  }, [logar, audioInicializado]);

  const alternarSidebar = () => {
    inicializarAudio();
    setEstaAberto(!estaAberto);
  };

  const alternarNotificacoes = async () => {
    inicializarAudio();
    setMostrarNotificacoes(!mostrarNotificacoes);
  };

  return (
    <>
      <button 
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-[#013C3C] p-2 rounded-full" 
        onClick={alternarSidebar}
      >
        <FaBars />
      </button>

      <aside className={`fixed top-0 h-screen w-64 bg-[#013C3C] flex flex-col justify-between rounded-tr-2xl rounded-br-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:relative md:flex ${estaAberto ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <Link
            href="/"
            className="bg-[#1C1C1C] py-4 flex justify-center items-center gap-2"
            onClick={() => setTimeout(() => window.location.reload(), 500)}
          >
            <Image src="/icone.png" alt="Logo" width={28} height={28} />
            <span className="hidden md:block text-white font-mono text-sm">StockControl</span>
          </Link>

          <nav className="flex flex-col items-start px-4 py-6 gap-4 text-white text-sm">
            <button onClick={alternarNotificacoes} className="relative flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f] text-white text-sm">
              <span className="text-lg relative">
                <FaBell />
                {temNotificacaoNaoLida && (
                  <>
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                  </>
                )}
              </span>
              <span className="text-sm md:inline">{t("notifications")}</span>
            </button>

            <LinkSidebar href="/dashboard" icon={<FaFileAlt />} label={t("dashboard")} />
            <LinkSidebar href="/logs" icon={<FaClipboardUser />} label={t("summary")} />
            <LinkSidebar href="/produtos" icon={<FaBoxOpen />} label={t("products")} />
            <LinkSidebar href="/vendas" icon={<FaCartShopping />} label={t("sells")} />
            <LinkSidebar href="/usuarios" icon={<FaUser />} label={t("users")} />
            <LinkSidebar href="/suporte" icon={<FaHeadset />} label={t("support")} />
            <LinkSidebar href="/fornecedores" icon={<FaTruck />} label={t("suppliers")} />
            <LinkSidebar href="/configuracoes" icon={<FaWrench />} label={t("settings")} />
            <LinkSidebar href="/conta" icon={<FaUser />} label={t("account")} />

            <Link href="/empresa" className="flex items-center gap-2">
              <Image src={fotoEmpresa || "/contadefault.png"} alt="Foto da Empresa" width={40} height={40} className="rounded-full object-cover border border-gray-300" />
              <h1 className="text-sm font-medium">{nomeEmpresa || t("create_company")}</h1>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-start px-4 pb-6 gap-4 text-white text-sm">
          {possuiEmpresa && (
            <LinkSidebar href="/ativacao" icon={<FaCheckDouble />} label={t("activation")} />
          )}

          <button
            onClick={() => {
              localStorage.removeItem("client_key");
              window.location.href = "/";
            }}
            className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f] text-white text-sm"
          >
            <span className="text-lg">
              <FaSignOutAlt />
            </span>
            <span className="text-sm md:inline">{t("logout")}</span>
          </button>
        </div>
      </aside>

      {mostrarNotificacoes && (
        <PainelNotificacoes 
          estaVisivel={mostrarNotificacoes} 
          aoFechar={() => setMostrarNotificacoes(false)} 
          nomeEmpresa={nomeEmpresa} 
        />
      )}
    </>
  );
}

function LinkSidebar({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]">
      <span className="text-lg">{icon}</span>
      <span className="text-sm md:inline">{label}</span>
    </Link>
  );
}

function PainelNotificacoes({ estaVisivel, aoFechar, nomeEmpresa }: { 
  estaVisivel: boolean; 
  aoFechar: () => void; 
  nomeEmpresa: string | null 
}) {
  const { t } = useTranslation("sidebar");
  const panelRef = useRef<HTMLDivElement>(null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoI[]>([]);
  const [mostrarLidas, setMostrarLidas] = useState(false);
  const { usuario } = useUsuarioStore();

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

    } catch (erro) {
      console.error("Erro ao marcar notificações como lidas:", erro);
    }
  }, [usuario?.id]);

  const alternarMostrarLidas = useCallback(() => {
    setMostrarLidas(!mostrarLidas);
  }, [mostrarLidas]);

  const buscarNotificacoes = useCallback(async (): Promise<NotificacaoI[]> => {
    if (!usuario?.id) return [];
  
    try {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${usuario.id}`);
      const todasNotificacoes: NotificacaoI[] = await resposta.json();
  
      const notificacoesComStatus = todasNotificacoes.map(n => ({
        ...n,
        lida: n.empresaId 
          ? n.NotificacaoLida?.some(nl => nl.usuarioId === usuario.id) || false
          : n.lida
      }));
  
      return notificacoesComStatus.filter(n => {
        if (mostrarLidas) {
          return n.lida;
        } else {
          return !n.lida;
        }
      });
  
    } catch (erro) {
      console.error("Erro ao buscar notificações:", erro);
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

  const tabelaNotificacoes = notificacoes.map((notificacao) => {
    const estaLida = notificacao.empresaId
      ? notificacao.NotificacaoLida?.some(nl => nl.usuarioId === usuario?.id)
      : notificacao.lida;
      
    if (notificacao.convite) {
      return (
        <div key={notificacao.id} className="flex flex-col gap-2 p-4 bg-[#1C1C1C] rounded-lg mb-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">{t("invite_title")}</h3>
            <button onClick={() => deletarNotificacao(notificacao.id)} className="text-white">
              ✕
            </button>
          </div>

          <p>
            {t("invite_description")} {notificacao.convite?.empresa?.nome || t("unknown_company")}.
          </p>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>
              {t("from")}: {notificacao.convite?.empresa?.nome || t("unknown_company")}
            </span>
            <span>{formatarData(notificacao.createdAt)}</span>
          </div>

          <button 
            className="py-2 px-4 bg-[#013C3C] text-white rounded-lg mt-2" 
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
      <div key={notificacao.id} className="flex flex-col gap-2 p-4 bg-[#1C1C1C] rounded-lg mb-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{notificacao.titulo}</h3>
          {!notificacao.empresaId && (
            <button onClick={() => deletarNotificacao(notificacao.id)} className="text-white">
              ✕
            </button>
          )}
        </div>

        <p>{mensagem}</p>

        <div className="flex flex-col text-xs mt-2 text-gray-400 gap-1">
          <span>
            {t("from")}: {nomeRemetente}
          </span>
          <span>
            {t("Data")}: {formatarData(notificacao.createdAt)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs flex items-center gap-1">
            {estaLida ? <FaCheck color="#82C8E5" /> : <FaCheckDouble />}
            {estaLida ? t("read") : t("unread")}
          </span>
        </div>
      </div>
    );
  });

  return (
    <div
    ref={panelRef}
    className={`fixed w-80 bg-[#013C3C] text-white p-4 shadow-lg rounded-b-xl transition-all duration-300 z-50 ${estaVisivel ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
    style={{
      borderTop: "2px solid #015959",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)"
    }}
  >
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold">{t("notifications")}</h2>
      <div className="flex gap-2">
        {!mostrarLidas && (
          <button
            onClick={marcarTodasComoLidas}
            className="text-xs bg-[#015959] hover:bg-[#014747] px-2 py-1 rounded"
          >
            {t("marcarLidas")}
          </button>
        )}
        <button
          onClick={alternarMostrarLidas}
          className="text-xs bg-[#015959] hover:bg-[#014747] px-2 py-1 rounded"
        >
          {mostrarLidas ? t("mostrarTodas") : t("mostrarLidas")}
        </button>
        <button
          onClick={aoFechar}
          className="text-white hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
    <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
      {mostrarLidas && (
        <div className="text-center py-2 text-gray-300 italic text-xs">
        {t("empresa_nao_pode_ser_deletada", { nomeEmpresa })}
      </div>
      )}
      {notificacoes.length > 0 ? (
        tabelaNotificacoes
      ) : (
        <p className="text-center py-4 text-gray-300">
          {mostrarLidas ? t("semNotificacoesLidas") : t("NenhumaNotificacao")}
        </p>
      )}
    </div>
  </div>
  );
}