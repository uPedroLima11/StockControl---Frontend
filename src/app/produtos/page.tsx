"use client";

import { ProdutoI } from "@/utils/types/produtos";
import { FornecedorI } from "@/utils/types/fornecedor";
import { CategoriaI } from "@/utils/types/categoria";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaSearch, FaCog } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Produtos() {
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<ProdutoI | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [categorias, setCategorias] = useState<CategoriaI[]>([]);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [form, setForm] = useState<ProdutoI>({
    id: "",
    nome: "",
    descricao: "",
    preco: 0,
    quantidade: 0,
    foto: "",
    fornecedorId: "",
    categoriaId: "",
    empresaId: "",
    fornecedor: undefined,
    categoria: undefined,
    empresa: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [busca, setBusca] = useState("");
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

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    const buscarUsuario = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
      const usuario = await response.json();
      setEmpresaId(usuario.empresaId);
      setTipoUsuario(usuario.tipo);
    };

    buscarUsuario();
  }, []);

  useEffect(() => {
    if (!empresaId) return;

    const buscarProdutos = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
      const todosProdutos: ProdutoI[] = await response.json();
      const produtosDaEmpresa = todosProdutos.filter(p => p.empresaId === empresaId);
      setProdutos(produtosDaEmpresa);
    };

    buscarProdutos();
  }, [empresaId]);

  useEffect(() => {
    const buscarFornecedores = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`);
      const data = await res.json();
      setFornecedores(data);
    };

    const buscarCategorias = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/categorias`);
      const data = await res.json();
      setCategorias(data);
    };

    buscarFornecedores();
    buscarCategorias();
  }, []);

  useEffect(() => {
    if (modalVisualizar) {
      setForm({
        ...modalVisualizar,
        preco: parseFloat(modalVisualizar.preco.toFixed(2)),
        quantidade: modalVisualizar.quantidade,
      });
    }
  }, [modalVisualizar]);

  const handleSubmit = async () => {
    if (!empresaId) return alert("Empresa não identificada.");
    try {
      const precoFormatado = parseFloat(form.preco.toString().replace(/\./g, "").replace(",", "."));
      const quantidadeFormatada = parseFloat(form.quantidade.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, preco: precoFormatado, quantidade: quantidadeFormatada, empresaId }),
      });

      if (response.ok) {
        setModalAberto(false);
        setForm({
          id: "",
          nome: "",
          descricao: "",
          preco: 0,
          quantidade: 0,
          foto: "",
          fornecedorId: "",
          categoriaId: "",
          empresaId: "",
          fornecedor: undefined,
          categoria: undefined,
          empresa: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.mensagem || "Erro ao cadastrar produto");
      }
    } catch (err) {
      console.error("Erro ao criar produto:", err);
    }
  };

  const handleUpdate = async () => {
    if (!modalVisualizar) return;

    try {
      const precoFormatado = parseFloat(form.preco.toString().replace(/\./g, "").replace(",", "."));
      const quantidadeFormatada = parseFloat(form.quantidade.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${modalVisualizar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, preco: precoFormatado, quantidade: quantidadeFormatada }),
      });

      if (response.ok) {
        setModalVisualizar(null);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Produto atualizado com sucesso!",
          showConfirmButton: false,
          timer: 1500,
        });
        setTimeout(() => window.location.reload(), 1600);
      } else {
        Swal.fire({ icon: "error", title: "Erro!", text: "Erro ao atualizar produto." });
      }
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
      Swal.fire({ icon: "error", title: "Erro!", text: "Erro inesperado ao tentar atualizar." });
    }
  };

  const handleDelete = async () => {
    if (!modalVisualizar) return;

    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${modalVisualizar.id}`, {
          method: "DELETE",
        });
        Swal.fire("Deletado!", "O produto foi excluído com sucesso.", "success");
        setModalVisualizar(null);
        window.location.reload();
      } catch (err) {
        console.error("Erro ao excluir produto:", err);
        Swal.fire("Erro!", "Não foi possível deletar o produto.", "error");
      }
    }
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const podeEditar = tipoUsuario === "ADMIN" || tipoUsuario === "PROPRIETARIO";

  return (
    <div className="flex justify-center px-4 py-10" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-2xl font-mono mb-6" style={{ color: "var(--cor-fonte)" }}>
          Produtos
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div
            className="flex items-center border rounded-full px-4 py-2 shadow-sm"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#FFFFFF" : "#000000"
            }}
          >
            <input
              type="text"
              placeholder="Buscar Produto"
              className="outline-none font-mono text-sm bg-transparent"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ color: "var(--cor-fonte)" }}
            />
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
              Novo Produto
            </button>
          )}
        </div>

        <div
          className="border rounded-xl overflow-x-auto shadow"
          style={{
            backgroundColor: "var(--cor-fundo-bloco)",
            borderColor: modoDark ? "#FFFFFF" : "#000000"
          }}
        >
          <table className="w-full text-sm font-mono">
            <thead className="border-b">
              <tr style={{ color: "var(--cor-fonte)" }}>
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FaCog /> Nome</div></th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-center">Estoque</th>
                <th className="py-3 px-4">Preço</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map(produto => (
                <tr
                  key={produto.id}
                  onClick={() => { setModalVisualizar(produto); setForm(produto); }}
                  className="border-b hover:bg-opacity-50 transition cursor-pointer"
                  style={{
                    color: "var(--cor-fonte)",
                    borderColor: modoDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Image src={produto.foto || "/out.jpg"} width={30} height={30} className="rounded" alt={produto.nome} />
                    <span className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap block">{produto.nome}</span>
                  </td>
                  <td className="py-3 px-3">{produto.fornecedor?.nome || "-"}</td>
                  <td className="py-3 px-3">{produto.categoria?.nome || "-"}</td>
                  <td className="py-3 px-4 text-center">{produto.quantidade || "-"}</td>
                  <td className="py-3 px-3">R${produto.preco.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(modalAberto || modalVisualizar) && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
            <div
              className="p-6 rounded-lg shadow-xl w-full max-w-lg"
              style={{
                backgroundColor: "var(--cor-fundo-bloco)",
                color: "var(--cor-fonte)"
              }}
            >
              <h2 className="text-xl font-bold mb-4">{modalVisualizar ? "Visualizar Produto" : "Novo Produto"}</h2>

              <input
                placeholder="Nome"
                value={form.nome || ""}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className={`${inputClass} bg-transparent border ${modoDark ? 'border-white' : 'border-gray-300'}`}
                disabled={Boolean(!podeEditar && modalVisualizar)}
                style={{ color: "var(--cor-fonte)" }}
              />

              <input
                placeholder="Descrição"
                value={form.descricao || ""}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className={`${inputClass} bg-transparent border ${modoDark ? 'border-white' : 'border-gray-300'}`}
                disabled={Boolean(!podeEditar && modalVisualizar)}
                style={{ color: "var(--cor-fonte)" }}
              />

              <input
                placeholder="Preço"
                type="text"
                value={form.preco || ""}
                onChange={(e) => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })}
                className={`${inputClass} bg-transparent border ${modoDark ? 'border-white' : 'border-gray-300'}`}
                disabled={Boolean(!podeEditar && modalVisualizar)}
                style={{ color: "var(--cor-fonte)" }}
              />

              <input
                placeholder="Quantidade"
                type="number"
                value={form.quantidade || ""}
                onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                className={`${inputClass} bg-transparent border ${modoDark ? 'border-white' : 'border-gray-300'}`}
                disabled={Boolean(!podeEditar && modalVisualizar)}
                style={{ color: "var(--cor-fonte)" }}
              />

              <input
                placeholder="Foto (URL) (Não obrigatório)"
                value={form.foto || ""}
                onChange={(e) => setForm({ ...form, foto: e.target.value })}
                className={`${inputClass} bg-transparent border ${modoDark ? 'border-white' : 'border-gray-300'}`}
                disabled={Boolean(!podeEditar && modalVisualizar)}
                style={{ color: "var(--cor-fonte)" }}
              />

              {form.foto && (
                <img
                  src={form.foto}
                  alt="Preview"
                  className="w-44 h-44 object-cover rounded mb-4"
                />
              )}

              <select
                value={form.fornecedorId || ""}
                onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}
                className={`${inputClass} bg-transparent border ${modoDark ? 'border-white' : 'border-gray-300'}`}
                disabled={Boolean(!podeEditar && modalVisualizar)}
                style={{ color: "var(--cor-fonte)" }}
              >
                <option value="">Selecione o Fornecedor</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>

              <select
                value={form.categoriaId || ""}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                className={`${inputClass} bg-transparent border ${modoDark ? 'border-white' : 'border-gray-300'}`}
                disabled={Boolean(!podeEditar && modalVisualizar)}
                style={{ color: "var(--cor-fonte)" }}
              >
                <option value="">Selecione a Categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => { setModalAberto(false); setModalVisualizar(null); }}
                  className="hover:underline"
                  style={{ color: "var(--cor-fonte)" }}
                >
                  Fechar
                </button>
                {modalVisualizar ? (
                  podeEditar && <>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 rounded hover:bg-blue-700"
                      style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)", border: `1px solid ${modoDark ? '#FFFFFF' : '#000000'}` }}
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded hover:bg-red-700"
                      style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)", border: `1px solid ${modoDark ? '#FFFFFF' : '#000000'}` }}
                    >
                      Excluir
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded hover:bg-[#00443f]"
                    style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)", border: `1px solid ${modoDark ? '#FFFFFF' : '#000000'}` }}
                  >
                    Criar Produto
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass = "w-full rounded p-2 mb-3";