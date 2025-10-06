"use client";

import { ProdutoI } from "@/utils/types/produtos";
import { VendaI } from "@/utils/types/vendas";
import { useEffect, useState, useCallback } from "react";
import { LuShieldAlert, LuTriangleAlert, LuTrendingUp, LuPackage, LuUsers, LuShoppingCart, LuDollarSign, LuChartBar } from "react-icons/lu";
import { FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight, FaBox, FaExclamationTriangle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

interface CategoriaDistribuicao {
  categoria: string;
  quantidade: number;
  cor: string;
}

interface ProdutoVenda {
  id: string;
  nome: string;
  vendas: number;
}

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
    gradiente: "linear-gradient(135deg, #0A1929 0%, #132F4C 50%, #1E4976 100%)",
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
    gradiente: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)",
  },
};

export default function Dashboard() {
  const [contagemProduto, setContagemProduto] = useState(0);
  const [, setContagemEstoque] = useState(0);
  const [, setContagemValor] = useState(0);
  const [, setContagemLucro] = useState(0);
  const [contagemVendas, setContagemVendas] = useState(0);
  const [, setContagemFornecedores] = useState(0);
  const [contagemFuncionarios, setContagemFuncionarios] = useState(0);
  const [vendas30Dias, setVendas30Dias] = useState(0);
  const [todasVendas, setTodasVendas] = useState<VendaI[]>([]);
  const [modoDark, setModoDark] = useState(false);
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  const [produtosTopVendas, setProdutosTopVendas] = useState<ProdutoVenda[]>([]);
  const [distribuicaoCategorias, setDistribuicaoCategorias] = useState<CategoriaDistribuicao[]>([]);
  const [produtoExpandido, setProdutoExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation("dashboard");

  const produtosPorPagina = 5;
  const temaAtual = modoDark ? cores.dark : cores.light;

  const coresCategorias = [temaAtual.primario, temaAtual.secundario, temaAtual.sucesso, temaAtual.alerta, temaAtual.erro, "#6A0572", "#9EE6CF", "#45B7D1", "#F9A1BC", "#9B59B6"];

  const bgGradient = modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";

  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";
  const bgStats = modoDark ? "bg-slate-800/50" : "bg-white/80";

  const calcularTotalUnidadesVendidas = (vendas: VendaI[]): number => {
    return vendas.reduce((total, venda) => {
      return total + (venda.quantidade || 1);
    }, 0);
  };

  const calcularPorcentagensPizza = useCallback((categorias: CategoriaDistribuicao[]) => {
    const total = categorias.reduce((sum, cat) => sum + cat.quantidade, 0);
    if (total === 0) return categorias.map(() => 0);
    return categorias.map((cat) => (cat.quantidade / total) * 100);
  }, []);

  const calcularPathSegmento = useCallback((porcentagem: number, offsetAcumulado: number, raio: number = 45) => {
    if (porcentagem === 0) return "";

    if (porcentagem === 100) {
      return `<circle cx="50" cy="50" r="${raio}" fill="transparent" stroke="currentColor" stroke-width="10"/>`;
    }

    const anguloOffset = offsetAcumulado * 3.6;
    const anguloExtent = porcentagem * 3.6;

    const startAngle = (anguloOffset - 90) * (Math.PI / 180);
    const endAngle = (anguloOffset + anguloExtent - 90) * (Math.PI / 180);

    const x1 = 50 + raio * Math.cos(startAngle);
    const y1 = 50 + raio * Math.sin(startAngle);
    const x2 = 50 + raio * Math.cos(endAngle);
    const y2 = 50 + raio * Math.sin(endAngle);

    const largeArcFlag = anguloExtent > 180 ? 1 : 0;

    return `M 50 50 L ${x1} ${y1} A ${raio} ${raio} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }, []);

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

      const usuarioSalvo = localStorage.getItem("client_key");
      if (usuarioSalvo) {
        const usuarioValor = usuarioSalvo.replace(/"/g, "");
        await fetchDashboardData(usuarioValor);
      }

      setLoading(false);
    };

    initialize();

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
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [modoDark]);

  async function fetchTodasCategorias() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/categorias`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
      });
      if (response.ok) {
        const categorias = await response.json();
        return categorias.map((cat: { nome: string }) => cat.nome);
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }
  }

  async function fetchDashboardData(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) {
        resetAllData();
        return;
      }

      await Promise.all([fetchContagem(usuarioId), fetchProdutos(usuarioId), fetchFornecedores(usuarioId), fetchVendas(usuarioId), fetchFuncionarios(usuarioId), fetchTopProdutos(usuarioId), fetchDistribuicaoCategorias(usuarioId)]);
    } catch (error) {
      console.error("Erro ao buscar dados da dashboard:", error);
    }
  }

  function resetAllData() {
    setContagemEstoque(0);
    setContagemValor(0);
    setContagemLucro(0);
    setContagemVendas(0);
    setContagemProduto(0);
    setContagemFornecedores(0);
    setContagemFuncionarios(0);
    setVendas30Dias(0);
    setTodasVendas([]);
    setProdutos([]);
    setProdutosTopVendas([]);
    setDistribuicaoCategorias([]);
  }

  async function fetchContagem(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const [responseVendas, responseProdutos] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/contagem/${usuario.empresaId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/contagem/${usuario.empresaId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }),
      ]);

      if (responseVendas.ok) {
        const totalData = await responseVendas.json();
        setContagemLucro(totalData.total || 0);
      }

      if (responseProdutos.ok) {
        const produtosData = await responseProdutos.json();
        setContagemEstoque(produtosData.contagemQuantidade || 0);
        setContagemValor(produtosData.contagemPreco || 0);
        setContagemProduto(produtosData.count || 0);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  }

  async function fetchFuncionarios(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const responseFuncionarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/contagem/${usuario.empresaId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (responseFuncionarios.ok) {
        const data = await responseFuncionarios.json();
        setContagemFuncionarios(data.quantidade || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setContagemFuncionarios(0);
    }
  }

  async function fetchFornecedores(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const responseFornecedor = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/contagem/${usuario.empresaId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (responseFornecedor.ok) {
        const data = await responseFornecedor.json();
        setContagemFornecedores(data._count?.id || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      setContagemFornecedores(0);
    }
  }

  async function fetchProdutos(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (responseProdutos.ok) {
        const todosProdutos: ProdutoI[] = await responseProdutos.json();
        const produtosDaEmpresa = todosProdutos.filter((p) => p.empresaId === usuario.empresaId);

        const produtosComSaldos = await Promise.all(
          produtosDaEmpresa.map(async (produto) => {
            try {
              const responseSaldo = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${produto.id}/saldo`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Cookies.get("token")}`,
                },
              });
              if (responseSaldo.ok) {
                const { saldo } = await responseSaldo.json();
                return { ...produto, quantidade: saldo };
              }
            } catch (error) {
              console.error("Erro ao buscar saldo:", error);
            }
            return produto;
          })
        );

        setProdutos(produtosComSaldos);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  async function fetchVendas(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) {
        setTodasVendas([]);
        setContagemVendas(0);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/${usuario.empresaId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const vendas = data.vendas || [];
        setTodasVendas(vendas);
        calcularVendas30Dias(vendas);

        const totalUnidades = calcularTotalUnidadesVendidas(vendas);
        setContagemVendas(totalUnidades);
      } else {
        setTodasVendas([]);
        setContagemVendas(0);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      setTodasVendas([]);
      setContagemVendas(0);
    }
  }

  async function fetchTopProdutos(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/top-produtos/${usuario.empresaId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProdutosTopVendas(data);
      } else {
        if (todasVendas.length > 0) {
          const vendasPorProduto: { [key: string]: { vendas: number; nome: string } } = {};

          todasVendas.forEach((venda) => {
            if (venda.produtoId && venda.produto) {
              const produtoId = venda.produtoId.toString();

              if (!vendasPorProduto[produtoId]) {
                vendasPorProduto[produtoId] = {
                  vendas: 0,
                  nome: venda.produto.nome,
                };
              }
              vendasPorProduto[produtoId].vendas += venda.quantidade || 1;
            }
          });

          const topProdutos = Object.entries(vendasPorProduto)
            .sort((a, b) => b[1].vendas - a[1].vendas)
            .slice(0, 5)
            .map(([produtoId, data]) => ({
              id: produtoId,
              nome: data.nome,
              vendas: data.vendas,
            }));

          setProdutosTopVendas(topProdutos);
        } else {
          setProdutosTopVendas([]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar top produtos:", error);
      setProdutosTopVendas([]);
    }
  }

  async function fetchDistribuicaoCategorias(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const [responseProdutos, todasCategorias] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }),
        fetchTodasCategorias(),
      ]);

      if (responseProdutos.ok) {
        const todosProdutos: ProdutoI[] = await responseProdutos.json();
        const produtosDaEmpresa = todosProdutos.filter((p) => p.empresaId === usuario.empresaId);

        const distribuicao: { [key: string]: number } = {};
        produtosDaEmpresa.forEach((produto) => {
          const categoriaOriginal = produto.categoria?.nome || "Sem Categoria";
          distribuicao[categoriaOriginal] = (distribuicao[categoriaOriginal] || 0) + 1;
        });

        const categoriasOrdenadas = Object.entries(distribuicao).sort((a, b) => b[1] - a[1]);

        const categoriasComProdutos = categoriasOrdenadas.filter(([, quantidade]) => quantidade > 0);

        const distribuicaoFinal: CategoriaDistribuicao[] = categoriasComProdutos
          .map(([categoriaOriginal, quantidade], index) => ({
            categoria: t(`categorias.${categoriaOriginal}`, { defaultValue: categoriaOriginal }),
            quantidade,
            cor: coresCategorias[index] || "#CCCCCC",
          }))
          .slice(0, 5);

        if (distribuicaoFinal.length < 5) {
          const categoriasExistentes = new Set(categoriasComProdutos.map(([cat]) => cat));

          const categoriasDisponiveis = todasCategorias.filter((categoria: string) => !categoriasExistentes.has(categoria) && !distribuicao[categoria]);

          categoriasDisponiveis.slice(0, 5 - distribuicaoFinal.length).forEach((categoriaOriginal: string) => {
            distribuicaoFinal.push({
              categoria: t(`categorias.${categoriaOriginal}`, { defaultValue: categoriaOriginal }),
              quantidade: 0,
              cor: coresCategorias[distribuicaoFinal.length] || "#CCCCCC",
            });
          });
        }

        setDistribuicaoCategorias(distribuicaoFinal);
      }
    } catch (error) {
      console.error("Erro ao buscar distribuição de categorias:", error);
    }
  }

  async function calcularVendas30Dias(vendas: VendaI[]) {
    const data30DiasAtras = new Date();
    data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);

    const vendasFiltradas = vendas.filter((venda) => {
      if (!venda.createdAt) return false;
      const dataVenda = new Date(venda.createdAt);
      return dataVenda >= data30DiasAtras;
    });

    const total = vendasFiltradas.reduce((sum, venda) => sum + (venda.valorVenda || 0), 0);

    if (i18n.language === "pt") {
      setVendas30Dias(total);
    } else {
      try {
        const cotacao = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
        const cotacaoJson = await cotacao.json();
        const valorConvertido = total / parseFloat(cotacaoJson.USDBRL.bid);
        setVendas30Dias(valorConvertido);
      } catch (error) {
        console.error("Erro ao buscar cotação:", error);
        setVendas30Dias(total / 5);
      }
    }
  }

  const toggleExpandirProduto = (id: string) => {
    setProdutoExpandido(produtoExpandido === id ? null : id);
  };

  const produtosCriticos = produtos.filter((produto) => produto.quantidade < (produto.quantidadeMin || 0) && produto.quantidadeMin !== undefined && produto.quantidadeMin > 0);
  const produtosAtencao = produtos.filter((produto) => produto.quantidade >= (produto.quantidadeMin || 0) && produto.quantidade < (produto.quantidadeMin || 0) + 5 && produto.quantidadeMin !== undefined && produto.quantidadeMin > 0);
  const produtosEstoqueBaixo = [...produtosCriticos, ...produtosAtencao];

  const indexUltimoProduto = paginaAtual * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosAtuais = produtosEstoqueBaixo.slice(indexPrimeiroProduto, indexUltimoProduto);
  const totalPaginas = Math.ceil(produtosEstoqueBaixo.length / produtosPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setProdutoExpandido(null);
  };

  const totalItens = distribuicaoCategorias.reduce((sum, cat) => sum + cat.quantidade, 0);
  const porcentagensPizza = calcularPorcentagensPizza(distribuicaoCategorias);

  const statsCards = [
    {
      label: t("atividades.contagemVendas"),
      value: contagemVendas,
      icon: LuShoppingCart,
      color: "from-blue-500 to-cyan-500",
      bgColor: modoDark ? "bg-blue-500/10" : "bg-blue-50",
    },
    {
      label: t("atividades.lucroMensal"),
      value: vendas30Dias,
      icon: LuDollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: modoDark ? "bg-green-500/10" : "bg-green-50",
      isCurrency: true,
    },
    {
      label: t("atividades.contagemItens"),
      value: contagemProduto,
      icon: LuPackage,
      color: "from-purple-500 to-pink-500",
      bgColor: modoDark ? "bg-purple-500/10" : "bg-purple-50",
    },
    {
      label: t("atividades.contagemFuncionarios"),
      value: contagemFuncionarios,
      icon: LuUsers,
      color: "from-orange-500 to-red-500",
      bgColor: modoDark ? "bg-orange-500/10" : "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${textPrimary}`}>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient} pb-8`}>
      <div className="px-4 sm:px-6 py-8 w-full max-w-7xl mx-auto">
        <section className={`relative py-8 rounded-3xl mb-6 overflow-hidden ${bgCard} backdrop-blur-sm border ${borderColor}`}>
          <div className="absolute inset-0">
            <div className={`absolute top-0 left-10 w-32 h-32 ${modoDark ? "bg-blue-500/20" : "bg-blue-200/50"} rounded-full blur-3xl animate-float`}></div>
            <div className={`absolute bottom-0 right-10 w-48 h-48 ${modoDark ? "bg-slate-700/20" : "bg-slate-300/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "2s" }}></div>
            <div className={`absolute top-1/2 left-1/2 w-24 h-24 ${modoDark ? "bg-cyan-500/20" : "bg-cyan-200/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "4s" }}></div>
          </div>

          <div className="relative z-10 text-center">
            <h1 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-3`}>
              {t("dashboardTitulo")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">STOCKCONTROL</span>
            </h1>
            <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
              {t("intro.linha1")} {t("intro.linha2")}
            </p>
          </div>
        </section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="gradient-border animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`p-4 rounded-[15px] ${bgStats} backdrop-blur-sm card-hover`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                      {stat.isCurrency
                        ? stat.value.toLocaleString(i18n.language === "en" ? "en-US" : "pt-BR", {
                            style: "currency",
                            currency: i18n.language === "en" ? "USD" : "BRL",
                          })
                        : stat.value}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={`rounded-2xl ${bgCard} border ${borderColor} p-6 backdrop-blur-sm card-hover`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${modoDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                <LuTrendingUp className={`text-xl ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
              </div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>{t("financeiro.topProdutos")}</h2>
            </div>

            <div className="space-y-4">
              {produtosTopVendas.length > 0 ? (
                produtosTopVendas.map((produto, index) => {
                  const maxVendas = Math.max(...produtosTopVendas.map((p) => p.vendas));
                  const porcentagem = maxVendas > 0 ? (produto.vendas / maxVendas) * 100 : 0;
                  return (
                    <div key={produto.id} className="space-y-2 animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-medium ${textPrimary} truncate flex-1 mr-4`} title={produto.nome}>
                          {produto.nome}
                        </span>
                        <span className={`font-bold ${textPrimary} whitespace-nowrap`}>
                          {produto.vendas} {t("financeiro.unidades")}
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${porcentagem}%`,
                            background: modoDark ? "linear-gradient(90deg, #3B82F6, #0EA5E9)" : "linear-gradient(90deg, #1976D2, #0284C7)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`text-center py-8 ${textMuted}`}>
                  <LuPackage className="text-4xl mx-auto mb-3 opacity-50" />
                  <p>{t("financeiro.semDados")}</p>
                </div>
              )}
            </div>
          </div>
          <div className={`rounded-2xl ${bgCard} border ${borderColor} p-6 backdrop-blur-sm card-hover`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${modoDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
                <LuChartBar className={`text-xl ${modoDark ? "text-purple-400" : "text-purple-500"}`} />
              </div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>{t("financeiro.categorias")}</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg width="128" height="128" viewBox="0 0 100 100">
                    {distribuicaoCategorias.map((item, index) => {
                      const porcentagem = porcentagensPizza[index];
                      if (porcentagem === 0) return null;

                      let offsetAcumulado = 0;
                      for (let i = 0; i < index; i++) {
                        offsetAcumulado += porcentagensPizza[i];
                      }

                      return <path key={index} d={calcularPathSegmento(porcentagem, offsetAcumulado)} fill={item.cor} stroke={temaAtual.card} strokeWidth="2" className="transition-all duration-500" />;
                    })}
                    <circle cx="50" cy="50" r="35" fill={temaAtual.card} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-bold text-center ${textPrimary}`}>
                      {totalItens}
                      <br />
                      <span className={`text-xs ${textMuted}`}>{t("financeiro.itens")}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {distribuicaoCategorias.map((item, index) => {
                  const porcentagem = totalItens > 0 ? ((item.quantidade / totalItens) * 100).toFixed(0) : "0";
                  return (
                    <div key={index} className="flex items-center justify-between text-sm animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }} />
                        <span className={`font-medium ${textPrimary} truncate max-w-[100px]`} title={item.categoria}>
                          {item.categoria}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={textPrimary}>{item.quantidade}</span>
                        <span className={textMuted}>({porcentagem}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl ${bgCard} border ${borderColor} p-6 backdrop-blur-sm card-hover`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${modoDark ? "bg-red-500/20" : "bg-red-100"}`}>
              <FaExclamationTriangle className={`text-xl ${modoDark ? "text-red-400" : "text-red-500"}`} />
            </div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>{t("estoqueBaixo.titulo")}</h2>
            {produtosEstoqueBaixo.length > 0 && <span className={`px-2 py-1 rounded-full text-xs font-bold ${modoDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"}`}>{produtosEstoqueBaixo.length}</span>}
          </div>
          <div className="hidden md:block">
            {produtosEstoqueBaixo.length > 0 ? (
              <>
                <table className="w-full text-sm text-left">
                  <thead className={`border-b ${borderColor}`}>
                    <tr className={textPrimary}>
                      <th className="py-3 px-4 text-start font-semibold">{t("estoqueBaixo.colunas.produto")}</th>
                      <th className="py-3 px-4 text-center font-semibold">{t("estoqueBaixo.colunas.estoqueAtual")}</th>
                      <th className="py-3 px-4 text-center font-semibold">{t("estoqueBaixo.colunas.estoqueIdeal")}</th>
                      <th className="py-3 px-4 text-center font-semibold">{t("Estado")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosAtuais.map((produto, index) => (
                      <tr key={produto.id} className={`border-b ${borderColor} ${bgHover} transition-all duration-200 animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                        <td className="py-3 px-4 text-start">
                          <div className="flex items-center gap-3">
                            <FaBox className={textMuted} />
                            <span className={textPrimary}>{produto.nome}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${textPrimary}`}>{produto.quantidade}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={textPrimary}>{produto.quantidadeMin || 0}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {produto.quantidade < (produto.quantidadeMin || 0) ? (
                            <div className="flex items-center justify-center gap-2 text-red-400">
                              <LuShieldAlert size={18} />
                              <span className="font-medium">{t("estoqueBaixo.estadoCritico")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-yellow-400">
                              <LuTriangleAlert size={18} />
                              <span className="font-medium">{t("estoqueBaixo.estadoAtencao")}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-6">
                    <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === 1 ? `${bgCard} ${textMuted} cursor-not-allowed` : `${bgHover} ${textPrimary} border ${borderColor} hover:scale-105`}`}>
                      <FaAngleLeft />
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPaginas)].map((_, index) => {
                        const pagina = index + 1;
                        const mostrarPagina = pagina === 1 || pagina === totalPaginas || (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1);

                        if (!mostrarPagina) {
                          if (pagina === paginaAtual - 2 || pagina === paginaAtual + 2) {
                            return (
                              <span key={pagina} className={`px-3 py-1 ${textMuted}`}>
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button key={pagina} onClick={() => mudarPagina(pagina)} className={`px-3 py-1 rounded-xl transition-all duration-300 text-sm ${pagina === paginaAtual ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105" : `${bgCard} ${bgHover} ${textPrimary} border ${borderColor} hover:scale-105`}`}>
                            {pagina}
                          </button>
                        );
                      })}
                    </div>

                    <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === totalPaginas ? `${bgCard} ${textMuted} cursor-not-allowed` : `${bgHover} ${textPrimary} border ${borderColor} hover:scale-105`}`}>
                      <FaAngleRight />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center py-8 ${textMuted}`}>
                <FaBox className="text-4xl mx-auto mb-3 opacity-50" />
                <p>{t("estoqueBaixo.nenhumProduto")}</p>
              </div>
            )}
          </div>
          <div className="md:hidden space-y-3">
            {produtosEstoqueBaixo.length === 0 ? (
              <div className={`text-center p-6 rounded-xl ${bgCard} ${borderColor} border`}>
                <FaBox className="text-3xl mx-auto mb-3 opacity-50" />
                <p className={textMuted}>{t("estoqueBaixo.nenhumProduto")}</p>
              </div>
            ) : (
              produtosAtuais.map((produto, index) => (
                <div key={produto.id} className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${bgCard} ${borderColor} animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }} onClick={() => toggleExpandirProduto(produto.id)}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBox className={textMuted} />
                        <p className={`font-semibold ${textPrimary}`}>{produto.nome}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={textMuted}>
                          {t("estoqueBaixo.colunas.estoqueAtual")}: <span className={`font-bold ${textPrimary}`}>{produto.quantidade}</span>
                        </span>
                        <span className={textMuted}>
                          {t("estoqueBaixo.colunas.estoqueIdeal")}: <span className={textPrimary}>{produto.quantidadeMin || 0}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandirProduto(produto.id);
                      }}
                      className={`p-1 ${bgHover} rounded-lg transition-colors`}
                    >
                      {produtoExpandido === produto.id ? <FaChevronUp className={textMuted} /> : <FaChevronDown className={textMuted} />}
                    </button>
                  </div>

                  <div className={`mt-3 text-sm overflow-hidden transition-all duration-200 ${produtoExpandido === produto.id ? "max-h-96" : "max-h-0"}`}>
                    <div className={`pt-3 border-t ${borderColor}`}>
                      <div className="flex items-center gap-2">
                        {produto.quantidade < (produto.quantidadeMin || 0) ? (
                          <>
                            <LuShieldAlert size={18} className="text-red-400" />
                            <span className="text-red-400 font-medium">{t("estoqueBaixo.estadoCritico")}</span>
                          </>
                        ) : (
                          <>
                            <LuTriangleAlert size={18} className="text-yellow-400" />
                            <span className="text-yellow-400 font-medium">{t("estoqueBaixo.estadoAtencao")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
