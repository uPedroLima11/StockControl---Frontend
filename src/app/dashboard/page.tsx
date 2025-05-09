"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [modoDark, setModoDark] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);

    const root = document.documentElement;

    if (ativado) {
      root.style.setProperty("--cor-fundo", "#20252B");
      root.style.setProperty("--cor-fonte", "#FFFFFF");
      root.style.setProperty("--cor-subtitulo", "#A3A3A3");
      root.style.setProperty("--cor-fundo-bloco", "#1a25359f");
    } else {
      root.style.setProperty("--cor-fundo", "#FFFFFF");
      root.style.setProperty("--cor-fonte", "#000000");
      root.style.setProperty("--cor-subtitulo", "#4B5563");
      root.style.setProperty("--cor-fundo-bloco", "#FFFFFF");
    }
  }, []);

  return (
    <div className="px-2 sm:px-4 pt-8">
      <div
        className="justify-center w-full max-w-6xl rounded-[2rem] px-4 sm:px-8 md:px-12 py-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 mx-auto shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]"
        style={{ backgroundColor: "var(--cor-caixa-destaque)" }}
      >
        <Image
          alt="icone"
          src="/icone.png"
          width={100}
          height={100}
          quality={100}
          priority
          className="object-contain"
        />
        <div className="text-white text-center md:text-left">
          <h1 className="text-3xl font-bold">STOCKCONTROL</h1>
          <p className="text-base mt-1">
            Controle seu estoque de <br />
            forma simples e inteligente
          </p>
        </div>
      </div>

      <div className="flex justify-center px-2 sm:px-4 py-10">
        <div className="w-full max-w-6xl space-y-8">
          <h1 className="text-center text-2xl font-mono" style={{ color: "var(--cor-fonte)" }}>
            Dashboard
          </h1>

          <div
            className="border-2 rounded-xl p-6 shadow-md"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#FFFFFF" : "#000000",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: "var(--cor-fonte)" }}>
              Resumo do Inventário
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>R$ 407.00</p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>Lucro de Venda Mensal</p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>R$ 109.00</p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>Custo Itens</p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>36</p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>Itens Disponíveis</p>
              </div>
            </div>
          </div>

          <div
            className="border-2 rounded-xl p-6 shadow-md"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#FFFFFF" : "#000000",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: "var(--cor-fonte)" }}>
              Atividades Recentes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {[
                ["10", "Itens Recebidos"],
                ["R$ 57.30", "Custo Itens"],
                ["5", "Itens Ajustados"],
                ["12", "Itens Removidos"],
                ["R$ 24.00 / R$ 3.00", "Aumento / Redução de Custos"],
              ].map(([valor, texto]) => (
                <div key={texto}>
                  <p className="text-lg font-bold" style={{ color: "var(--cor-fonte)" }}>{valor}</p>
                  <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>{texto}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="border-2 rounded-xl p-6 shadow-md overflow-x-auto"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#FFFFFF" : "#000000",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: "var(--cor-fonte)" }}>
              Produtos com Estoque Baixo
            </h2>
            <table className="min-w-full text-sm text-left">
              <thead className="border-b">
                <tr style={{ color: "var(--cor-fonte)" }} className="font-semibold">
                  <th className="py-2 pr-4 whitespace-nowrap">Produto</th>
                  <th className="py-2 pr-4 whitespace-nowrap">Estoque Atual</th>
                  <th className="py-2 pr-4 whitespace-nowrap">Estoque Ideal</th>
                  <th className="py-2 pr-4 whitespace-nowrap">Valor Atual</th>
                  <th className="py-2 pr-4 whitespace-nowrap">Valor Ideal</th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--cor-fonte)" }}>
                {[
                  ["Computadores", 7, 25, "R$ 22.400", "R$ 80.100"],
                  ["Monitores", 5, 20, "R$ 45.000", "R$ 160.600"],
                  ["Telefones", 11, 17, "R$ 16.000", "R$ 64.800"],
                  ["Teclados", 2, 17, "R$ 800", "R$ 12.050"],
                  ["Mouses", 7, 17, "R$ 15.400", "R$ 73.200"],
                ].map(([nome, atual, ideal, valorAtual, valorIdeal]) => (
                  <tr className="border-b" key={nome}>
                    <td className="py-2 pr-4 whitespace-nowrap">{nome}</td>
                    <td className="py-2 pr-4">{atual}</td>
                    <td className="py-2 pr-4">{ideal}</td>
                    <td className="py-2 pr-4">{valorAtual}</td>
                    <td className="py-2 pr-4">{valorIdeal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
