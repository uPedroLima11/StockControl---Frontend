"use client";
import { FornecedorI } from "@/utils/types/fornecedor";
import { useEffect, useState } from "react";
import { FaCog, FaSearch, FaPhoneAlt, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function Fornecedores() {
  const [modoDark, setModoDark] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<FornecedorI | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState<FornecedorI>({
    id: "",
    nome: "",
    email: "",
    cnpj: "",
    telefone: "",
    categoria: "",
    foto: "",
    empresaId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    Produto: [],
  });
  const [busca, setBusca] = useState("");
  const { t } = useTranslation("fornecedores");
  const router = useRouter();

  const verificarAtivacaoEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar dados da empresa");
      }
      const empresaData = await response.json();
      
      const ativada = empresaData.ChaveAtivacao !== null && empresaData.ChaveAtivacao !== undefined;
      
      setEmpresaAtivada(ativada);
      return ativada;
    } catch (error) {
      console.error("Erro ao verificar ativação da empresa:", error);
      return false;
    }
  };

  const mostrarAlertaNaoAtivada = () => {
    Swal.fire({
      title: t("empresaNaoAtivada.titulo"),
      text: t("empresaNaoAtivada.mensagem"),
      icon: "warning",
      confirmButtonText: t("empresaNaoAtivada.botao"),
      confirmButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/ativacao");
      }
    });
  };

  const handleAcaoProtegida = (acao: () => void) => {
    if (!empresaAtivada) {
      mostrarAlertaNaoAtivada();
      return;
    }
    acao();
  };

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
        root.style.setProperty("--cor-fundo-bloco", "#ececec");
      }

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
      const usuario = await responseUsuario.json();
      setEmpresaId(usuario.empresaId);
      setTipoUsuario(usuario.tipo);

      if (usuario.empresaId) {
        const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
        setEmpresaAtivada(ativada);
      }

      const responseFornecedores = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`);
      const fornecedoresData = await responseFornecedores.json();
      setFornecedores(fornecedoresData);
    };

    initialize();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleAdicionarFornecedor() {
    handleAcaoProtegida(async () => {
      if (!empresaId) return alert("Empresa não identificada.");

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const formData = new FormData();
      formData.append("nome", form.nome);
      formData.append("email", form.email);
      formData.append("cnpj", form.cnpj);
      formData.append("telefone", form.telefone);
      formData.append("categoria", form.categoria);
      if (fotoFile) {
        formData.append("foto", fotoFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`, {
        method: "POST",
        body: formData,
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
    });
  }

  async function handleSalvarFornecedor() {
    handleAcaoProtegida(async () => {
      if (!modalVisualizar?.id) return;

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId || "");
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const formData = new FormData();
      formData.append("nome", form.nome);
      formData.append("email", form.email);
      formData.append("cnpj", form.cnpj);
      formData.append("telefone", form.telefone);
      formData.append("categoria", form.categoria);
      if (fotoFile) {
        formData.append("foto", fotoFile);
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${modalVisualizar.id}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          Swal.fire({
            text: "Fornecedor atualizado com sucesso!",
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          setModalVisualizar(null);
          window.location.reload();
        } else {
          throw new Error("Erro ao atualizar fornecedor");
        }
      } catch (error) {
        console.error("Erro ao atualizar fornecedor:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Algo deu errado ao atualizar o fornecedor.",
          confirmButtonColor: "#013C3C",
        });
      }
    });
  }

  async function handleDelete() {
    handleAcaoProtegida(async () => {
      if (!modalVisualizar) return;

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId || "");
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

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
    });
  }

  function handleEntrarContato(fornecedor: FornecedorI) {
    const telefoneFormatado = fornecedor.telefone.replace(/\D/g, "");
    const numeroComDdd = `${telefoneFormatado}`;
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroComDdd}`;
    window.open(urlWhatsApp, "_blank");
  }

  const podeEditar = (tipoUsuario === "ADMIN" || tipoUsuario === "PROPRIETARIO") && empresaAtivada;
  
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-2xl font-mono mb-6" style={{ color: "var(--cor-fonte)" }}>
          {t("titulo")}
        </h1>

        {empresaId && !empresaAtivada && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: modoDark ? "#1E3A8A" : "#BFDBFE",
              color: modoDark ? "#FFFFFF" : "#1E3A8A"
            }}>
            <FaLock className="text-xl" />
            <div>
              <p className="font-bold">{t("empresaNaoAtivada.alertaTitulo")}</p>
              <p>{t("empresaNaoAtivada.alertaMensagem")}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div
            className="flex items-center border rounded-full px-4 py-2 shadow-sm"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#FFFFFF" : "#000000",
            }}
          >
            <input 
              type="text" 
              placeholder={t("buscar")} 
              className="outline-none font-mono text-sm bg-transparent" 
              value={busca} 
              onChange={(e) => setBusca(e.target.value)} 
              style={{ color: "var(--cor-fonte)" }} 
            />
            <FaSearch className="ml-2" style={{ color: modoDark ? "#FBBF24" : "#00332C" }} />
          </div>

          {podeEditar && (
            <button
              onClick={() => handleAcaoProtegida(() => setModalAberto(true))}
              className="px-6 py-2 border-2 rounded-lg transition font-mono text-sm"
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#FFFFFF",
                borderColor: modoDark ? "#FFFFFF" : "#00332C",
                color: modoDark ? "#FFFFFF" : "#00332C",
              }}
            >
              {t("novoFornecedor")}
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
                    <FaCog /> {t("foto")}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">{t("nome")}</th>
                <th className="py-3 px-4 text-center">{t("cnpj")}</th>
                <th className="py-3 px-4 text-center">{t("email")}</th>
                <th className="py-3 px-4 text-center">{t("telefone")}</th>
                <th className="py-3 px-4 text-center">{t("categoria")}</th>
                <th className="py-3 px-4 text-center">{t("adicionadoEm")}</th>
                <th className="py-3 px-4 text-center">{t("contato")}</th>
              </tr>
            </thead>
            <tbody>
                {fornecedores
                .filter(
                  (fornecedor) =>
                  fornecedor.empresaId === empresaId &&
                  (fornecedor.nome.toLowerCase().includes(busca.toLowerCase()) ||
                    fornecedor.categoria.toLowerCase().includes(busca.toLowerCase()))
                )
                .map((fornecedor) => (
                  <tr key={fornecedor.id} className="cursor-pointer border-b">
                  <td
                    onClick={() => {
                    setModalVisualizar(fornecedor);
                    setForm(fornecedor);
                    }}
                    className="py-3 px-4 text-center flex items-center justify-center"
                  >
                    {fornecedor.foto ? (
                    <img
                      src={fornecedor.foto || "/contadefault.png"}
                      alt={fornecedor.nome}
                      className="text-center w-10 h-10 rounded-full"
                    />
                    ) : (
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"></div>
                    )}
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
                    <FaPhoneAlt
                    onClick={() => handleEntrarContato(fornecedor)}
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
      {(modalAberto || modalVisualizar) && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-lg"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              color: "var(--cor-fonte)",
            }}
          >
            <h2 className="text-xl font-bold mb-4">{modalVisualizar ? t("visualizarFornecedor") : t("novoFornecedor")}</h2>

            <input 
              placeholder={t("nome")} 
              value={form.nome || ""} 
              onChange={(e) => setForm({ ...form, nome: e.target.value })} 
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} 
              disabled={Boolean(!podeEditar && modalVisualizar)} 
              style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} 
            />

            <input 
              placeholder={t("email")} 
              value={form.email || ""} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} 
              disabled={Boolean(!podeEditar && modalVisualizar)} 
              style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} 
            />

            <input 
              placeholder={t("cnpj")} 
              value={form.cnpj || ""} 
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })} 
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} 
              disabled={Boolean(!podeEditar && modalVisualizar)} 
              style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} 
            />

            <input 
              placeholder={t("telefone")} 
              value={form.telefone || ""} 
              onChange={(e) => setForm({ ...form, telefone: e.target.value })} 
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} 
              disabled={Boolean(!podeEditar && modalVisualizar)} 
              style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} 
            />

            <input 
              placeholder={t("categoria")} 
              value={form.categoria || ""} 
              onChange={(e) => setForm({ ...form, categoria: e.target.value })} 
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} 
              disabled={Boolean(!podeEditar && modalVisualizar)} 
              style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} 
            />

            <div className="mb-3">
              <label className="block mb-1">{t("foto")}</label>
              {fotoPreview || form.foto ? <img src={fotoPreview || form.foto || ""} alt="Preview" className="w-20 h-20 object-cover rounded-full mb-2" /> : null}
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*" 
                disabled={Boolean(!podeEditar && modalVisualizar)} 
                className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`} 
                style={{ backgroundColor: "#1a25359f", color: "var(--cor-fonte)" }} 
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setModalVisualizar(null);
                }}
                className="hover:underline"
                style={{ color: "var(--cor-fonte)" }}
              >
                {t("fechar")}
              </button>
              {modalVisualizar ? (
                podeEditar && (
                  <>
                    <button
                      onClick={handleSalvarFornecedor}
                      className="px-4 py-2 rounded hover:bg-blue-700"
                      style={{
                        backgroundColor: "#1a25359f",
                        color: "var(--cor-fonte)",
                        border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}`,
                      }}
                    >
                      {t("salvar")}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded hover:bg-red-700"
                      style={{
                        backgroundColor: "#1a25359f",
                        color: "var(--cor-fonte)",
                        border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}`,
                      }}
                    >
                      {t("excluir")}
                    </button>
                  </>
                )
              ) : (
                <button 
                  onClick={handleAdicionarFornecedor} 
                  className="px-4 py-2 rounded hover:bg-[#00443f]" 
                  style={{ 
                    backgroundColor: "#1a25359f", 
                    color: "var(--cor-fonte)", 
                    border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}` 
                  }}
                >
                  {t("afiliarFornecedor")}
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