"use client";
import { cores } from "@/utils/cores";
import { ClienteI } from "@/utils/types/clientes";
import { useEffect, useState } from "react";
import { FaSearch, FaPhoneAlt, FaLock, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaEdit, FaEye, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export default function Clientes() {
  const [modoDark, setModoDark] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteI[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<ClienteI | null>(null);
  const [form, setForm] = useState<ClienteI>({
    id: "",
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    empresaId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [busca, setBusca] = useState("");
  const [clienteExpandido, setClienteExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const clientesPorPagina = 10;
  const { t } = useTranslation("clientes");
  const router = useRouter();
  const [nomeCaracteres, setNomeCaracteres] = useState(0);
  const [emailCaracteres, setEmailCaracteres] = useState(0);
  const [telefoneCaracteres, setTelefoneCaracteres] = useState(0);
  const [enderecoCaracteres, setEnderecoCaracteres] = useState(0);
  const [cidadeCaracteres, setCidadeCaracteres] = useState(0);
  const [estadoCaracteres, setEstadoCaracteres] = useState(0);
  const [cepCaracteres, setCepCaracteres] = useState(0);

  const temaAtual = modoDark ? cores.dark : cores.light;

  const usuarioTemPermissao = async (permissaoChave: string): Promise<boolean> => {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return false;

      const usuarioId = usuarioSalvo.replace(/"/g, "");
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/tem-permissao/${permissaoChave}`, {
        headers: {
          "user-id": usuarioId,
        },
      });

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
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    const style = document.createElement("style");
    style.textContent = `
    html::-webkit-scrollbar {
      width: 10px;
    }
    
    html::-webkit-scrollbar-track {
      background: ${modoDark ? "#132F4C" : "#F8FAFC"};
    }
    
    html::-webkit-scrollbar-thumb {
      background: ${modoDark ? "#132F4C" : "#90CAF9"}; 
      border-radius: 5px;
      border: 2px solid ${modoDark ? "#132F4C" : "#F8FAFC"};
    }
    
    html::-webkit-scrollbar-thumb:hover {
      background: ${modoDark ? "#132F4C" : "#64B5F6"}; 
    }
    
    html {
      scrollbar-width: thin;
      scrollbar-color: ${modoDark ? "#132F4C" : "#90CAF9"} ${modoDark ? "#0A1830" : "#F8FAFC"};
    }
    
    @media (max-width: 768px) {
      html::-webkit-scrollbar {
        width: 6px;
      }
      
      html::-webkit-scrollbar-thumb {
        border: 1px solid ${modoDark ? "#132F4C" : "#F8FAFC"};
        border-radius: 3px;
      }
    }
  `;
    document.head.appendChild(style);

    const carregarDados = async () => {
      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioValor}/permissoes`, {
          headers: {
            "user-id": usuarioValor,
          },
        });

        if (response.ok) {
          const dados: { permissoes: { chave: string; concedida: boolean }[]; permissoesPersonalizadas: boolean } = await response.json();

          const permissoesUsuarioObj: Record<string, boolean> = {};
          dados.permissoes.forEach((permissao) => {
            permissoesUsuarioObj[permissao.chave] = permissao.concedida;
          });

          setPermissoesUsuario(permissoesUsuarioObj);
        } else {
          const permissoesParaVerificar = ["clientes_criar", "clientes_editar", "clientes_excluir", "clientes_visualizar"];

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

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
      const usuario = await responseUsuario.json();
      setEmpresaId(usuario.empresaId);
      setTipoUsuario(usuario.tipo);

      if (usuario.empresaId) {
        const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
        setEmpresaAtivada(ativada);
      }

      const responseClientes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`);
      const clientesData = await responseClientes.json();
      const clientesOrdenados = (clientesData.clientes || []).sort((a: ClienteI, b: ClienteI) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setClientes(clientesOrdenados);
    };

    carregarDados();

    return () => {
      document.head.removeChild(style);
    };
  }, [modoDark]);

  useEffect(() => {
    if (modalVisualizar) {
      setNomeCaracteres(modalVisualizar.nome?.length || 0);
      setEmailCaracteres(modalVisualizar.email?.length || 0);
      setTelefoneCaracteres(modalVisualizar.telefone?.length || 0);
      setEnderecoCaracteres(modalVisualizar.endereco?.length || 0);
      setCidadeCaracteres(modalVisualizar.cidade?.length || 0);
      setEstadoCaracteres(modalVisualizar.estado?.length || 0);
      setCepCaracteres(modalVisualizar.cep?.length || 0);
    }
  }, [modalVisualizar]);

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setForm({ ...form, nome: value });
      setNomeCaracteres(value.length);
    }
  };

  const podeVisualizar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.clientes_visualizar;

  const podeCriar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.clientes_criar;

  const podeEditar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.clientes_editar;

  const podeExcluir = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.clientes_excluir;

  const verificarAtivacaoEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`, {
        headers: {
          "user-id": localStorage.getItem("client_key") || "",
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar os dados da empresa");
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 45) {
      setForm({ ...form, email: value });
      setEmailCaracteres(value.length);
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      setForm({ ...form, telefone: value });
      setTelefoneCaracteres(value.length);
    }
  };
  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setForm({ ...form, endereco: value });
      setEnderecoCaracteres(value.length);
    }
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setForm({ ...form, cidade: value });
      setCidadeCaracteres(value.length);
    }
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 2) {
      setForm({ ...form, estado: value });
      setEstadoCaracteres(value.length);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setForm({ ...form, cep: value });
      setCepCaracteres(value.length);
    }
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

  const clientesDaEmpresa = empresaId ? clientes.filter((cliente) => cliente.empresaId === empresaId) : [];

  const clientesFiltrados = clientesDaEmpresa.filter((cliente) => cliente.nome.toLowerCase().includes(busca.toLowerCase()) || cliente.email?.toLowerCase().includes(busca.toLowerCase()) || cliente.telefone?.includes(busca));

  const indexUltimoCliente = paginaAtual * clientesPorPagina;
  const indexPrimeiroCliente = indexUltimoCliente - clientesPorPagina;
  const clientesAtuais = clientesFiltrados.slice(indexPrimeiroCliente, indexUltimoCliente);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setClienteExpandido(null);
  };

  async function handleAdicionarCliente() {
    handleAcaoProtegida(async () => {
      if (!empresaId) return alert("Empresa não identificada.");

      if (!form.nome.trim()) {
        Swal.fire({
          title: t("modal.camposObrigatorios.titulo", "Campo obrigatório"),
          text: `${t("nome")} ${t("modal.camposObrigatorios.texto", "é obrigatório")}`,
          icon: "warning",
          confirmButtonColor: "#013C3C",
        });
        return;
      }

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const usuarioValor = localStorage.getItem("client_key")?.replace(/"/g, "");
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": usuarioValor || "",
        },
        body: JSON.stringify({
          ...form,
          empresaId,
        }),
      });

      if (response.status === 201) {
        Swal.fire({
          text: t("sucesso.adicionarCliente"),
          icon: "success",
          confirmButtonColor: "#013C3C",
        });
        setModalAberto(false);
        window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: t("erro.titulo"),
          text: t("erro.mensagem"),
          confirmButtonColor: "#013C3C",
        });
      }
    });
  }

  async function handleSalvarCliente() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    handleAcaoProtegida(async () => {
      if (!modalVisualizar?.id) return;

      if (!form.nome.trim()) {
        Swal.fire({
          title: t("modal.camposObrigatorios.titulo", "Campo obrigatório"),
          text: `${t("nome")} ${t("modal.camposObrigatorios.texto", "é obrigatório")}`,
          icon: "warning",
          confirmButtonColor: "#013C3C",
        });
        return;
      }
      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId || "");
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes/${modalVisualizar.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "user-id": usuarioValor || "",
          },
          body: JSON.stringify(form),
        });

        if (response.ok) {
          Swal.fire({
            text: "Cliente atualizado com sucesso!",
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          setModalVisualizar(null);
          window.location.reload();
        } else {
          throw new Error("Erro ao atualizar cliente");
        }
      } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Algo deu errado ao atualizar o cliente.",
          confirmButtonColor: "#013C3C",
        });
      }
    });
  }

  async function handleDelete() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    handleAcaoProtegida(async () => {
      if (!modalVisualizar) return;

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId || "");
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const result = await Swal.fire({
        title: t("confirmacao.excluir.titulo"),
        text: t("confirmacao.excluir.mensagem"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("confirmacao.excluir.confirmar"),
        cancelButtonText: t("confirmacao.excluir.cancelar"),
      });

      if (result.isConfirmed) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes/${modalVisualizar.id}`, {
            method: "DELETE",
            headers: {
              "user-id": usuarioValor,
            },
          });
          Swal.fire(t("sucesso.excluir.titulo"), t("sucesso.excluir.mensagem"), "success");
          setModalVisualizar(null);
          window.location.reload();
        } catch (err) {
          console.error("Erro ao excluir cliente:", err);
          Swal.fire(t("erro.excluir.titulo"), t("erro.excluir.mensagem"), "error");
        }
      }
    });
  }

  function handleEntrarContato(cliente: ClienteI) {
    if (!cliente.telefone) {
      Swal.fire({
        icon: "info",
        title: t("info.semTelefone.titulo"),
        text: t("info.semTelefone.mensagem"),
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const telefoneFormatado = cliente.telefone.replace(/\D/g, "");

    const numeroComCodigoPais = `55${telefoneFormatado}`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroComCodigoPais}`;
    window.open(urlWhatsApp, "_blank");
  }

  function formatarEndereco(cliente: ClienteI) {
    const partes = [];
    if (cliente.endereco) partes.push(cliente.endereco);
    if (cliente.cidade) partes.push(cliente.cidade);
    if (cliente.estado) partes.push(cliente.estado);
    if (cliente.cep) partes.push(cliente.cep);

    return partes.join(", ");
  }

  function formatarTelefone(telefone: string) {
    if (!telefone) return "-";

    const numeros = telefone.replace(/\D/g, "");

    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return telefone;
  }
  function formatarData(dataString: string | Date) {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const toggleExpandirCliente = (id: string) => {
    setClienteExpandido(clienteExpandido === id ? null : id);
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: temaAtual.texto }}>
          {t("titulo")}
        </h1>

        {empresaId && !empresaAtivada && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: temaAtual.primario + "20",
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`,
            }}
          >
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
                className="outline-none font-mono text-sm bg-transparent placeholder-gray-400"
                style={{
                  color: temaAtual.texto,
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
                <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} className={`p-2 rounded-full ${paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`} style={{ color: temaAtual.texto }}>
                  <FaAngleLeft />
                </button>

                <span className="text-sm font-mono" style={{ color: temaAtual.texto }}>
                  {paginaAtual}/{totalPaginas}
                </span>

                <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className={`p-2 rounded-full ${paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`} style={{ color: temaAtual.texto }}>
                  <FaAngleRight />
                </button>
              </div>
            )}
          </div>

          {podeCriar && empresaAtivada && (
            <button
              onClick={() => handleAcaoProtegida(() => setModalAberto(true))}
              className="px-6 py-2 border-2 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer font-mono text-sm"
              style={{
                backgroundColor: temaAtual.primario,
                borderColor: temaAtual.primario,
                color: "#FFFFFF",
              }}
            >
              {t("novoCliente")}
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
          {!empresaId || clientesDaEmpresa.length === 0 ? (
            <div className="p-4 text-center" style={{ color: temaAtual.texto }}>
              {t("nenhumClienteEncontrado")}
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="p-4 text-center" style={{ color: temaAtual.texto }}>
              {t("nenhumClienteEncontradoBusca")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b" style={{ borderColor: temaAtual.borda }}>
                    <tr style={{ color: temaAtual.texto }}>
                      <th className="py-3 px-4 text-center">{t("nome")}</th>
                      <th className="py-3 px-4 text-center">{t("email")}</th>
                      <th className="py-3 px-4 text-center">{t("telefone")}</th>
                      <th className="py-3 px-4 text-center">{t("endereco")}</th>
                      <th className="py-3 px-4 text-center">{t("adicionadoEm")}</th>
                      <th className="py-3 px-4 text-center">{t("contato")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesAtuais.map((cliente: ClienteI) => (
                      <tr
                        key={cliente.id}
                        className="border-b transition-all duration-200 cursor-pointer"
                        style={{
                          color: temaAtual.texto,
                          borderColor: temaAtual.borda,
                          backgroundColor: temaAtual.card,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.hover;
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = modoDark ? "0 4px 12px rgba(30, 73, 118, 0.3)" : "0 4px 12px rgba(2, 132, 199, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.card;
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {cliente.nome}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {cliente.email || "-"}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {formatarTelefone(cliente.telefone || "")}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center max-w-[200px] truncate"
                          title={formatarEndereco(cliente) || "-"}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <FaMapMarkerAlt />
                            <span className="truncate">{formatarEndereco(cliente) || "-"}</span>
                          </div>
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {formatarData(cliente.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <FaPhoneAlt onClick={() => handleEntrarContato(cliente)} color="#25D366" size={32} className="cursor-pointer m-auto border-2 p-1 rounded-2xl transition hover:scale-110" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2 p-2">
                {clientesAtuais.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="border rounded-lg p-3 transition-all cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      borderColor: temaAtual.borda,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.hover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = modoDark ? "0 4px 12px rgba(30, 73, 118, 0.3)" : "0 4px 12px rgba(2, 132, 199, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.card;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => toggleExpandirCliente(cliente.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold truncate" style={{ color: temaAtual.texto }}>
                            {cliente.nome}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs" style={{ color: temaAtual.placeholder }}>
                          <span>{formatarData(cliente.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEntrarContato(cliente);
                          }}
                          className="text-green-500 hover:text-green-300 p-1 transition"
                        >
                          <FaPhoneAlt />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandirCliente(cliente.id);
                          }}
                          className="p-1 transition"
                          style={{ color: temaAtual.primario }}
                        >
                          {clienteExpandido === cliente.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${clienteExpandido === cliente.id ? "max-h-96" : "max-h-0"}`} style={{ color: temaAtual.texto }}>
                      <div className="pt-2 border-t space-y-2" style={{ borderColor: temaAtual.borda }}>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("email")}:</span>
                          <span>{cliente.email || "-"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("telefone")}:</span>
                          <span>{formatarTelefone(cliente.telefone || "")}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("endereco")}:</span>
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {formatarEndereco(cliente) || "-"}
                          </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          {podeEditar ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalVisualizar(cliente);
                                setForm(cliente);
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded text-sm transition"
                              style={{
                                backgroundColor: temaAtual.primario,
                                color: "#FFFFFF",
                              }}
                            >
                              <FaEdit /> {t("editar")}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalVisualizar(cliente);
                                setForm(cliente);
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded text-sm transition"
                              style={{
                                backgroundColor: temaAtual.primario,
                                color: "#FFFFFF",
                              }}
                            >
                              <FaEye /> {t("visualizar")}
                            </button>
                          )}
                        </div>
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
            className="p-4 md:p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`,
            }}
          >
            <h2 className="text-lg md:text-xl font-bold mb-4">{modalVisualizar ? t("visualizarCliente") : t("novoCliente")}</h2>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm">
                  {t("nome")} <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder={t("nome")}
                  value={form.nome || ""}
                  onChange={handleNomeChange}
                  className="w-full rounded p-2 border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    borderColor: temaAtual.borda,
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={20}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {nomeCaracteres}/20 {nomeCaracteres === 20 && " - Limite"}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">{t("email")} <span className="text-red-500">*</span></label>
                <input
                  placeholder={t("email")}
                  value={form.email || ""}
                  onChange={handleEmailChange}
                  className="w-full rounded p-2 border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    borderColor: temaAtual.borda,
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={45}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {emailCaracteres}/45 {emailCaracteres === 45 && " - Limite"}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">{t("telefone")}</label>
                <input
                  placeholder={t("telefone")}
                  value={form.telefone || ""}
                  onChange={handleTelefoneChange}
                  className="w-full rounded p-2 border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    borderColor: temaAtual.borda,
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={11}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {telefoneCaracteres}/11 {telefoneCaracteres === 11 && " - Limite"}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">{t("endereco")}</label>
                <input
                  placeholder={t("endereco")}
                  value={form.endereco || ""}
                  onChange={handleEnderecoChange}
                  className="w-full rounded p-2 border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    borderColor: temaAtual.borda,
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={50}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {enderecoCaracteres}/50 {enderecoCaracteres === 50 && " - Limite"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm">{t("cidade")}</label>
                  <input
                    placeholder={t("cidade")}
                    value={form.cidade || ""}
                    onChange={handleCidadeChange}
                    className="w-full rounded p-2 border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      borderColor: temaAtual.borda,
                    }}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    maxLength={20}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {cidadeCaracteres}/20 {cidadeCaracteres === 20 && " - Limite"}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm">{t("estado")}</label>
                  <input
                    placeholder={t("estado")}
                    value={form.estado || ""}
                    onChange={handleEstadoChange}
                    className="w-full rounded p-2 border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      borderColor: temaAtual.borda,
                    }}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    maxLength={2}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {estadoCaracteres}/2 {estadoCaracteres === 2 && " - Limite"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">{t("cep")}</label>
                <input
                  placeholder={t("cep")}
                  value={form.cep || ""}
                  onChange={handleCepChange}
                  className="w-full rounded p-2 border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    borderColor: temaAtual.borda,
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={10}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {cepCaracteres}/10 {cepCaracteres === 10 && " - Limite"}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6 flex-wrap gap-2">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setModalVisualizar(null);
                }}
                className="hover:underline cursor-pointer text-sm px-3 py-2 rounded transition"
                style={{
                  color: temaAtual.texto,
                  backgroundColor: temaAtual.hover,
                }}
              >
                {t("fechar")}
              </button>
              {modalVisualizar ? (
                podeEditar && (
                  <>
                    <button
                      onClick={handleSalvarCliente}
                      className="px-4 py-2 rounded hover:opacity-90 cursor-pointer text-sm transition"
                      style={{
                        backgroundColor: "#10B981",
                        color: "#FFFFFF",
                      }}
                    >
                      {t("salvar")}
                    </button>
                    {podeExcluir && (
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded hover:opacity-90 cursor-pointer text-sm transition"
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
                  onClick={handleAdicionarCliente}
                  className="px-4 py-2 rounded hover:opacity-90 cursor-pointer text-sm transition"
                  style={{
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                  }}
                >
                  {t("adicionarCliente")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
