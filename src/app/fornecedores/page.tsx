"use client";
import { FornecedorI } from "@/utils/types/fornecedor";
import { useEffect, useState, useRef } from "react";
import { FaCog, FaSearch, FaPhoneAlt, FaLock, FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<FornecedorI>({
    id: "",
    nome: "",
    email: "",
    cnpj: "",
    telefone: "",
    categoria: "",
    foto: "",
    empresaId: "",
    usuarioId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    Produto: [],
  });
  const [busca, setBusca] = useState("");
  const [fornecedorExpandido, setFornecedorExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const fornecedoresPorPagina = 10;
  const { t } = useTranslation("fornecedores");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nomeCaracteres, setNomeCaracteres] = useState(0);
  const [categoriaCaracteres, setCategoriaCaracteres] = useState(0);
  const [emailCaracteres, setEmailCaracteres] = useState(0);
  const [cnpjCaracteres, setCnpjCaracteres] = useState(0);
  const [telefoneCaracteres, setTelefoneCaracteres] = useState(0);

  const cores = {
    dark: {
      fundo: "#0A1929",
      texto: "#FFFFFF",
      card: "#132F4C",
      borda: "#1E4976",
      primario: "#1976D2",
      secundario: "#00B4D8",
      placeholder: "#9CA3AF",
      hover: "#1E4976"
    },
    light: {
      fundo: "#F8FAFC",
      texto: "#0F172A",
      card: "#FFFFFF",
      borda: "#E2E8F0",
      primario: "#1976D2",
      secundario: "#0284C7",
      placeholder: "#6B7280",
      hover: "#EFF6FF"
    }
  };

  const temaAtual = modoDark ? cores.dark : cores.light;

  const usuarioTemPermissao = async (permissaoChave: string): Promise<boolean> => {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return false;

      const usuarioId = usuarioSalvo.replace(/"/g, "");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/tem-permissao/${permissaoChave}`,
        {
          headers: {
            'user-id': usuarioId
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.temPermissao;
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }
  };

  useEffect(() => {
    const carregarPermissoes = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;

      const usuarioId = usuarioSalvo.replace(/"/g, "");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/permissoes`,
          {
            headers: {
              'user-id': usuarioId
            }
          }
        );

        if (response.ok) {
          const dados: { permissoes: { chave: string; concedida: boolean }[]; permissoesPersonalizadas: boolean } = await response.json();

          const permissoesUsuarioObj: Record<string, boolean> = {};
          dados.permissoes.forEach(permissao => {
            permissoesUsuarioObj[permissao.chave] = permissao.concedida;
          });

          setPermissoesUsuario(permissoesUsuarioObj);
        } else {
          const permissoesParaVerificar = [
            "fornecedores_criar",
            "fornecedores_editar",
            "fornecedores_excluir",
            "fornecedores_visualizar"
          ];

          const permissoes: Record<string, boolean> = {};

          for (const permissao of permissoesParaVerificar) {
            const temPermissao = await usuarioTemPermissao(permissao);
            permissoes[permissao] = temPermissao;
          }

          setPermissoesUsuario(permissoes);
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      }
    };

    carregarPermissoes();
  }, []);


  const podeVisualizar = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.fornecedores_visualizar;

  const podeCriar = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.fornecedores_criar;

  const podeEditar = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.fornecedores_editar;

  const podeExcluir = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.fornecedores_excluir;

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

      const responseFornecedores = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`, {
        headers: {
          'user-id': usuarioValor
        }
      });
      const fornecedoresData = await responseFornecedores.json();
      const fornecedoresOrdenados = fornecedoresData.sort((a: FornecedorI, b: FornecedorI) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setFornecedores(fornecedoresOrdenados);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (modalVisualizar) {
      setNomeCaracteres(modalVisualizar.nome?.length || 0);
      setCategoriaCaracteres(modalVisualizar.categoria?.length || 0);
      setEmailCaracteres(modalVisualizar.email?.length || 0);
      setCnpjCaracteres(modalVisualizar.cnpj?.length || 0);
      setTelefoneCaracteres(modalVisualizar.telefone?.length || 0);
    }
  }, [modalVisualizar]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 45) {
      setForm({ ...form, email: value });
      setEmailCaracteres(value.length);
    }
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 18) {
      setForm({ ...form, cnpj: value });
      setCnpjCaracteres(value.length);
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 14) {
      setForm({ ...form, telefone: value });
      setTelefoneCaracteres(value.length);
    }
  };

  const formatarData = (dataString: string | Date) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatarTelefone = (telefone: string) => {
    return `(${telefone.slice(2, 4)}) ${telefone.slice(4, 9)}-${telefone.slice(9)}`;
  };

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

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 60) {
      setForm({ ...form, nome: value });
      setNomeCaracteres(value.length);
    }
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setForm({ ...form, categoria: value });
      setCategoriaCaracteres(value.length);
    }
  };

  async function handleAdicionarFornecedor() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

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
      formData.append("empresaId", empresaId);
      formData.append("usuarioId", usuarioValor || "");
      if (fotoFile) {
        formData.append("foto", fotoFile);
      }


      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) return;
        const usuarioValor = usuarioSalvo.replace(/"/g, "");

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`, {
          method: "POST",
          body: formData,
          headers: {
            'user-id': usuarioValor
          }
        });

        if (response.status === 201) {
          Swal.fire({
            text: t("mensagens.fornecedorAdicionado"),
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          setModalAberto(false);
          window.location.reload();
        } else {
          Swal.fire({
            icon: "error",
            title: t("mensagens.erro"),
            text: t("mensagens.erroAdicionar"),
            confirmButtonColor: "#013C3C",
          });
        }
      } catch (error) {
        console.error("Erro ao adicionar fornecedor:", error);
        Swal.fire({
          icon: "error",
          title: t("mensagens.erro"),
          text: t("mensagens.erroAdicionar"),
          confirmButtonColor: "#013C3C",
        });
      }
    });
  }

  async function handleSalvarFornecedor() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

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
      formData.append("empresaId", empresaId || "");
      formData.append("usuarioId", usuarioValor || "");

      if (fotoFile) {
        formData.append("foto", fotoFile);
      }

      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) return;
        const usuarioValor = usuarioSalvo.replace(/"/g, "");

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${modalVisualizar.id}`, {
          method: "PUT",
          body: formData,
          headers: {
            'user-id': usuarioValor
          }
        });

        if (response.ok) {
          Swal.fire({
            text: t("mensagens.fornecedorAtualizado"),
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
          title: t("mensagens.erro"),
          text: t("mensagens.erroAtualizar"),
          confirmButtonColor: "#013C3C",
        });
      }
    });
  }

  async function handleDelete(fornecedor: FornecedorI) {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    handleAcaoProtegida(async () => {
      if (!fornecedor) return;

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId || "");
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const result = await Swal.fire({
        title: t("mensagens.temCerteza"),
        text: t("mensagens.naoReverter"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("mensagens.simDeletar"),
        cancelButtonText: t("mensagens.cancelar"),
      });

      if (result.isConfirmed) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${fornecedor.id}`, { // ← Use fornecedor.id
            method: "DELETE",
            headers: {
              'user-id': usuarioValor
            }
          });
          Swal.fire(t("mensagens.deletado"), t("mensagens.produtoExcluido"), "success");
          setModalVisualizar(null);
          window.location.reload();
        } catch (err) {
          console.error("Erro ao excluir produto:", err);
          Swal.fire(t("mensagens.erro"), t("mensagens.erroDeletar"), "error");
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

  const toggleExpandirFornecedor = (id: string) => {
    setFornecedorExpandido(fornecedorExpandido === id ? null : id);
  };

  const fornecedoresFiltrados = fornecedores.filter(
    (fornecedor) =>
      fornecedor.empresaId === empresaId &&
      (fornecedor.nome.toLowerCase().includes(busca.toLowerCase()) ||
        fornecedor.categoria.toLowerCase().includes(busca.toLowerCase()))
  );

  const indexUltimoFornecedor = paginaAtual * fornecedoresPorPagina;
  const indexPrimeiroFornecedor = indexUltimoFornecedor - fornecedoresPorPagina;
  const fornecedoresAtuais = fornecedoresFiltrados.slice(indexPrimeiroFornecedor, indexUltimoFornecedor);
  const totalPaginas = Math.ceil(fornecedoresFiltrados.length / fornecedoresPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setFornecedorExpandido(null);
  };

  if (!podeVisualizar) {
    return (
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo }}>
        <div className="w-full max-w-6xl">
          <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: temaAtual.texto }}>
            {t("titulo")}
          </h1>
          <div className="p-4 text-center" style={{ color: temaAtual.texto }}>
            {t("semPermissaoVisualizar")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: temaAtual.texto }}>
          {t("titulo")}
        </h1>

        {empresaId && !empresaAtivada && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{
            backgroundColor: temaAtual.primario + "20",
            color: temaAtual.texto,
            border: `1px solid ${temaAtual.borda}`
          }}>
            <FaLock className="text-xl" />
            <div>
              <p className="font-bold">{t("empresaNaoAtivada.alertaTitulo")}</p>
              <p>{t("empresaNaoAtivada.alertaMensagem")}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 mb-3 md:mb-6">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center border rounded-full px-3 md:px-4 py-1 md:py-2 shadow-sm flex-1"
              style={{
                backgroundColor: temaAtual.card,
                borderColor: temaAtual.borda,
              }}
            >
              <input
                type="text"
                placeholder={t("buscar")}
                className="outline-none placeholder-gray-400 font-mono text-sm bg-transparent"
                style={{
                  color: temaAtual.texto
                }}
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPaginaAtual(1);
                }}
              />
              <FaSearch className="ml-2" style={{ color: temaAtual.primario }} />
            </div>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`p-2 rounded-full ${paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                  style={{ color: temaAtual.texto }}
                >
                  <FaAngleLeft />
                </button>

                <span className="text-sm font-mono" style={{ color: temaAtual.texto }}>
                  {paginaAtual}/{totalPaginas}
                </span>

                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`p-2 rounded-full ${paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                  style={{ color: temaAtual.texto }}
                >
                  <FaAngleRight />
                </button>
              </div>
            )}
          </div>

          {podeCriar && empresaAtivada && (
            <button
              onClick={() => handleAcaoProtegida(() => setModalAberto(true))}
              className="px-6 py-2 border-2 cursor-pointer rounded-lg transition font-mono text-sm"
              style={{
                backgroundColor: temaAtual.primario,
                borderColor: temaAtual.primario,
                color: "#FFFFFF",
              }}
            >
              {t("novoFornecedor")}
            </button>
          )}
        </div>

        <div
          className="border rounded-xl shadow"
          style={{
            backgroundColor: temaAtual.card,
            borderColor: temaAtual.borda,
          }}
        >
          {fornecedoresFiltrados.length === 0 ? (
            <div className="p-4 text-center" style={{ color: temaAtual.texto }}>
              {t("nenhumFornecedorEncontrado")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b" style={{ borderColor: temaAtual.borda }}>
                    <tr style={{ color: temaAtual.texto }}>
                      <th className="py-3 px-4 text-center">
                        <div className="flex items-center gap-1 justify-center">
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
                    {fornecedoresAtuais.map((fornecedor) => (
                      <tr
                        key={fornecedor.id}
                        className="border-b transition-all duration-200 cursor-pointer"
                        style={{
                          color: temaAtual.texto,
                          borderColor: temaAtual.borda,
                          backgroundColor: temaAtual.card,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.hover;
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = modoDark
                            ? "0 4px 12px rgba(30, 73, 118, 0.3)"
                            : "0 4px 12px rgba(2, 132, 199, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.card;
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          <Image
                            src={fornecedor.foto || "/contadefault.png"}
                            width={40}
                            height={40}
                            className="mx-auto rounded-full object-cover"
                            alt={fornecedor.nome}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/contadefault.png";
                            }}
                          />
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
                          {formatarTelefone(fornecedor.telefone)}
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
                          {formatarData(fornecedor.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <FaPhoneAlt
                            onClick={() => handleEntrarContato(fornecedor)}
                            color="#25D366"
                            size={20}
                            className="cursor-pointer m-auto border-2 p-1 rounded-2xl hover:bg-green-100 transition"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-2 p-2">
                {fornecedoresAtuais.map((fornecedor) => (
                  <div
                    key={fornecedor.id}
                    className="border rounded-lg p-3 transition-all cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      borderColor: temaAtual.borda,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.hover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = modoDark
                        ? "0 4px 12px rgba(30, 73, 118, 0.3)"
                        : "0 4px 12px rgba(2, 132, 199, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.card;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => toggleExpandirFornecedor(fornecedor.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <Image
                          src={fornecedor.foto || "/contadefault.png"}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          alt={fornecedor.nome}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/contadefault.png";
                          }}
                        />
                        <div>
                          <p className="font-semibold" style={{ color: temaAtual.texto }}>{fornecedor.nome}</p>
                          <p className="text-xs" style={{ color: temaAtual.primario }}>
                            {fornecedor.categoria}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FaPhoneAlt
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEntrarContato(fornecedor);
                          }}
                          color="#25D366"
                          size={16}
                          className="cursor-pointer border p-1 rounded-full hover:bg-green-100 transition"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandirFornecedor(fornecedor.id);
                          }}
                          className="p-1"
                          style={{ color: temaAtual.primario }}
                        >
                          {fornecedorExpandido === fornecedor.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${fornecedorExpandido === fornecedor.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: temaAtual.texto }}
                    >
                      <div className="pt-2 border-t space-y-2" style={{ borderColor: temaAtual.borda }}>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("cnpj")}:</span>
                          <span>{fornecedor.cnpj}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("email")}:</span>
                          <span>{fornecedor.email}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("telefone")}:</span>
                          <span>{formatarTelefone(fornecedor.telefone)}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("adicionadoEm")}:</span>
                          <span>{formatarData(fornecedor.createdAt)}</span>
                        </div>
                        {podeEditar && (
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => {
                                setModalVisualizar(fornecedor);
                                setForm(fornecedor);
                              }}
                              className="px-3 py-1 text-xs rounded border"
                              style={{
                                backgroundColor: temaAtual.primario,
                                borderColor: temaAtual.primario,
                                color: "#FFFFFF",
                              }}
                            >
                              {t("editar")}
                            </button>
                            {podeExcluir && (
                              <button
                                onClick={() => handleDelete(fornecedor)}
                                className="px-3 py-1 text-xs rounded border"
                                style={{
                                  backgroundColor: "#EF4444",
                                  borderColor: "#EF4444",
                                  color: "#FFFFFF",
                                }}
                              >
                                {t("excluir")}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {(modalAberto || modalVisualizar) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-semibold mb-4">
              {modalVisualizar ? t("visualizarFornecedor") : t("novoFornecedor")}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm">{t("nome")}</label>
                <input
                  placeholder={t("nome")}
                  value={form.nome || ""}
                  onChange={handleNomeChange}
                  className="w-full rounded p-2"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={60}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {nomeCaracteres}/60 {nomeCaracteres === 60 && " - Limite atingido"}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">{t("email")}</label>
                <input
                  placeholder={t("email")}
                  value={form.email || ""}
                  onChange={handleEmailChange}
                  className="w-full rounded p-2"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={45}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {emailCaracteres}/45 {emailCaracteres === 45 && " - Limite atingido"}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">{t("cnpj")}</label>
                <input
                  placeholder={t("cnpj")}
                  value={form.cnpj || ""}
                  onChange={handleCnpjChange}
                  className="w-full rounded p-2"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={18}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {cnpjCaracteres}/18 {cnpjCaracteres === 18 && " - Limite atingido"}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">{t("telefone")}</label>
                <input
                  placeholder={t("telefone")}
                  value={form.telefone || ""}
                  onChange={handleTelefoneChange}
                  className="w-full rounded p-2"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={14}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {telefoneCaracteres}/14 {telefoneCaracteres === 14 && " - Limite atingido"}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">{t("categoria")}</label>
                <input
                  placeholder={t("categoria")}
                  value={form.categoria || ""}
                  onChange={handleCategoriaChange}
                  className="w-full rounded p-2"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={20}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {categoriaCaracteres}/20 {categoriaCaracteres === 20 && " - Limite atingido"}
                </div>
              </div>

              <div className="mt-2">
                <label className="block mb-1 text-sm">{t("foto")}</label>
                {(fotoPreview || form.foto) && (
                  <Image
                    src={fotoPreview || form.foto || ""}
                    width={80}
                    height={80}
                    className="object-cover rounded-full mb-2 mx-auto"
                    alt="Preview"
                    onError={e => { (e.target as HTMLImageElement).src = "/contadefault.png"; }}
                  />
                )}
                {(podeCriar || podeEditar) && (
                  <div className="flex flex-col justify-end">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={Boolean(!podeEditar && modalVisualizar)}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-3 py-3 cursor-pointer rounded border text-sm flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: temaAtual.primario,
                        color: "#FFFFFF",
                        borderColor: temaAtual.primario,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      {t("selecionarImagem")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setModalVisualizar(null);
                  setFotoFile(null);
                  setFotoPreview(null);
                }}
                className="cursor-pointer hover:underline"
                style={{ color: temaAtual.texto }}
              >
                {t("fechar")}
              </button>

              {modalVisualizar ? (
                podeEditar && (
                  <>
                    <button
                      onClick={handleSalvarFornecedor}
                      className="px-4 cursor-pointer py-2 rounded"
                      style={{
                        backgroundColor: "#10B981",
                        color: "#FFFFFF",
                      }}
                    >
                      {t("salvar")}
                    </button>
                    {podeExcluir && (
                      <button
                        onClick={() => handleDelete(form)}
                        className="cursor-pointer px-4 py-2 rounded"
                        style={{
                          backgroundColor: "#EF4444",
                          color: "#FFFFFF",
                        }}
                      >
                        {t("excluir")}
                      </button>
                    )}
                  </>
                )
              ) : (
                <button
                  onClick={handleAdicionarFornecedor}
                  className="cursor-pointer px-4 py-2 rounded"
                  style={{
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
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