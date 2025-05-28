"use client";
import { FaCog, FaSearch, FaPhoneAlt, FaLock } from "react-icons/fa";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Clientes() {
    const empresaAtivada = false;
    const empresaId = "1";
    const podeEditar = true;
    const clientes = [
        {
            id: "1",
            nome: "Cliente Exemplo",
            email: "cliente@exemplo.com",
            cpf: "123.456.789-00",
            telefone: "5511988887777",
            categoria: "Premium",
            foto: "",
            empresaId: "1",
            usuarioId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
    const busca = "";
    const [modoDark, setModoDark] = useState(false);

    useEffect(() => {
        const temaSalvo = localStorage.getItem("modoDark");
        const ativo = temaSalvo === "true";
        setModoDark(ativo);
        aplicarTema(ativo);
    }, []);

    const aplicarTema = (ativado: boolean) => {
        const root = document.documentElement;
        if (ativado) {
            root.classList.add("dark");
            root.style.setProperty("--cor-fundo", "#20252B");
            root.style.setProperty("--cor-texto", "#fffff2");
            root.style.setProperty("--cor-fundo-bloco", "#20252B");
            root.style.setProperty("--cor-borda", "#20252B");
            root.style.setProperty("--cor-cinza", "#A3A3A3");
            root.style.setProperty("--cor-destaque", "#00332C");
            document.body.style.backgroundColor = "#20252B";
            document.body.style.color = "#fffff2";
        } else {
            root.classList.remove("dark");
            root.style.setProperty("--cor-fundo", "#ffffff");
            root.style.setProperty("--cor-texto", "#000000");
            root.style.setProperty("--cor-fundo-bloco", "#ececec");
            root.style.setProperty("--cor-borda", "#ffffff");
            root.style.setProperty("--cor-cinza", "#4B5563");
            root.style.setProperty("--cor-destaque", "#00332C");
            document.body.style.backgroundColor = "#ffffff";
            document.body.style.color = "#000000";
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-2 py-8" style={{
            backgroundColor: modoDark ? "#20252B" : "#ffffff",
            color: modoDark ? "#ffffff" : "#000000",
        }}>
            <div className="w-full max-w-6xl">
                <h1 className={`text-center text-2xl font-mono mb-6 ${modoDark ? "text-white" : "text-black"}`}>
                    Clientes (em desenvolvimento)
                </h1>

                {empresaId && !empresaAtivada && (
                    <div className="mb-6 p-4 rounded-lg flex items-center gap-3"
                        style={{
                            backgroundColor: modoDark ? "#1E3A8A" : "#BFDBFE",
                            color: modoDark ? "#FFFFFF" : "#1E3A8A"
                        }}>
                        <FaLock className="text-xl" />
                        <div>
                            <p className="font-bold">Empresa não ativada</p>
                            <p>Ative sua empresa para acessar todos os recursos.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div
                        className="flex items-center border rounded-full px-4 py-2 shadow-sm w-full sm:w-auto"
                        style={{
                            backgroundColor: modoDark ? "#1F2937" : "#ffffff",
                            color: modoDark ? "#fffff2" : "#000000",
                            border: modoDark ? "1px solid #374151" : "2px solid #000000",
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Buscar"
                            className="outline-none font-mono text-sm bg-transparent w-full"
                            value={busca}
                             style={{
                            backgroundColor: modoDark ? "#1F2937" : "#ffffff",
                            color: modoDark ? "#fffff2" : "#000000",
                             }}
                            readOnly
                        />
                        <FaSearch className="ml-2" style={{ color: modoDark ? "#FBBF24" : "#00332C" }} />
                    </div>

                    {podeEditar && (
                        <button
                            className="px-6 py-2 border-2 rounded-lg transition font-mono text-sm w-full sm:w-auto"
                            style={{
                                backgroundColor: modoDark ? "#1a25359f" : "#FFFFFF",
                                borderColor: modoDark ? "#FFFFFF" : "#00332C",
                                color: modoDark ? "#FFFFFF" : "#00332C",
                            }}
                        >
                            Novo Cliente
                        </button>
                    )}
                </div>

                <div
                    className="border rounded-xl overflow-x-auto shadow"
                    style={{
                        backgroundColor: "var(--cor-fundo-bloco)",
                        borderColor: modoDark ? "#FFFFFF" : "#000000",
                    }}
                >
                    <table className="w-full text-sm font-mono min-w-[700px]">
                        <thead className="border-b">
                            <tr style={{ color: "var(--cor-fonte)" }}>
                                <th className="py-3 px-4 text-center" >
                                    <div className="flex items-center  gap-1 text-white justify-center">
                                        <FaCog color={`${modoDark ? "text-white" : "text-black"}`}/> <span className={`${modoDark ? "text-white" : "text-black"}`}> Foto </span>
                                    </div>
                                </th>
                                <th className={`py-3 px-4 text-center ${modoDark ? "text-white" : "text-black"}`}>Nome</th>
                                <th className={`py-3 px-4 text-center ${modoDark ? "text-white" : "text-black"}`}>CPF</th>
                                <th className={`py-3 px-4 text-center ${modoDark ? "text-white" : "text-black"}`}>Email</th>
                                <th className={`py-3 px-4 text-center ${modoDark ? "text-white" : "text-black"}`}>Telefone</th>
                                <th className={`py-3 px-4 text-center ${modoDark ? "text-white" : "text-black"}`}>Categoria</th>
                                <th className={`py-3 px-4 text-center ${modoDark ? "text-white" : "text-black"}`}>Adicionado em</th>
                                <th className={`py-3 px-4 text-center ${modoDark ? "text-white" : "text-black"}`}>Contato</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cliente) => (
                                <tr
                                    key={cliente.id}
                                    className={`cursor-pointer border-b transition ${modoDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                                        }`}
                                >
                                    <td className="py-3 px-4 text-center">
                                        {cliente.foto ? (
                                            <Image
                                                src="/contadefault.png"
                                                alt={cliente.nome}
                                                width={40}
                                                height={40}
                                                className="mx-auto w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"></div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">{cliente.nome}</td>
                                    <td className="py-3 px-4 text-center">{cliente.cpf}</td>
                                    <td className="py-3 px-4 text-center">{cliente.email}</td>
                                    <td className="py-3 px-4 text-center">
                                        {`(${cliente.telefone.slice(2, 4)}) ${cliente.telefone.slice(4, 9)}-${cliente.telefone.slice(9)}`}
                                    </td>
                                    <td className="py-3 px-4 text-center">{cliente.categoria}</td>
                                    <td className="py-3 px-4 text-center">{new Date(cliente.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <FaPhoneAlt
                                            color="#25D366"
                                            size={32}
                                            className="cursor-pointer m-auto border-2 p-1 rounded-2xl"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
