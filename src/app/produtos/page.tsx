"use client";

import { ProdutoI } from "@/utils/types/produtos";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaSearch, FaCog } from "react-icons/fa";

export default function Produtos() {
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
      const dados = await response.json();
      setProdutos(dados);
    }
    buscaDados();
  });

  const produtoTable = produtos.map((produto) => (
    <tr key={produto.id} className="border-b hover:bg-gray-100 transition">
      <td className="py-3 px-4 flex items-center gap-2 max-w-[260px]">
        <Image src={produto.foto || "/out.jpg"} width={30} height={30} className="rounded" priority loading="eager" alt={""} />
        <span className="truncate">{produto.nome}</span>
      </td>
      <td className="py-3 px-3">{produto.id}</td>
      <td className="py-3 px-3">{produto.fornecedor?.nome || ""}</td>
      <td className="py-3 px-3">{produto.categoria?.nome || ""}</td>
      <td className="py-3 px-3">{produto.quantidade}</td>
      <td className="py-3 px-3">R${produto.preco.toFixed(2).replace(".", ",")}</td>
    </tr>
  ));
  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-2xl font-mono text-white mb-6">Produtos</h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center border rounded-full px-4 py-2 bg-white shadow-sm">
            <input type="text" placeholder="Buscar Produto" className="outline-none font-mono text-sm" />
            <FaSearch className="ml-2 text-green-800" />
          </div>

          <button className="px-6 py-2 border-2 bg-white border-[#00332C] rounded-lg text-[#00332C] hover:bg-[#00332C] hover:text-white transition font-mono text-sm">Novo Produto</button>
        </div>

        <div className="bg-white border border-gray-300 rounded-xl overflow-x-auto shadow">
          <table className="w-full text-sm font-mono">
            <thead className="border-b">
              <tr className="text-left text-gray-700">
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <FaCog />
                    Nome ▲
                  </div>
                </th>
                <th className="py-3 px-4">Identificador</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4">Categorias</th>
                <th className="py-3 px-4">Estoque</th>
                <th className="py-3 px-4">Preço</th>
              </tr>
            </thead>
            <tbody>
              {produtoTable.length > 0 ? (
                produtoTable
              ) : (
                <tr className="border-b hover:bg-gray-100 transition">
                  <td colSpan={6} className="py-3 px-4 text-center text-gray-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}	
              {/* {Array(4)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-b hover:bg-gray-100 transition">
                    <td className="py-3 px-4 flex items-center gap-2 max-w-[260px]">
                      <Image src="/gabinete.png" alt="gabinete" width={30} height={30} className="rounded" priority loading="eager" />
                      <span className="truncate">PC Gamer Mancer Bonnacon III, Intel Core i5, 16GB RAM, RTX 3060</span>
                    </td>
                    <td className="py-3 px-4">418312</td>
                    <td className="py-3 px-4">Terabyte</td>
                    <td className="py-3 px-4">Eletrônicos</td>
                    <td className="py-3 px-4">3</td>
                    <td className="py-3 px-4">R$ 1800,00</td>
                  </tr>
                ))} */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
