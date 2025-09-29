"use client";
import Image from "next/image";
import { FaCloud, FaLock, FaUserShield, FaWhatsapp } from "react-icons/fa";
import { MdOutlineLibraryBooks } from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import { BiPackage } from "react-icons/bi";
import { useEffect } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function Home() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      html::-webkit-scrollbar {
      width: 10px;
      }
      
      html::-webkit-scrollbar-track {
      background: #20446e;
      }
      
      html::-webkit-scrollbar-thumb {
      background: #2d5c8c; 
      border-radius: 5px;
      border: 2px solid #20446e;
      }
      
      html::-webkit-scrollbar-thumb:hover {
      background: #3973b8; 
      }
      
      html {
      scrollbar-width: thin;
      scrollbar-color: #2d5c8c #0A1929;
      }
      
      @media (max-width: 768px) {
      html::-webkit-scrollbar {
        width: 6px;
      }
      
      html::-webkit-scrollbar-thumb {
        border: 1px solid #20446e;
        border-radius: 3px;
      }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="mt-40">
      <div className={`bg-[#0f1e2e] p-6 md:p-10 rounded-3xl mx-4 sm:mx-6 lg:mx-10 shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row items-center justify-around gap-8 ${poppins.className}`}>
        <div className="w-full lg:w-1/2 flex justify-center">
          <Image alt="Banner ilustrativo de gestão de estoque" src="/banner2.png" width={1344} height={1260} quality={100} priority className="w-full max-w-md md:max-w-lg lg:max-w-full h-auto object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>

        <section className="p-4 sm:p-8 lg:p-10 flex flex-col items-center text-white lg:items-start lg:w-1/2 text-center lg:text-left">
          <h1 className="font-bold text-3xl pb-5">StockControl</h1>
          <h2 className="font-semibold text-xl pb-5">Gestão de estoque simples, rápida e inteligente.</h2>
          <p>Automatize processos, evite perdas, ganhe tempo e tenha controle total do seu estoque. Facilite a gestão e impulsione o crescimento do seu negócio.</p>

          <Link href="/registro" type="button" className="mt-10 px-10 py-4 rounded-full bg-[#132F4C] hover:bg-[#1E4976] text-white font-bold text-base shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] transition duration-300 ease-in-out ">
            Comece Agora
          </Link>
        </section>
      </div>
      <div className="py-16 ">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Porque Usar o StockControl</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white w-20 h-20 flex items-center justify-center rounded-full text-2xl font-bold mb-4">1</div>
              <h3 className="font-semibold text-xl mb-2">Interface Intuitiva</h3>
              <p className="text-gray-600">Não precisa ser expert! Simples de usar em qualquer dispositivo.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white w-20 h-20 flex items-center justify-center rounded-full text-2xl font-bold mb-4">2</div>
              <h3 className="font-semibold text-xl mb-2">Controle em Tempo Real</h3>
              <p className="text-gray-600">Veja entradas, saídas e produtos com baixo estoque em tempo real.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white w-20 h-20 flex items-center justify-center rounded-full text-2xl font-bold mb-4">3</div>
              <h3 className="font-semibold text-xl mb-2">Gestão Completa e Inteligente</h3>
              <p className="text-gray-600">Gerencie produtos, fornecedores, vendas e muito mais com agilidade e precisão.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="px-8 py-16 mb-52">
        <h1 className="text-center text-3xl font-bold mb-12 text-gray-800">Produtos</h1>

        <div className="flex flex-col lg:flex-row gap-20 items-center justify-center">
          <div className="flex-1 bg-[#0A1929] p-0 md:p-0 rounded-3xl shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)] flex items-center justify-center min-h-[220px] sm:min-h-[320px] md:min-h-[420px] w-full overflow-hidden">
            <Image alt="produtos" src="/produtos.png" width={1200} height={420} quality={100} className="rounded-2xl shadow-lg object-contain w-full max-w-full" style={{ objectFit: "contain", objectPosition: "center center" }} sizes="(max-width: 1024px) 100vw, 50vw" priority />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center mt-8 lg:mt-0">
            <h1 className="text-lg md:text-xl xl:text-xl text-black font-bold indent-6 max-w-2xl text-center">Gerencie seus produtos com total praticidade e eficiência.</h1>
            <br />
            <p className="text-gray-600 mt-14 text-center text-xl indent-6 max-w-2xl">A tela de Produtos foi pensada para oferecer um controle completo dos seus itens em estoque. Cadastre, edite ou remova produtos com poucos cliques. Visualize rapidamente informações como nome, quantidade, código, preço e status. Ideal para manter sua operação organizada e eficiente.</p>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 mb-52 -mt-48">
        <h1 className="text-center text-3xl font-bold mb-12 text-gray-800">Detalhes</h1>

        <div className="flex flex-col lg:flex-row gap-20 px-2 sm:px-8 overflow-x-hidden">
          <div className="flex-1 flex items-center justify-center min-h-[220px] sm:min-h-[320px] md:min-h-[420px] lg:min-h-[520px] w-full overflow-hidden">
            <Image alt="detalhes" src="/dashboard.png" width={1400} height={500} quality={100} className="rounded-2xl shadow-lg object-contain w-full max-w-full" style={{ objectFit: "contain", objectPosition: "center center" }} sizes="(max-width: 1024px) 100vw, 50vw" priority />
          </div>
          <div className="flex-1 flex flex-col justify-center lg:items-start">
            <h1 className="text-lg md:text-xl xl:text-xl text-black font-bold indent-6 max-w-2xl text-center lg:text-left">Tenha Resumidamente as Informações e Atividades do Inventário</h1>
            <br />
            <p className="text-gray-600 mt-8 text-center text-xl lg:text-left indent-6">Tenha uma visão completa do seu estoque logo após o login. A Dashboard reúne os principais indicadores e atividades em um só lugar. Veja um resumo do inventário, acompanhe as atividades recentes e receba alertas de produtos com estoque baixo para agir rapidamente. Tudo organizado, visual e eficiente — ideal para decisões rápidas e estratégicas.</p>
          </div>
        </div>
      </section>

      <section className=" py-16 px-6 sm:px-12 lg:px-20 -mt-48">
        <h2 id="recursos" className="text-3xl font-bold text-center mb-12 text-gray-800 scroll-mt-40">
          Recursos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-gray-700">
          <div className="flex items-start gap-4">
            <MdOutlineLibraryBooks className="text-[#398677]" size={32} />
            <div>
              <h3 className="font-semibold text-lg underline underline-offset-2 text-[#398677]">Registro de Movimentações</h3>
              <p className="mt-1 text-sm">Tenha controle total das entradas e saídas dos produtos em tempo real.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <FaCloud className="text-[#398677]" size={32} />
            <div>
              <h3 className="font-semibold text-lg text-[#398677]">Acesso em Nuvem</h3>
              <p className="mt-1 text-sm">Acesse o sistema de onde estiver, com autenticação segura e disponibilidade 24h por dia.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <BiPackage className="text-[#398677]" size={32} />
            <div>
              <h3 className="font-semibold text-lg text-[#398677]">Gestão de Produtos</h3>
              <p className="mt-1 text-sm">Adicione, edite ou remova produtos com facilidade e total controle.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <HiOutlineChartBar className="text-[#398677]" size={32} />
            <div>
              <h3 className="font-semibold text-lg text-[#398677]">Exportação de Dados</h3>
              <p className="mt-1 text-sm">Exporte Produtos, Vendas, Clientes, Fornecedores, Usuários e Movimentações de Estoque rapidamente em Excel aplicando filtros e datas.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <FaLock className="text-[#398677]" size={32} />
            <div>
              <h3 className="font-semibold text-lg text-[#398677]">Segurança de Dados</h3>
              <p className="mt-1 text-sm">Sistema protegido com autenticação segura e registro de atividade.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <FaUserShield className="text-[#398677]" size={32} />
            <div>
              <h3 className="font-semibold text-lg text-[#398677]">Permissões de Usuário</h3>
              <p className="mt-1 text-sm">Administre quem pode acessar, editar ou visualizar dados do sistema.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 sm:px-12 lg:px-20 -mt-10">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Desenvolvedores</h2>

        <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
          <div className="md:w-1/2">
            <p className="text-lg text-gray-600 mb-6">Nossa equipe de desenvolvimento é composta por professionals apaixonados por tecnologia e inovação, dedicados a criar soluções que fazem a diferença.</p>
            <p className="text-lg text-gray-600">Combinamos expertise técnica com criatividade para entregar produtos de alta qualidade que superam as expectativas dos nossos clientes.</p>
          </div>

          <div className="md:w-1/2 flex flex-col items-center gap-8 justify-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pedros&apos; TI</h3>
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white p-1 rounded-lg shadow-lg">
                    <a href="https://www.linkedin.com/in/upedrolima/" target="_blank" rel="noopener noreferrer" className="block">
                      <Image src="/pedrolima.jpg" alt="Desenvolvedor 1" width={160} height={160} quality={100} className="w-40 h-40 object-cover rounded-md" />
                    </a>
                  </div>
                </div>
                <a href="https://www.linkedin.com/in/upedrolima/" target="_blank" rel="noopener noreferrer" className="mt-4 text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors">
                  Pedro Lima
                </a>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white p-1 rounded-lg shadow-lg">
                    <a href="https://www.linkedin.com/in/phasiqueira/" target="_blank" rel="noopener noreferrer" className="block">
                      <Image src="/pedrosiqueira.jpg" alt="Desenvolvedor 2" width={160} height={160} quality={100} className="w-40 h-40 object-cover rounded-md" />
                    </a>
                  </div>
                </div>
                <a href="https://www.linkedin.com/in/phasiqueira/" target="_blank" rel="noopener noreferrer" className="mt-4 text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors">
                  Pedro Siqueira
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 sm:px-12 text-center">
        <h2 id="assinatura" className="text-2xl font-bold text-gray-800 mb-8 scroll-mt-40">
          Assinatura
        </h2>

        <div className="bg-[#ecececec] px-8 py-10 rounded-xl shadow-md inline-block border border-gray-300">
          <h3 className="text-2xl font-semibold mb-2">R$ 79/mês</h3>
          <p className="text-gray-600 mb-6">
            Entre em contato para assinar <br />e receber sua chave de ativação
          </p>
          <a href="https://wa.me/+5553981185633" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-800 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition">
            <FaWhatsapp size={20} />
            Fale no WhatsApp
          </a>
        </div>
      </section>
      <footer className="bg-[#1E2A38] py-8 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center">
            <Image src="/icone.png" alt="Logo StockControl" width={60} height={60} className="mr-2 object-contain filter brightness-0 invert" />
            <span className="text-white text-lg font-semibold">StockControl</span>
          </div>

          <div className="flex flex-col items-center text-center text-gray-300 gap-4">
            <p className="text-sm">
              Desenvolvido por <span className="font-bold">Pedro Lima</span> e <span className="font-bold">Pedro Siqueira</span>
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/politica-privacidade" className="hover:underline text-gray-300">
                Política de Privacidade
              </Link>
              <Link href="/termos-uso" className="hover:underline text-gray-300">
                Termos de Uso
              </Link>
              <Link href="https://wa.me/5553981185633" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
                Contato via Whatsapp
              </Link>
            </div>

            <p className="text-xs text-gray-400">© 2025 StockControl. Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
