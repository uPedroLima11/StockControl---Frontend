"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaBars, FaBell, FaChartBar, FaBoxOpen, FaFileAlt,
  FaUser, FaHeadset, FaWrench, FaSignOutAlt, FaTruck
} from "react-icons/fa";
import { NotificacaoI } from "@/utils/types/notificacao";
import { useUsuarioStore } from "../context/usuario";
import { ConviteI } from "@/utils/types/convite";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { t } = useTranslation("sidebar");
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);
  const [temNotificacaoNaoLida, setTemNotificacaoNaoLida] = useState(false);
  const { logar, usuario } = useUsuarioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/notification-sound.mp3');
    audioRef.current.volume = 0.3;

    const usuarioSalvo = localStorage.getItem("client_key");
    const usuarioId = usuarioSalvo?.replace(/"/g, "");

    async function fetchData() {
      if (!usuarioId) return;

      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
        if (userResponse.status === 200) {
          const userData = await userResponse.json();
          logar(userData);
        }

        const companyResponse = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${usuarioId}`);
        if (companyResponse.status === 200) {
          const companyData = await companyResponse.json();
          setFotoEmpresa(companyData.foto);
          setNomeEmpresa(companyData.nome);
        }

        await checkNotifications(usuarioId);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    async function checkNotifications(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${idUsuario}`);
      const notificacoes = await response.json();
      const possuiNaoLidas = notificacoes.some((n: NotificacaoI) => !n.lida);

      if (possuiNaoLidas && !temNotificacaoNaoLida) {
        const somAtivado = localStorage.getItem("somNotificacao") !== "false";
        if (somAtivado && audioRef.current) {
          audioRef.current.play().catch(e => console.log("Erro ao tocar som:", e));
        }
      }
      setTemNotificacaoNaoLida(possuiNaoLidas);
    }

    fetchData();

    const intervalId = setInterval(() => {
      if (usuarioId) checkNotifications(usuarioId);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [logar]);


  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleNotifications = async () => {
    if (usuario?.id) {
      await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/marcar-lidas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id }),
      });
      setTemNotificacaoNaoLida(false);
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <>
      <audio ref={audioRef} src="/notification-sound.mp3" preload="auto" />
      <button className="md:hidden fixed top-4 left-4 z-50 text-white bg-[#013C3C] p-2 rounded-full" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <aside className={`fixed top-0 h-screen w-64 bg-[#013C3C] flex flex-col justify-between rounded-tr-2xl rounded-br-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:relative md:flex ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <Link href="/" className="bg-[#1C1C1C] py-4 flex justify-center items-center gap-2">
            <Image src="/icone.png" alt="Logo" width={28} height={28} />
            <span className="hidden md:block text-white font-mono text-sm">StockControl</span>
          </Link>

          <nav className="flex flex-col items-start px-4 py-6 gap-4 text-white text-sm">
            <button onClick={toggleNotifications} className="relative flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f] text-white text-sm">
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

            <SidebarLink href="/dashboard" icon={<FaFileAlt />} label={t("dashboard")} />
            <SidebarLink href="#" icon={<FaChartBar />} label={t("summary")} />
            <SidebarLink href="/produtos" icon={<FaBoxOpen />} label={t("products")} />
            <SidebarLink href="/usuarios" icon={<FaUser />} label={t("users")} />
            <SidebarLink href="/suporte" icon={<FaHeadset />} label={t("support")} />
            <SidebarLink href="/fornecedores" icon={<FaTruck />} label={t("suppliers")} />
            <SidebarLink href="/configuracoes" icon={<FaWrench />} label={t("settings")} />
            <SidebarLink href="/conta" icon={<FaUser />} label={t("account")} />

            <Link href="/empresa" className="flex items-center gap-2">
              <Image
                src={fotoEmpresa || "/contadefault.png"}
                alt="Foto da Empresa"
                width={40}
                height={40}
                className="rounded-full object-cover border border-gray-300"
              />
              <h1 className="text-sm font-medium">{nomeEmpresa || t("create_company")}</h1>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-start px-4 pb-6 gap-4 text-white text-sm">
          <SidebarLink href="/ativacao" icon={<FaWrench />} label={t("activation")} />
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

      {showNotifications && (
        <NotificacaoPainel
          isVisible={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]">
      <span className="text-lg">{icon}</span>
      <span className="text-sm md:inline">{label}</span>
    </Link>
  );
}

function NotificacaoPainel({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const { t } = useTranslation("sidebar");
  const panelRef = useRef<HTMLDivElement>(null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoI[]>([]);
  const { usuario } = useUsuarioStore();

  useEffect(() => {
    async function fetchNotifications() {
      if (!usuario?.id) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${usuario.id}`);
        setNotificacoes(await response.json());
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    if (isVisible) fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, usuario]);


  async function handleInviteResponse(id: string, convite: ConviteI) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/convite/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ empresaId: convite.empresaId }),
    });

    if (response.ok) {
      window.location.href = "/empresa";
    }
  }

  async function handleDeleteNotification(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${id}`, {
      method: "DELETE",
    });
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }

  const formatarData = (dataString: string | Date) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const notificacaoTable = notificacoes.map((notificacao) => {
    if (notificacao.convite) {
      return (
        <div key={notificacao.id} className="flex flex-col gap-2 p-4 bg-[#1C1C1C] rounded-lg mb-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">{t("invite_title")}</h3>
            <button onClick={() => handleDeleteNotification(notificacao.id)} className="text-white">✕</button>
          </div>

          <p>{t("invite_description")} {notificacao.convite?.empresa?.nome || t("unknown_company")}.</p>
          
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{t("from")}: {notificacao.convite?.empresa?.nome || t("unknown_company")}</span>
            <span>{formatarData(notificacao.createdAt)}</span>
          </div>

          <button
            className="py-2 px-4 bg-[#013C3C] text-white rounded-lg mt-2"
            onClick={() => notificacao.convite && handleInviteResponse(usuario?.id || "", notificacao.convite)}
          >
            {t("accept")}
          </button>
        </div>
      );
    }

    const descricao = notificacao.descricao;
    const partesDescricao = descricao.split(": ");
    const nomeEnviadoPor = partesDescricao[0]?.replace("Enviado por", "").trim() || "Desconhecido";
    const descricaoMensagem = partesDescricao.slice(1).join(": ").trim();

    return (
      <div key={notificacao.id} className="flex flex-col gap-2 p-4 bg-[#1C1C1C] rounded-lg mb-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{notificacao.titulo}</h3>
          <button onClick={() => handleDeleteNotification(notificacao.id)} className="text-white">✕</button>
        </div>

        <p>{descricaoMensagem}</p>
        
        <div className="flex flex-col text-xs mt-2 text-gray-400 gap-1">
          <span>{t("from")}: {nomeEnviadoPor}</span>
          <span>{t("Data")}: {formatarData(notificacao.createdAt)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs">{notificacao.lida ? t("read") : t("unread")}</span>
        </div>
      </div>
    );
  });
  return (
    <div ref={panelRef} className={`fixed top-0 left-0 w-80 bg-[#013C3C] text-white p-4 shadow-lg rounded-b-xl transition-transform duration-300 z-50 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{t("notifications")}</h2>
        <button onClick={onClose} className="text-white">✕</button>
      </div>
      <div className="space-y-4 text-sm max-h-[80vh] overflow-y-auto">
        {notificacoes.length > 0 ? (
          notificacaoTable
        ) : (
          <p className="text-center py-4">{t("no_notifications")}</p>
        )}
      </div>
    </div>
  );
}