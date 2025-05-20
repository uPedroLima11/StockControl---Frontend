'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useUsuarioStore } from '@/context/usuario';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);
  const { logar } = useUsuarioStore();

  const toggleMenu = () => setMenuOpen(!menuOpen);

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
    <nav className="font-sans bg-gradient-to-r py-2 bg-[#0f0e17] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] fixed w-screen z-20 top-0">
      <div className="w-full flex items-center justify-between px-4 lg:px-10">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/icone.png" className="h-16" />
          <span className="text-lg font-semibold text-white">StockControl</span>
        </Link>

        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-white text-2xl focus:outline-none">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-14">
          <a href="#recursos" className="text-white hover:text-[#b37400] text-lg font-bold">
            Recursos
          </a>
          <Link href="#assinatura" className="text-white hover:text-[#b37400] text-lg font-bold">
            Assinatura
          </Link>
          {fotoEmpresa ? (
            <Link href="/conta">
              <img
                src={fotoEmpresa || '/contadefault.png'}
                alt="Empresa"
                className="h-14 w-14 rounded-full object-cover border border-gray-300"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-[#D4CCCC] text-black text-xl px-8 py-2 rounded-3xl font-light transition hover:bg-[#c2b9b9]"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-[#0f0e17] px-4 py-6 flex flex-col gap-6 text-white text-lg font-semibold shadow-md">
          <a href="#recursos" onClick={toggleMenu} className="hover:text-[#b37400]">
            Recursos
          </a>
          <Link href="#assinatura" onClick={toggleMenu} className="hover:text-[#b37400]">
            Assinatura
          </Link>
          {fotoEmpresa ? (
            <Link href="/conta" onClick={toggleMenu}>
              <img
                src={fotoEmpresa || '/contadefault.png'}
                alt="Empresa"
                className="h-14 w-14 rounded-full object-cover border border-gray-300"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={toggleMenu}
              className="bg-[#D4CCCC] text-black rounded-3xl px-6 py-2 text-center text-base"
            >
              Entrar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
