import { useState, useEffect } from 'react';
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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); 
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    if (!isClient) {
        
        return null;
    }

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 text-white bg-[#00403C] p-2 rounded-full"
                onClick={toggleSidebar}
            >
                <FaBars />
            </button>

            <aside
                className={`absolute top-0 h-screen w-64 bg-[#00403C] flex flex-col justify-between rounded-tr-2xl rounded-br-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto md:translate-x-0 md:relative md:flex ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div>
                    <Link href="/" className="bg-[#1C1C1C] py-4 flex justify-center items-center gap-2">
                        <Image src="/icone.png" alt="Logo" width={28} height={28} />
                        <span className="hidden md:block text-white font-mono text-sm">StockControl</span>
                    </Link>

                    <nav className="flex flex-col items-start px-4 py-6 gap-4 text-white text-sm">
                        <SidebarLink href="#" icon={<FaBell />} label="Notificações" />
                        <SidebarLink href="#" icon={<FaChartBar />} label="Resumo" />
                        <SidebarLink href="/produtos" icon={<FaBoxOpen />} label="Produtos" />
                        <SidebarLink href="/dashboard" icon={<FaFileAlt />} label="Relatórios" />
                        <SidebarLink href="#" icon={<FaUser />} label="Minha Conta" />
                        <SidebarLink href="#" icon={<FaHeadset />} label="Suporte" />
                    </nav>
                </div>

                <div className="flex flex-col items-start px-4 pb-6 gap-4 text-white text-sm">
                    <SidebarLink href="#" icon={<FaWrench />} label="Ativação" />
                    <SidebarLink href="#" icon={<FaSignOutAlt />} label="Sair" />
                </div>
            </aside>
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
