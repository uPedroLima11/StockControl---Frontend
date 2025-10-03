'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link as ScrollLink } from 'react-scroll';
import { useUsuarioStore } from '@/context/usuario';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
  const { logar } = useUsuarioStore();

  const toggleMenu = () => setMenuOpen(!menuOpen);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${idUsuario}`);
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

        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-white text-2xl focus:outline-none z-50 relative">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-14">
          <ScrollLink 
            to="features" 
            {...scrollProps}
            className="text-white hover:text-blue-300 text-lg font-bold transition-colors duration-300 hover:scale-105 cursor-pointer"
          >
            Recursos
          </ScrollLink>
          
          <ScrollLink 
            to="pricing" 
            {...scrollProps}
            className="text-white hover:text-blue-300 text-lg font-bold transition-colors duration-300 hover:scale-105 cursor-pointer"
          >
            Assinatura
          </ScrollLink>
          
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
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Entrar
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
              className="hover:text-blue-300 transition-all duration-300 py-3 transform hover:scale-105 cursor-pointer w-full text-left border-b border-blue-500/10 last:border-b-0"
            >
              Recursos
            </ScrollLink>
            
            <ScrollLink 
              to="pricing" 
              {...scrollProps}
              className="hover:text-blue-300 transition-all duration-300 py-3 transform hover:scale-105 cursor-pointer w-full text-left border-b border-blue-500/10 last:border-b-0"
            >
              Assinatura
            </ScrollLink>
            
            <div className="w-full pt-2">
              {fotoEmpresa ? (
                <Link 
                  href="/conta" 
                  onClick={() => setMenuOpen(false)} 
                  className="py-3 flex items-center gap-3 w-full"
                >
                  <img
                    src={fotoEmpresa || '/contadefault.png'}
                    alt="Empresa"
                    className="h-12 w-12 rounded-full object-cover border border-gray-300 transition-transform duration-300 hover:scale-110"
                  />
                  <span className="text-white">Minha Conta</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl px-6 py-3 text-center font-semibold transition-all duration-300 transform hover:scale-105 inline-block w-full text-lg"
                >
                  Entrar
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