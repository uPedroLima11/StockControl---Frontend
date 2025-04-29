'use client'

import { Poppins } from 'next/font/google';
import Image from 'next/image';

const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
});

export default function Dashboard() {
    return (
        <div className="px-2 sm:px-4 pt-8 bg-[#20252B]">
            <div className="bg-[#013C3C] justify-center w-full max-w-6xl rounded-[2rem] px-4 sm:px-8 md:px-12 py-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 mx-auto shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]">
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
                    <h1 className="text-center text-2xl font-mono text-white">Dashboard</h1>

                    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-md">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Resumo do Inventário</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                            <div>
                                <p className="text-2xl font-semibold text-gray-800">36</p>
                                <p className="text-sm text-gray-500">Itens Disponíveis</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-800">R$ 109.00</p>
                                <p className="text-sm text-gray-500">Custo Itens</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-800">R$ 407.00</p>
                                <p className="text-sm text-gray-500">Lucro de Venda Mensal</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-md">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Atividades Recentes</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
                            <div>
                                <p className="text-lg font-bold text-gray-700">10</p>
                                <p className="text-sm text-gray-500">Itens Recebidos</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-700">R$ 57.30</p>
                                <p className="text-sm text-gray-500">Custo Itens</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-700">5</p>
                                <p className="text-sm text-gray-500">Itens Ajustados</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-700">12</p>
                                <p className="text-sm text-gray-500">Itens Removidos</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-700 break-words">R$ 24.00 / R$ 3.00</p>
                                <p className="text-sm text-gray-500">Aumento / Redução de Custos</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-md overflow-x-auto">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Produtos com Estoque Baixo</h2>
                        <table className="min-w-full text-sm text-left">
                            <thead className="border-b">
                                <tr className="text-gray-700 font-semibold">
                                    <th className="py-2 pr-4 whitespace-nowrap">Produto</th>
                                    <th className="py-2 pr-4 whitespace-nowrap">Estoque Atual</th>
                                    <th className="py-2 pr-4 whitespace-nowrap">Estoque Ideal</th>
                                    <th className="py-2 pr-4 whitespace-nowrap">Valor Atual</th>
                                    <th className="py-2 pr-4 whitespace-nowrap">Valor Ideal</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                <tr className="border-b">
                                    <td className="py-2 pr-4 whitespace-nowrap">Computadores</td>
                                    <td className="py-2 pr-4">7</td>
                                    <td className="py-2 pr-4">25</td>
                                    <td className="py-2 pr-4">R$ 22.400</td>
                                    <td className="py-2 pr-4">R$ 80.100</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 pr-4 whitespace-nowrap">Monitores</td>
                                    <td className="py-2 pr-4">5</td>
                                    <td className="py-2 pr-4">20</td>
                                    <td className="py-2 pr-4">R$ 45.000</td>
                                    <td className="py-2 pr-4">R$ 160.600</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 pr-4 whitespace-nowrap">Telefones</td>
                                    <td className="py-2 pr-4">11</td>
                                    <td className="py-2 pr-4">17</td>
                                    <td className="py-2 pr-4">R$ 16.000</td>
                                    <td className="py-2 pr-4">R$ 64.800</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 pr-4 whitespace-nowrap">Teclados</td>
                                    <td className="py-2 pr-4">2</td>
                                    <td className="py-2 pr-4">17</td>
                                    <td className="py-2 pr-4">R$ 800</td>
                                    <td className="py-2 pr-4">R$ 12.050</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 whitespace-nowrap">Mouses</td>
                                    <td className="py-2 pr-4">7</td>
                                    <td className="py-2 pr-4">17</td>
                                    <td className="py-2 pr-4">R$ 15.400</td>
                                    <td className="py-2 pr-4">R$ 73.200</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
