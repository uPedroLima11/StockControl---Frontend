'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaGlobe } from 'react-icons/fa';
import { Link as ScrollLink } from 'react-scroll';
import { useUsuarioStore } from '@/context/usuario';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import Image from 'next/image';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const { logar } = useUsuarioStore();
  const { t } = useTranslation("navbar");

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const toggleIdiomas = () => {
    setMostrarIdiomas(!mostrarIdiomas);
  };

  const mudarIdioma = (lng: string) => {
    i18n.changeLanguage(lng);
    setMostrarIdiomas(false);
  };

  const scrollProps = {
    spy: true,
    smooth: true,
    offset: -80,
    duration: 800,
    onClick: () => setMenuOpen(false)
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
      }
    }

    const buscaEmpresa = async (idUsuario: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${idUsuario}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`
        },
      });
      if (response.status === 200) {
        const dados = await response.json();
        setFotoEmpresa(dados?.foto || '/contadefault.png');
      }
    }

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      buscaEmpresa(usuarioValor);
    }
  }, [logar]);

  return (
    <nav className="font-sans bg-[#0A1929] py-2 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] fixed w-screen z-50 top-0">
      <div className="w-full flex items-center justify-between px-4 lg:px-10">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/icone.png" className="h-16 object-contain filter brightness-0 invert" alt="Logo" />
          <span className="text-lg font-semibold text-white">StockControl</span>
        </Link>

        <div className="lg:hidden flex items-center gap-4">
          <div className="relative">
            <button
              onClick={toggleIdiomas}
              className="text-white p-2 rounded-lg hover:bg-blue-500/10 transition-all duration-200"
            >
              <FaGlobe className="text-lg" />
            </button>

            {mostrarIdiomas && (
              <div className="absolute top-12 right-0 bg-[#0A1929] border border-blue-500/20 rounded-2xl shadow-2xl p-2 min-w-[140px] z-50">
                <button
                  onClick={() => mudarIdioma("pt")}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-500/10 transition-all duration-200 text-white"
                >
                  <Image src="/brasil.png" alt="Português" width={24} height={18} className="rounded flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">Português</span>
                </button>
                <button
                  onClick={() => mudarIdioma("en")}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-500/10 transition-all duration-200 text-white"
                >
                  <Image src="/ingles.png" alt="English" width={24} height={18} className="rounded flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">English</span>
                </button>
              </div>
            )}
          </div>

          <button onClick={toggleMenu} className="text-white text-2xl focus:outline-none z-50 relative">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-8">
          <ScrollLink
            to="features"
            {...scrollProps}
            className="text-white hover:text-blue-300 text-lg font-bold transition-colors duration-300 hover:scale-105 cursor-pointer"
          >
            {t("recursos")}
          </ScrollLink>

          <ScrollLink
            to="pricing"
            {...scrollProps}
            className="text-white hover:text-blue-300 text-lg font-bold transition-colors duration-300 hover:scale-105 cursor-pointer"
          >
            {t("assinatura")}
          </ScrollLink>
          <div className="relative">
            <button
              onClick={toggleIdiomas}
              className="text-white hover:text-blue-300 text-lg font-bold transition-colors duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 p-2 rounded-lg hover:bg-blue-500/10"
            >
              <FaGlobe className="text-lg" />
              <span>{i18n.language === 'pt' ? 'BR' : 'EN'}</span>
            </button>

            {mostrarIdiomas && (
              <div className="absolute top-12 right-0 bg-[#0A1929] border border-blue-500/20 rounded-2xl shadow-2xl p-2 min-w-[140px] z-50">
                <button
                  onClick={() => mudarIdioma("pt")}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-500/10 transition-all duration-200 text-white"
                >
                  <Image src="/brasil.png" alt="Português" width={24} height={18} className="rounded flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">Português</span>
                </button>
                <button
                  onClick={() => mudarIdioma("en")}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-500/10 transition-all duration-200 text-white"
                >
                  <Image src="/ingles.png" alt="English" width={24} height={18} className="rounded flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">English</span>
                </button>
              </div>
            )}
          </div>

          {fotoEmpresa ? (
            <Link href="/dashboard">
              <img
                src={fotoEmpresa || '/contadefault.png'}
                alt="Empresa"
                className="h-14 w-14 rounded-full object-cover border border-gray-300 transition-transform duration-300 hover:scale-110"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl px-4 py-2 text-center font-semibold transition-all duration-300 transform hover:scale-105 inline-block w-full text-base"
            >
              {t("entrar")}
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 bg-[#0A1929] border-t border-blue-500/20 z-40 shadow-lg">
          <div className="flex flex-col items-start py-4 gap-2 text-white text-lg font-semibold bg-[#0A1929] px-6">
            <ScrollLink
              to="features"
              {...scrollProps}
              className="hover:text-blue-300 transition-all duration-300 py-3 transform hover:scale-105 cursor-pointer w-full text-left border-b border-blue-500/10"
            >
              {t("recursos")}
            </ScrollLink>

            <ScrollLink
              to="pricing"
              {...scrollProps}
              className="hover:text-blue-300 transition-all duration-300 py-3 transform hover:scale-105 cursor-pointer w-full text-left border-b border-blue-500/10"
            >
              {t("assinatura")}
            </ScrollLink>

            <div className="w-full pt-2 border-b border-blue-500/10 pb-4">
              {fotoEmpresa ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 flex items-center gap-3 w-full"
                >
                  <img
                    src={fotoEmpresa || '/contadefault.png'}
                    alt="Empresa"
                    className="h-12 w-12 rounded-full object-cover border border-gray-300 transition-transform duration-300 hover:scale-110"
                  />
                  <span className="text-white">{t("minha_conta")}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl px-4 py-2 text-center font-semibold transition-all duration-300 transform hover:scale-105 inline-block w-full text-base"
                >
                  {t("entrar")}
                </Link>
              )}
            </div>
          </div>
          <div
            className="fixed inset-0 bg-black/50 -z-10"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}
    </nav>
  );
}