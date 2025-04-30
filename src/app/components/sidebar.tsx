'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FaBars,
    FaBell,
    FaChartBar,
    FaBoxOpen,
    FaFileAlt,
    FaUser,
    FaHeadset,
    FaWrench,
    FaSignOutAlt,
} from 'react-icons/fa';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
    const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    useEffect(() => {
        if (isClient) {
            const idUsuario = getCookie('idUsuario');
            if (idUsuario) {
                fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.foto) {
                            setFotoEmpresa(data.foto);
                            if (data.nome === 'Empresa') {
                                setFotoEmpresa('/contadefault.png');
                            }
                        } else {
                            setFotoEmpresa('/contadefault.png');
                        }

                        if (data.nome) {
                            setNomeEmpresa(data.nome);
                        }
                    })
                    .catch(err => {
                        console.error('Erro ao buscar empresa:', err);
                        setFotoEmpresa('/default-empresa.png');
                    });
            }
        }
    }, [isClient]);

    if (!isClient) return null;

    function getCookie(nome: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + nome + '=([^;]+)'));
        return match ? match[2] : null;
    }

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 text-white bg-[#013C3C] p-2 rounded-full"
                onClick={toggleSidebar}
            >
                <FaBars />
            </button>

            <aside
                className={`fixed top-0 h-screen w-64 bg-[#013C3C] flex flex-col justify-between rounded-tr-2xl rounded-br-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:relative md:flex ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div>
                    <Link href="/" className="bg-[#1C1C1C] py-4 flex justify-center items-center gap-2">
                        <Image src="/icone.png" alt="Logo" width={28} height={28} />
                        <span className="hidden md:block text-white font-mono text-sm">StockControl</span>
                    </Link>

                    <nav className="flex flex-col items-start px-4 py-6 gap-4 text-white text-sm">
                        <button
                            onClick={toggleNotifications}
                            className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f] text-white text-sm"
                        >
                            <span className="text-lg"><FaBell /></span>
                            <span className="text-sm md:inline">Notificações</span>
                        </button>
                        <SidebarLink href="#" icon={<FaChartBar />} label="Resumo" />
                        <SidebarLink href="/produtos" icon={<FaBoxOpen />} label="Produtos" />
                        <SidebarLink href="/dashboard" icon={<FaFileAlt />} label="Relatórios" />
                        <SidebarLink href="/usuarios" icon={<FaUser />} label="Usuários" />
                        <SidebarLink href="/suporte" icon={<FaHeadset />} label="Suporte" />
                        <SidebarLink href="/configuracoes" icon={<FaWrench />} label="Configurações" />
                        <SidebarLink href="/conta" icon={<FaUser />} label="Conta" />
                        {fotoEmpresa && (
                            <Link href="/conta" className="flex items-center gap-1">
                                <img
                                    src={fotoEmpresa}
                                    alt="Foto da Empresa"
                                    className="h-10 w-10 rounded-full object-cover border border-gray-300"
                                />
                                {nomeEmpresa && <h1 className='text-sm font-medium'>{nomeEmpresa}</h1>}
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex flex-col items-start px-4 pb-6 gap-4 text-white text-sm">
                    <SidebarLink href="/ativacao" icon={<FaWrench />} label="Ativação" />
                    <button
                        onClick={() => {
                            document.cookie = 'idUsuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                            window.location.href = '/';
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f] text-white text-sm"
                    >
                        <span className="text-lg"><FaSignOutAlt /></span>
                        <span className="text-sm md:inline">Sair</span>
                    </button>
                </div>
            </aside>

            <NotificacaoPainel isVisible={showNotifications} onClose={() => setShowNotifications(false)} />
        </>
    );
}

function SidebarLink({
    href,
    icon,
    label,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <Link href={href} className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]">
            <span className="text-lg">{icon}</span>
            <span className="text-sm md:inline">{label}</span>
        </Link>
    );
}

function NotificacaoPainel({
    isVisible,
    onClose,
}: {
    isVisible: boolean;
    onClose: () => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, onClose]);

    return (
        <div
            ref={panelRef}
            className={`fixed top-0 left-0 w-80 bg-[#013C3C] text-white p-4 shadow-lg rounded-b-xl transition-transform duration-300 z-50 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Notificações</h2>
                <button onClick={onClose} className="text-white">✕</button>
            </div>
            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-bold">Produto Esgotado!</h3>
                    <p>O item <strong>“Computadores”</strong> está fora de estoque.</p>
                    <p>(7) Produtos Restantes.</p>
                </div>
                <div>
                    <h3 className="font-bold">Reposição Concluída</h3>
                    <p>O produto <strong>“Monitores”</strong> foi reabastecido com sucesso.</p>
                </div>
                <div>
                    <h3 className="font-bold">Atualização de Produto</h3>
                    <p>As informações do produto <strong>“Mouses”</strong> foram modificadas.</p>
                </div>
            </div>
        </div>
    );
}
