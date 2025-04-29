import Image from "next/image";
import Link from "next/link";

import {
    FaBell,
    FaChartBar,
    FaBoxOpen,
    FaFileAlt,
    FaUser,
    FaHeadset,
    FaWrench,
    FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar() {
    return (
        <aside className="sticky top-0 h-screen w-[80px] md:w-64 bg-[#00403C] flex flex-col justify-between rounded-tr-2xl rounded-br-2xl">
            <div>
                <Link href={"/"} className="bg-[#1C1C1C] py-4 flex justify-center items-center gap-2">
                    <Image
                        src="/icone.png"
                        alt="Logo"
                        width={28}
                        height={28}
                    />
                    <span className="hidden md:block text-white font-mono text-sm">StockControl</span>
                </Link>

                <nav className="flex flex-col items-center md:items-start px-4 py-6 gap-4 text-white text-sm">
                    <Link
                        href="#"
                        className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]"
                    >
                        <FaBell className="text-lg" />
                        <span className="hidden md:inline">Notificações</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]"
                    >
                        <FaChartBar className="text-lg" />
                        <span className="hidden md:inline">Resumo</span>
                    </Link>
                    <Link
                        href="/produtos"
                        className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]"
                    >
                        <FaBoxOpen className="text-lg" />
                        <span className="hidden md:inline">Produtos</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]"
                    >
                        <FaFileAlt className="text-lg" />
                        <span className="hidden md:inline">Relatórios</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]"
                    >
                        <FaUser className="text-lg" />
                        <span className="hidden md:inline">Minha Conta</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]"
                    >
                        <FaHeadset className="text-lg" />
                        <span className="hidden md:inline">Suporte</span>
                    </Link>
                </nav>
            </div>

            <div className="flex flex-col items-center md:items-start px-4 pb-6 gap-4 text-white text-sm">
                <Link
                    href="#"
                    className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]"
                >
                    <FaWrench className="text-lg" />
                    <span className="hidden md:inline">Ativação</span>
                </Link>
                <Link
                    href="#"
                    className="flex items-center w-full gap-3 px-3 py-2 rounded-full transition hover:bg-[#00322f]"
                >
                    <FaSignOutAlt className="text-lg" />
                    <span className="hidden md:inline">Sair</span>
                </Link>
            </div>
        </aside>
    );
}
