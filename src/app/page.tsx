import Image from "next/image";
import Banner from "../components/banner";
import { FaCloud, FaLock, FaUserShield, FaWhatsapp } from "react-icons/fa";
import { MdOutlineLibraryBooks } from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import { BiPackage } from "react-icons/bi";
export default function Home() {
  return (
    <div className="mt-40">
      <Banner />
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
              <h3 className="font-semibold text-xl mb-2">Relatórios Inteligentes</h3>
              <p className="text-gray-600">Geração de gráficos e relatórios completos com apenas um clique.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="px-8 py-16 mb-52">
        <h1 className="text-center text-3xl font-bold mb-12 text-gray-800">Produtos</h1>

        <div className="flex flex-col lg:flex-row gap-20">
          <div className="flex-1 bg-[#29292B] p-6 md:p-8 rounded-3xl shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)] flex items-center justify-center">
            <Image alt="produtos" src="/produtos.png" width={700} height={400} quality={100} className="rounded-2xl shadow-lg object-cover max-w-full max-h-[400px]" />
          </div>
          <div className="flex-1 flex flex-col lg:items-start">
            <h1 className="text-lg md:text-xl xl:text-xl text-black font-bold indent-6 max-w-2xl text-center lg:text-left">Gerencie seus produtos com total praticidade e eficiência.</h1>

            <br />

            <p className="text-gray-600 mt-20 text-center text-xl lg:text-left indent-6">A tela de Produtos foi pensada para oferecer um controle completo dos seus itens em estoque. Cadastre, edite ou remova produtos com poucos cliques. Visualize rapidamente informações como nome, quantidade, código, preço e status. Ideal para manter sua operação organizada e eficiente.</p>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 mb-52 -mt-48">
        <h1 className="text-center text-3xl font-bold mb-12 text-gray-800">Detalhes</h1>

        <div className="flex flex-col lg:flex-row gap-20">
          <div className="flex-1 bg-[#29292B] p-6 md:p-8 rounded-3xl shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)] flex items-center justify-center">
            <Image alt="detalhes" src="/detalhes.png" width={700} height={400} quality={100} className="rounded-2xl shadow-lg object-cover max-w-full max-h-[400px]" />
          </div>
          <div className="flex-1 flex flex-col lg:items-start">
            <h1 className="text-lg md:text-xl xl:text-xl text-black font-bold indent-6 max-w-2xl text-center lg:text-left">Tenha Resumidamente as Informações e Atividades do Inventário</h1>
            <br />
            <p className="text-gray-600 mt-20 text-center text-xl lg:text-left indent-6">Tenha uma visão completa do seu estoque logo após o login. A Dashboard reúne os principais indicadores e atividades em um só lugar. Veja um resumo do inventário, acompanhe as atividades recentes e receba alertas de produtos com estoque baixo para agir rapidamente. Tudo organizado, visual e eficiente — ideal para decisões rápidas e estratégicas.</p>
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
              <h3 className="font-semibold text-lg text-[#398677]">Relatórios em Gráficos</h3>
              <p className="mt-1 text-sm">Visualize o desempenho do estoque com gráficos de fácil compreensão.</p>
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

      <section className=" py-16 px-6 sm:px-12 text-center -mt-10">
        <h2 id="assinatura" className="text-2xl font-bold text-gray-800 mb-8 scroll-mt-40">
          Assinatura
        </h2>

        <div className="bg-white px-8 py-10 rounded-xl shadow-md inline-block border border-gray-300">
          <h3 className="text-2xl font-semibold mb-2">R$ 49/mês</h3>
          <p className="text-gray-600 mb-6">
            Entre em contato para assinar <br />e receber sua chave de ativação
          </p>
          <a href="https://wa.me/55539999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-800 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition">
            <FaWhatsapp size={20} />
            Fale no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
