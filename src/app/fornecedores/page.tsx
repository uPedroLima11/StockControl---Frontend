"use client";
import { CategoriaI } from "@/utils/types/categoria";
import { FornecedorI } from "@/utils/types/fornecedor";
import { useEffect, useState } from "react";
import { FaCog, FaSearch } from "react-icons/fa";

export default function Fornecedores() {
  const [modoDark, setModoDark] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [_empresaId, setEmpresaId] = useState<string | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [_categorias, setCategorias] = useState<CategoriaI[]>([]);
  const [_modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const initialize = async () => {
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

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
      const usuario = await responseUsuario.json();
      setEmpresaId(usuario.empresaId);
      setTipoUsuario(usuario.tipo);

      const responseFornecedores = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`);
      const fornecedoresData = await responseFornecedores.json();
      console.log(fornecedoresData);
      setFornecedores(fornecedoresData);

      const responseCategorias = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/categorias`);
      const categoriasData = await responseCategorias.json();
      setCategorias(categoriasData);
    };

    initialize();
  }, []);

  const podeEditar = tipoUsuario === "ADMIN" || tipoUsuario === "PROPRIETARIO";
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-2xl font-mono mb-6" style={{ color: "var(--cor-fonte)" }}>
          Fornecedores
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div
            className="flex items-center border rounded-full px-4 py-2 shadow-sm"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#FFFFFF" : "#000000",
            }}
          >
            <input type="text" placeholder="Buscar Fornecedor" className="outline-none font-mono text-sm bg-transparent" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ color: "var(--cor-fonte)" }} />
            <FaSearch className="ml-2" style={{ color: modoDark ? "#FBBF24" : "#00332C" }} />
          </div>

          {podeEditar && (
            <button
              onClick={() => setModalAberto(true)}
              className="px-6 py-2 border-2 rounded-lg transition font-mono text-sm"
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#FFFFFF",
                borderColor: modoDark ? "#FFFFFF" : "#00332C",
                color: modoDark ? "#FFFFFF" : "#00332C",
              }}
            >
              Desabilitado
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
          <table className="w-full text-sm font-mono">
            <thead className="border-b">
              <tr style={{ color: "var(--cor-fonte)" }}>
                <th className="flex items-center justify-center py-3 px-4">
                  <div className="flex items-center gap-1">
                    <FaCog /> Foto
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Nome</th>
                <th className="py-3 px-4 text-center">CNPJ</th>
                <th className="py-3 px-4 text-center">Email</th>
                <th className="py-3 px-4 text-center">Telefone</th>
                <th className="py-3 px-4 text-center">Categoria</th>
                <th className="py-3 px-4 text-center">Adicionado em</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores
                .filter((fornecedor) => fornecedor.nome.toLowerCase().includes(busca.toLowerCase()))
                .map((fornecedor) => (
                  <tr key={fornecedor.id} className="border-b">
                    <td className="py-3 px-4 text-center flex items-center justify-center">{fornecedor.foto ? <img src={fornecedor.foto || "/contadefault.png"} alt={fornecedor.nome} className=" text-center w-10 h-10 rounded-full" /> : <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"></div>}</td>
                    <td className="py-3 px-4 text-center">{fornecedor.nome}</td>
                    <td className="py-3 px-4 text-center">{fornecedor.cnpj}</td>
                    <td className="py-3 px-4 text-center">{fornecedor.email}</td>
                    <td className="py-3 px-4 text-center">{fornecedor.telefone}</td>
                    <td className="py-3 px-4 text-center">{fornecedor.categoria}</td>
                    <td className="py-3 px-4 text-center">{new Date(fornecedor.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
