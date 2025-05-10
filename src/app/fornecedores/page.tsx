"use client";
import { FornecedorI } from "@/utils/types/fornecedor";
import { useEffect, useState } from "react";
import { FaCog, FaSearch, FaPhoneAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Fornecedores() {
  const [modoDark, setModoDark] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<FornecedorI | null>(null);
  const [form, setForm] = useState<FornecedorI>({
    id: "",
    nome: "",
    email: "",
    cnpj: "",
    telefone: "",
    categoria: "",
    foto: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    Produto: [],
  });
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
      setFornecedores(fornecedoresData);
    };

    initialize();
  }, []);

  async function handleAdicionarFornecedor() {
    if (!empresaId) return alert("Empresa não identificada.");

    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        cnpj: form.cnpj,
        telefone: form.telefone,
        categoria: form.categoria,
        foto: form.foto,
      }),
    });

    if (response.status === 201) {
      Swal.fire({
        text: "Fornecedor adicionado com sucesso!",
        icon: "success",
        confirmButtonColor: "#013C3C",
      });
      setModalAberto(false);
      window.location.reload();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo deu errado, tente novamente.",
        confirmButtonColor: "#013C3C",
      });
    }
  }

  async function handleDelete() {
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
        await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${modalVisualizar.id}`, {
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
  }

  function handleEntrarContato(fornecedor: FornecedorI) {
    const telefoneFormatado = fornecedor.telefone.replace(/\D/g, "");
    const numeroComDdd = `${telefoneFormatado}`;
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroComDdd}`;
    window.open(urlWhatsApp, "_blank");
  }

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
              Adicionar Fornecedor
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
                <th className="py-3 px-4 text-center">Contato</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores
                .filter((fornecedor) => fornecedor.nome.toLowerCase().includes(busca.toLowerCase()))
                .map((fornecedor) => (
                  <tr key={fornecedor.id} className="cursor-pointer border-b">
                    <td
                      onClick={() => {
                        setModalVisualizar(fornecedor);
                        setForm(fornecedor);
                      }}
                      className="py-3 px-4 text-center flex items-center justify-center"
                    >
                      {fornecedor.foto ? <img src={fornecedor.foto || "/contadefault.png"} alt={fornecedor.nome} className="text-center w-10 h-10 rounded-full" /> : <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"></div>}
                    </td>
                    <td
                      onClick={() => {
                        setModalVisualizar(fornecedor);
                        setForm(fornecedor);
                      }}
                      className="py-3 px-4 text-center"
                    >
                      {fornecedor.nome}
                    </td>
                    <td
                      onClick={() => {
                        setModalVisualizar(fornecedor);
                        setForm(fornecedor);
                      }}
                      className="py-3 px-4 text-center"
                    >
                      {fornecedor.cnpj}
                    </td>
                    <td
                      onClick={() => {
                        setModalVisualizar(fornecedor);
                        setForm(fornecedor);
                      }}
                      className="py-3 px-4 text-center"
                    >
                      {fornecedor.email}
                    </td>
                    <td
                      onClick={() => {
                        setModalVisualizar(fornecedor);
                        setForm(fornecedor);
                      }}
                      className="py-3 px-4 text-center"
                    >
                        {`(${fornecedor.telefone.slice(2, 4)}) ${fornecedor.telefone.slice(4, 9)}-${fornecedor.telefone.slice(9)}`}
                    </td>
                    <td
                      onClick={() => {
                        setModalVisualizar(fornecedor);
                        setForm(fornecedor);
                      }}
                      className="py-3 px-4 text-center"
                    >
                      {fornecedor.categoria}
                    </td>
                    <td
                      onClick={() => {
                        setModalVisualizar(fornecedor);
                        setForm(fornecedor);
                      }}
                      className="py-3 px-4 text-center"
                    >
                      {new Date(fornecedor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <FaPhoneAlt onClick={() => handleEntrarContato(fornecedor)} color="#25D366" size={32} className="cursor-pointer m-auto border-2 p-1 rounded-2xl" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {(modalAberto || modalVisualizar) && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-lg"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              color: "var(--cor-fonte)",
            }}
          >
            <h2 className="text-xl font-bold mb-4">{modalVisualizar ? "Visualizar Fornecedor" : "Novo Fornecedor"}</h2>

            <input placeholder="Nome" value={form.nome || ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} disabled={Boolean(!podeEditar && modalVisualizar)} style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} />

            <input placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} disabled={Boolean(!podeEditar && modalVisualizar)} style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} />

            <input placeholder="cnpj" value={form.cnpj || ""} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} disabled={Boolean(!podeEditar && modalVisualizar)} style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} />

            <input placeholder="Telefone" value={form.telefone || ""} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} disabled={Boolean(!podeEditar && modalVisualizar)} style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} />

            <input placeholder="Categoria" value={form.categoria || ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} disabled={Boolean(!podeEditar && modalVisualizar)} style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} />

            <input placeholder="Foto" value={form.foto || ""} onChange={(e) => setForm({ ...form, foto: e.target.value })} className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} disabled={Boolean(!podeEditar && modalVisualizar)} style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setModalVisualizar(null);
                }}
                className="hover:underline"
                style={{ color: "var(--cor-fonte)" }}
              >
                Fechar
              </button>
              {modalVisualizar ? (
                podeEditar && (
                  <>
                    <button onClick={handleAdicionarFornecedor} className="px-4 py-2 rounded hover:bg-blue-700" style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)", border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}` }}>
                      Salvar
                    </button>
                    <button onClick={handleDelete} className="px-4 py-2 rounded hover:bg-red-700" style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)", border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}` }}>
                      Excluir
                    </button>
                  </>
                )
              ) : (
                <button onClick={handleAdicionarFornecedor} className="px-4 py-2 rounded hover:bg-[#00443f]" style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)", border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}` }}>
                  Afiliar Fornecedor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded p-2 mb-3";
