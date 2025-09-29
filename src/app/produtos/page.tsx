"use client";

import { ProdutoI } from "@/utils/types/produtos";
import { FornecedorI } from "@/utils/types/fornecedor";
import { CategoriaI } from "@/utils/types/categoria";
import { cores } from "@/utils/cores";
import { useEffect, useState, useRef } from "react";
import { FaSearch, FaCog, FaLock, FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight, FaStar, FaRegStar, FaSort, FaSortUp, FaSortDown, FaQuestionCircle, FaTimes, FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import MovimentacaoEstoqueModal from "@/components/MovimentacaoEstoqueModal";
import Image from "next/image";
import Swal from "sweetalert2";

type CampoOrdenacao = 'nome' | 'estoque' | 'preco' | 'none';
type DirecaoOrdenacao = 'asc' | 'desc';

export default function Produtos() {
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  const [produtosOriginais, setProdutosOriginais] = useState<ProdutoI[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<ProdutoI | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [categorias, setCategorias] = useState<CategoriaI[]>([]);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [modoDark, setModoDark] = useState(false);
  const [produtoExpandido, setProdutoExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const produtosPorPagina = 10;
  const { t } = useTranslation("produtos");
  const router = useRouter();
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [recarregarProdutos, setRecarregarProdutos] = useState(0);
  const [totalProdutos, setTotalProdutos] = useState<number>(0);

  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [menuCategoriasAberto, setMenuCategoriasAberto] = useState(false);

  const [campoOrdenacao, setCampoOrdenacao] = useState<CampoOrdenacao>('none');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<DirecaoOrdenacao>('asc');

  const [form, setForm] = useState<ProdutoI>({
    id: "",
    nome: "",
    descricao: "",
    preco: 0,
    quantidade: 0,
    quantidadeMin: 0,
    foto: "",
    noCatalogo: false,
    fornecedorId: "",
    categoriaId: "",
    empresaId: "",
    fornecedor: undefined,
    categoria: undefined,
    empresa: "",
    usuarioId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [nomeCaracteres, setNomeCaracteres] = useState(0);
  const [descricaoCaracteres, setDescricaoCaracteres] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuCategoriasRef = useRef<HTMLDivElement>(null);

  const temaAtual = modoDark ? cores.dark : cores.light;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuCategoriasRef.current && !menuCategoriasRef.current.contains(event.target as Node)) {
        setMenuCategoriasAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

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

    const carregarPermissoes = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioValor}/permissoes`,
          { headers: { 'user-id': usuarioValor } }
        );
        if (response.ok) {
          const dados: { permissoes: { chave: string; concedida: boolean }[] } = await response.json();
          const permissoesUsuarioObj: Record<string, boolean> = {};
          dados.permissoes.forEach(permissao => {
            permissoesUsuarioObj[permissao.chave] = permissao.concedida;
          });
          setPermissoesUsuario(permissoesUsuarioObj);
        } else {
          const permissoesParaVerificar = [
            "produtos_criar",
            "produtos_editar",
            "produtos_excluir",
            "produtos_visualizar",
            "estoque_gerenciar"
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

    const initialize = async () => {
      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`, {
        headers: { 'user-id': usuarioValor }
      });
      if (!responseUsuario.ok) {
        console.error("Erro ao buscar os dados do usuário");
        return;
      }
      const usuario = await responseUsuario.json();
      setEmpresaId(usuario.empresaId);
      setTipoUsuario(usuario.tipo);

      if (usuario.empresaId) {
        const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
        setEmpresaAtivada(ativada);
        if (ativada) {
          const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
          if (responseProdutos.ok) {
            const todosProdutos = await responseProdutos.json();
            const produtosDaEmpresa = todosProdutos
              .filter((p: ProdutoI) => p.empresaId === usuario.empresaId)
              .sort((a: ProdutoI, b: ProdutoI) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            setProdutos(produtosDaEmpresa);
            setProdutosOriginais(produtosDaEmpresa);
            setTotalProdutos(produtosDaEmpresa.length);
          }
        }
      }

      const responseFornecedores = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`, {
        headers: { 'user-id': usuarioValor }
      });
      if (responseFornecedores.ok) {
        const fornecedoresData = await responseFornecedores.json();
        setFornecedores(fornecedoresData);
      }

      const responseCategorias = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/categorias`, {
        headers: { 'user-id': usuarioValor }
      });
      if (responseCategorias.ok) {
        const categoriasData = await responseCategorias.json();
        setCategorias(categoriasData);
      }
    };

    carregarPermissoes();
    initialize();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.head.removeChild(style);
    };
  }, [modoDark]);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    const carregarProdutos = async () => {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`, {
        headers: { 'user-id': usuarioValor }
      });
      if (!responseUsuario.ok) {
        console.error("Erro ao buscar os dados do usuário");
        return;
      }
      const usuario = await responseUsuario.json();

      if (usuario?.empresaId && empresaAtivada) {
        const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
        if (responseProdutos.ok) {
          const todosProdutos = await responseProdutos.json();
          const produtosDaEmpresa = todosProdutos
            .filter((p: ProdutoI) => p.empresaId === usuario.empresaId)
            .sort((a: ProdutoI, b: ProdutoI) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          setProdutos(produtosDaEmpresa);
          setProdutosOriginais(produtosDaEmpresa);
          setTotalProdutos(produtosDaEmpresa.length);
        }
      }
    };

    carregarProdutos();
  }, [recarregarProdutos, empresaAtivada]);

  useEffect(() => {
    if (produtosOriginais.length > 0) {
      const produtosOrdenados = ordenarProdutos(produtosOriginais, campoOrdenacao, direcaoOrdenacao);
      setProdutos(produtosOrdenados);
    }
  }, [produtosOriginais, campoOrdenacao, direcaoOrdenacao]);

  useEffect(() => {
    if (modalVisualizar) {
      setForm({
        ...modalVisualizar,
        preco: parseFloat(modalVisualizar.preco.toFixed(2)),
        quantidade: modalVisualizar.quantidade,
        quantidadeMin: modalVisualizar.quantidadeMin || 0,
      });
      setPreview(modalVisualizar.foto || null);
      setNomeCaracteres(modalVisualizar.nome?.length || 0);
      setDescricaoCaracteres(modalVisualizar.descricao?.length || 0);
    }
  }, [modalVisualizar]);

  const recarregarListaProdutos = () => {
    setRecarregarProdutos(prev => prev + 1);
  };

  const ordenarProdutos = (produtos: ProdutoI[], campo: CampoOrdenacao, direcao: DirecaoOrdenacao) => {
    if (campo === 'none') return [...produtos];

    return [...produtos].sort((a, b) => {
      let valorA, valorB;

      switch (campo) {
        case 'nome':
          valorA = a.nome.toLowerCase();
          valorB = b.nome.toLowerCase();
          break;
        case 'estoque':
          valorA = a.quantidade;
          valorB = b.quantidade;
          break;
        case 'preco':
          valorA = a.preco;
          valorB = b.preco;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return direcao === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return direcao === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleOrdenar = (campo: CampoOrdenacao) => {
    if (campoOrdenacao === campo) {
      setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrdenacao(campo);
      setDirecaoOrdenacao('asc');
    }
  };

  const obterIconeOrdenacao = (campo: CampoOrdenacao) => {
    if (campoOrdenacao !== campo) {
      return <FaSort />;
    }

    return direcaoOrdenacao === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

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

  const podeVisualizar = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.produtos_visualizar;

  const podeCriar = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.produtos_criar;

  const podeEditar = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.produtos_editar;

  const podeExcluir = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.produtos_excluir;

  const podeGerenciarCatalogo = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.produtos_editar;

  const podeGerenciarEstoque = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.estoque_gerenciar;

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

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 60) {
      setForm({ ...form, nome: value });
      setNomeCaracteres(value.length);
    }
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setForm({ ...form, descricao: value });
      setDescricaoCaracteres(value.length);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/upload-foto`, {
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

  const toggleCatalogo = async (produtoId: string, noCatalogo: boolean) => {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    handleAcaoProtegida(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${produtoId}/catalogo`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'user-id': usuarioValor
          },
          body: JSON.stringify({ noCatalogo: !noCatalogo }),
        });

        if (response.ok) {
          const produtoAtualizado = await response.json();

          setProdutos(prevProdutos =>
            prevProdutos.map(p =>
              p.id === produtoId
                ? { ...p, noCatalogo: produtoAtualizado.noCatalogo }
                : p
            )
          );

          if (modalVisualizar && modalVisualizar.id === produtoId) {
            setModalVisualizar(prev => prev ? { ...prev, noCatalogo: produtoAtualizado.noCatalogo } : null);
          }

          Swal.fire({
            position: "center",
            icon: "success",
            title: produtoAtualizado.noCatalogo
              ? t("produtoAdicionadoCatalogo.titulo")
              : t("produtoRemovidoCatalogo.titulo"),
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire("Erro!", "Não foi possível alterar o catálogo", "error");
        }
      } catch (err) {
        console.error("Erro ao alterar catálogo:", err);
        Swal.fire("Erro!", "Erro de conexão avec le serveur", "error");
      }
    });
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
        descricao: form.descricao.trim(),
        quantidadeMin: form.quantidadeMin !== 0
      };

      const camposFaltando = Object.entries(camposObrigatorios)
        .filter(([, value]) => !value)
        .map(([campo]) => campo);

      if (camposFaltando.length > 0) {
        const camposTraduzidos = camposFaltando.map(campo => {
          switch (campo) {
            case 'nome': return t("nome");
            case 'descricao': return t("descricao");
            case 'quantidadeMin': return t("quantidadeMinima");
            default: return campo;
          }
        });

        Swal.fire({
          icon: 'error',
          title: t("erroCamposObrigatorios.titulo") || 'Campos obrigatórios',
          html: `${t("erroCamposObrigatorios.mensagem") || 'Preencha os campos obrigatórios:'}<br><strong>${camposTraduzidos.join(', ')}</strong>`,
          confirmButtonColor: '#EF4444'
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

        if (file) {
          const uploadedUrl = await uploadFotoSeparada(file);
          if (uploadedUrl) {
            fotoUrl = uploadedUrl;
          } else {
            Swal.fire("Aviso", "Upload da foto falhou, continuando sem imagem", "warning");
          }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'user-id': usuarioValor
          },
          body: JSON.stringify({
            nome: form.nome,
            descricao: form.descricao,
            preco: form.preco || 0,
            quantidade: form.quantidade || 0,
            quantidadeMin: form.quantidadeMin,
            noCatalogo: form.noCatalogo,
            fornecedorId: form.fornecedorId,
            categoriaId: form.categoriaId,
            empresaId: empresaId,
            usuarioId: usuarioValor,
            fotoUrl: fotoUrl
          })
        });

        if (response.ok) {
          setModalAberto(false);
          setForm({
            id: "",
            nome: "",
            descricao: "",
            noCatalogo: false,
            preco: 0,
            quantidade: 0,
            quantidadeMin: 0,
            foto: "",
            fornecedorId: "",
            categoriaId: "",
            empresaId: "",
            fornecedor: undefined,
            categoria: undefined,
            empresa: "",
            usuarioId: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setFile(null);
          setPreview(null);

          Swal.fire({
            position: "center",
            icon: "success",
            title: t("produtoCriadoSucesso.titulo"),
            showConfirmButton: false,
            timer: 1500,
          });

          setTimeout(() => window.location.reload(), 1600);
        } else {
          const errorData = await response.json();
          Swal.fire("Erro!", `Erro ao cadastrar produto: ${errorData.mensagem || 'Erro desconhecido'}`, "error");
        }
      } catch (err) {
        console.error("Erro ao criar produto:", err);
        Swal.fire("Erro!", "Erro de conexão com o servidor", "error");
      }
    });
  };

  const uploadFotoUpdate = async (file: File, produtoId: string): Promise<string | null> => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("foto", file);

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return null;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${produtoId}/upload-foto`, {
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

  const handleUpdate = async () => {
    handleAcaoProtegida(async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!modalVisualizar) return;

      const camposObrigatorios = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        quantidadeMin: form.quantidadeMin !== 0
      };

      const camposFaltando = Object.entries(camposObrigatorios)
        .filter(([, value]) => !value)
        .map(([campo]) => campo);

      if (camposFaltando.length > 0) {
        const camposTraduzidos = camposFaltando.map(campo => {
          switch (campo) {
            case 'nome': return t("nome");
            case 'descricao': return t("descricao");
            case 'quantidadeMin': return t("quantidadeMinima");
            default: return campo;
          }
        });

        Swal.fire({
          icon: 'error',
          title: t("erroCamposObrigatorios.titulo") || 'Campos obrigatórios',
          html: `${t("erroCamposObrigatorios.mensagem") || 'Preencha os campos obrigatórios:'}<br><strong>${camposTraduzidos.join(', ')}</strong>`,
          confirmButtonColor: '#EF4444'
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

        if (file) {
          const uploadedUrl = await uploadFotoUpdate(file, modalVisualizar.id);
          if (uploadedUrl) {
            fotoUrl = uploadedUrl;
          } else {
            Swal.fire("Aviso", "Upload da foto falhou, mantendo imagem anterior", "warning");
          }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${modalVisualizar.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'user-id': usuarioValor
          },
          body: JSON.stringify({
            nome: form.nome,
            descricao: form.descricao,
            preco: form.preco,
            quantidadeMin: form.quantidadeMin,
            noCatalogo: form.noCatalogo,
            fornecedorId: form.fornecedorId,
            categoriaId: form.categoriaId,
            usuarioId: usuarioValor,
            fotoUrl: fotoUrl
          })
        });

        if (response.ok) {
          const updatedProduto = await response.json();

          setModalVisualizar(null);
          setFile(null);
          setPreview(null);

          setProdutos(produtos.map(p => p.id === updatedProduto.id ? updatedProduto : p));
          Swal.fire({
            position: "center",
            icon: "success",
            title: t("produtoAtualizadoSucesso.titulo"),
            showConfirmButton: false,
            timer: 1500,
          });
          setTimeout(() => window.location.reload(), 1600);
        } else {
          const errorText = await response.text();
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text: `Erro ao atualizar produto: ${errorText}`
          });
        }
      } catch (err) {
        console.error("Erro ao atualizar produto:", err);
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: "Erro inesperado ao tentar atualizar."
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
      });

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (result.isConfirmed) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${modalVisualizar.id}`, {
            method: "DELETE",
            headers: {
              'user-id': usuarioValor
            }
          });
          Swal.fire(
            t("produtoExcluidoSucesso.titulo"),
            t("produtoExcluidoSucesso.mensagem"),
            "success"
          );
          setModalVisualizar(null);
          window.location.reload();
        } catch (err) {
          console.error("Erro ao excluir produto:", err);
          Swal.fire("Erro!", "Não foi possível deletar o produto.", "error");
        }
      }
    });
  };

  const aplicarFiltroCategoria = (categoriaId: string | null) => {
    setFiltroCategoria(categoriaId);
    setPaginaAtual(1);
    setMenuCategoriasAberto(false);
  };

  const removerFiltro = () => {
    setFiltroCategoria(null);
    setPaginaAtual(1);
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const buscaMatch = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const categoriaMatch = filtroCategoria ? produto.categoriaId === filtroCategoria : true;
    return buscaMatch && categoriaMatch;
  });

  const indexUltimoProduto = paginaAtual * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosAtuais = produtosFiltrados.slice(indexPrimeiroProduto, indexUltimoProduto);
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);

  const toggleExpandirProduto = (id: string) => {
    setProdutoExpandido(produtoExpandido === id ? null : id);
  };

  const formatarPreco = (preco: number) => {
    return preco.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setProdutoExpandido(null);
  };

  const nomeCategoriaSelecionada = filtroCategoria 
    ? categorias.find(c => String(c.id) === filtroCategoria)?.nome 
    : null;

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
      <div className="w-full max-w-7xl">
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
            <div className="flex items-center gap-2 flex-1">
            <div
              className="flex items-center border rounded-full px-3 md:px-4 py-1 md:py-2 shadow-sm"
              style={{
              backgroundColor: temaAtual.card,
              borderColor: temaAtual.borda,
              minWidth: "180px",
              maxWidth: "260px",
              width: "100%",
              }}
            >
              <input
              type="text"
              placeholder={t("buscar")}
              className="outline-none font-mono text-sm bg-transparent placeholder-gray-400"
              style={{
                color: temaAtual.texto,
                width: "100%",
              }}
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              />
              <FaSearch className="ml-2" style={{ color: temaAtual.primario }} />
            </div>
            
            <div className="relative" ref={menuCategoriasRef}>
              <button
                onClick={() => setMenuCategoriasAberto(!menuCategoriasAberto)}
                className="flex items-center gap-2 px-3 md:px-4 py-1 md:py-2 border rounded-full shadow-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  borderColor: temaAtual.borda,
                  color: temaAtual.texto,
                }}
              >
                <FaFilter className="text-sm" />
                <span className="text-sm font-mono">
                  {filtroCategoria ? nomeCategoriaSelecionada : t("categoria")}
                </span>
                {menuCategoriasAberto ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
              </button>

              {menuCategoriasAberto && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto z-50 rounded-lg shadow-lg border"
                  style={{
                    backgroundColor: temaAtual.card,
                    borderColor: temaAtual.borda,
                  }}
                >
                  <div className="p-2">
                    {categorias.map((categoria) => (
                      <div
                        key={categoria.id}
                        className="p-2 rounded-md cursor-pointer hover:opacity-80 transition"
                        style={{
                          backgroundColor: filtroCategoria === String(categoria.id) ? temaAtual.primario + "40" : "transparent",
                          color: temaAtual.texto,
                        }}
                        onClick={() => aplicarFiltroCategoria(String(categoria.id))}
                      >
                        {categoria.nome}
                      </div>
                    ))}
                    {categorias.length === 0 && (
                      <div className="p-2 text-center text-sm" style={{ color: temaAtual.texto }}>
                        {t("nenhumaCategoria")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {filtroCategoria && (
              <button
                onClick={removerFiltro}
                className="p-2 rounded-full hover:opacity-80 transition"
                style={{ color: temaAtual.texto }}
                title={t("removerFiltro")}
              >
                <FaTimes />
              </button>
            )}

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
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono" style={{ color: temaAtual.texto }}>
              {t("produtosCadastrados")}: {totalProdutos}
            </span>

            {podeCriar && empresaAtivada && (
              <button
                onClick={() => handleAcaoProtegida(() => setModalAberto(true))}
                className="px-6 py-2 border-2 rounded-lg transition-all duration-200 font-mono text-sm cursor-pointer hover:scale-105"
                style={{
                  backgroundColor: temaAtual.primario,
                  borderColor: temaAtual.primario,
                  color: "#FFFFFF",
                }}
              >
                {t("novo")}
              </button>
            )}
          </div>
        </div>

        {filtroCategoria && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg" style={{
            backgroundColor: temaAtual.primario + "20",
            border: `1px solid ${temaAtual.borda}`
          }}>
            <span className="text-sm" style={{ color: temaAtual.texto }}>
              {t("filtroAtivo")}: <strong>{nomeCategoriaSelecionada}</strong>
            </span>
            <button
              onClick={removerFiltro}
              className="text-sm flex items-center gap-1 hover:opacity-80 transition"
              style={{ color: temaAtual.primario }}
            >
              <FaTimes className="text-xs" />
              {t("removerFiltro")}
            </button>
          </div>
        )}

        <div
          className="border rounded-xl shadow-lg"
          style={{
            backgroundColor: temaAtual.card,
            borderColor: temaAtual.borda,
          }}
        >
          {produtosFiltrados.length === 0 ? (
            <div className="p-6 text-center" style={{ color: temaAtual.texto }}>
              {filtroCategoria ? t("nenhumProdutoCategoria") : t("nenhumProdutoEncontrado")}
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm font-mono" style={{ tableLayout: 'fixed' }}>
                  <thead className="border-b w-full" style={{ borderColor: temaAtual.borda }}>
                    <tr style={{ color: temaAtual.texto }}>
                      <th className="py-4 px-6 text-left" style={{ width: '25%' }}>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleOrdenar('nome')}>
                          <FaCog /> {t("nome")}
                          <span className="ml-1">
                            {obterIconeOrdenacao('nome')}
                          </span>
                        </div>
                      </th>
                      <th className="py-4 px-6 text-center" style={{ width: '15%' }}>{t("fornecedor")}</th>
                      <th className="py-4 px-6 text-center" style={{ width: '15%' }}>{t("categoria")}</th>
                      <th className="py-4 px-6 text-center" style={{ width: '15%' }}>
                        <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => handleOrdenar('estoque')}>
                          {t("estoque")}
                          <span>
                            {obterIconeOrdenacao('estoque')}
                          </span>
                        </div>
                      </th>
                      <th className="py-4 px-6 text-center" style={{ width: '15%' }}>
                        <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => handleOrdenar('preco')}>
                          {t("preco")}
                          <span>
                            {obterIconeOrdenacao('preco')}
                          </span>
                        </div>
                      </th>
                      <th className="py-4 px-6 text-center" style={{ width: '15%' }}>{t("catalogo")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosAtuais.map((produto) => (
                      <tr
                        key={produto.id}
                        className="border-b transition-all duration-200 cursor-pointer"
                        style={{
                          color: temaAtual.texto,
                          borderColor: temaAtual.borda,
                          backgroundColor: temaAtual.card,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = modoDark
                            ? "#1E4976"
                            : "#EFF6FF";
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
                        onClick={() => {
                          setModalVisualizar(produto);
                          setForm(produto);
                        }}
                      >
                        <td className="py-4 px-6 flex items-center gap-3">
                          <Image
                            src={produto.foto || "/out.jpg"}
                            width={30}
                            height={30}
                            className="rounded"
                            alt={produto.nome}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/out.jpg";
                            }}
                          />
                          <span className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap block">
                            {produto.nome}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">{produto.fornecedor?.nome || "-"}</td>
                        <td className="py-3 px-3 text-center">{produto.categoria?.nome || "-"}</td>
                        <td className="py-3 px-4 text-center">{produto.quantidade || "-"}</td>
                        <td className="py-3 px-3 text-center">
                          R$ {formatarPreco(produto.preco)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {podeGerenciarCatalogo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCatalogo(produto.id, produto.noCatalogo);
                              }}
                              className="p-1 text-yellow-500 hover:text-yellow-300 transition"
                              title={produto.noCatalogo ? t("removerDoCatalogo") : t("adicionarAoCata")}
                            >
                              {produto.noCatalogo ? <FaStar /> : <FaRegStar />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2 p-2">
                {produtosAtuais.map((produto) => (
                  <div
                    key={produto.id}
                    className="border rounded-lg p-3 transition-all cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      borderColor: temaAtual.borda,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = modoDark
                        ? "#1E4976"
                        : "#EFF6FF";
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
                    onClick={() => toggleExpandirProduto(produto.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Image
                          src={produto.foto || "/out.jpg"}
                          width={40}
                          height={40}
                          className="rounded"
                          alt={produto.nome}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/out.jpg";
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: temaAtual.texto }}>
                            {produto.nome}
                          </p>
                          <p className="text-xs" style={{ color: temaAtual.primario }}>
                            R$ {formatarPreco(produto.preco)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {podeGerenciarCatalogo && (
                          <button
                            onClick={() => toggleCatalogo(produto.id, produto.noCatalogo)}
                            className="text-yellow-500 hover:text-yellow-300 p-1"
                            title={produto.noCatalogo ? t("removerDoCatalogo") : t("adicionarAoCata")}
                          >
                            {produto.noCatalogo ? <FaStar /> : <FaRegStar />}
                          </button>
                        )}

                        <button
                          onClick={() => toggleExpandirProduto(produto.id)}
                          className="p-1"
                          style={{ color: temaAtual.primario }}
                        >
                          {produtoExpandido === produto.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${produtoExpandido === produto.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: temaAtual.texto }}
                    >
                      <div className="pt-2 border-t" style={{ borderColor: temaAtual.borda }}>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="font-semibold">{t("fornecedor")}:</p>
                            <p>{produto.fornecedor?.nome || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t("categoria")}:</p>
                            <p>{produto.categoria?.nome || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t("estoque")}:</p>
                            <p>{produto.quantidade || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t("quantidadeMinima")}:</p>
                            <p>{produto.quantidadeMin || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t("catalogo")}:</p>
                            <p>{produto.noCatalogo ? t("sim") : t("nao")}</p>
                          </div>
                        </div>
                        {produto.descricao && (
                          <div className="mt-2">
                            <p className="font-semibold">{t("descricao")}:</p>
                            <p>{produto.descricao}</p>
                          </div>
                        )}
                        <div className="mt-3 flex justify-end gap-2">
                          {podeEditar && (
                            <button
                              onClick={() => {
                                setModalVisualizar(produto);
                                setForm(produto);
                              }}
                              className="px-3 cursor-pointer  py-1 text-sm rounded border"
                              style={{
                                backgroundColor: temaAtual.primario,
                                borderColor: temaAtual.primario,
                                color: "#FFFFFF",
                              }}
                            >
                              {t("editar")}
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

        {(modalAberto || modalVisualizar) && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
            <div
              className="p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: temaAtual.card,
                color: temaAtual.texto,
                border: `1px solid ${temaAtual.borda}`
              }}
            >
              <h2 className="text-xl font-bold mb-4">
                {modalVisualizar ? t("editarProduto") : t("novoProduto")}
              </h2>

              <div className="mb-3">
                <label className="block mb-1 text-sm">
                  {t("nome")} <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder={t("nome")}
                  value={form.nome || ""}
                  onChange={handleNomeChange}
                  className="w-full rounded p-2 mb-3"
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

              <div className="mb-3">
                <label className="block mb-1 text-sm">
                  {t("descricao")} <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder={t("descricao")}
                  value={form.descricao || ""}
                  onChange={handleDescricaoChange}
                  className="w-full rounded p-2 mb-3"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  maxLength={255}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {descricaoCaracteres}/255 {descricaoCaracteres === 255 && " - Limite atingido"}
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <label className="block mb-1 text-sm">{t("preco")}</label>
                  <input
                    placeholder={t("preco")}
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.preco || ""}
                    onChange={(e) => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded p-2 mb-3"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`
                    }}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                  />
                </div>
              </div>

              {modalVisualizar ? (
                <>
                  <div className="flex gap-2 w-full items-end">
                    {podeGerenciarEstoque && (
                      <div className="flex-1">
                        <label className="block mb-1 text-sm">{t("estoque")}</label>
                        <div className="w-full">
                          <MovimentacaoEstoqueModal
                            produto={{
                              id: modalVisualizar.id,
                              nome: modalVisualizar.nome,
                              quantidade: modalVisualizar.quantidade
                            }}
                            modoDark={modoDark}
                            empresaId={empresaId!}
                            onMovimentacaoConcluida={recarregarListaProdutos}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <label className="text-sm">
                          {t("quantidadeMinima")} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative inline-flex items-center group">
                          <FaQuestionCircle
                            className="text-gray-400 hover:text-blue-500 cursor-help transition-colors"
                            size={14}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                setShowTooltip(!showTooltip);
                              }
                            }}
                          />

                          <div
                            className="hidden md:block absolute invisible group-hover:visible right-full -top-3 mr-3 w-64 p-4 rounded shadow-lg z-[60] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                            style={{
                              backgroundColor: modoDark ? "#1E293B" : "#FFFFFF",
                              color: modoDark ? "#FFFFFF" : "#1E293B",
                              border: `1px solid ${modoDark ? "#334155" : "#E2E8F0"}`,
                              top: "auto",
                              bottom: "100%",
                              marginBottom: "8px"
                            }}
                          >
                            <div className="text-sm font-medium mb-1 text-center">💡 {t("quantidadeMinima")}</div>
                            <div className="text-xs leading-tight text-center">
                              {t("quantidadeMinimaTooltip")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {showTooltip && window.innerWidth < 768 && (
                        <div
                          className="fixed inset-0 flex items-center justify-center z-[70] md:hidden"
                          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                          onClick={() => setShowTooltip(false)}
                        >
                          <div
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 mx-4 max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-sm font-medium mb-2 text-center text-gray-900 dark:text-white">
                              💡 {t("quantidadeMinima")}
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 text-center mb-3">
                              {t("quantidadeMinimaTooltip")}
                            </div>
                            <div className="flex justify-center">
                              <button
                                onClick={() => setShowTooltip(false)}
                                className="w-30 items-center py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                              >
                                Fechar
                              </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <input
                      placeholder={t("quantidadeMinima")}
                      type="number"
                      min={0}
                      value={form.quantidadeMin || ""}
                      onChange={(e) => setForm({ ...form, quantidadeMin: Number(e.target.value) })}
                      className="rounded p-2"
                      style={{
                        backgroundColor: temaAtual.card,
                        color: temaAtual.texto,
                        border: `1px solid ${temaAtual.borda}`
                      }}
                      disabled={Boolean(!podeEditar && modalVisualizar)}
                    />
                  </div>
                </div>

                {podeEditar && (
                  <div className="mt-3">
                    <label className="block mb-1 text-sm">{t("foto")}</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-10 py-2 cursor-pointer rounded border text-sm flex items-center justify-center gap-2 h-[42px]"
                      style={{
                        backgroundColor: temaAtual.primario,
                        color: "#FFFFFF",
                        borderColor: temaAtual.primario,
                        maxWidth: '400px' 
                      }}
                      disabled={isUploading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
              </>
            ) : (
              <div className="flex gap-2 w-full items-end">
                <div className="flex-1">
                  {podeEditar && (
                    <>
                      <label className="block mb-1 text-sm">{t("foto")}</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-2 cursor-pointer rounded border text-sm flex items-center justify-center gap-2 h-[42px]"
                        style={{
                          backgroundColor: temaAtual.primario,
                          color: "#FFFFFF",
                          borderColor: temaAtual.primario,
                        }}
                        disabled={isUploading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-sm">
                      {t("quantidadeMinima")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative inline-flex items-center group">
                      <FaQuestionCircle
                        className="text-gray-400 hover:text-blue-500 cursor-help transition-colors"
                        size={14}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setShowTooltip(!showTooltip);
                          }
                        }}
                      />

                      <div
                        className="hidden md:block absolute invisible group-hover:visible right-full -top-3 mr-3 w-64 p-4 rounded shadow-lg z-[60] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{
                          backgroundColor: modoDark ? "#1E293B" : "#FFFFFF",
                          color: modoDark ? "#FFFFFF" : "#1E293B",
                          border: `1px solid ${modoDark ? "#334155" : "#E2E8F0"}`,
                          top: "auto",
                          bottom: "100%",
                          marginBottom: "8px"
                        }}
                      >
                        <div className="text-sm font-medium mb-1 text-center">💡 {t("quantidadeMinima")}</div>
                        <div className="text-xs leading-tight text-center">
                          {t("quantidadeMinimaTooltip")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {showTooltip && window.innerWidth < 768 && (
                    <div
                      className="fixed inset-0 flex items-center justify-center z-[70] md:hidden"
                      style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                      onClick={() => setShowTooltip(false)}
                    >
                      <div
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 mx-4 max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-sm font-medium mb-2 text-center text-gray-900 dark:text-white">
                          💡 {t("quantidadeMinima")}
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 text-center mb-3">
                          {t("quantidadeMinimaTooltip")}
                        </div>
                        <div className="flex justify-center">
                          <button
                            onClick={() => setShowTooltip(false)}
                            className="w-30 items-center py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                          >
                            Fechar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    placeholder={t("quantidadeMinima")}
                    type="number"
                    min={0}
                    value={form.quantidadeMin || ""}
                    onChange={(e) => setForm({ ...form, quantidadeMin: Number(e.target.value) })}
                    className="w-full rounded p-2"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`
                    }}
                  />
                </div>
              </div>
            )}

            {(preview || form.foto) && (
              <div className="mt-4 mb-4">
                <img
                  src={preview || form.foto || ""}
                  alt="Preview"
                  className="w-20 h-20 md:w-44 md:h-44 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/out.jpg";
                  }}
                />
              </div>
            )}

            <div className="flex gap-2 mb-3 mt-4">
              <select
                value={form.fornecedorId || ""}
                onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}
                className="w-full rounded cursor-pointer p-2"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                disabled={Boolean(!podeEditar && modalVisualizar)}
              >
                <option value="">{t("selecionarFornecedor")}</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
              <select
                value={form.categoriaId || ""}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                className="w-full cursor-pointer rounded p-2"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                disabled={Boolean(!podeEditar && modalVisualizar)}
              >
                <option value="">{t("selecionarCategoria")}</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between mt-4">
              <div>
                {modalVisualizar && podeExcluir && (
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 cursor-pointer rounded border"
                    style={{
                      backgroundColor: "#F87171",
                      borderColor: "#F87171",
                      color: "#fff"
                    }}
                  >
                    {t("excluir")}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setModalVisualizar(null);
                  }}
                  className="px-4 cursor-pointer  py-2 rounded border"
                  style={{
                    borderColor: temaAtual.borda,
                    color: temaAtual.texto,
                  }}
                >
                  {t("cancelar")}
                </button>

                {(podeCriar && !modalVisualizar) && (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 cursor-pointer rounded text-white"
                    style={{ backgroundColor: temaAtual.primario }}
                    disabled={isUploading}
                  >
                    {isUploading ? t("enviando") : t("salvar")}
                  </button>
                )}

                {(podeEditar && modalVisualizar) && (
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 rounded cursor-pointer text-white"
                    style={{ backgroundColor: temaAtual.primario }}
                    disabled={isUploading}
                  >
                    {isUploading ? t("enviando") : t("atualizar")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
  )
}     </div>
    </div>
  );
}
