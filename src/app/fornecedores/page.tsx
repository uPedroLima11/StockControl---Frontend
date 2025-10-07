"use client";

import { FornecedorI } from "@/utils/types/fornecedor";
import { useEffect, useState, useRef } from "react";
import { FaSearch, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaIdCard, FaChevronDown, FaAngleLeft, FaAngleRight, FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaTimes, FaWhatsapp, FaBox, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { cores } from "@/utils/cores";
import Image from "next/image";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

type CampoOrdenacao = "nome" | "categoria" | "email" | "cnpj" | "none";
type DirecaoOrdenacao = "asc" | "desc";
type TipoVisualizacao = "cards" | "lista";



export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [fornecedoresOriginais, setFornecedoresOriginais] = useState<FornecedorI[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<FornecedorI | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [modoDark, setModoDark] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const fornecedoresPorPagina = 12;
  const { t } = useTranslation("fornecedores");
  const router = useRouter();
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>("cards");
  const [modoModal, setModoModal] = useState<"visualizar" | "editar" | "criar">("visualizar");
  const [stats, setStats] = useState({
    total: 0,
    comProdutos: 0,
    semProdutos: 0,
    favoritos: 0,
    categorizados: 0,
  });

  const [menuFiltrosAberto, setMenuFiltrosAberto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [campoOrdenacao, setCampoOrdenacao] = useState<CampoOrdenacao>("none");
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<DirecaoOrdenacao>("asc");

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

  const [nomeCaracteres, setNomeCaracteres] = useState(0);
  const [categoriaCaracteres, setCategoriaCaracteres] = useState(0);
  const [emailCaracteres, setEmailCaracteres] = useState(0);
  const [cnpjCaracteres, setCnpjCaracteres] = useState(0);
  const [telefoneCaracteres, setTelefoneCaracteres] = useState(0);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuFiltrosRef = useRef<HTMLDivElement>(null);
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
      console.error("Erro ao verificar a permissão:", error);
      return false;
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const initialize = async () => {
      setLoading(true);

      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

      const visualizacaoSalva = localStorage.getItem("fornecedores_visualizacao") as TipoVisualizacao;
      if (visualizacaoSalva && (visualizacaoSalva === "cards" || visualizacaoSalva === "lista")) {
        setTipoVisualizacao(visualizacaoSalva);
      }

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) {
        setLoading(false);
        return;
      }

      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      try {
        const carregarPermissoes = async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioValor}/permissoes`, {
              headers: { "user-id": usuarioValor }
            });
            if (response.ok) {
              const dados: { permissoes: { chave: string; concedida: boolean }[] } = await response.json();
              const permissoesUsuarioObj: Record<string, boolean> = {};
              dados.permissoes.forEach((permissao) => {
                permissoesUsuarioObj[permissao.chave] = permissao.concedida;
              });
              setPermissoesUsuario(permissoesUsuarioObj);
            } else {
              const permissoesParaVerificar = ["fornecedores_criar", "fornecedores_editar", "fornecedores_excluir", "fornecedores_visualizar"];
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

        const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`, {
          headers: { "user-id": usuarioValor },
        });

        if (!responseUsuario.ok) {
          console.error("Erro ao buscar os dados do usuário");
          setLoading(false);
          return;
        }

        const usuario = await responseUsuario.json();
        setEmpresaId(usuario.empresaId);
        setTipoUsuario(usuario.tipo);

        if (usuario.empresaId) {
          const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
          setEmpresaAtivada(ativada);

          if (ativada) {
            const responseFornecedores = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/empresa/${usuario.empresaId}`, {
              headers: {
                "content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
              },
            });

            if (responseFornecedores.ok) {
              const fornecedoresDaEmpresa = await responseFornecedores.json();
              const fornecedoresOrdenados = fornecedoresDaEmpresa.sort((a: FornecedorI, b: FornecedorI) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

              setFornecedores(fornecedoresOrdenados);
              setFornecedoresOriginais(fornecedoresOrdenados);

              const comProdutos = fornecedoresDaEmpresa.filter((f: FornecedorI) =>
                f.Produto && f.Produto.length > 0
              ).length;

              const categorizados = fornecedoresDaEmpresa.filter((f: FornecedorI) =>
                f.categoria && f.categoria.trim() !== ''
              ).length;

              setStats({
                total: fornecedoresDaEmpresa.length,
                comProdutos,
                semProdutos: fornecedoresDaEmpresa.length - comProdutos,
                favoritos: 0,
                categorizados,
              });
            }
          }
        }

        await carregarPermissoes();

      } catch (error) {
        console.error("Erro na inicialização:", error);
      } finally {
        setLoading(false);
      }
    };

    function handleClickOutside(event: MouseEvent) {
      if (menuFiltrosRef.current && !menuFiltrosRef.current.contains(event.target as Node)) {
        setMenuFiltrosAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .animate-slide-in {
        animation: slideIn 0.4s ease-out forwards;
      }
      
      .card-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
        
      .card-hover:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }
      
      .glow-effect {
        position: relative;
        overflow: hidden;
      }
      
      .glow-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s;
      }
      
      .glow-effect:hover::before {
        left: 100%;
      }
      
      .gradient-border {
        position: relative;
        background: linear-gradient(45deg, ${modoDark ? "#3B82F6, #0EA5E9, #1E293B" : "#1976D2, #0284C7, #E2E8F0"});
        padding: 1px;
        border-radius: 16px;
      }
      
      .gradient-border > div {
        background: ${modoDark ? "#1E293B" : "#FFFFFF"};
        border-radius: 15px;
      }
      
      .scroll-custom {
        max-height: 200px;
        overflow-y: auto;
      }
      
      .scroll-custom::-webkit-scrollbar {
        width: 6px;
      }
      
      .scroll-custom::-webkit-scrollbar-track {
        background: ${modoDark ? "#1E293B" : "#F1F5F9"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb {
        background: ${modoDark ? "#3B82F6" : "#94A3B8"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb:hover {
        background: ${modoDark ? "#2563EB" : "#64748B"};
      }
      
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    initialize();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  useEffect(() => {
    if (modalAberto && !modalVisualizar) {
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
      setNomeCaracteres(0);
      setCategoriaCaracteres(0);
      setEmailCaracteres(0);
      setCnpjCaracteres(0);
      setTelefoneCaracteres(0);
      setFotoFile(null);
      setFotoPreview(null);
    }
  }, [modalAberto, modalVisualizar]);

  const ordenarFornecedores = (fornecedores: FornecedorI[], campo: CampoOrdenacao, direcao: DirecaoOrdenacao) => {
    if (campo === "none") return [...fornecedores];

    return [...fornecedores].sort((a, b) => {
      let valorA, valorB;

      switch (campo) {
        case "nome":
          valorA = a.nome.toLowerCase();
          valorB = b.nome.toLowerCase();
          break;
        case "categoria":
          valorA = a.categoria?.toLowerCase() || "";
          valorB = b.categoria?.toLowerCase() || "";
          break;
        case "email":
          valorA = a.email?.toLowerCase() || "";
          valorB = b.email?.toLowerCase() || "";
          break;
        case "cnpj":
          valorA = a.cnpj?.toLowerCase() || "";
          valorB = b.cnpj?.toLowerCase() || "";
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return direcao === "asc" ? -1 : 1;
      }
      if (valorA > valorB) {
        return direcao === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const alterarVisualizacao = (novoTipo: TipoVisualizacao) => {
    setTipoVisualizacao(novoTipo);
    localStorage.setItem("fornecedores_visualizacao", novoTipo);
  };

  const verificarAtivacaoEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
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

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 60) {
      setForm({ ...form, nome: value });
      setNomeCaracteres(value.length);
    }
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
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      setForm({ ...form, telefone: value });
      setTelefoneCaracteres(value.length);
    }
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setForm({ ...form, categoria: value });
      setCategoriaCaracteres(value.length);
    }
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
          "user-id": usuarioValor,
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
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
          "user-id": usuarioValor,
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
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

  const handleSubmit = async () => {
    handleAcaoProtegida(async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      if (!empresaId) {
        Swal.fire("Erro", "Empresa não identificada.", "error");
        return;
      }

      const camposObrigatorios = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        cnpj: form.cnpj.trim(),
        telefone: form.telefone.trim(),
      };

      const camposFaltando = Object.entries(camposObrigatorios)
        .filter(([, value]) => !value)
        .map(([campo]) => campo);

      if (camposFaltando.length > 0) {
        const camposTraduzidos = camposFaltando.map((campo) => {
          switch (campo) {
            case "nome":
              return t("nome");
            case "email":
              return t("email");
            case "cnpj":
              return t("cnpj");
            case "telefone":
              return t("telefone");
            default:
              return campo;
          }
        });

        Swal.fire({
          icon: "error",
          title: t("erroCamposObrigatorios.titulo") || "Campos obrigatórios",
          html: `${t("erroCamposObrigatorios.mensagem") || "Preencha os campos obrigatórios:"}<br><strong>${camposTraduzidos.join(", ")}</strong>`,
          confirmButtonColor: "#EF4444",
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
        });
        return;
      }

      if (empresaId) {
        const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
        if (!empresaAtivada) {
          mostrarAlertaNaoAtivada();
          return;
        }
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
            "user-id": usuarioValor,
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({
            nome: form.nome.trim(),
            email: form.email.trim(),
            cnpj: form.cnpj.trim(),
            telefone: form.telefone.trim(),
            categoria: form.categoria.trim(),
            empresaId: empresaId,
            usuarioId: usuarioValor,
            fotoUrl: fotoUrl,
          }),
        });

        if (response.ok) {
          setModalAberto(false);
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
          setFotoFile(null);
          setFotoPreview(null);

          Swal.fire({
            position: "center",
            icon: "success",
            title: t("fornecedorCriadoSucesso.titulo"),
            showConfirmButton: false,
            timer: 1500,
            background: modoDark ? temaAtual.card : "#FFFFFF",
            color: modoDark ? temaAtual.texto : temaAtual.texto,
          });

          setTimeout(() => window.location.reload(), 1600);
        } else {
          const errorData = await response.json();
          Swal.fire("Erro!", `Erro ao cadastrar fornecedor: ${errorData.mensagem || "Erro desconhecido"}`, "error");
        }
      } catch (err) {
        console.error("Erro ao criar fornecedor:", err);
        Swal.fire("Erro!", "Erro de conexão com o servidor", "error");
      }
    });
  };

  const handleUpdate = async () => {
    handleAcaoProtegida(async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!modalVisualizar) return;

      const camposObrigatorios = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        cnpj: form.cnpj.trim(),
        telefone: form.telefone.trim(),
      };

      const camposFaltando = Object.entries(camposObrigatorios)
        .filter(([, value]) => !value)
        .map(([campo]) => campo);

      if (camposFaltando.length > 0) {
        const camposTraduzidos = camposFaltando.map((campo) => {
          switch (campo) {
            case "nome":
              return t("nome");
            case "email":
              return t("email");
            case "cnpj":
              return t("cnpj");
            case "telefone":
              return t("telefone");
            default:
              return campo;
          }
        });

        Swal.fire({
          icon: "error",
          title: t("erroCamposObrigatorios.titulo") || "Campos obrigatórios",
          html: `${t("erroCamposObrigatorios.mensagem") || "Preencha os campos obrigatórios:"}<br><strong>${camposTraduzidos.join(", ")}</strong>`,
          confirmButtonColor: "#EF4444",
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
        });
        return;
      }

      if (empresaId) {
        const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
        if (!empresaAtivada) {
          mostrarAlertaNaoAtivada();
          return;
        }
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
            "user-id": usuarioValor,
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({
            nome: form.nome.trim(),
            email: form.email.trim(),
            cnpj: form.cnpj.trim(),
            telefone: form.telefone.trim(),
            categoria: form.categoria.trim(),
            empresaId: empresaId,
            usuarioId: usuarioValor,
            fotoUrl: fotoUrl,
          }),
        });

        if (response.ok) {
          const updatedFornecedor = await response.json();

          setModalVisualizar(null);
          setFotoFile(null);
          setFotoPreview(null);

          setFornecedores(fornecedores.map((f) => (f.id === updatedFornecedor.id ? updatedFornecedor : f)));
          Swal.fire({
            position: "center",
            icon: "success",
            title: t("fornecedorAtualizadoSucesso.titulo"),
            showConfirmButton: false,
            timer: 1500,
            background: modoDark ? temaAtual.card : "#FFFFFF",
            color: modoDark ? temaAtual.texto : temaAtual.texto,
          });
          setTimeout(() => window.location.reload(), 1600);
        } else {
          const errorText = await response.text();
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text: `Erro ao atualizar fornecedor: ${errorText}`,
            background: modoDark ? temaAtual.card : "#FFFFFF",
            color: modoDark ? temaAtual.texto : temaAtual.texto,
          });
        }
      } catch (err) {
        console.error("Erro ao atualizar fornecedor:", err);
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: "Erro inesperado ao tentar atualizar.",
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
        });
      }
    });
  };

  const handleDelete = async () => {
    handleAcaoProtegida(async () => {
      if (!modalVisualizar) return;

      if (empresaId) {
        const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
        if (!empresaAtivada) {
          mostrarAlertaNaoAtivada();
          return;
        }
      }

      const result = await Swal.fire({
        title: t("confirmacaoExclusao.titulo"),
        text: t("confirmacaoExclusao.mensagem"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("confirmacaoExclusao.botaoConfirmar"),
        cancelButtonText: t("confirmacaoExclusao.botaoCancelar"),
        background: modoDark ? temaAtual.card : "#FFFFFF",
        color: modoDark ? temaAtual.texto : temaAtual.texto,
      });

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      if (result.isConfirmed) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${modalVisualizar.id}`, {
            method: "DELETE",
            headers: {
              "user-id": usuarioValor,
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          });
          Swal.fire(t("fornecedorExcluidoSucesso.titulo"), t("fornecedorExcluidoSucesso.mensagem"), "success");
          setModalVisualizar(null);
          window.location.reload();
        } catch (err) {
          console.error("Erro ao excluir fornecedor:", err);
          Swal.fire("Erro!", "Não foi possível deletar o fornecedor.", "error");
        }
      }
    });
  };

  const handleEntrarContato = (fornecedor: FornecedorI) => {
    const telefoneFormatado = fornecedor.telefone.replace(/\D/g, "");
    const numeroComCodigoPais = `55${telefoneFormatado}`;
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroComCodigoPais}`;
    window.open(urlWhatsApp, "_blank");
  };

  const formatarTelefone = (telefone: string) => {
    const numeros = telefone.replace(/\D/g, "");
    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return telefone;
  };

  const formatarData = (dataString: string | Date) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const aplicarFiltroCategoria = (categoria: string | null) => {
    setFiltroCategoria(categoria);
    setPaginaAtual(1);
  };

  const removerFiltros = () => {
    setFiltroCategoria(null);
    setCampoOrdenacao("none");
    setDirecaoOrdenacao("asc");
    setPaginaAtual(1);
  };

  const categoriasUnicas = [...new Set(fornecedoresOriginais.map(f => f.categoria).filter(Boolean))];

  const fornecedoresFiltrados = fornecedoresOriginais.filter((fornecedor) => {
    const buscaMatch = fornecedor.nome.toLowerCase().includes(busca.toLowerCase()) ||
      fornecedor.email.toLowerCase().includes(busca.toLowerCase()) ||
      fornecedor.cnpj.includes(busca) ||
      fornecedor.categoria.toLowerCase().includes(busca.toLowerCase());
    const categoriaMatch = filtroCategoria ? fornecedor.categoria === filtroCategoria : true;
    return buscaMatch && categoriaMatch;
  });

  const fornecedoresOrdenados = ordenarFornecedores(fornecedoresFiltrados, campoOrdenacao, direcaoOrdenacao);

  const indexUltimoFornecedor = paginaAtual * fornecedoresPorPagina;
  const indexPrimeiroFornecedor = indexUltimoFornecedor - fornecedoresPorPagina;
  const fornecedoresAtuais = fornecedoresOrdenados.slice(indexPrimeiroFornecedor, indexUltimoFornecedor);
  const totalPaginas = Math.ceil(fornecedoresOrdenados.length / fornecedoresPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  const podeVisualizar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.fornecedores_visualizar;
  const podeCriar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.fornecedores_criar;
  const podeEditar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.fornecedores_editar;
  const podeExcluir = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.fornecedores_excluir;

  const abrirModalVisualizar = (fornecedor: FornecedorI) => {
    setModalVisualizar(fornecedor);
    setForm(fornecedor);
    setModoModal("visualizar");
  };

  const abrirModalEditar = (fornecedor: FornecedorI) => {
    setModalVisualizar(fornecedor);
    setForm(fornecedor);
    setModoModal("editar");
  };

  const abrirModalCriar = () => {
    setModalAberto(true);
    setModalVisualizar(null);
    setModoModal("criar");
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalVisualizar(null);
    setFotoFile(null);
    setFotoPreview(null);
    setModoModal("visualizar");
  };

  if (!podeVisualizar) {
    return (
      <div className={`min-h-screen ${modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"} flex items-center justify-center px-4`}>
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-6 ${modoDark ? "bg-red-500/20" : "bg-red-100"} rounded-full flex items-center justify-center`}>
            <FaExclamationTriangle className={`text-3xl ${modoDark ? "text-red-400" : "text-red-500"}`} />
          </div>
          <h1 className={`text-2xl font-bold ${modoDark ? "text-white" : "text-slate-900"} mb-4`}>{t("acessoRestrito")}</h1>
          <p className={modoDark ? "text-gray-300" : "text-slate-600"}>{t("acessoRestritoMensagem")}</p>
        </div>
      </div>
    );
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
  const bgSelected = modoDark ? "bg-blue-500/20" : "bg-blue-100";

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
                 <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("fornecedores")}</span>
                </h1>
                <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>{t("subtitulo")}</p>
              </div>
            </section>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: t("stats.total"),
                  value: stats.total,
                  icon: FaBuilding,
                  color: "from-blue-500 to-cyan-500",
                  bgColor: modoDark ? "bg-blue-500/10" : "bg-blue-50",
                },
                {
                  label: t("stats.comProdutos"),
                  value: stats.comProdutos,
                  icon: FaBox,
                  color: "from-green-500 to-emerald-500",
                  bgColor: modoDark ? "bg-green-500/10" : "bg-green-50",
                },
                {
                  label: t("stats.semProdutos"),
                  value: stats.semProdutos,
                  icon: FaExclamationTriangle,
                  color: "from-orange-500 to-amber-500",
                  bgColor: modoDark ? "bg-orange-500/10" : "bg-orange-50",
                },
                {
                  label: t("stats.categorizados"),
                  value: stats.categorizados,
                  icon: FaMapMarkerAlt,
                  color: "from-purple-500 to-pink-500",
                  bgColor: modoDark ? "bg-purple-500/10" : "bg-purple-50",
                  tooltip: `${stats.categorizados} de ${stats.total} fornecedores têm categoria definida`
                },
              ].map((stat, index) => (
                <div key={index} className="gradient-border animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`p-4 rounded-[15px] ${bgStats} backdrop-blur-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                          {stat.value}
                        </div>
                        <div className={textMuted}>{stat.label}</div>
                      </div>
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`text-xl bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {empresaId && !empresaAtivada && (
              <div className={`mb-4 p-4 rounded-2xl flex items-center gap-3 ${modoDark ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30" : "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"}`}>
                <div className={`p-2 ${modoDark ? "bg-orange-500/20" : "bg-orange-100"} rounded-xl`}>
                  <FaExclamationTriangle className={`text-xl ${modoDark ? "text-orange-400" : "text-orange-500"}`} />
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
                      placeholder={t("buscarPlaceholder")}
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
                  <div className="relative" ref={menuFiltrosRef}>
                    <button onClick={() => setMenuFiltrosAberto(!menuFiltrosAberto)} className={`flex items-center gap-3 ${bgCard} ${bgHover} border cursor-pointer ${borderColor} rounded-xl px-4 py-3 transition-all duration-300 backdrop-blur-sm`}>
                      <FaFilter className={modoDark ? "text-blue-400" : "text-blue-500"} />
                      <span className={`${textPrimary} text-sm`}>{t("filtros.filtrar")}</span>
                      <FaChevronDown className={`${modoDark ? "text-blue-400" : "text-blue-500"} transition-transform duration-300 text-xs ${menuFiltrosAberto ? "rotate-180" : ""}`} />
                    </button>

                    {menuFiltrosAberto && (
                      <div className={`absolute top-full left-0 mt-2 w-64 ${modoDark ? "bg-slate-800/95" : "bg-white/95"} border ${borderColor} rounded-xl shadow-2xl ${modoDark ? "shadow-blue-500/20" : "shadow-blue-200"} z-50 overflow-hidden backdrop-blur-sm`}>
                        <div className="p-3">
                          <div className={`text-sm font-semibold ${textPrimary} mb-2`}>{t("filtros.ordenarPor")}</div>

                          <div className="mb-3">
                            <div className={`text-xs font-medium ${textMuted} mb-2`}>{t("filtros.campo")}</div>
                            <div className="flex flex-col gap-1">
                              {[
                                { valor: "nome", label: t("nome") },
                                { valor: "categoria", label: t("categoria") },
                                { valor: "email", label: t("email") },
                                { valor: "cnpj", label: t("cnpj") },
                              ].map((campo) => (
                                <button
                                  key={campo.valor}
                                  onClick={() => {
                                    if (campoOrdenacao === campo.valor) {
                                      setDirecaoOrdenacao(direcaoOrdenacao === "asc" ? "desc" : "asc");
                                    } else {
                                      setCampoOrdenacao(campo.valor as CampoOrdenacao);
                                      setDirecaoOrdenacao("asc");
                                    }
                                  }}
                                  className={`flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer text-xs transition-all ${campoOrdenacao === campo.valor ? `${bgSelected} text-blue-600 font-medium` : `${bgHover} ${textPrimary}`
                                    }`}
                                >
                                  <span>{campo.label}</span>
                                  {campoOrdenacao === campo.valor && (
                                    <span className="text-xs">{direcaoOrdenacao === "asc" ? "↑" : "↓"}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className={`text-xs font-medium ${textMuted} mb-2`}>{t("filtros.categoria")}</div>
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto scroll-custom">
                              {categoriasUnicas.map((categoria) => (
                                <button
                                  key={categoria}
                                  onClick={() => aplicarFiltroCategoria(categoria)}
                                  className={`flex items-center px-2 py-1 rounded-lg cursor-pointer text-xs transition-all ${filtroCategoria === categoria ? `${bgSelected} text-blue-600 font-medium` : `${bgHover} ${textPrimary}`
                                    }`}
                                >
                                  {categoria}
                                </button>
                              ))}
                            </div>
                          </div>

                          {(filtroCategoria || campoOrdenacao !== "none") && (
                            <button
                              onClick={removerFiltros}
                              className={`w-full px-3 cursor-pointer py-2 ${modoDark ? "bg-red-500/10 hover:bg-red-500/20" : "bg-red-50 hover:bg-red-100"} border ${modoDark ? "border-red-500/30" : "border-red-200"} rounded-lg ${modoDark ? "text-red-400" : "text-red-500"} transition-all duration-300 text-xs font-medium`}
                            >
                              {t("filtros.limparFiltros")}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

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

                  {filtroCategoria && (
                    <button
                      onClick={() => aplicarFiltroCategoria(null)}
                      className={`px-4 py-3 ${modoDark ? "bg-red-500/10 hover:bg-red-500/20" : "bg-red-50 hover:bg-red-100"} border ${modoDark ? "border-red-500/30" : "border-red-200"} rounded-xl ${modoDark ? "text-red-400" : "text-red-500"} transition-all duration-300 flex items-center gap-2 text-sm`}
                    >
                      <FaTimes className="text-xs" />
                      {t("limpar")}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                <div className={`hidden lg:flex items-center gap-1 ${bgCard} border ${borderColor} rounded-xl p-1`}>
                  <button
                    onClick={() => alterarVisualizacao("cards")}
                    className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${tipoVisualizacao === "cards"
                      ? "bg-blue-500 text-white"
                      : `${bgHover} ${textPrimary}`
                      }`}
                    title={t("visualizacao.tooltipCards")}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                        <div className={`${tipoVisualizacao === "cards" ? "bg-white" : "bg-blue-500"} rounded-sm`}></div>
                        <div className={`${tipoVisualizacao === "cards" ? "bg-white" : "bg-blue-500"} rounded-sm`}></div>
                        <div className={`${tipoVisualizacao === "cards" ? "bg-white" : "bg-blue-500"} rounded-sm`}></div>
                        <div className={`${tipoVisualizacao === "cards" ? "bg-white" : "bg-blue-500"} rounded-sm`}></div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => alterarVisualizacao("lista")}
                    className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${tipoVisualizacao === "lista"
                      ? "bg-blue-500 text-white"
                      : `${bgHover} ${textPrimary}`
                      }`}
                    title={t("visualizacao.tooltipLista")}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="flex flex-col gap-0.5 w-3 h-3">
                        <div className={`${tipoVisualizacao === "lista" ? "bg-white" : "bg-blue-500"} rounded-sm h-1`}></div>
                        <div className={`${tipoVisualizacao === "lista" ? "bg-white" : "bg-blue-500"} rounded-sm h-1`}></div>
                        <div className={`${tipoVisualizacao === "lista" ? "bg-white" : "bg-blue-500"} rounded-sm h-1`}></div>
                      </div>
                    </div>
                  </button>
                </div>
                {podeCriar && empresaAtivada && (
                  <button
                    onClick={() => handleAcaoProtegida(abrirModalCriar)}
                    className="px-6 py-3 bg-gradient-to-r cursor-pointer from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white flex items-center gap-2 hover:scale-105 shadow-lg shadow-blue-500/25 text-sm"
                  >
                    <FaPlus className="text-sm" />
                    {t("novoFornecedor")}
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className={`${bgCard} rounded-xl p-4 animate-pulse border ${borderColor}`}>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded-xl h-32 mb-3`}></div>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-3 mb-2`}></div>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-3 w-2/3 mb-3`}></div>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-6 mb-2`}></div>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-2 mb-1`}></div>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-2 w-3/4`}></div>
                  </div>
                ))}
              </div>
            ) : fornecedoresOrdenados.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-24 h-24 mx-auto mb-4 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
                  <FaBuilding className={`text-2xl ${textMuted}`} />
                </div>
                <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{t("nenhumFornecedorEncontrado")}</h3>
                <p className={`${textMuted} mb-4 text-sm`}>{busca ? t("nenhumFornecedorEncontradoBusca") : t("comeceAdicionando")}</p>
                {podeCriar && empresaAtivada && (
                  <button
                    onClick={() => handleAcaoProtegida(abrirModalCriar)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white flex items-center gap-2 mx-auto hover:scale-105 text-sm"
                  >
                    <FaPlus />
                    {t("criarPrimeiroFornecedor")}
                  </button>
                )}
              </div>
            ) : (
              <>
                {tipoVisualizacao === "cards" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {fornecedoresAtuais.map((fornecedor, index) => (
                      <div
                        key={fornecedor.id}
                        className={`group ${modoDark
                          ? "bg-gradient-to-br from-blue-500/5 to-cyan-500/5"
                          : "bg-gradient-to-br from-blue-100/30 to-cyan-100/30"
                          } rounded-xl border ${modoDark
                            ? "border-blue-500/20 hover:border-blue-500/40"
                            : "border-blue-200 hover:border-blue-300"
                          } p-4 transition-all duration-500 card-hover backdrop-blur-sm`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="relative mb-3 overflow-hidden rounded-lg">
                          <div className="w-full h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg flex items-center justify-center">
                            <Image
                              src={fornecedor.foto || "/contadefault.png"}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-full border-2 border-white/20"
                              alt={fornecedor.nome}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/contadefault.png";
                              }}
                            />
                          </div>

                          <div className="absolute top-2 right-2 flex gap-1">
                            {fornecedor.Produto && fornecedor.Produto.length > 0 && (
                              <div className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${modoDark ? "bg-green-500/90 text-white" : "bg-green-100 text-green-800"}`}>
                                {fornecedor.Produto.length} {t("produtos")}
                              </div>
                            )}
                          </div>
                          <div className="absolute top-2 left-2 flex flex-col gap-1 xl:hidden">
                            <button
                              onClick={() => abrirModalVisualizar(fornecedor)}
                              className="cursor-pointer bg-blue-600/90 hover:bg-blue-700/90 text-white p-1.5 rounded transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center justify-center"
                            >
                              <FaEye className="text-xs" />
                            </button>
                            {podeEditar && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalEditar(fornecedor);
                                }}
                                className="cursor-pointer bg-green-600/90 hover:bg-green-700/90 text-white p-1.5 rounded transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center justify-center"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                            )}
                          </div>

                          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden xl:flex gap-1">
                            <button
                              onClick={() => abrirModalVisualizar(fornecedor)}
                              className="flex-1 cursor-pointer bg-blue-600/90 hover:bg-blue-700/90 text-white py-1 px-2 rounded text-xs transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-1"
                            >
                              <FaEye className="text-xs" />
                              {t("ver")}
                            </button>
                            {podeEditar && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalEditar(fornecedor);
                                }}
                                className="cursor-pointer bg-green-600/90 hover:bg-green-700/90 text-white p-1 rounded transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className={`font-bold ${textPrimary} mb-1 line-clamp-2 group-hover:text-blue-500 transition-colors text-sm leading-tight`}>{fornecedor.nome}</h3>

                        <div className="space-y-1 text-xs mb-3">
                          <div className="flex items-center gap-1 text-cyan-500">
                            <FaEnvelope className="text-xs" />
                            <span className="truncate">{fornecedor.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-500">
                            <FaIdCard className="text-xs" />
                            <span>{fornecedor.cnpj}</span>
                          </div>
                          <div className="flex items-center gap-1 text-orange-500">
                            <FaMapMarkerAlt className="text-xs" />
                            <span>{fornecedor.categoria || t("semCategoria")}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-blue-500/20">
                          <button
                            onClick={() => handleEntrarContato(fornecedor)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-xs font-semibold hover:scale-105"
                            style={{
                              background: modoDark ? "linear-gradient(135deg, #25D366, #128C7E)" : "linear-gradient(135deg, #25D366, #128C7E)",
                              color: "#FFFFFF",
                            }}
                          >
                            <FaWhatsapp size={12} />
                            {t("contato")}
                          </button>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${textMuted}`}>
                              {formatarData(fornecedor.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {fornecedoresAtuais.map((fornecedor) => (
                      <div
                        key={fornecedor.id}
                        className={`${modoDark
                          ? "bg-slate-800/50"
                          : "bg-gradient-to-br from-blue-100/30 to-cyan-100/30"
                          } rounded-xl border ${modoDark ? "border-blue-500/20" : "border-blue-200"
                          } p-4 transition-all duration-300 hover:shadow-lg backdrop-blur-sm`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-shrink-0">
                            <Image
                              src={fornecedor.foto || "/contadefault.png"}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg border-2 border-white/20"
                              alt={fornecedor.nome}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/contadefault.png";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                              <div>
                                <h3 className={`font-bold ${textPrimary} line-clamp-1 text-sm`}>{fornecedor.nome}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${modoDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
                                    {fornecedor.categoria || t("semCategoria")}
                                  </span>
                                  {fornecedor.Produto && fornecedor.Produto.length > 0 && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${modoDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-800"}`}>
                                      {fornecedor.Produto.length} {t("produtos")}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm" style={{ color: temaAtual.primario }}>
                                  {formatarData(fornecedor.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <FaEnvelope className={modoDark ? "text-cyan-400" : "text-cyan-500"} />
                                <span className={textPrimary}>{fornecedor.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaIdCard className={modoDark ? "text-green-400" : "text-green-500"} />
                                <span className={textPrimary}>{fornecedor.cnpj}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaPhoneAlt className={modoDark ? "text-orange-400" : "text-orange-500"} />
                                <span className={textPrimary}>{formatarTelefone(fornecedor.telefone)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[120px]">
                            <button
                              onClick={() => abrirModalVisualizar(fornecedor)}
                              className="px-3 py-2 rounded-lg cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs transition-all duration-300 flex items-center justify-center gap-1"
                            >
                              <FaEye className="text-xs" />
                              {t("ver")}
                            </button>

                            {podeEditar && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalEditar(fornecedor);
                                }}
                                className="px-3 py-2 rounded-lg cursor-pointer bg-green-600 hover:bg-green-700 text-white text-xs transition-all duration-300 flex items-center justify-center gap-1"
                              >
                                <FaEdit className="text-xs" />
                                {t("editar")}
                              </button>
                            )}

                            <button
                              onClick={() => handleEntrarContato(fornecedor)}
                              className="px-3 py-2 rounded-lg cursor-pointer bg-green-600 hover:bg-green-700 text-white text-xs transition-all duration-300 flex items-center justify-center gap-1"
                            >
                              <FaWhatsapp className="text-xs" />
                              {t("contato")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
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
            {(modalAberto || modalVisualizar) && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
                <div className={`${modoDark ? "bg-slate-800 border-blue-500/30 shadow-blue-500/20" : "bg-white border-blue-200 shadow-blue-200"} border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-sm`} onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className={`text-xl font-bold ${textPrimary}`}>
                        {modoModal === "visualizar" ? t("visualizarFornecedor") :
                          modoModal === "editar" ? t("editarFornecedor") :
                            t("novoFornecedor")}
                      </h2>
                      <button
                        onClick={fecharModal}
                        className={`p-2 cursor-pointer ${bgHover} rounded-lg transition-colors ${textMuted} hover:${textPrimary}`}
                      >
                        <FaTimes className="text-lg" />
                      </button>
                    </div>
                    {modoModal === "visualizar" ? (
                      <div className="space-y-4">
                        {form.foto && (
                          <div className="flex justify-center mb-4">
                            <Image
                              src={form.foto}
                              width={120}
                              height={120}
                              className="object-cover rounded-full border-2 border-blue-500/30"
                              alt={form.nome}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/contadefault.png";
                              }}
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("nome")}</label>
                            <div className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary}`}>
                              {form.nome || "-"}
                            </div>
                          </div>

                          <div>
                            <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("email")}</label>
                            <div className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary}`}>
                              {form.email || "-"}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("cnpj")}</label>
                              <div className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary}`}>
                                {form.cnpj || "-"}
                              </div>
                            </div>

                            <div>
                              <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("telefone")}</label>
                              <div className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary}`}>
                                {form.telefone ? formatarTelefone(form.telefone) : "-"}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("categoria")}</label>
                            <div className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary}`}>
                              {form.categoria || t("semCategoria")}
                            </div>
                          </div>
                          {form.Produto && form.Produto.length > 0 && (
                            <div>
                              <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>Produtos Vinculados</label>
                              <div className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary}`}>
                                {form.Produto.length} {t("produtos")}
                              </div>
                            </div>
                          )}
                          <div>
                            <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("adicionadoEm")}</label>
                            <div className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary}`}>
                              {formatarData(form.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>
                            {t("nome")} <span className="text-red-400">*</span>
                          </label>
                          <input
                            placeholder={t("nomePlaceholder")}
                            value={form.nome || ""}
                            onChange={handleNomeChange}
                            className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                            maxLength={60}
                          />
                          <div className={`text-right text-xs ${textMuted} mt-1`}>{nomeCaracteres}/60</div>
                        </div>

                        <div>
                          <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>
                            {t("email")} <span className="text-red-400">*</span>
                          </label>
                          <input
                            placeholder={t("emailPlaceholder")}
                            value={form.email || ""}
                            onChange={handleEmailChange}
                            className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                            maxLength={45}
                          />
                          <div className={`text-right text-xs ${textMuted} mt-1`}>{emailCaracteres}/45</div>
                        </div>

                        <div className="flex gap-2 w-full">
                          <div className="flex-1">
                            <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>
                              {t("cnpj")} <span className="text-red-400">*</span>
                            </label>
                            <input
                              placeholder={t("cnpjPlaceholder")}
                              value={form.cnpj || ""}
                              onChange={handleCnpjChange}
                              className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                              maxLength={18}
                            />
                            <div className={`text-right text-xs ${textMuted} mt-1`}>{cnpjCaracteres}/18</div>
                          </div>

                          <div className="flex-1">
                            <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>
                              {t("telefone")} <span className="text-red-400">*</span>
                            </label>
                            <input
                              placeholder={t("telefonePlaceholder")}
                              value={form.telefone || ""}
                              onChange={handleTelefoneChange}
                              className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                              maxLength={14}
                            />
                            <div className={`text-right text-xs ${textMuted} mt-1`}>{telefoneCaracteres}/14</div>
                          </div>
                        </div>

                        <div>
                          <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("categoria")}</label>
                          <input
                            placeholder={t("categoriaPlaceholder")}
                            value={form.categoria || ""}
                            onChange={handleCategoriaChange}
                            className={`w-full ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                            maxLength={20}
                          />
                          <div className={`text-right text-xs ${textMuted} mt-1`}>{categoriaCaracteres}/20</div>
                        </div>

                        <div className="mt-2">
                          <label className={`block ${textPrimary} mb-2 font-medium text-sm`}>{t("foto")}</label>
                          {(fotoPreview || form.foto) && (
                            <div className="flex justify-center mb-2">
                              <Image
                                src={fotoPreview || form.foto || ""}
                                width={80}
                                height={80}
                                className="object-cover rounded-full border-2 border-blue-500/30"
                                alt="Preview"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/contadefault.png";
                                }}
                              />
                            </div>
                          )}
                          <div className="flex flex-col justify-end">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className={`w-full px-3 py-3 cursor-pointer rounded border text-sm flex items-center justify-center gap-2 transition-all duration-300 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              style={{
                                backgroundColor: temaAtual.primario,
                                color: "#FFFFFF",
                                borderColor: temaAtual.primario,
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                              </svg>
                              {isUploading ? t("enviando") : t("selecionarImagem")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-blue-500/20">
                      <div>
                        {modoModal === "editar" && podeExcluir && (
                          <button
                            onClick={handleDelete}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer ${modoDark ? "bg-red-500/10 hover:bg-red-500/20" : "bg-red-50 hover:bg-red-100"} border ${modoDark ? "border-red-500/30" : "border-red-200"} ${modoDark ? "text-red-400" : "text-red-500"} rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-1 text-xs sm:text-sm`}
                          >
                            <FaTrash className="text-xs" />
                            {t("excluir")}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <button
                          onClick={fecharModal}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer ${bgCard} ${bgHover} border ${borderColor} ${textPrimary} rounded-xl transition-all duration-300 hover:scale-105 text-xs sm:text-sm min-w-[70px] sm:min-w-0`}
                        >
                          {modoModal === "visualizar" ? t("fechar") : t("cancelar")}
                        </button>
                        {modoModal === "criar" && podeCriar && (
                          <button
                            onClick={handleSubmit}
                            disabled={isUploading}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm min-w-[70px] sm:min-w-0"
                          >
                            {isUploading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {t("enviando")}
                              </>
                            ) : (
                              <>
                                <FaCheck className="text-xs" />
                                {t("salvar")}
                              </>
                            )}
                          </button>
                        )}

                        {modoModal === "editar" && podeEditar && (
                          <button
                            onClick={handleUpdate}
                            disabled={isUploading}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm min-w-[70px] sm:min-w-0"
                          >
                            {isUploading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {t("enviando")}
                              </>
                            ) : (
                              <>
                                <FaCheck className="text-xs" />
                                {t("atualizar")}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}