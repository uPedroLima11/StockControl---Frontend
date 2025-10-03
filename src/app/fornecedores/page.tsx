"use client";
import { FornecedorI } from "@/utils/types/fornecedor";
import { useEffect, useState, useRef } from "react";
import { FaSearch, FaPhoneAlt, FaLock, FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { cores } from "@/utils/cores";
import Swal from "sweetalert2";
import Image from "next/image";
import Cookies from "js-cookie";

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
  const [, setIsUploading] = useState(false);
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
      console.error("Erro ao verificar a permissão:", error);
      return false;
    }
  };

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (usuarioSalvo) {
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
      }

      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

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

    carregarDadosIniciais();

    const style = document.createElement('style');
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

    return () => {
      document.head.removeChild(style);
    };
  }, [modoDark]);

  useEffect(() => {
    if (modalVisualizar) {
      setNomeCaracteres(modalVisualizar.nome?.length || 0);
      setCategoriaCaracteres(modalVisualizar.categoria?.length || 0);
      setEmailCaracteres(modalVisualizar.email?.length || 0);
      setCnpjCaracteres(modalVisualizar.cnpj?.length || 0);
      setTelefoneCaracteres(modalVisualizar.telefone?.length || 0);
    }
  }, [modalVisualizar]);


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
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`
        }
      });
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
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
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
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return telefone;
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

  const uploadFotoSeparada = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("foto", file);

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return null;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/upload-foto`, {
        method: "POST",
        body: formData,
        headers: {
          'user-id': usuarioValor
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.fotoUrl;
      } else {
        console.error("Erro no upload da foto:", await response.text());
        return null;
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFotoUpdate = async (file: File, fornecedorId: string): Promise<string | null> => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("foto", file);

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return null;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${fornecedorId}/upload-foto`, {
        method: "PUT",
        body: formData,
        headers: {
          'user-id': usuarioValor
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.fotoUrl;
      } else {
        console.error("Erro no upload da foto:", await response.text());
        return null;
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  async function handleAdicionarFornecedor() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    handleAcaoProtegida(async () => {
      if (!empresaId) return alert("Empresa não identificada.");

      let mensagemErro = "";

      if (!form.nome.trim()) {
        mensagemErro += `• ${t("nome")} ${t("modal.camposObrigatorios.texto", "é obrigatório")}\n`;
      }

      if (!form.email.trim()) {
        mensagemErro += `• ${t("email")} ${t("modal.camposObrigatorios.texto", "é obrigatório")}\n`;
      }

      if (!form.cnpj.trim()) {
        mensagemErro += `• ${t("cnpj")} ${t("modal.camposObrigatorios.texto", "é obrigatório")}\n`;
      }

      if (mensagemErro) {
        Swal.fire({
          title: t("modal.camposObrigatorios.titulo", "Campos obrigatórios"),
          html: `${t("modal.camposObrigatorios.texto", "Por favor, preencha os seguintes campos:")}<br><br>${mensagemErro.replace(/\n/g, '<br>')}`,
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

      try {
        let fotoUrl = form.foto;

        if (fotoFile) {
          const uploadedUrl = await uploadFotoSeparada(fotoFile);
          if (uploadedUrl) {
            fotoUrl = uploadedUrl;
          } else {
            Swal.fire("Aviso", "Upload da foto falhou, continuando sem imagem", "warning");
          }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'user-id': usuarioValor
          },
          body: JSON.stringify({
            nome: form.nome.trim(),
            email: form.email.trim(),
            cnpj: form.cnpj.trim(),
            telefone: form.telefone.trim(),
            categoria: form.categoria.trim(),
            empresaId: empresaId,
            usuarioId: usuarioValor,
            fotoUrl: fotoUrl
          })
        });

        if (response.status === 201) {
          Swal.fire({
            text: t("mensagens.fornecedorAdicionado"),
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          setModalAberto(false);
          setFotoFile(null);
          setFotoPreview(null);
          setForm({
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

      let mensagemErro = "";

      if (!form.nome.trim()) {
        mensagemErro += `• ${t("nome")} ${t("mensagens.campoObrigatorio", "é obrigatório")}\n`;
      }

      if (!form.email.trim()) {
        mensagemErro += `• ${t("email")} ${t("mensagens.campoObrigatorio", "é obrigatório")}\n`;
      }

      if (!form.cnpj.trim()) {
        mensagemErro += `• ${t("cnpj")} ${t("mensagens.campoObrigatorio", "é obrigatório")}\n`;
      }

      if (mensagemErro) {
        Swal.fire({
          title: t("mensagens.camposObrigatorios", "Campos obrigatórios"),
          html: `${t("mensagens.preenchaCampos", "Por favor, preencha os seguintes campos:")}<br><br>${mensagemErro.replace(/\n/g, '<br>')}`,
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
        let fotoUrl = form.foto;

        if (fotoFile) {
          const uploadedUrl = await uploadFotoUpdate(fotoFile, modalVisualizar.id);
          if (uploadedUrl) {
            fotoUrl = uploadedUrl;
          } else {
            Swal.fire("Aviso", "Upload da foto falhou, mantendo imagem anterior", "warning");
          }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${modalVisualizar.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'user-id': usuarioValor
          },
          body: JSON.stringify({
            nome: form.nome.trim(),
            email: form.email.trim(),
            cnpj: form.cnpj.trim(),
            telefone: form.telefone.trim(),
            categoria: form.categoria.trim(),
            empresaId: empresaId || "",
            usuarioId: usuarioValor,
            fotoUrl: fotoUrl
          })
        });

        if (response.ok) {
          Swal.fire({
            text: t("mensagens.fornecedorAtualizado"),
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          setModalVisualizar(null);
          setFotoFile(null);
          setFotoPreview(null);
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
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${fornecedor.id}`, {
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

    const numeroComCodigoPais = `55${telefoneFormatado}`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroComCodigoPais}`;
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
              className="outline-none font-mono text-sm bg-transparent placeholder-gray-400 w-full"
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
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
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
              className="px-6 py-2 border-2 cursor-pointer rounded-lg transition-all duration-200 hover:scale-105 font-mono text-sm whitespace-nowrap mt-2 sm:mt-0"
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

        {totalPaginas > 1 && (
          <div className="hidden md:flex justify-between items-center mb-4">
            <span className="text-sm font-mono" style={{ color: temaAtual.texto }}>
              {t("totalFornecedores")}: {fornecedoresFiltrados.length}
            </span>
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
                {paginaAtual} / {totalPaginas}
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
          </div>
        )}

        <div
          className="border rounded-xl shadow"
          style={{
            backgroundColor: temaAtual.card,
            borderColor: temaAtual.borda,
          }}
        >
          {fornecedoresFiltrados.length === 0 ? (
            <div className="p-8 text-center" style={{ color: temaAtual.texto }}>
              {busca ? t("nenhumFornecedorEncontradoBusca") : t("nenhumFornecedorEncontrado")}
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b" style={{ borderColor: temaAtual.borda }}>
                    <tr style={{ color: temaAtual.texto }}>
                      <th className="py-3 px-4 text-center w-16">{t("foto")}</th>
                      <th className="py-3 px-4 text-left">{t("nome")}</th>
                      <th className="py-3 px-4 text-left">{t("cnpj")}</th>
                      <th className="py-3 px-4 text-left">{t("email")}</th>
                      <th className="py-3 px-4 text-center">{t("telefone")}</th>
                      <th className="py-3 px-4 text-center">{t("categoria")}</th>
                      <th className="py-3 px-4 text-center">{t("contato")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedoresAtuais.map((fornecedor) => (
                      <tr
                        key={fornecedor.id}
                        className="border-b transition-all duration-200"
                        style={{
                          color: temaAtual.texto,
                          borderColor: temaAtual.borda,
                          backgroundColor: temaAtual.card,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.card;
                        }}
                      >
                        <td className="py-3 px-4 text-center">
                          <div
                            className="cursor-pointer mx-auto"
                            onClick={() => {
                              setModalVisualizar(fornecedor);
                              setForm(fornecedor);
                            }}
                          >
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
                          </div>
                        </td>
                        <td
                          className="py-3 px-4 text-left cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          {fornecedor.nome}
                        </td>
                        <td
                          className="py-3 px-4 text-left cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          {fornecedor.cnpj}
                        </td>
                        <td
                          className="py-3 px-4 text-left cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          <span className="text-xs">{fornecedor.email}</span>
                        </td>
                        <td
                          className="py-3 px-4 text-center cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          {formatarTelefone(fornecedor.telefone)}
                        </td>
                        <td
                          className="py-3 px-4 text-center cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded" >
                            {fornecedor.categoria}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <FaPhoneAlt
                            onClick={() => handleEntrarContato(fornecedor)}
                            color="#25D366"
                            size={18}
                            className="cursor-pointer m-auto hover:scale-110 transition-transform"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="hidden md:block lg:hidden overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b" style={{ borderColor: temaAtual.borda }}>
                    <tr style={{ color: temaAtual.texto }}>
                      <th className="py-3 px-2 text-center w-14">{t("foto")}</th>
                      <th className="py-3 px-2 text-left">{t("nome")}</th>
                      <th className="py-3 px-2 text-left">{t("cnpj")}</th>
                      <th className="py-3 px-2 text-center">{t("categoria")}</th>
                      <th className="py-3 px-2 text-center">{t("contato")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedoresAtuais.map((fornecedor) => (
                      <tr
                        key={fornecedor.id}
                        className="border-b transition-all duration-200"
                        style={{
                          color: temaAtual.texto,
                          borderColor: temaAtual.borda,
                          backgroundColor: temaAtual.card,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.card;
                        }}
                      >
                        <td className="py-3 px-2 text-center">
                          <div
                            className="cursor-pointer mx-auto"
                            onClick={() => {
                              setModalVisualizar(fornecedor);
                              setForm(fornecedor);
                            }}
                          >
                            <Image
                              src={fornecedor.foto || "/contadefault.png"}
                              width={36}
                              height={36}
                              className="rounded-full object-cover"
                              alt={fornecedor.nome}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/contadefault.png";
                              }}
                            />
                          </div>
                        </td>
                        <td
                          className="py-3 px-2 text-left cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          <div>
                            <div className="font-medium">{fornecedor.nome}</div>
                            <div className="text-xs" style={{ color: temaAtual.texto }}>
                              {fornecedor.email}
                            </div>
                          </div>
                        </td>
                        <td
                          className="py-3 px-2 text-left cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          <div className="text-xs">{fornecedor.cnpj}</div>
                          <div className="text-xs">{formatarTelefone(fornecedor.telefone)}</div>
                        </td>
                        <td
                          className="py-3 px-2 text-center cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded">
                            {fornecedor.categoria}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <FaPhoneAlt
                            onClick={() => handleEntrarContato(fornecedor)}
                            color="#25D366"
                            size={16}
                            className="cursor-pointer m-auto hover:scale-110 transition-transform"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3 p-3">
                {fornecedoresAtuais.map((fornecedor) => (
                  <div
                    key={fornecedor.id}
                    className="border rounded-lg p-4 transition-all"
                    style={{
                      backgroundColor: temaAtual.card,
                      borderColor: temaAtual.borda,
                    }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                        >
                          <Image
                            src={fornecedor.foto || "/contadefault.png"}
                            width={48}
                            height={48}
                            className="rounded-full object-cover flex-shrink-0"
                            alt={fornecedor.nome}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/contadefault.png";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              setModalVisualizar(fornecedor);
                              setForm(fornecedor);
                            }}
                          >
                            <p className="font-semibold truncate" style={{ color: temaAtual.texto }}>
                              {fornecedor.nome}
                            </p>
                            <p className="text-xs truncate" style={{ color: temaAtual.texto }}>
                              {fornecedor.email}
                            </p>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: temaAtual.texto }}>
                              {fornecedor.categoria}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <FaPhoneAlt
                          onClick={() => handleEntrarContato(fornecedor)}
                          color="#25D366"
                          size={16}
                          className="cursor-pointer border p-1 rounded-full hover:bg-green-100 transition"
                        />
                        <button
                          onClick={() => toggleExpandirFornecedor(fornecedor.id)}
                          className="p-1"
                          style={{ color: temaAtual.primario }}
                        >
                          {fornecedorExpandido === fornecedor.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-3 text-sm overflow-hidden transition-all duration-200 ${fornecedorExpandido === fornecedor.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: temaAtual.texto }}
                    >
                      <div className="pt-3 border-t space-y-2" style={{ borderColor: temaAtual.borda }}>
                        <div className="flex justify-between">
                          <span className="font-semibold">{t("cnpj")}:</span>
                          <span>{fornecedor.cnpj}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">{t("telefone")}:</span>
                          <span>{formatarTelefone(fornecedor.telefone)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">{t("adicionadoEm")}:</span>
                          <span>{formatarData(fornecedor.createdAt)}</span>
                        </div>

                        {podeEditar && (
                          <div className="flex justify-end gap-2 pt-3">
                            <button
                              onClick={() => {
                                setModalVisualizar(fornecedor);
                                setForm(fornecedor);
                              }}
                              className="px-3 py-1.5 text-xs rounded border"
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
                                className="px-3 py-1.5 text-xs rounded border"
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

        {totalPaginas > 1 && (
          <div className="md:hidden flex justify-between items-center mt-4 p-3 rounded-lg" style={{
            backgroundColor: temaAtual.card,
            border: `1px solid ${temaAtual.borda}`
          }}>
            <span className="text-sm font-mono" style={{ color: temaAtual.texto }}>
              {paginaAtual} / {totalPaginas}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => mudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                className={`p-2 rounded-full ${paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                style={{
                  color: temaAtual.texto,
                  backgroundColor: temaAtual.primario + "20"
                }}
              >
                <FaAngleLeft />
              </button>

              <button
                onClick={() => mudarPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
                className={`p-2 rounded-full ${paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                style={{
                  color: temaAtual.texto,
                  backgroundColor: temaAtual.primario + "20"
                }}
              >
                <FaAngleRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {(modalAberto || modalVisualizar) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
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

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">
                  {t("nome")} <span className="text-red-500">*</span>
                </label>
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
                <label className="block mb-1 text-sm">
                  {t("email")} <span className="text-red-500">*</span>
                </label>
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
                <label className="block mb-1 text-sm">
                  {t("cnpj")} <span className="text-red-500">*</span>
                </label>
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

            <div className="flex justify-between mt-6 gap-3">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setModalVisualizar(null);
                  setFotoFile(null);
                  setFotoPreview(null);
                }}
                className="cursor-pointer hover:underline px-4 py-2 rounded"
                style={{
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
              >
                {t("fechar")}
              </button>

              {modalVisualizar ? (
                podeEditar && (
                  <div className="flex gap-2">
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
                  </div>
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