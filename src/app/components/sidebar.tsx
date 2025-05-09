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

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);
  const [temNotificacaoNaoLida, setTemNotificacaoNaoLida] = useState(false);
  const { logar, usuario } = useUsuarioStore();

  useEffect(() => {
    const usuarioSalvo = typeof window !== "undefined" ? localStorage.getItem("client_key") : null;
    const usuarioId = usuarioSalvo?.replace(/"/g, "");

    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
      }
    }

    async function buscaEmpresa(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        if (dados) {
          setFotoEmpresa(dados.foto);
          setNomeEmpresa(dados.nome);
        }
      }
    }

    async function verificarNotificacoes(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${idUsuario}`);
      const notificacoes = await response.json();
      const possuiNaoLidas = notificacoes.some((n: NotificacaoI) => !n.lida);
      setTemNotificacaoNaoLida(possuiNaoLidas);
    }

    if (usuarioId) {
      buscaUsuarios(usuarioId);
      buscaEmpresa(usuarioId);
      verificarNotificacoes(usuarioId);

      const intervalId = setInterval(() => {
        if (usuarioId) {
          verificarNotificacoes(usuarioId);
        }
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [logar]);


  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);

    if (!showNotifications && usuario?.id) {
      await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/marcar-lidas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarioId: usuario.id }),
      });
      setTemNotificacaoNaoLida(false);
    }
  };

  return (
    <>
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
              <span className="text-sm md:inline">Notificações</span>
            </button>

            <SidebarLink href="/dashboard" icon={<FaFileAlt />} label="Dashboard" />
            <SidebarLink href="#" icon={<FaChartBar />} label="Resumo" />
            <SidebarLink href="/produtos" icon={<FaBoxOpen />} label="Produtos" />
            <SidebarLink href="/usuarios" icon={<FaUser />} label="Usuários" />
            <SidebarLink href="/suporte" icon={<FaHeadset />} label="Suporte" />
            <SidebarLink href="/Fornecedores" icon={<FaTruck />} label="Fornecedores" />
            <SidebarLink href="/configuracoes" icon={<FaWrench />} label="Configurações" />
            <SidebarLink href="/conta" icon={<FaUser />} label="Conta" />

            <Link href="/empresa" className="flex items-center gap-2">
              <Image src={fotoEmpresa || "/contadefault.png"} alt="Foto da Empresa" width={40} height={40} className="rounded-full object-cover border border-gray-300" />
              <h1 className="text-sm font-medium">{nomeEmpresa ?? "Criar Empresa"}</h1>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-start px-4 pb-6 gap-4 text-white text-sm">
          <SidebarLink href="/ativacao" icon={<FaWrench />} label="Ativação" />
          <button onClick={() => {
            localStorage.removeItem("client_key");
            window.location.href = "/";
          }} className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f] text-white text-sm">
            <span className="text-lg">
              <FaSignOutAlt />
            </span>
            <span className="text-sm md:inline">Sair</span>
          </button>
        </div>
      </aside>

      <NotificacaoPainel isVisible={showNotifications} onClose={() => setShowNotifications(false)} />
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoI[]>([]);
  const [usuarios, setUsuarios] = useState<Map<string, string>>(new Map());
  const { usuario } = useUsuarioStore();

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${usuario.id}`);
      const dados = await response.json();
      setNotificacoes(dados);

      const usuariosMap = new Map();
      for (const notificacao of dados) {
        const usuarioId = notificacao.enviadoPorId;
        if (usuarioId && !usuariosMap.has(usuarioId)) {
          const usuarioResponse = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
          const usuarioData = await usuarioResponse.json();
          usuariosMap.set(usuarioId, usuarioData.nome);
        }
      }
      setUsuarios(usuariosMap);
    }

    if (usuario?.id) {
      buscaDados();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose, usuario]);

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

  const notificacaoTable = notificacoes.map((notificacao) => {
    const nomeEnviadoPor = usuarios.get(notificacao.enviadoPorId?.toString()) || "Desconhecido";
    return (
      <div key={notificacao.id} className="flex flex-col gap-2 p-4 bg-[#1C1C1C] rounded-lg mb-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{notificacao.titulo}</h3>
          <button onClick={() => handleDeleteNotification(notificacao.id)} className="text-white">✕</button>
        </div>

        <p>{notificacao.descricao}</p>
        <p className="text-sm text-gray-400">Enviado por: {nomeEnviadoPor}</p>

        {notificacao.convite != null ? (
          <button
            onClick={() => notificacao.convite && handleInviteResponse(usuario.id, notificacao.convite)}
            className="py-2 px-4 bg-[#013C3C] text-white rounded-lg"
          >
            Aceitar
          </button>
        ) : (
          <p>{notificacao.lida ? "Lida" : "Não lida"}</p>
        )}
      </div>
    );
  });


  return (
    <div ref={panelRef} className={`fixed top-0 left-0 w-80 bg-[#013C3C] text-white p-4 shadow-lg rounded-b-xl transition-transform duration-300 z-50 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Notificações</h2>
        <button onClick={onClose} className="text-white">✕</button>
      </div>
      <div className="space-y-4 text-sm">{notificacaoTable}</div>
    </div>
  );
}