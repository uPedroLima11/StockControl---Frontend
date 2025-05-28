import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#181818] py-8 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto w-full flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-center">
                    <Image
                        src="/icone.png"
                        alt="Logo StockControl"
                        width={60}
                        height={60}
                        className="mr-2"
                    />
                    <span className="text-white text-lg font-semibold">StockControl</span>
                </div>

                <div className="flex flex-col items-center text-center text-gray-300 gap-4">
                    <p className="text-sm">
                        Desenvolvido por <span className="font-bold">Pedro Lima</span>, <span className="font-bold">Pedro Siqueira</span>
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link href="/politica-privacidade" className="hover:underline">
                            Política de Privacidade
                        </Link>
                        <Link href="/termos-uso" className="hover:underline">
                            Termos de Uso
                        </Link>
                        <Link
                            href="https://wa.me/5553981185633"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 hover:underline"
                        >
                            Contato via Whatsapp
                        </Link>
                    </div>

                    <p className="text-xs">
                        © 2025 StockControl. Todos os direitos reservados
                    </p>
                </div>

            </div>
        </footer>
    );
}
