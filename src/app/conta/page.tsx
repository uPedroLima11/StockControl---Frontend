'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  empresaId: string | null;
};

type Empresa = {
  nome?: string;
  telefone?: string;
  endereco?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  email?: string;
};

export default function MinhaConta() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    empresa: {
      nome: '',
      telefone: '',
      endereco: '',
      pais: '',
      estado: '',
      cidade: '',
      cep: '',
      email: '',
    },
  });

  function getCookie(nome: string) {
    const match = document.cookie.match(new RegExp('(^| )' + nome + '=([^;]+)'));
    return match ? match[2] : null;
  }

  useEffect(() => {
    const idUsuario = getCookie('idUsuario');
    if (!idUsuario) return;

    const buscarDados = async () => {
      const resUser = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios`);
      const todosUsuarios = await resUser.json();
      const user = todosUsuarios.find((u: Usuario) => u.id === idUsuario);
      setUsuario(user);

      const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
      const empresaData = await resEmpresa.json();
      setEmpresa(empresaData.empresa);
    };

    buscarDados();
  }, []);

  const abrirModal = () => {
    setForm({
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      empresa: {
        nome: empresa?.nome || '',
        telefone: empresa?.telefone || '',
        endereco: empresa?.endereco || '',
        pais: empresa?.pais || '',
        estado: empresa?.estado || '',
        cidade: empresa?.cidade || '',
        cep: empresa?.cep || '',
        email: empresa?.email || '',
      },
    });
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!usuario) return;

    await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuario.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    alert('Dados atualizados!');
    setModalAberto(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 bg-[#20252B]">
      <div className="bg-white w-full max-w-md rounded p-6 shadow-md">
        <h1 className="text-2xl font-mono text-center mb-6">Minha conta</h1>

        <div className="border-b border-black mb-4 pb-2">
          <h2 className="text-lg font-semibold underline">Email</h2>
          <p className="mt-1">Email: {usuario?.email || '...'}</p>
        </div>

        <div className="border-b border-black mb-6 pb-6">
          <h2 className="text-lg font-semibold mb-4">Senha</h2>
          <Link href="/esqueci" className="px-6 py-2 border-2 border-[#00332C] rounded-lg text-[#00332C] hover:bg-[#00332C] hover:text-white transition font-mono text-sm">
            Trocar Minha Senha
          </Link>
        </div>

        <div className="border-b border-black mb-4 pb-2">
          <h2 className="text-lg font-semibold">Informações da Conta</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>Nome da Empresa: <strong>{empresa?.nome || 'Adicionar'}</strong></p>
            <p>Cargo na Empresa: <strong>{usuario?.tipo || 'Adicionar'}</strong></p>
            <p>Nome: {usuario?.nome?.split(' ')[0] || 'Adicionar'}</p>
            <p>Sobrenome: {usuario?.nome?.split(' ').slice(1, 3).join(' ') || 'Adicionar'}</p>
            <p>Endereço: {empresa?.endereco || 'Adicionar'}</p>
            <p>País: {empresa?.pais || 'Adicionar'}</p>
            <p>Estado: {empresa?.estado || 'Adicionar'}</p>
            <p>Cidade: {empresa?.cidade || 'Adicionar'}</p>
            <p>Cep: {empresa?.cep || 'Adicionar'}</p>
            <p>Telefone: {empresa?.telefone || 'Adicionar'}</p>
            <p>Email da Empresa: {empresa?.email || 'Adicionar'}</p>
          </div>
        </div>

        <button onClick={abrirModal} className="mt-4 bg-[#00332C] text-white px-6 py-2 rounded hover:bg-[#00443f] transition w-full">
          Editar Perfil
        </button>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Conta</h2>

            <label className="block text-sm font-medium">Nome:</label>
            <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">Email:</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">Nome da Empresa:</label>
            <input type="text" value={form.empresa.nome} onChange={(e) => setForm({ ...form, empresa: { ...form.empresa, nome: e.target.value } })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">Email da Empresa:</label>
            <input type="email" value={form.empresa.email} onChange={(e) => setForm({ ...form, empresa: { ...form.empresa, email: e.target.value } })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">Telefone:</label>
            <input type="text" value={form.empresa.telefone} onChange={(e) => setForm({ ...form, empresa: { ...form.empresa, telefone: e.target.value } })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">Endereço:</label>
            <input type="text" value={form.empresa.endereco} onChange={(e) => setForm({ ...form, empresa: { ...form.empresa, endereco: e.target.value } })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">País:</label>
            <input type="text" value={form.empresa.pais} onChange={(e) => setForm({ ...form, empresa: { ...form.empresa, pais: e.target.value } })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">Estado:</label>
            <input type="text" value={form.empresa.estado} onChange={(e) => setForm({ ...form, empresa: { ...form.empresa, estado: e.target.value } })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">Cidade:</label>
            <input type="text" value={form.empresa.cidade} onChange={(e) => setForm({ ...form, empresa: { ...form.empresa, cidade: e.target.value } })} className="w-full border p-2 mb-3 rounded" />

            <label className="block text-sm font-medium">CEP:</label>
            <input type="text" value={form.empresa.cep} onChange={(e) => setForm({ ...form, empresa: { ...form.empresa, cep: e.target.value } })} className="w-full border p-2 mb-3 rounded" />

            <div className="flex justify-between mt-6">
              <button onClick={() => setModalAberto(false)} className="text-gray-500 hover:underline">Cancelar</button>
              <button onClick={handleSalvar} className="bg-[#00332C] text-white px-4 py-2 rounded hover:bg-[#00443f]">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
