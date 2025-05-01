'use client';

import Link from 'next/link';
export default function MinhaConta() {
    return (
        <div className="min-h-screen flex justify-center items-start pt-10">
            <div className="bg-white w-full max-w-md rounded p-6 shadow-md">
                <h1 className="text-2xl font-mono text-center mb-6">Minha conta</h1>

                <div className="border-b border-black mb-4 pb-2">
                    <h2 className="text-lg font-semibold underline">Email</h2>
                    <p className="mt-1">Email: Usuariodaconta@gmail.com</p>
                </div>

                <div className="border-b border-black mb-6 pb-6">
                    <h2 className="text-lg font-semibold mb-4">Senha</h2>
                    <Link href={"/esqueci"} className="px-6 py-2 border-2 border-[#00332C] rounded-lg text-[#00332C] hover:bg-[#00332C] hover:text-white transition font-mono text-sm">
                        Trocar Minha Senha
                    </Link>
                </div>

                <div className="border-b border-black mb-4 pb-2">
                    <h2 className="text-lg font-semibold">Informações da Conta</h2>
                    <div className="mt-2 space-y-1 text-sm">
                        <p>Nome da Empresa: <strong>StockControl</strong></p>
                        <p>Cargo na Empresa: <strong>Proprietário</strong></p>
                        <p>Primeiro Nome: Usuario</p>
                        <p>Sobrenome: da Conta</p>
                        <p>Endereço: Rua Quatorze</p>
                        <p>País: Brasil</p>
                        <p>Estado: RS</p>
                        <p>Cidade: Pelotas</p>
                        <p>Cep: 40048922</p>
                        <p>Telefone: <span className="text-gray-500">Adicionar</span></p>
                        <p>WebSite: <span className="text-gray-500">Adicionar</span></p>
                        <p>Email da Empresa: <span className="text-gray-500">Adicionar</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
