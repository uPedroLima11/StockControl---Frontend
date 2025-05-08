"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaBell, FaChartBar, FaBoxOpen, FaFileAlt, FaUser, FaHeadset, FaWrench, FaSignOutAlt, FaTruck } from "react-icons/fa";
import { NotificacaoI } from "@/utils/types/notificacao";
import { useUsuarioStore } from "../context/usuario";
import { ConviteI } from "@/utils/types/convite";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);
  const { logar } = useUsuarioStore();
 
  useEffect(() => {
    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
      }
    }

    const buscaEmpresa = async (idUsuario: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        if (dados) {
          setFotoEmpresa(dados.foto);
          setNomeEmpresa(dados.nome);
        }
      }
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      buscaEmpresa(usuarioValor);
    }
  }, [logar]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
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
            <button onClick={toggleNotifications} className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f] text-white text-sm">
              <span className="text-lg">
                <FaBell />
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
              <img src={fotoEmpresa || "/contadefault.png"} alt="Foto da Empresa" className="h-10 w-10 rounded-full object-cover border border-gray-300" />
              <h1 className="text-sm font-medium">{nomeEmpresa ?? "Criar Empresa"}</h1>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-start px-4 pb-6 gap-4 text-white text-sm">
          <SidebarLink href="/ativacao" icon={<FaWrench />} label="Ativação" />
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
  const { usuario } = useUsuarioStore();

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao/${usuario.id}`);
      const dados = await response.json();
      setNotificacoes(dados);
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

  const notificacaoTable = notificacoes.map((notificacao) => (
    <div key={notificacao.id} className="flex flex-col gap-2 p-4 bg-[#1C1C1C] rounded-lg mb-2">
      <h3 className="font-bold">{notificacao.titulo}</h3>
      <p>{notificacao.descricao}</p>
      {notificacao.convite != null ? (
        <button
          onClick={() => {
            handleInviteResponse(usuario.id, notificacao.convite);
          }}
          className="px- py-2 bg-[#013C3C] text-white rounded-lg"
        >
          Aceitar
        </button>
      ) : (
        <p>{notificacao.lida ? "Lida" : "Não lida"}</p>
      )}
    </div>
  ));

  return (
    <div ref={panelRef} className={`fixed top-0 left-0 w-80 bg-[#013C3C] text-white p-4 shadow-lg rounded-b-xl transition-transform duration-300 z-50 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Notificações</h2>
        <button onClick={onClose} className="text-white">
          ✕
        </button>
      </div>
      <div className="space-y-4 text-sm">{notificacaoTable}</div>
    </div>
  );
}
