'use client';

import { useEffect, useState } from 'react';
import { FaCog } from 'react-icons/fa';

interface Usuario {
  id: string;
  nome: string;
  tipo: string;
  createdAt: string;
  updatedAt: string;
  empresaId: string | null;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function getCookie(nome: string): string | null {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (let cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === nome) return decodeURIComponent(value);
    }
    return null;
  }
  

  useEffect(() => {
    const idUsuario = getCookie('idUsuario');
    console.log('🧩 ID do usuário encontrado no cookie:', idUsuario);
    
    if (!idUsuario) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    const fetchDados = async () => {
      try {
        const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
        if (!resEmpresa.ok) throw new Error('Você não possui uma empresa cadastrada');

        const empresaData = await resEmpresa.json();
        const empresaIdRecebido = empresaData.empresa.id;
        setEmpresaId(empresaIdRecebido);

        const resUsuarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios`);
        if (!resUsuarios.ok) throw new Error('Erro ao buscar usuários');

        const todosUsuarios: Usuario[] = await resUsuarios.json();

        const usuariosDaEmpresa = todosUsuarios.filter(
          (usuario) => usuario.empresaId === empresaIdRecebido
        );

        setUsuarios(usuariosDaEmpresa);
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#20252B] text-white py-10 px-4 md:px-16">
        <h1 className="text-3xl font-mono text-white">Carregando usuários...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#20252B] text-white py-10 px-4 md:px-16">
        <h1 className="text-3xl font-mono text-red-400">Erro: {error}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B1F24] text-white py-10 px-4 md:px-16">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-mono text-white">Usuários</h1>
        <button className="border px-4 py-2 rounded-sm border-[#55D6BE] text-sm hover:bg-[#55d6be1a] transition">
          Convidar Usuário
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left text-sm font-light border-separate border-spacing-y-2">
          <thead className="border-b border-gray-600 text-gray-300">
            <tr>
              <th className="px-6 py-4">Nome de Usuário</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4">Criado em</th>
              <th className="px-6 py-4 font-bold">Última Atualização</th>
              <th className="px-6 py-4">Ação</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">Nenhum usuário encontrado</td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="bg-[#2A2F36] rounded-md shadow-sm">
                  <td className="px-6 py-4">{usuario.nome}</td>
                  <td className="px-6 py-4">{usuario.tipo}</td>
                  <td className="px-6 py-4">
                    {new Date(usuario.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {new Date(usuario.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <FaCog className="cursor-pointer hover:text-gray-400" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
