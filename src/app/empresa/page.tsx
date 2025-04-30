'use client';

import { useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

interface Empresa {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  foto?: string;
}

export default function Empresa() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar cookie
  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const userId = localStorage.getItem('idUsuario') || getCookie('idUsuario');

        if (!userId) {
          console.error('Usuário não logado');
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${userId}`);
        if (!res.ok) throw new Error('Erro ao buscar empresa');

        const data = await res.json();
        setEmpresa(data);
      } catch (error) {
        console.error('Erro ao buscar dados da empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600 font-mono">Carregando dados da empresa...</p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-600 font-mono">Empresa não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start pt-10">
      <div className="bg-white w-full max-w-md rounded p-6 shadow-md">
        <h1 className="text-2xl font-mono text-center mb-6">Minha Empresa</h1>

        <div className="border-b border-black mb-4 pb-2">
          <h2 className="text-lg font-semibold underline">Dados da Empresa</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>Nome da Empresa: <strong>{empresa.nome}</strong></p>
            <p>Endereço: {empresa.endereco || 'Não informado'}</p>
            <p>País: {empresa.pais || 'Não informado'}</p>
            <p>Estado: {empresa.estado || 'Não informado'}</p>
            <p>Cidade: {empresa.cidade || 'Não informado'}</p>
            <p>CEP: {empresa.cep || 'Não informado'}</p>
            <p>Telefone: {empresa.telefone || 'Não informado'}</p>
            <p>Email Corporativo: {empresa.email}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Logo da Empresa</h2>
          <button className="flex items-center gap-2 px-6 py-2 border-2 border-[#00332C] rounded-lg text-[#00332C] hover:bg-[#00332C] hover:text-white transition font-mono text-sm">
            <FaCloudUploadAlt />
            Adicionar Logo
          </button>
        </div>
      </div>
    </div>
  );
}
