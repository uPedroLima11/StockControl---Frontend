'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fotoEmpresa, setFotoEmpresa] = useState<string | null>(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const idUsuario = getCookie('idUsuario');

    if (idUsuario) {
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`)
        .then(res => res.json())
        .then(data => {
          if (data.empresa.foto) {
            setFotoEmpresa(data.empresa.foto);
          } else {
            setFotoEmpresa('/contadefault.png');
          }
        })
        .catch(err => {
          console.error('Erro ao buscar empresa:', err);
          setFotoEmpresa('/contadefault.png'); 
        });
    }
  }, []);

  function getCookie(nome: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + nome + '=([^;]+)'));
    return match ? match[2] : null;
  }

  return (
    <nav className="font-sans bg-gradient-to-r py-2 bg-[#0f0e17] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] fixed w-screen z-20 top-0">
      <div className="w-full flex items-center justify-between px-4 lg:px-10">
        <a href="/" className="flex items-center space-x-2">
          <img src="/icone.png" className="h-16" />
          <span className="text-lg font-semibold text-white">StockControl</span>
        </a>

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
            <Link href={"/conta"}>
              <img
                src={fotoEmpresa}
                alt="Empresa"
                className="h-14 w-14 rounded-full object-cover border border-gray-300"
              />
            </Link>
          ) : (
            <Link
              href="/registro"
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
          <Link
            href="/registro"
            onClick={toggleMenu}
            className="bg-[#D4CCCC] text-black rounded-3xl px-6 py-2 text-center text-base"
          >
            Entrar
          </Link>
        </div>
      )}
    </nav>
  );
}
