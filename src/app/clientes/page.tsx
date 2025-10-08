"use client";
import { cores } from "@/utils/cores";
import { ClienteI } from "@/utils/types/clientes";
import { useEffect, useState } from "react";
import { FaSearch, FaPhoneAlt, FaLock, FaMapMarkerAlt, FaEdit, FaEye, FaAngleLeft, FaAngleRight, FaUserPlus, FaUsers, FaTimes } from "react-icons/fa";
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
  const [, setClienteExpandido] = useState<string | null>(null);
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
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
  const temaSalvo = localStorage.getItem("modoDark");
  const ativado = temaSalvo === "true";
  setModoDark(ativado);

  const handleThemeChange = (e: CustomEvent) => {
    setModoDark(e.detail.modoDark);
  };

  window.addEventListener('themeChanged', handleThemeChange as EventListener);
  
  return () => {
    window.removeEventListener('themeChanged', handleThemeChange as EventListener);
  };
}, []);

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    const carregarDados = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioValor}/permissoes`, {
          headers: {
            "user-id": usuarioValor,
            Authorization: `Bearer ${Cookies.get("token")}`,
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

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();
      setEmpresaId(usuario.empresaId);
      setTipoUsuario(usuario.tipo);

      if (usuario.empresaId) {
        const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
        setEmpresaAtivada(ativada);
      }

      const responseClientes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const clientesData = await responseClientes.json();
      const clientesOrdenados = (clientesData.clientes || []).sort((a: ClienteI, b: ClienteI) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setClientes(clientesOrdenados);
    };

    carregarDados();
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
      background: modoDark ? temaAtual.card : "#FFFFFF",
      color: modoDark ? temaAtual.texto : temaAtual.texto,
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
      <div className={`min-h-screen ${modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"} flex items-center justify-center px-4`}>
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-6 ${modoDark ? "bg-red-500/20" : "bg-red-100"} rounded-full flex items-center justify-center`}>
            <FaLock className={`text-3xl ${modoDark ? "text-red-400" : "text-red-500"}`} />
          </div>
          <h1 className={`text-2xl font-bold ${modoDark ? "text-white" : "text-slate-900"} mb-4`}>{t("acessoRestrito")}</h1>
          <p className={modoDark ? "text-gray-300" : "text-slate-600"}>{t("semPermissaoVisualizar")}</p>
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
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
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
          Authorization: `Bearer ${Cookies.get("token")}`,
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
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
        });
        setModalAberto(false);
        window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: t("erro.titulo"),
          text: t("erro.mensagem"),
          confirmButtonColor: "#013C3C",
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
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
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
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
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify(form),
        });

        if (response.ok) {
          Swal.fire({
            text: "Cliente atualizado com sucesso!",
            icon: "success",
            confirmButtonColor: "#013C3C",
            background: modoDark ? temaAtual.card : "#FFFFFF",
            color: modoDark ? temaAtual.texto : temaAtual.texto,
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
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
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
        background: modoDark ? temaAtual.card : "#FFFFFF",
        color: modoDark ? temaAtual.texto : temaAtual.texto,
      });

      if (result.isConfirmed) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes/${modalVisualizar.id}`, {
            method: "DELETE",
            headers: {
              "user-id": usuarioValor,
              Authorization: `Bearer ${Cookies.get("token")}`,
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
        background: modoDark ? temaAtual.card : "#FFFFFF",
        color: modoDark ? temaAtual.texto : temaAtual.texto,
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

  const bgGradient = modoDark
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";

  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-black";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-gray-50/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-400";
  const bgInput = modoDark ? "bg-slate-700/50" : "bg-gray-200";
  const bgStats = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      <div className="flex">
        <div className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 py-8 w-full max-w-7xl mx-auto">
            <section className={`relative py-8 rounded-3xl mb-6 overflow-hidden ${modoDark ? "bg-slate-800/30" : "bg-white/30"} backdrop-blur-sm border ${borderColor}`}>
              <div className="absolute inset-0">
                <div className={`absolute top-0 left-10 w-32 h-32 ${modoDark ? "bg-blue-500/20" : "bg-blue-200/50"} rounded-full blur-3xl animate-float`}></div>
                <div className={`absolute bottom-0 right-10 w-48 h-48 ${modoDark ? "bg-slate-700/20" : "bg-slate-300/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "2s" }}></div>
                <div className={`absolute top-1/2 left-1/2 w-24 h-24 ${modoDark ? "bg-cyan-500/20" : "bg-cyan-200/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "4s" }}></div>
              </div>

              <div className="relative z-10 text-center">
                <h1 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-3`}>
                  {t("titulo")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("clientes")}</span>
                </h1>
                <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>{t("subtitulo")}</p>
              </div>
            </section>

            <div className="flex justify-start mb-6">
              <div className="gradient-border animate-fade-in-up w-full max-w-xs">
                <div className={`p-4 rounded-[15px] ${bgStats} backdrop-blur-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-1`}>
                        {clientesDaEmpresa.length}
                      </div>
                      <div className={textMuted}>{t("stats.total")}</div>
                    </div>
                    <div className={`p-2 rounded-lg ${modoDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                      <FaUsers className={`text-xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {empresaId && !empresaAtivada && (
              <div className={`mb-4 p-4 rounded-2xl flex items-center gap-3 ${modoDark ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30" : "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"}`}>
                <div className={`p-2 ${modoDark ? "bg-orange-500/20" : "bg-orange-100"} rounded-xl`}>
                  <FaLock className={`text-xl ${modoDark ? "text-orange-400" : "text-orange-500"}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${textPrimary} text-sm`}>{t("empresaNaoAtivada.alertaTitulo")}</p>
                  <p className={textMuted}>{t("empresaNaoAtivada.alertaMensagem")}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <div className="relative flex-1 max-w-md">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                  <div className={`relative flex items-center ${bgCard} rounded-xl px-4 py-3 border ${borderColor} backdrop-blur-sm`}>
                    <FaSearch className={`${modoDark ? "text-blue-400" : "text-blue-500"} mr-3 text-sm`} />
                    <input
                      type="text"
                      placeholder={t("buscar")}
                      value={busca}
                      onChange={(e) => {
                        setBusca(e.target.value);
                        setPaginaAtual(1);
                      }}
                      className={`bg-transparent border-none outline-none ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} w-full text-sm`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {totalPaginas > 1 && (
                    <div className={`flex items-center gap-1 ${bgCard} border ${borderColor} rounded-xl px-3 py-2`}>
                      <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} className={`p-1 cursor-pointer rounded-lg transition-all duration-300 ${paginaAtual === 1 ? `${textMuted} cursor-not-allowed` : `${textPrimary} ${bgHover} hover:scale-105`}`}>
                        <FaAngleLeft className="text-sm" />
                      </button>

                      <span className={`${textPrimary} text-sm mx-2`}>
                        {paginaAtual}/{totalPaginas}
                      </span>

                      <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className={`p-1 cursor-pointer rounded-lg transition-all duration-300 ${paginaAtual === totalPaginas ? `${textMuted} cursor-not-allowed` : `${textPrimary} ${bgHover} hover:scale-105`}`}>
                        <FaAngleRight className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                {podeCriar && empresaAtivada && (
                  <button
                    onClick={() => handleAcaoProtegida(() => setModalAberto(true))}
                    className="px-4 py-3 bg-gradient-to-r cursor-pointer from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white flex items-center gap-2 hover:scale-105 shadow-lg shadow-blue-500/25 text-sm"
                  >
                    <FaUserPlus className="text-sm" />
                    {t("novoCliente")}
                  </button>
                )}
              </div>
            </div>

            {!empresaId || clientesDaEmpresa.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-24 h-24 mx-auto mb-4 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
                  <FaUsers className={`text-2xl ${textMuted}`} />
                </div>
                <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{t("nenhumClienteEncontrado")}</h3>
                <p className={`${textMuted} mb-4 text-sm`}>{t("comeceAdicionando")}</p>
                {podeCriar && empresaAtivada && (
                  <button onClick={() => setModalAberto(true)} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white flex items-center gap-2 mx-auto hover:scale-105 text-sm">
                    <FaUserPlus />
                    {t("adicionarPrimeiroCliente")}
                  </button>
                )}
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-24 h-24 mx-auto mb-4 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
                  <FaSearch className={`text-2xl ${textMuted}`} />
                </div>
                <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{t("nenhumClienteEncontradoBusca")}</h3>
                <p className={`${textMuted} mb-4 text-sm`}>{t("tenteOutroTermo")}</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {clientesAtuais.map((cliente) => {
                  return (
                    <div
                      key={cliente.id}
                      className={`${modoDark
                        ? "bg-slate-800/50"
                        : "bg-gradient-to-br from-blue-100/30 to-cyan-100/30"
                        } rounded-xl border ${modoDark ? "border-blue-500/20" : "border-blue-200"
                        } p-4 transition-all duration-300 hover:shadow-lg backdrop-blur-sm`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500`}>
                              <span className="text-lg font-bold text-white">
                                {cliente.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                            <div>
                              <h3 className={`font-bold ${textPrimary} line-clamp-1 text-sm`}>{cliente.nome}</h3>
                              <p className={`${textMuted} text-xs line-clamp-2 mt-1`}>{cliente.email || t("semEmail")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white`}>
                                {formatarTelefone(cliente.telefone || "")}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className={textMuted}>{t("adicionadoEm")}: </span>
                              <span className={textPrimary}>{formatarData(cliente.createdAt)}</span>
                            </div>
                            <div>
                              <span className={textMuted}>{t("ultimaAtualizacao")}: </span>
                              <span className={textPrimary}>{formatarData(cliente.updatedAt)}</span>
                            </div>
                            <div>
                              <span className={textMuted}>{t("endereco")}: </span>
                              <span className={`flex items-center gap-1 ${textPrimary}`}>
                                <FaMapMarkerAlt className="text-xs" />
                                {formatarEndereco(cliente) || t("semEndereco")}
                              </span>
                            </div>
                            <div>
                              <span className={textMuted}>{t("contato")}: </span>
                              <span className={`${cliente.telefone ? "text-green-500" : "text-red-500"} font-medium`}>
                                {cliente.telefone ? t("disponivel") : t("indisponivel")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 min-w-[120px]">
                          <button
                            onClick={() => handleEntrarContato(cliente)}
                            disabled={!cliente.telefone}
                            className={`p-2 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center ${cliente.telefone
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-gray-400 cursor-not-allowed text-white"
                              }`}
                          >
                            <FaPhoneAlt className="text-xs" />
                          </button>

                          {podeEditar ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalVisualizar(cliente);
                                setForm(cliente);
                              }}
                              className="px-2 py-1 rounded-lg cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white text-xs transition-all duration-300 flex items-center justify-center gap-1"
                            >
                              <FaEdit className="text-xs" />
                              {t("editar")}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalVisualizar(cliente);
                                setForm(cliente);
                              }}
                              className="px-2 py-1 rounded-lg cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs transition-all duration-300 flex items-center justify-center gap-1"
                            >
                              <FaEye className="text-xs" />
                              {t("visualizar")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === 1
                    ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed`
                    : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105`
                    }`}
                >
                  <FaAngleLeft className="text-sm" />
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPaginas)].map((_, index) => {
                    const pagina = index + 1;
                    const mostrarPagina = pagina === 1 || pagina === totalPaginas || (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1);

                    if (!mostrarPagina) {
                      if (pagina === paginaAtual - 2 || pagina === paginaAtual + 2) {
                        return (
                          <span key={pagina} className={`px-2 py-1 ${textMuted} text-sm`}>
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={pagina}
                        onClick={() => mudarPagina(pagina)}
                        className={`px-3 py-1 rounded-xl transition-all duration-300 text-sm ${pagina === paginaAtual
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105"
                          : `${bgCard} ${bgHover} ${textPrimary} border ${borderColor} hover:scale-105`
                          }`}
                      >
                        {pagina}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === totalPaginas
                    ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed`
                    : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105`
                    }`}
                >
                  <FaAngleRight className="text-sm" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(modalAberto || modalVisualizar) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div className={`${modoDark ? "bg-slate-800 border-blue-500/30 shadow-blue-500/20" : "bg-white border-blue-200 shadow-blue-200"} border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-sm`} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${textPrimary}`}>{modalVisualizar ? t("visualizarCliente") : t("novoCliente")}</h2>
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setModalVisualizar(null);
                  }}
                  className={`p-2 cursor-pointer ${bgHover} rounded-lg transition-colors ${textMuted} hover:${textPrimary}`}
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>
                    {t("nome")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    placeholder={t("nome")}
                    value={form.nome || ""}
                    onChange={handleNomeChange}
                    className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    maxLength={20}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {nomeCaracteres}/20 {nomeCaracteres === 20 && " - Limite"}
                  </div>
                </div>

                <div>
                  <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("email")}</label>
                  <input
                    placeholder={t("email")}
                    value={form.email || ""}
                    onChange={handleEmailChange}
                    className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    maxLength={45}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {emailCaracteres}/45 {emailCaracteres === 45 && " - Limite"}
                  </div>
                </div>

                <div>
                  <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("telefone")}</label>
                  <input
                    placeholder={t("telefone")}
                    value={form.telefone || ""}
                    onChange={handleTelefoneChange}
                    className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    maxLength={11}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {telefoneCaracteres}/11 {telefoneCaracteres === 11 && " - Limite"}
                  </div>
                </div>

                <div>
                  <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("endereco")}</label>
                  <input
                    placeholder={t("endereco")}
                    value={form.endereco || ""}
                    onChange={handleEnderecoChange}
                    className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    maxLength={50}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {enderecoCaracteres}/50 {enderecoCaracteres === 50 && " - Limite"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("cidade")}</label>
                    <input
                      placeholder={t("cidade")}
                      value={form.cidade || ""}
                      onChange={handleCidadeChange}
                      className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                      disabled={Boolean(!podeEditar && modalVisualizar)}
                      maxLength={20}
                    />
                    <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                      {cidadeCaracteres}/20 {cidadeCaracteres === 20 && " - Limite"}
                    </div>
                  </div>

                  <div>
                    <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("estado")}</label>
                    <input
                      placeholder={t("estado")}
                      value={form.estado || ""}
                      onChange={handleEstadoChange}
                      className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                      disabled={Boolean(!podeEditar && modalVisualizar)}
                      maxLength={2}
                    />
                    <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                      {estadoCaracteres}/2 {estadoCaracteres === 2 && " - Limite"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("cep")}</label>
                  <input
                    placeholder={t("cep")}
                    value={form.cep || ""}
                    onChange={handleCepChange}
                    className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    maxLength={10}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {cepCaracteres}/10 {cepCaracteres === 10 && " - Limite"}
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4 border-t border-blue-500/20">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setModalVisualizar(null);
                  }}
                  className={`px-4 py-2 cursor-pointer ${bgCard} ${bgHover} border ${borderColor} ${textPrimary} rounded-xl transition-all duration-300 hover:scale-105 text-sm`}
                >
                  {t("fechar")}
                </button>
                {modalVisualizar ? (
                  podeEditar && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSalvarCliente}
                        className="px-4 py-2 cursor-pointer bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 hover:scale-105 text-sm"
                      >
                        {t("salvar")}
                      </button>
                      {podeExcluir && (
                        <button
                          onClick={handleDelete}
                          className="px-4 py-2 cursor-pointer bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 hover:scale-105 text-sm"
                        >
                          {t("excluir")}
                        </button>
                      )}
                    </div>
                  )
                ) : (
                  <button
                    onClick={handleAdicionarCliente}
                    className="px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 hover:scale-105 text-sm"
                  >
                    {t("adicionarCliente")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}