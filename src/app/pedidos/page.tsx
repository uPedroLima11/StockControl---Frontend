"use client";

import { PedidoI, StatusPedido } from "@/utils/types/pedidos";
import { FornecedorI } from "@/utils/types/fornecedor";
import { useEffect, useState, useRef, useCallback } from "react";
import { FaSearch, FaPlus, FaEnvelope, FaClock, FaCheck, FaTimes, FaEye, FaFilter, FaChevronDown, FaAngleLeft, FaAngleRight, FaShoppingCart, FaTruck, FaFileInvoice, FaEdit, FaPaperPlane } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import Image from "next/image";
import { CriarModal } from "../../components/CriarModal";
import { Produto, ItemPedidoCriacao } from "../../utils/types/index";

type CampoOrdenacao = "numero" | "dataCriacao" | "fornecedor" | "total" | "status" | "none";
type DirecaoOrdenacao = "asc" | "desc";

const cores = {
  dark: {
    fundo: "#0A1929",
    texto: "#FFFFFF",
    card: "#132F4C",
    borda: "#1E4976",
    primario: "#1976D2",
    secundario: "#00B4D8",
    placeholder: "#9CA3AF",
    hover: "#1E4976",
    ativo: "#1976D2",
    sucesso: "#10B981",
    erro: "#EF4444",
    alerta: "#F59E0B",
    gradiente: "linear-gradient(135deg, #0A1929 0%, #132F4C 50%, #1E4976 100%)"
  },
  light: {
    fundo: "#E0DCDC",
    texto: "#0F172A",
    card: "#FFFFFF",
    borda: "#E2E8F0",
    primario: "#1976D2",
    secundario: "#0284C7",
    placeholder: "#64748B",
    hover: "#F1F5F9",
    ativo: "#0284C7",
    sucesso: "#10B981",
    erro: "#EF4444",
    alerta: "#F59E0B",
    gradiente: "linear-gradient(135deg, #E0DCDC 0%, #E2E8F0 50%, #CBD5E1 100%)"
  },
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<PedidoI[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoI[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState<"criar" | "detalhes" | "enviarEmail">("criar");
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoI | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [modoDark, setModoDark] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const pedidosPorPagina = 10;
  const { t } = useTranslation("pedidos");
  const router = useRouter();
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [recarregarPedidos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    processando: 0,
    concluidos: 0,
    cancelados: 0,
  });

  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>("");
  const [itensCriacao, setItensCriacao] = useState<ItemPedidoCriacao[]>([]);
  const [observacoesCriacao, setObservacoesCriacao] = useState("");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [carregandoCriacao, setCarregandoCriacao] = useState(false);
  const [observacoesEmail, setObservacoesEmail] = useState("");
  const [quantidadesAtendidas, setQuantidadesAtendidas] = useState<Record<string, number>>({});
  const [produtoSelecionadoAutomatico, setProdutoSelecionadoAutomatico] = useState<number | null>(null);
  const [abrirModalAutomatico, setAbrirModalAutomatico] = useState(false);
  const [produtosCarregados, setProdutosCarregados] = useState(false);
  const [dadosUsuarioCarregados, setDadosUsuarioCarregados] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState<Record<string, boolean>>({});
  const [empresa, setEmpresa] = useState<{ id: string; nome: string; email: string; telefone?: string } | null>(null);

  const modalProcessadoRef = useRef(false);
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | "TODOS">("TODOS");
  const [menuFiltrosAberto, setMenuFiltrosAberto] = useState(false);
  const [campoOrdenacao, setCampoOrdenacao] = useState<CampoOrdenacao>("none");
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<DirecaoOrdenacao>("desc");

  const [modoVisualizacao, setModoVisualizacao] = useState(false);

  const menuFiltrosRef = useRef<HTMLDivElement>(null);
  const temaAtual = modoDark ? cores.dark : cores.light;


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
      return;
    }

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const produtoParam = urlParams.get("produto");
      const abrirModalParam = urlParams.get("abrirModal");

      if (produtoParam && abrirModalParam === "true") {
        const produtoId = parseInt(produtoParam);
        if (!isNaN(produtoId)) {
          setProdutoSelecionadoAutomatico(produtoId);
          setAbrirModalAutomatico(true);
          modalProcessadoRef.current = false;

          const url = new URL(window.location.href);
          url.searchParams.delete("produto");
          url.searchParams.delete("abrirModal");
          window.history.replaceState({}, "", url.toString());
        }
      }
    }

    const initialize = async () => {
      setLoading(true);
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
        carregarPermissoes();

        if (usuario.empresaId) {
          const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
          setEmpresaAtivada(ativada);

          if (ativada) {
            carregarPedidos(usuario.empresaId);
          }
        }

        const responseEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${usuario.empresaId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        if (responseEmpresa.ok) {
          const empresaData = await responseEmpresa.json();
          setEmpresa(empresaData);
        }

        setDadosUsuarioCarregados(true);
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
        background: linear-gradient(45deg, ${modoDark ? "#1976D2, #00B4D8, #132F4C" : "#1976D2, #0284C7, #E2E8F0"});
        padding: 1px;
        border-radius: 16px;
      }
      
      .gradient-border > div {
        background: ${modoDark ? "#132F4C" : "#FFFFFF"};
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
        background: ${modoDark ? "#132F4C" : "#F1F5F9"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb {
        background: ${modoDark ? "#1976D2" : "#94A3B8"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb:hover {
        background: ${modoDark ? "#1565C0" : "#64748B"};
      }
      
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      @media (max-width: 1000px) {
        .pedido-card {
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 12px;
        }
        
        .pedido-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .pedido-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .pedido-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .pedido-acoes {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          justify-content: flex-end;
        }
        
        .itens-container {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid;
        }
        
        .quantidade-info {
          font-size: 0.75rem;
        }
        
        .quantidade-recebida {
          font-size: 0.7rem;
        }
      }
    `;
    document.head.appendChild(style);

    initialize();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.head.removeChild(style);
    };
  }, [modoDark, recarregarPedidos]);

  useEffect(() => {
    if (dadosUsuarioCarregados && empresaId && !produtosCarregados) {
      carregarProdutos();
    }
  }, [dadosUsuarioCarregados, empresaId, produtosCarregados]);

  useEffect(() => {
    if (!abrirModalAutomatico || !produtoSelecionadoAutomatico || !dadosUsuarioCarregados || !produtosCarregados || modalProcessadoRef.current || modalAberto) {
      return;
    }

    modalProcessadoRef.current = true;

    setTimeout(() => {
      const produto = produtos.find((p) => p.id === produtoSelecionadoAutomatico);

      if (produto) {
        handleAbrirModalCriacaoComProduto(produto);
      } else {
        handleAbrirModalCriacao();
      }

      setAbrirModalAutomatico(false);
      setProdutoSelecionadoAutomatico(null);
    }, 2000);
  }, [abrirModalAutomatico, produtoSelecionadoAutomatico, dadosUsuarioCarregados, produtosCarregados, produtos, modalAberto]);

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
      return empresaData.ChaveAtivacao !== null && empresaData.ChaveAtivacao !== undefined;
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

  const carregarPedidos = async (empresaId: string) => {
    try {
      setLoading(true);
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;

      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/empresa/${empresaId}`, {
        method: "GET",
        headers: {
          "user-id": usuarioValor,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (response.ok) {
        const pedidosData = await response.json();
        const pedidosOrdenados = pedidosData.sort((a: PedidoI, b: PedidoI) =>
          new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime()
        );

        setPedidos(pedidosOrdenados);
        setPedidosFiltrados(pedidosOrdenados);

        const statsCalculadas = {
          total: pedidosData.length,
          pendentes: pedidosData.filter((p: PedidoI) => p.status === StatusPedido.PENDENTE).length,
          processando: pedidosData.filter((p: PedidoI) => p.status === StatusPedido.PROCESSANDO).length,
          concluidos: pedidosData.filter((p: PedidoI) => p.status === StatusPedido.CONCLUIDO).length,
          cancelados: pedidosData.filter((p: PedidoI) => p.status === StatusPedido.CANCELADO).length,
        };

        setStats(statsCalculadas);
      } else {
        console.error("Erro ao carregar pedidos:", response.status);
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarFornecedores = async () => {
    try {
      if (!empresaId) return;

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioId = usuarioSalvo.replace(/"/g, "");
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/empresa/${empresaId}`, {
        headers: {
          "user-id": usuarioId,
          authorization: `Bearer ${Cookies.get("token")}`,
        }
      });
      if (response.ok) {
        const fornecedoresData = await response.json();
        setFornecedores(fornecedoresData);
      }
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    }
  };

  const carregarProdutos = async () => {
    try {
      if (!empresaId || produtosCarregados) return;
      
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioId = usuarioSalvo.replace(/"/g, "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/empresa/${empresaId}`, {
        method: "GET",
        headers: {
          "user-id": usuarioId,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (response.ok) {
        const produtosData = await response.json();
        setProdutos(produtosData);
        setProdutosCarregados(true);
      } else {
        console.error("❌ Erro ao carregar produtos");
        setProdutosCarregados(true);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setProdutosCarregados(true);
    }
  };

  const filtrarPedidos = useCallback(() => {
    let filtrados = pedidos;

    if (filtroStatus !== "TODOS") {
      filtrados = filtrados.filter((pedido) => pedido.status === filtroStatus);
    }

    if (busca) {
      const termo = busca.toLowerCase();
      filtrados = filtrados.filter((pedido) =>
        pedido.numero.toLowerCase().includes(termo) ||
        pedido.fornecedor.nome.toLowerCase().includes(termo) ||
        pedido.itens.some((item) => item.produto.nome.toLowerCase().includes(termo))
      );
    }

    setPedidosFiltrados(filtrados);
  }, [busca, filtroStatus, pedidos]);

  useEffect(() => {
    filtrarPedidos();
    setPaginaAtual(1);
  }, [filtrarPedidos]);

  const getStatusInfo = (status: StatusPedido) => {
    switch (status) {
      case StatusPedido.PENDENTE:
        return {
          cor: modoDark ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-yellow-100 text-yellow-800 border-yellow-200",
          icone: <FaClock className="text-sm" />,
          texto: t("status.pendente")
        };
      case StatusPedido.PROCESSANDO:
        return {
          cor: modoDark ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-100 text-blue-800 border-blue-200",
          icone: <FaTruck className="text-sm" />,
          texto: t("status.processando")
        };
      case StatusPedido.CONCLUIDO:
        return {
          cor: modoDark ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-100 text-green-800 border-green-200",
          icone: <FaCheck className="text-sm" />,
          texto: t("status.concluido")
        };
      case StatusPedido.CANCELADO:
        return {
          cor: modoDark ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-100 text-red-800 border-red-200",
          icone: <FaTimes className="text-sm" />,
          texto: t("status.cancelado")
        };
      default:
        return {
          cor: modoDark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-100 text-gray-800 border-gray-200",
          icone: <FaClock className="text-sm" />,
          texto: status
        };
    }
  };

  const ordenarPedidos = (pedidos: PedidoI[], campo: CampoOrdenacao, direcao: DirecaoOrdenacao) => {
    if (campo === "none") return [...pedidos];

    return [...pedidos].sort((a, b) => {
      let valorA, valorB;

      switch (campo) {
        case "numero":
          valorA = a.numero.toLowerCase();
          valorB = b.numero.toLowerCase();
          break;
        case "dataCriacao":
          valorA = new Date(a.dataSolicitacao).getTime();
          valorB = new Date(b.dataSolicitacao).getTime();
          break;
        case "fornecedor":
          valorA = a.fornecedor.nome.toLowerCase();
          valorB = b.fornecedor.nome.toLowerCase();
          break;
        case "total":
          valorA = a.total;
          valorB = b.total;
          break;
        case "status":
          valorA = a.status;
          valorB = b.status;
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

  const aplicarFiltroStatus = (status: StatusPedido | "TODOS") => {
    setFiltroStatus(status);
    setPaginaAtual(1);
  };

  const aplicarOrdenacao = (campo: CampoOrdenacao) => {
    if (campo === campoOrdenacao) {
      setDirecaoOrdenacao(direcaoOrdenacao === "asc" ? "desc" : "asc");
    } else {
      setCampoOrdenacao(campo);
      setDirecaoOrdenacao("desc");
    }
  };

  const formatarData = (data: Date | string): string => {
    if (!data) return t("dataInvalida");

    try {
      const dataObj = typeof data === "string" ? new Date(data) : data;
      const dataAjustada = new Date(dataObj.getTime() + dataObj.getTimezoneOffset() * 60000);

      return dataAjustada.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error, data);
      return t("dataInvalida");
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleAbrirModalCriacaoComProduto = (produto: Produto) => {
    handleAcaoProtegida(() => {
      if (modalAberto) {
        setModalAberto(false);
        setTimeout(() => {
          abrirModalComProduto(produto);
        }, 300);
      } else {
        abrirModalComProduto(produto);
      }
    });
  };

  const abrirModalComProduto = (produto: Produto) => {
    setModalTipo("criar");
    setModalAberto(true);
    carregarFornecedores();

    setFornecedorSelecionado("");
    setObservacoesCriacao("");
    setBuscaProduto("");

    const itemExistente = itensCriacao.find((item) => item.produtoId === produto.id);

    if (!itemExistente) {
      setItensCriacao([
        {
          produtoId: produto.id,
          produto: produto,
          quantidade: 1,
          precoUnitario: produto.preco,
          observacao: ``,
        },
      ]);
    }

    setTimeout(() => {
      const buscaInput = document.querySelector('input[placeholder*="buscarProdutos"]') as HTMLInputElement;
      if (buscaInput) {
        buscaInput.focus();
      }
    }, 500);
  };

  const handleAbrirModalCriacao = () => {
    handleAcaoProtegida(() => {
      setModalTipo("criar");
      setModalAberto(true);
      carregarFornecedores();
      carregarProdutos();
      setFornecedorSelecionado("");
      setItensCriacao([]);
      setObservacoesCriacao("");
      setBuscaProduto("");
    });
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setItensCriacao([]);
    setModoVisualizacao(false);
  };

  const adicionarItem = (produto: Produto) => {
    const itemExistente = itensCriacao.find((item) => item.produtoId === produto.id);

    if (itemExistente) {
      setItensCriacao(itensCriacao.map((item) => (item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item)));
    } else {
      setItensCriacao([
        ...itensCriacao,
        {
          produtoId: produto.id,
          produto: produto,
          quantidade: 1,
          precoUnitario: produto.preco,
          observacao: "",
        },
      ]);
    }
  };

  const removerItem = (produtoId: number) => {
    setItensCriacao(itensCriacao.filter((item) => item.produtoId !== produtoId));
  };

  const atualizarQuantidade = (produtoId: number, quantidade: number) => {
    if (quantidade < 1) return;

    setItensCriacao(itensCriacao.map((item) => (item.produtoId === produtoId ? { ...item, quantidade } : item)));
  };

  const handleAbrirVisualizacao = (pedido: PedidoI) => {
    setPedidoSelecionado(pedido);
    setModalTipo("detalhes");
    setModalAberto(true);
    setModoVisualizacao(true);
  };

  const handleAbrirEdicao = (pedido: PedidoI) => {
    setPedidoSelecionado(pedido);
    setModalTipo("detalhes");
    setModalAberto(true);
    setModoVisualizacao(false);
  };


  const atualizarObservacao = (produtoId: number, observacao: string) => {
    setItensCriacao(itensCriacao.map((item) => (item.produtoId === produtoId ? { ...item, observacao } : item)));
  };

  const calcularTotal = () => {
    return itensCriacao.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0);
  };

  const handleCriarPedido = async () => {
    handleAcaoProtegida(async () => {
      if (!fornecedorSelecionado) {
        Swal.fire({
          icon: "error",
          title: t("erroFornecedorNaoSelecionado"),
        });
        return;
      }

      if (itensCriacao.length === 0) {
        Swal.fire({
          icon: "error",
          title: t("erroNenhumItem"),
        });
        return;
      }

      setCarregandoCriacao(true);

      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) return;

        const usuarioValor = usuarioSalvo.replace(/"/g, "");

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": usuarioValor,
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({
            fornecedorId: fornecedorSelecionado,
            itens: itensCriacao.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              observacao: item.observacao,
            })),
            observacoes: observacoesCriacao,
            empresaId: empresaId,
          }),
        });

        if (response.ok) {
          const pedidoCriado = await response.json();

          const fornecedor = fornecedores.find((f) => f.id === fornecedorSelecionado);
          if (fornecedor) {
            await handleEnviarEmail(
              {
                ...pedidoCriado.pedido,
                fornecedor: {
                  id: fornecedor.id,
                  nome: fornecedor.nome,
                  email: fornecedor.email,
                },
                itens: itensCriacao.map((item) => ({
                  id: `temp-${item.produtoId}`,
                  produtoId: item.produtoId,
                  produto: {
                    nome: item.produto.nome,
                    foto: item.produto.foto,
                  },
                  quantidadeSolicitada: item.quantidade,
                  quantidadeAtendida: 0,
                  precoUnitario: item.precoUnitario,
                  observacao: item.observacao,
                })),
                usuario: {
                  nome: "Usuário atual",
                },
                dataSolicitacao: new Date().toISOString(),
                observacoes: observacoesCriacao,
              } as PedidoI,
              observacoesCriacao
            );
          }

          Swal.fire({
            icon: "success",
            title: t("pedidoCriadoSucesso"),
            timer: 1500,
          });

          setModalAberto(false);
          carregarPedidos(empresaId!);
        } else {
          throw new Error("Erro ao criar pedido");
        }
      } catch (error) {
        console.error("Erro ao criar pedido:", error);
        Swal.fire({
          icon: "error",
          title: t("erroCriarPedido"),
        });
      } finally {
        setCarregandoCriacao(false);
      }
    });
  };

  const handleEnviarEmail = async (pedido: PedidoI, observacoesPersonalizadas?: string) => {
    handleAcaoProtegida(async () => {
      setEnviandoEmail((prev) => ({ ...prev, [pedido.id]: true }));

      try {
        const dataFormatada = formatarData(pedido.dataSolicitacao);

        const emailData = {
          action: "enviar_email_pedido",
          remetente_nome: empresa?.nome || "Sua Empresa",
          remetente_email: empresa?.email || "empresa@email.com",
          empresa_nome: empresa?.nome || "Nome da Empresa",
          empresa_telefone: empresa?.telefone || "(00) 00000-0000",
          empresa_id: empresaId,

          destinatario: pedido.fornecedor.email,
          fornecedor_nome: pedido.fornecedor.nome,

          pedido_id: pedido.id,
          pedido_numero: pedido.numero,
          assunto: `Pedido ${pedido.numero} - ${empresa?.nome || "Nome da Empresa"}`,
          total: pedido.total,
          data: dataFormatada,
          observacoes: observacoesPersonalizadas || pedido.observacoes || "Nenhuma",

          itens: pedido.itens.map((item) => ({
            produto: item.produto.nome,
            quantidade: item.quantidadeSolicitada,
            preco_unitario: item.precoUnitario,
            total_item: item.quantidadeSolicitada * item.precoUnitario,
            observacao: item.observacao || "",
          })),
        };
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/email-pedidos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Erro ao enviar email");
        }

        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/${pedido.id}/registrar-email`, {
            method: "POST",
            headers: {
              "user-id": localStorage.getItem("client_key")?.replace(/"/g, "") || "",
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          });
        } catch (error) {
          console.warn("Erro ao registrar email no log:", error);
        }

        Swal.fire({
          icon: "success",
          title: t("emailEnviadoSucesso"),
          html: t("emailEnviadoPara", { email: pedido.fornecedor.email }),
          timer: 3000,
        });
      } catch (error) {
        console.error("Erro ao enviar email:", error);
        Swal.fire({
          icon: "error",
          title: t("erroEnviarEmail"),
          text: error instanceof Error ? error.message : "Erro ao enviar email",
        });
      } finally {
        setEnviandoEmail((prev) => ({ ...prev, [pedido.id]: false }));
      }
    });
  };

  const handleAbrirModalEmail = (pedido: PedidoI) => {
    handleAcaoProtegida(() => {
      setPedidoSelecionado(pedido);
      setObservacoesEmail(pedido.observacoes || "");
      setModalTipo("enviarEmail");
      setModalAberto(true);
    });
  };

  const handleEnviarEmailComObservacoes = async () => {
    if (!pedidoSelecionado) return;
    await handleEnviarEmail(pedidoSelecionado, observacoesEmail);
    setModalAberto(false);
  };



  const handleConfirmarCancelamento = (pedidoId: string) => {
    Swal.fire({
      title: t("confirmarCancelamento.titulo") || "Confirmar Cancelamento",
      text: t("confirmarCancelamento.mensagem") || "Deseja confirmar o cancelamento do pedido?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("confirmarCancelamento.sim") || "Sim, cancelar",
      cancelButtonText: t("confirmarCancelamento.nao") || "Não",
      background: modoDark ? temaAtual.card : "#FFFFFF",
      color: modoDark ? temaAtual.texto : temaAtual.texto,
    }).then((result) => {
      if (result.isConfirmed) {
        handleAtualizarStatus(pedidoId, StatusPedido.CANCELADO);
      }
    });
  };

  const handleAtualizarStatus = async (pedidoId: string, novoStatus: string) => {
    handleAcaoProtegida(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/${pedidoId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "user-id": localStorage.getItem("client_key")?.replace(/"/g, "") || "",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({ status: novoStatus }),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: t("statusAtualizadoSucesso"),
            timer: 1500,
          });
          carregarPedidos(empresaId!);
        }
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        Swal.fire({
          icon: "error",
          title: t("erroAtualizarStatus"),
        });
      }
    });
  };

  const handleAtualizarQuantidades = async () => {
    if (!pedidoSelecionado) return;

    handleAcaoProtegida(async () => {
      try {
        const itensParaAtualizar = Object.entries(quantidadesAtendidas).map(([itemId, quantidade]) => ({
          itemId,
          quantidadeAtendida: quantidade,
        }));

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/${pedidoSelecionado.id}/itens`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "user-id": localStorage.getItem("client_key")?.replace(/"/g, "") || "",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({ itens: itensParaAtualizar }),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: t("quantidadesAtualizadasSucesso"),
            timer: 1500,
          });
          setQuantidadesAtendidas({});
          carregarPedidos(empresaId!);
        }
      } catch (error) {
        console.error("Erro ao atualizar quantidades:", error);
        Swal.fire({
          icon: "error",
          title: t("erroAtualizarQuantidades"),
        });
      }
    });
  };

  const handlePreencherQuantidadesSolicitadas = () => {
    if (!pedidoSelecionado) return;

    const novasQuantidades: Record<string, number> = {};
    pedidoSelecionado.itens.forEach((item) => {
      novasQuantidades[item.id] = item.quantidadeSolicitada;
    });

    setQuantidadesAtendidas(novasQuantidades);

    Swal.fire({
      icon: "success",
      title: t("quantidadesPreenchidas"),
      text: t("quantidadesPreenchidasTexto"),
      timer: 1500,
    });
  };

  const handleConcluirPedidoComEstoque = async (pedidoId: string) => {
    handleAcaoProtegida(async () => {
      try {
        const usuarioId = localStorage.getItem("client_key")?.replace(/"/g, "") || "";

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/${pedidoId}/concluir-com-estoque`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": usuarioId,
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({
            quantidadesRecebidas: quantidadesAtendidas,
          }),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: t("pedidoConcluidoComEstoque"),
            text: t("estoqueAtualizadoSucesso"),
            timer: 2000,
          });
          setQuantidadesAtendidas({});
          carregarPedidos(empresaId!);
          setModalAberto(false);
        } else {
          throw new Error("Erro ao concluir pedido com estoque");
        }
      } catch (error) {
        console.error("Erro ao concluir pedido com estoque:", error);
        Swal.fire({
          icon: "error",
          title: t("erroConcluirPedidoEstoque"),
        });
      }
    });
  };

  const pedidosOrdenados = ordenarPedidos(pedidosFiltrados, campoOrdenacao, direcaoOrdenacao);

  const indexUltimoPedido = paginaAtual * pedidosPorPagina;
  const indexPrimeiroPedido = indexUltimoPedido - pedidosPorPagina;
  const pedidosAtuais = pedidosOrdenados.slice(indexPrimeiroPedido, indexUltimoPedido);
  const totalPaginas = Math.ceil(pedidosOrdenados.length / pedidosPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  const podeVisualizar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_visualizar;
  const podeCriar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_criar;
  const podeEditar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_editar;
  const podeGerenciarStatus = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_gerenciar_status;

  if (!podeVisualizar) {
    return (
      <div className={`min-h-screen ${modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"} flex items-center justify-center px-4`}>
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-6 ${modoDark ? "bg-red-500/20" : "bg-red-100"} rounded-full flex items-center justify-center`}>
            <FaTimes className={`text-3xl ${modoDark ? "text-red-400" : "text-red-500"}`} />
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
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const bgInput = modoDark ? "bg-slate-700/50" : "bg-white";
  const bgStats = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";
  const bgSelected = modoDark ? "bg-blue-500/20" : "bg-blue-100";

  const renderPedidosCards = () => {
    return pedidosAtuais.map((pedido, index) => {
      const statusInfo = getStatusInfo(pedido.status);
      return (
        <div
          key={pedido.id}
          className={`pedido-card ${bgCard} rounded-xl border ${borderColor} transition-all duration-500 card-hover backdrop-blur-sm glow-effect`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="pedido-grid">
            <div className="pedido-header">
              <div>
                <div className={`font-bold ${textPrimary} text-base`}>{pedido.numero}</div>
                <div className={`text-sm ${textMuted} mt-1`}>{pedido.itens.length} {t("itens")}</div>
              </div>
              <div className={`status-badge border ${statusInfo.cor} inline-flex items-center gap-1 text-xs px-2 py-1`}>
                {statusInfo.icone}
                {statusInfo.texto}
              </div>
            </div>

            <div className="pedido-info">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${modoDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                  <FaTruck className={`text-sm ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                </div>
                <div>
                  <div className={`font-medium ${textPrimary} text-sm`}>{pedido.fornecedor.nome}</div>
                  <div className={`text-xs ${textMuted} line-clamp-1`}>{pedido.fornecedor.email}</div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className={`${textPrimary} text-sm`}>{formatarData(pedido.dataSolicitacao)}</div>
                <div className={`font-bold text-cyan-500 text-sm`}>{formatarMoeda(pedido.total)}</div>
              </div>
            </div>

            <div className="itens-container border-t border-blue-500/20 pt-3">
              <div className="flex flex-wrap gap-2">
                {pedido.itens.slice(0, 3).map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`px-2 py-1 rounded-full text-xs border ${modoDark ? "bg-slate-700/50 border-slate-600 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                  >
                    {item.produto.nome} ({item.quantidadeSolicitada})
                  </div>
                ))}
                {pedido.itens.length > 3 && (
                  <div className={`px-2 py-1 rounded-full text-xs border ${modoDark ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-blue-100 border-blue-200 text-blue-700"
                    }`}>
                    +{pedido.itens.length - 3} {t("mais")}
                  </div>
                )}
              </div>
            </div>

            <div className="pedido-acoes">
              <button
                onClick={() => handleAbrirVisualizacao(pedido)}
                className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${bgHover} ${textPrimary} hover:scale-110`}
                title={t("visualizar")}
              >
                <FaEye className="text-sm" />
              </button>

              {pedido.status !== StatusPedido.CONCLUIDO && pedido.status !== StatusPedido.CANCELADO && podeEditar && (
                <>
                  <button
                    onClick={() => handleAbrirEdicao(pedido)}
                    className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${bgHover} ${textPrimary} hover:scale-110`}
                    title={t("editar")}
                  >
                    <FaEdit className="text-sm" />
                  </button>

                  <button
                    onClick={() => handleAbrirModalEmail(pedido)}
                    className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${bgHover} ${textPrimary} hover:scale-110`}
                    title={t("enviarEmail")}
                  >
                    <FaEnvelope className="text-sm" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const renderPedidosTabela = () => {
    return (
      <div className="space-y-4 mb-6">
        <div className={`hidden lg:grid grid-cols-12 gap-4 px-6 py-3 ${bgCard} rounded-xl border ${borderColor} backdrop-blur-sm`}>
          <div className="col-span-2">
            <button
              onClick={() => aplicarOrdenacao("numero")}
              className={`flex items-center gap-1 ${textPrimary} text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {t("numero")}
              {campoOrdenacao === "numero" && (
                <span className="text-xs">
                  {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          </div>
          <div className="col-span-3">
            <button
              onClick={() => aplicarOrdenacao("fornecedor")}
              className={`flex items-center gap-1 ${textPrimary} text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {t("fornecedor")}
              {campoOrdenacao === "fornecedor" && (
                <span className="text-xs">
                  {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => aplicarOrdenacao("dataCriacao")}
              className={`flex items-center gap-1 ${textPrimary} text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {t("data")}
              {campoOrdenacao === "dataCriacao" && (
                <span className="text-xs">
                  {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => aplicarOrdenacao("total")}
              className={`flex items-center gap-1 ${textPrimary} text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {t("total")}
              {campoOrdenacao === "total" && (
                <span className="text-xs">
                  {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => aplicarOrdenacao("status")}
              className={`flex items-center gap-1 ${textPrimary} text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {t("labelStatus")}
              {campoOrdenacao === "status" && (
                <span className="text-xs">
                  {direcaoOrdenacao === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          </div>
          <div className="col-span-1 text-right">
            <span className={`${textPrimary} text-sm font-medium`}>{t("acoes")}</span>
          </div>
        </div>

        {pedidosAtuais.map((pedido, index) => {
          const statusInfo = getStatusInfo(pedido.status);
          return (
            <div
              key={pedido.id}
              className={`hidden lg:block group ${bgCard} rounded-xl border ${borderColor} p-6 transition-all duration-500 card-hover backdrop-blur-sm glow-effect`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <div className={`font-bold ${textPrimary} text-sm`}>{pedido.numero}</div>
                  <div className={`text-xs ${textMuted}`}>{pedido.itens.length} {t("itens")}</div>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${modoDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                      <FaTruck className={`text-sm ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                    </div>
                    <div>
                      <div className={`font-medium ${textPrimary} text-sm`}>{pedido.fornecedor.nome}</div>
                      <div className={`text-xs ${textMuted} line-clamp-1`}>{pedido.fornecedor.email}</div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className={`${textPrimary} text-sm`}>{formatarData(pedido.dataSolicitacao)}</div>
                </div>

                <div className="col-span-2">
                  <div className={`font-bold text-cyan-500 text-sm`}>{formatarMoeda(pedido.total)}</div>
                </div>

                <div className="col-span-2">
                  <div className={`status-badge border ${statusInfo.cor} inline-flex items-center gap-1`}>
                    {statusInfo.icone}
                    {statusInfo.texto}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleAbrirVisualizacao(pedido)}
                      className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${bgHover} ${textPrimary} hover:scale-110`}
                      title={t("visualizar")}
                    >
                      <FaEye className="text-sm" />
                    </button>

                    {pedido.status !== StatusPedido.CONCLUIDO && pedido.status !== StatusPedido.CANCELADO && podeEditar && (
                      <>
                        <button
                          onClick={() => handleAbrirEdicao(pedido)}
                          className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${bgHover} ${textPrimary} hover:scale-110`}
                          title={t("editar")}
                        >
                          <FaEdit className="text-sm" />
                        </button>

                        <button
                          onClick={() => handleAbrirModalEmail(pedido)}
                          className={`p-2 cursor-pointer rounded-lg transition-all duration-300 ${bgHover} ${textPrimary} hover:scale-110`}
                          title={t("enviarEmail")}
                        >
                          <FaEnvelope className="text-sm" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-wrap gap-2">
                  {pedido.itens.slice(0, 4).map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`px-3 py-1 rounded-full text-xs border ${modoDark ? "bg-slate-700/50 border-slate-600 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                    >
                      {item.produto.nome} ({item.quantidadeSolicitada})
                    </div>
                  ))}
                  {pedido.itens.length > 4 && (
                    <div className={`px-3 py-1 rounded-full text-xs border ${modoDark ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-blue-100 border-blue-200 text-blue-700"
                      }`}>
                      +{pedido.itens.length - 4} {t("mais")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
                  {t("titulo")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("pedidos")}</span>
                </h1>
                <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>{t("subtitulo")}</p>
              </div>
            </section>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[
                {
                  label: t("stats.total"),
                  value: stats.total,
                  icon: FaFileInvoice,
                  color: "from-blue-500 to-cyan-500",
                  bgColor: modoDark ? "bg-blue-500/10" : "bg-blue-50",
                },
                {
                  label: t("stats.pendentes"),
                  value: stats.pendentes,
                  icon: FaClock,
                  color: "from-yellow-500 to-amber-500",
                  bgColor: modoDark ? "bg-yellow-500/10" : "bg-yellow-50",
                },
                {
                  label: t("stats.processando"),
                  value: stats.processando,
                  icon: FaTruck,
                  color: "from-blue-500 to-indigo-500",
                  bgColor: modoDark ? "bg-blue-500/10" : "bg-blue-50",
                },
                {
                  label: t("stats.concluidos"),
                  value: stats.concluidos,
                  icon: FaCheck,
                  color: "from-green-500 to-emerald-500",
                  bgColor: modoDark ? "bg-green-500/10" : "bg-green-50",
                },
                {
                  label: t("stats.cancelados"),
                  value: stats.cancelados,
                  icon: FaTimes,
                  color: "from-red-500 to-orange-500",
                  bgColor: modoDark ? "bg-red-500/10" : "bg-red-50",
                },
              ].map((stat, index) => (
                <div key={index} className="gradient-border animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`p-4 rounded-[15px] ${bgStats} backdrop-blur-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>{stat.value}</div>
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
            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <div className="relative flex-1 max-w-md">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                  <div className={`relative flex items-center ${bgCard} rounded-xl px-4 py-3 border ${borderColor} backdrop-blur-sm`}>
                    <FaSearch className={`${modoDark ? "text-blue-400" : "text-blue-500"} mr-3 text-sm`} />
                    <input
                      type="text"
                      placeholder={t("buscarPedidos")}
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
                    <button
                      onClick={() => setMenuFiltrosAberto(!menuFiltrosAberto)}
                      className={`flex items-center gap-3 ${bgCard} ${bgHover} border cursor-pointer ${borderColor} rounded-xl px-4 py-3 transition-all duration-300 backdrop-blur-sm`}
                    >
                      <FaFilter className={modoDark ? "text-blue-400" : "text-blue-500"} />
                      <span className={`${textPrimary} text-sm`}>
                        {filtroStatus === "TODOS" ? t("todosStatus") : t(`status.${filtroStatus.toLowerCase()}`)}
                      </span>
                      <FaChevronDown className={`${modoDark ? "text-blue-400" : "text-blue-500"} transition-transform duration-300 text-xs ${menuFiltrosAberto ? "rotate-180" : ""}`} />
                    </button>

                    {menuFiltrosAberto && (
                      <div className={`absolute top-full left-0 mt-2 w-48 ${modoDark ? "bg-slate-800/95" : "bg-white/95"} border ${borderColor} rounded-xl shadow-2xl ${modoDark ? "shadow-blue-500/20" : "shadow-blue-200"} z-50 overflow-hidden backdrop-blur-sm`}>
                        <div className="p-2">
                          {["TODOS", StatusPedido.PENDENTE, StatusPedido.PROCESSANDO, StatusPedido.CONCLUIDO, StatusPedido.CANCELADO].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                aplicarFiltroStatus(status as StatusPedido | "TODOS");
                                setMenuFiltrosAberto(false);
                              }}
                              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${bgHover} text-sm ${filtroStatus === status ? `${bgSelected} font-medium` : ""
                                }`}
                            >
                              <span className={textPrimary}>
                                {status === "TODOS" ? t("todosStatus") : t(`status.${status.toLowerCase()}`)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {totalPaginas > 1 && (
                    <div className={`flex items-center gap-1 ${bgCard} border ${borderColor} rounded-xl px-3 py-2`}>
                      <button
                        onClick={() => mudarPagina(paginaAtual - 1)}
                        disabled={paginaAtual === 1}
                        className={`p-1 cursor-pointer rounded-lg transition-all duration-300 ${paginaAtual === 1 ? `${textMuted} cursor-not-allowed` : `${textPrimary} ${bgHover} hover:scale-105`
                          }`}
                      >
                        <FaAngleLeft className="text-sm" />
                      </button>

                      <span className={`${textPrimary} text-sm mx-2`}>
                        {paginaAtual}/{totalPaginas}
                      </span>

                      <button
                        onClick={() => mudarPagina(paginaAtual + 1)}
                        disabled={paginaAtual === totalPaginas}
                        className={`p-1 cursor-pointer rounded-lg transition-all duration-300 ${paginaAtual === totalPaginas ? `${textMuted} cursor-not-allowed` : `${textPrimary} ${bgHover} hover:scale-105`
                          }`}
                      >
                        <FaAngleRight className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                {podeCriar && empresaAtivada && (
                  <button
                    onClick={handleAbrirModalCriacao}
                    className="px-6 py-3 bg-gradient-to-r cursor-pointer from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white flex items-center gap-2 hover:scale-105 shadow-lg shadow-blue-500/25 text-sm"
                  >
                    <FaPlus className="text-sm" />
                    {t("novoPedido")}
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className={`${bgCard} rounded-xl p-6 animate-pulse border ${borderColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-4 w-1/4`}></div>
                        <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-3 w-1/3`}></div>
                      </div>
                      <div className="space-y-2">
                        <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-6 w-20`}></div>
                        <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-4 w-16`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pedidosOrdenados.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-24 h-24 mx-auto mb-4 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
                  <FaShoppingCart className={`text-2xl ${textMuted}`} />
                </div>
                <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{t("nenhumPedidoEncontrado")}</h3>
                <p className={`${textMuted} mb-4 text-sm`}>{t("comeceAdicionando")}</p>
                {podeCriar && empresaAtivada && (
                  <button
                    onClick={handleAbrirModalCriacao}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white flex items-center gap-2 mx-auto hover:scale-105 text-sm"
                  >
                    <FaPlus />
                    {t("criarPrimeiroPedido")}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="lg:hidden space-y-4 mb-6">
                  {renderPedidosCards()}
                </div>
                {renderPedidosTabela()}
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
                    const mostrarPagina =
                      pagina === 1 ||
                      pagina === totalPaginas ||
                      (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1);

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
      {modalAberto && modalTipo === "detalhes" && pedidoSelecionado && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className={`${modoDark ? "bg-slate-800 border-blue-500/30 shadow-blue-500/20" : "bg-white border-blue-200 shadow-blue-200"} border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${textPrimary}`}>
                  {modoVisualizacao ? t("visualizarPedido") : t("detalhesPedido")} - {pedidoSelecionado.numero}
                </h2>
                <button
                  onClick={() => setModalAberto(false)}
                  className={`p-2 cursor-pointer ${bgHover} rounded-lg transition-colors ${textMuted} hover:${textPrimary}`}
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className={`font-semibold ${textPrimary} mb-3`}>{t("informacoesPedido")}</h3>
                  <div className={`space-y-2 text-sm ${textSecondary}`}>
                    <div className="flex justify-between">
                      <span>{t("fornecedor")}:</span>
                      <span className={textPrimary}>{pedidoSelecionado.fornecedor.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("emailFornecedor")}:</span>
                      <span className={textPrimary}>{pedidoSelecionado.fornecedor.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("labelStatus")}:</span>
                      <span className={textPrimary}>{t(`status.${pedidoSelecionado.status.toLowerCase()}`)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("dataSolicitacao")}:</span>
                      <span className={textPrimary}>{formatarData(pedidoSelecionado.dataSolicitacao)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("total")}:</span>
                      <span className="font-bold text-cyan-500">{formatarMoeda(pedidoSelecionado.total)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`font-semibold ${textPrimary} mb-3`}>{t("labelStatus")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {!modoVisualizacao && podeGerenciarStatus && pedidoSelecionado.status !== StatusPedido.CONCLUIDO && pedidoSelecionado.status !== StatusPedido.CANCELADO && (
                      <>
                        {[StatusPedido.PENDENTE, StatusPedido.PROCESSANDO, StatusPedido.CONCLUIDO, StatusPedido.CANCELADO].map((status) => {
                          const statusInfo = getStatusInfo(status);
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                if (status === StatusPedido.CANCELADO) {
                                  handleConfirmarCancelamento(pedidoSelecionado.id);
                                } else {
                                  handleAtualizarStatus(pedidoSelecionado.id, status);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer hover:scale-105 ${pedidoSelecionado.status === status
                                ? "ring-2 ring-blue-500"
                                : ""
                                } ${statusInfo.cor}`}
                            >
                              {t(`status.${status.toLowerCase()}`)}
                            </button>
                          );
                        })}
                      </>
                    )}
                    {(modoVisualizacao || !podeGerenciarStatus) && (
                      <div className={`status-badge border ${getStatusInfo(pedidoSelecionado.status).cor}`}>
                        {getStatusInfo(pedidoSelecionado.status).icone}
                        {getStatusInfo(pedidoSelecionado.status).texto}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {pedidoSelecionado.itens.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${borderColor} ${bgCard} backdrop-blur-sm`}
                  >
                    <div className="block lg:hidden">
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <Image
                              src={item.produto.foto || "/out.jpg"}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg"
                              alt={item.produto.nome}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/out.jpg";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium ${textPrimary} text-sm leading-tight mb-1`}>
                              {item.produto.nome}
                            </h4>
                            <div className={`text-xs ${textMuted} space-y-0.5`}>
                              <div>{t("quantidade")}: {item.quantidadeSolicitada}</div>
                              <div>{t("precoUnitario")}: {formatarMoeda(item.precoUnitario)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className={`text-center p-2 rounded-lg ${modoDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                            <div className="font-semibold text-[10px] mb-1">{t("solicitado")}</div>
                            <div className="text-sm font-bold">{item.quantidadeSolicitada}</div>
                          </div>
                          <div className={`text-center p-2 rounded-lg ${modoDark ? "bg-green-500/20" : "bg-green-100"}`}>
                            <div className="font-semibold text-[10px] mb-1">{t("atendido")}</div>
                            <div className="text-sm font-bold">{item.quantidadeAtendida}</div>
                          </div>
                          <div className={`text-center p-2 rounded-lg ${modoDark ? "bg-yellow-500/20" : "bg-yellow-100"}`}>
                            <div className="font-semibold text-[10px] mb-1">{t("pendente")}</div>
                            <div className="text-sm font-bold">{item.quantidadeSolicitada - item.quantidadeAtendida}</div>
                          </div>
                        </div>

                        {!modoVisualizacao && podeEditar && pedidoSelecionado.status !== StatusPedido.CONCLUIDO && pedidoSelecionado.status !== StatusPedido.CANCELADO && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <label className={`text-xs font-medium ${textPrimary}`}>
                                {t("quantidadeRecebida")}
                              </label>
                              <button
                                onClick={() =>
                                  setQuantidadesAtendidas({
                                    ...quantidadesAtendidas,
                                    [item.id]: item.quantidadeSolicitada,
                                  })
                                }
                                className="text-xs cursor-pointer text-blue-500 hover:text-blue-700 font-medium"
                              >
                                {t("preencherSolicitado")}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={item.quantidadeSolicitada}
                                value={quantidadesAtendidas[item.id] || ""}
                                onChange={(e) =>
                                  setQuantidadesAtendidas({
                                    ...quantidadesAtendidas,
                                    [item.id]: parseInt(e.target.value) || 0,
                                  })
                                }
                                className={`p-1.5 border rounded text-sm ${bgInput} ${textPrimary} w-16 sm:w-20 lg:w-32`}
                                style={{ borderColor: temaAtual.borda }}
                              />
                              <span className={`text-xs ${textMuted} whitespace-nowrap`}>
                                / {item.quantidadeSolicitada}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                          <div className={`text-xs ${textMuted}`}>
                            {item.quantidadeSolicitada} × {formatarMoeda(item.precoUnitario)}
                          </div>
                          <div className={`font-bold text-cyan-500 text-sm`}>
                            {formatarMoeda(item.quantidadeSolicitada * item.precoUnitario)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={item.produto.foto || "/out.jpg"}
                          width={60}
                          height={60}
                          className="w-15 h-15 object-cover rounded-lg"
                          alt={item.produto.nome}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/out.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${textPrimary} text-sm`}>{item.produto.nome}</h4>
                        <div className={`text-xs ${textMuted} mt-1`}>
                          {t("quantidade")}: {item.quantidadeSolicitada} • {t("precoUnitario")}: {formatarMoeda(item.precoUnitario)}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                          <div className={`text-center p-1 rounded ${modoDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                            <div className="font-semibold text-[10px]">{t("solicitado")}</div>
                            <div className="quantidade-info">{item.quantidadeSolicitada}</div>
                          </div>
                          <div className={`text-center p-1 rounded ${modoDark ? "bg-green-500/20" : "bg-green-100"}`}>
                            <div className="font-semibold text-[10px]">{t("atendido")}</div>
                            <div className="quantidade-info">{item.quantidadeAtendida}</div>
                          </div>
                          <div className={`text-center p-1 rounded ${modoDark ? "bg-yellow-500/20" : "bg-yellow-100"}`}>
                            <div className="font-semibold text-[10px]">{t("pendente")}</div>
                            <div className="quantidade-info">{item.quantidadeSolicitada - item.quantidadeAtendida}</div>
                          </div>
                        </div>

                        {!modoVisualizacao && podeEditar && pedidoSelecionado.status !== StatusPedido.CONCLUIDO && pedidoSelecionado.status !== StatusPedido.CANCELADO && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className={`text-xs font-medium ${textPrimary}`}>
                                {t("quantidadeRecebida")}
                              </label>
                              <button
                                onClick={() =>
                                  setQuantidadesAtendidas({
                                    ...quantidadesAtendidas,
                                    [item.id]: item.quantidadeSolicitada,
                                  })
                                }
                                className="text-xs cursor-pointer text-blue-500 hover:text-blue-700 font-medium"
                              >
                                {t("preencherSolicitado")}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={item.quantidadeSolicitada}
                                value={quantidadesAtendidas[item.id] || ""}
                                onChange={(e) =>
                                  setQuantidadesAtendidas({
                                    ...quantidadesAtendidas,
                                    [item.id]: parseInt(e.target.value) || 0,
                                  })
                                }
                                className={`p-1.5 border rounded text-sm ${bgInput} ${textPrimary} w-20 lg:w-32`}
                                style={{ borderColor: temaAtual.borda }}
                              />
                              <span className={`text-xs ${textMuted} whitespace-nowrap`}>
                                / {item.quantidadeSolicitada}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-cyan-500 text-sm`}>
                          {formatarMoeda(item.quantidadeSolicitada * item.precoUnitario)}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          {item.quantidadeSolicitada} × {formatarMoeda(item.precoUnitario)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pedidoSelecionado.observacoes && (
                <div className="mt-6">
                  <h3 className={`font-semibold ${textPrimary} mb-3`}>{t("observacoes")}</h3>
                  <div className={`p-4 rounded-xl border ${borderColor} ${bgCard} backdrop-blur-sm`}>
                    <p className={`text-sm ${textSecondary}`}>{pedidoSelecionado.observacoes}</p>
                  </div>
                </div>
              )}
              {!modoVisualizacao && (
                <div className="flex flex-wrap justify-between gap-3 mt-6 pt-6 border-t border-blue-500/20">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalAberto(false)}
                      className={`px-4 py-2 cursor-pointer ${bgCard} ${bgHover} border ${borderColor} ${textPrimary} rounded-xl transition-all duration-300 hover:scale-105 text-sm`}
                    >
                      {t("fechar")}
                    </button>
                  </div>

                  {podeEditar && pedidoSelecionado.status !== StatusPedido.CONCLUIDO && pedidoSelecionado.status !== StatusPedido.CANCELADO && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleConfirmarCancelamento(pedidoSelecionado.id)}
                        className="px-4 py-2 cursor-pointer rounded text-white bg-red-500 hover:bg-red-600 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
                      >
                        <FaTimes className="text-xs" />
                        {t("cancelarPedido")}
                      </button>

                      <button
                        onClick={handlePreencherQuantidadesSolicitadas}
                        className={`px-4 py-2 cursor-pointer rounded text-white transition-all duration-300 hover:scale-105 text-sm`}
                        style={{
                          backgroundColor: temaAtual.secundario,
                        }}
                      >
                        {t("preencherTodasQuantidades")}
                      </button>

                      <button
                        onClick={handleAtualizarQuantidades}
                        className={`px-4 py-2 cursor-pointer rounded text-white transition-all duration-300 hover:scale-105 text-sm`}
                        style={{
                          backgroundColor: temaAtual.primario,
                        }}
                      >
                        {t("salvarQuantidades")}
                      </button>

                      <button
                        onClick={() => handleConcluirPedidoComEstoque(pedidoSelecionado.id)}
                        className="px-4 py-2 rounded cursor-pointer text-white bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
                      >
                        <FaCheck className="text-xs" />
                        {t("concluirComEstoque")}
                      </button>

                      <button
                        onClick={() => handleAbrirModalEmail(pedidoSelecionado)}
                        className="px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
                      >
                        <FaPaperPlane className="text-xs" />
                        {t("enviarEmail")}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {modoVisualizacao && (
                <div className="flex justify-end mt-6 pt-6 border-t border-blue-500/20">
                  <button
                    onClick={() => setModalAberto(false)}
                    className={`px-4 py-2 cursor-pointer ${bgCard} ${bgHover} border ${borderColor} ${textPrimary} rounded-xl transition-all duration-300 hover:scale-105 text-sm`}
                  >
                    {t("fechar")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalAberto && modalTipo === "enviarEmail" && pedidoSelecionado && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className={`${modoDark ? "bg-slate-800 border-blue-500/30 shadow-blue-500/20" : "bg-white border-blue-200 shadow-blue-200"} border rounded-2xl shadow-2xl w-full max-w-2xl backdrop-blur-sm`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${textPrimary}`}>
                  {t("enviarEmail")} - {pedidoSelecionado.numero}
                </h2>
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setObservacoesEmail("");
                  }}
                  className={`p-2 cursor-pointer ${bgHover} rounded-lg transition-colors ${textMuted} hover:${textPrimary}`}
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="mb-6">
                <label className={`block ${textPrimary} mb-3 font-medium`}>
                  {t("observacoesEmail")}
                </label>
                <textarea
                  value={observacoesEmail}
                  onChange={(e) => setObservacoesEmail(e.target.value)}
                  rows={4}
                  placeholder={t("observacoesEmailPlaceholder")}
                  className={`w-full ${bgInput} border ${borderColor} rounded-xl px-4 py-3 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm resize-none`}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setObservacoesEmail("");
                  }}
                  className={`px-4 py-2 cursor-pointer ${bgCard} ${bgHover} border ${borderColor} ${textPrimary} rounded-xl transition-all duration-300 hover:scale-105 text-sm`}
                >
                  {t("cancelar")}
                </button>
                <button
                  onClick={handleEnviarEmailComObservacoes}
                  disabled={enviandoEmail[pedidoSelecionado.id]}
                  className="px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {enviandoEmail[pedidoSelecionado.id] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("enviandoEmail")}
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-xs" />
                      {t("enviarEmail")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalAberto && modalTipo === "criar" && (
        <CriarModal
          temaAtual={temaAtual}
          t={t}
          fornecedores={fornecedores}
          produtos={produtos}
          fornecedorSelecionado={fornecedorSelecionado}
          itensCriacao={itensCriacao}
          observacoesCriacao={observacoesCriacao}
          buscaProduto={buscaProduto}
          carregandoCriacao={carregandoCriacao}
          setFornecedorSelecionado={setFornecedorSelecionado}
          setBuscaProduto={setBuscaProduto}
          setObservacoesCriacao={setObservacoesCriacao}
          adicionarItem={adicionarItem}
          removerItem={removerItem}
          atualizarQuantidade={atualizarQuantidade}
          atualizarObservacao={atualizarObservacao}
          calcularTotal={calcularTotal}
          handleCriarPedido={handleCriarPedido}
          onClose={handleFecharModal}
        />
      )}
    </div>
  );
}