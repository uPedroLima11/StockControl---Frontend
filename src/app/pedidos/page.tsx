"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch, FaPlus, FaEnvelope, FaClock, FaCheck, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import { CriarModal } from "./../../components/CriarModal";
import { Tema, Fornecedor, Produto, Pedido, ItemPedidoCriacao, Permissao } from "../../utils/types/index";
import { useRouter } from "next/navigation";

export default function PedidosPage() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
    const [empresaId, setEmpresaId] = useState<string | null>(null);
    const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalTipo, setModalTipo] = useState<'criar' | 'detalhes' | 'enviarEmail'>('criar');
    const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
    const [modoDark, setModoDark] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
    const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
    const { t } = useTranslation("pedidos");
    const [enviandoEmail, setEnviandoEmail] = useState<Record<string, boolean>>({});
    const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    const [empresa, setEmpresa] = useState<{ id: string, nome: string, email: string, telefone?: string } | null>(null);
    const router = useRouter();

    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 3;

    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>("");
    const [itensCriacao, setItensCriacao] = useState<ItemPedidoCriacao[]>([]);
    const [observacoesCriacao, setObservacoesCriacao] = useState("");
    const [buscaProduto, setBuscaProduto] = useState("");
    const [carregandoCriacao, setCarregandoCriacao] = useState(false);

    const [observacoesEmail, setObservacoesEmail] = useState("");

    const [quantidadesAtendidas, setQuantidadesAtendidas] = useState<Record<string, number>>({});

    const temas: { dark: Tema; light: Tema } = {
        dark: {
            fundo: "#0A1929",
            texto: "#FFFFFF",
            card: "#132F4C",
            borda: "#1E4976",
            primario: "#1976D2",
            secundario: "#00B4D8",
        },
        light: {
            fundo: "#cccccc",
            texto: "#0F172A",
            card: "#FFFFFF",
            borda: "#E2E8F0",
            primario: "#1976D2",
            secundario: "#0284C7",
        }
    };

    const temaAtual = modoDark ? temas.dark : temas.light;

    const verificarAtivacaoEmpresa = async (empresaId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`);
            if (!response.ok) return false;

            const empresaData = await response.json();
            return empresaData.ChaveAtivacao !== null && empresaData.ChaveAtivacao !== undefined;
        } catch (error) {
            console.error("Erro ao verificar ativação:", error);
            return false;
        }
    };

    const mostrarAlertaNaoAtivada = () => {
        Swal.fire({
            title: t("alerta.titulo") || "Empresa Não Ativada",
            text: t("alerta.mensagem") || "Sua empresa precisa ser ativada para acessar esta funcionalidade.",
            icon: "warning",
            confirmButtonText: t("alerta.botao") || "Ativar Empresa",
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

    const formatarData = (data: Date | string): string => {
        if (!data) return 'Data inválida';

        try {
            const dataObj = typeof data === 'string' ? new Date(data) : data;
            const dataAjustada = new Date(dataObj.getTime() + dataObj.getTimezoneOffset() * 60000);

            return dataAjustada.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Erro ao formatar data:', error, data);
            return 'Data inválida';
        }
    };

    const indexUltimoItem = paginaAtual * itensPorPagina;
    const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
    const itensAtuais = pedidosFiltrados.slice(indexPrimeiroItem, indexUltimoItem);
    const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);

    const mudarPagina = (numeroPagina: number) => {
        setPaginaAtual(numeroPagina);
    };

    const carregarDadosUsuario = useCallback(async () => {
        try {
            const usuarioSalvo = localStorage.getItem("client_key");
            if (!usuarioSalvo) return;

            const usuarioValor = usuarioSalvo.replace(/"/g, "");
            const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);

            if (responseUsuario.ok) {
                const usuario = await responseUsuario.json();
                setEmpresaId(usuario.empresaId);
                setTipoUsuario(usuario.tipo);
                carregarPermissoes(usuarioValor);

                if (usuario.empresaId) {
                    const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
                    setEmpresaAtivada(ativada);
                    if (ativada) {
                        carregarPedidos(usuario.empresaId);
                    }
                }

                const responseEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${usuario.empresaId}`);
                if (responseEmpresa.ok) {
                    const empresaData = await responseEmpresa.json();
                    setEmpresa(empresaData);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
        }
    }, []);

    const carregarPermissoes = async (usuarioId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/permissoes`);

            if (response.ok) {
                const dados = await response.json();
                const permissoesObj: Record<string, boolean> = {};
                dados.permissoes.forEach((permissao: Permissao) => {
                    permissoesObj[permissao.chave] = permissao.concedida;
                });
                setPermissoesUsuario(permissoesObj);
            }
        } catch (error) {
            console.error("Erro ao carregar permissões:", error);
        }
    };

    const carregarPedidos = async (empresaId: string) => {
        try {
            setCarregando(true);
            const usuarioSalvo = localStorage.getItem("client_key");
            if (!usuarioSalvo) return;

            const usuarioValor = usuarioSalvo.replace(/"/g, "");

            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/empresa/${empresaId}`, {
                headers: {
                    'user-id': usuarioValor
                }
            });

            if (response.ok) {
                const pedidosData = await response.json();
                setPedidos(pedidosData);
            } else {
                console.error('Erro ao carregar pedidos:', response.status);
            }
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
        } finally {
            setCarregando(false);
        }
    };

    const carregarFornecedores = async () => {
        try {
            if (!empresaId) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/empresa/${empresaId}`);
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
            if (!empresaId) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/empresa/${empresaId}`);
            if (response.ok) {
                const produtosData = await response.json();
                setProdutos(produtosData);
            }
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
        }
    };

    const filtrarPedidos = useCallback(() => {
        let filtrados = pedidos;

        if (filtroStatus !== "TODOS") {
            filtrados = filtrados.filter(pedido => pedido.status === filtroStatus);
        }

        if (busca) {
            const termo = busca.toLowerCase();
            filtrados = filtrados.filter(pedido =>
                pedido.numero.toLowerCase().includes(termo) ||
                pedido.fornecedor.nome.toLowerCase().includes(termo) ||
                pedido.itens.some(item => item.produto.nome.toLowerCase().includes(termo))
            );
        }

        setPedidosFiltrados(filtrados);
    }, [busca, filtroStatus, pedidos]);

    useEffect(() => {
        const temaSalvo = localStorage.getItem("modoDark");
        setModoDark(temaSalvo === "true");
        carregarDadosUsuario();
    }, [carregarDadosUsuario]);

    useEffect(() => {
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
        filtrarPedidos();
    }, [filtrarPedidos]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [pedidosFiltrados]);

    const podeCriarPedido = (tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_criar) && empresaAtivada;
    const podeEditarPedido = (tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_editar) && empresaAtivada;
    const podeGerenciarStatus = (tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_gerenciar_status) && empresaAtivada;
    const podeVisualizarPedidos = (tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_visualizar) && empresaAtivada;
    const podeEnviarEmail = (tipoUsuario === "PROPRIETARIO" || permissoesUsuario.pedidos_criar) && empresaAtivada;

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDENTE':
                return { cor: 'text-yellow-500', icone: <FaClock />, texto: t("status.pendente") };
            case 'PROCESSANDO':
                return { cor: 'text-blue-500', icone: <FaEye />, texto: t("status.processando") };
            case 'CONCLUIDO':
                return { cor: 'text-green-500', icone: <FaCheck />, texto: t("status.concluido") };
            case 'CANCELADO':
                return { cor: 'text-red-500', icone: <FaTimes />, texto: t("status.cancelado") };
            default:
                return { cor: 'text-gray-500', icone: <FaClock />, texto: status };
        }
    };

    const handleAtualizarStatus = async (pedidoId: string, novoStatus: string) => {
        handleAcaoProtegida(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/${pedidoId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': localStorage.getItem("client_key")?.replace(/"/g, "") || ''
                    },
                    body: JSON.stringify({ status: novoStatus })
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: t("statusAtualizadoSucesso"),
                        timer: 1500
                    });
                    carregarPedidos(empresaId!);
                }
            } catch (error) {
                console.error("Erro ao atualizar status:", error);
                Swal.fire({
                    icon: 'error',
                    title: t("erroAtualizarStatus")
                });
            }
        });
    };

    const handleConcluirPedidoComEstoque = async (pedidoId: string) => {
        handleAcaoProtegida(async () => {
            try {
                const usuarioId = localStorage.getItem("client_key")?.replace(/"/g, "") || '';

                const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/${pedidoId}/concluir-com-estoque`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': usuarioId
                    },
                    body: JSON.stringify({
                        quantidadesRecebidas: quantidadesAtendidas
                    })
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: t("pedidoConcluidoComEstoque"),
                        text: t("estoqueAtualizadoSucesso"),
                        timer: 2000
                    });
                    setQuantidadesAtendidas({});
                    carregarPedidos(empresaId!);
                    setModalAberto(false);
                } else {
                    throw new Error('Erro ao concluir pedido com estoque');
                }
            } catch (error) {
                console.error("Erro ao concluir pedido com estoque:", error);
                Swal.fire({
                    icon: 'error',
                    title: t("erroConcluirPedidoEstoque")
                });
            }
        });
    };

    const handleEnviarEmail = async (pedido: Pedido, observacoesPersonalizadas?: string) => {
        handleAcaoProtegida(async () => {
            setEnviandoEmail(prev => ({ ...prev, [pedido.id]: true }));

            try {
                if (!N8N_WEBHOOK_URL) {
                    throw new Error('Serviço de email não configurado');
                }

                const dataFormatada = formatarData(pedido.dataSolicitacao);

                const emailData = {
                    action: "enviar_email_pedido",
                    remetente_nome: empresa?.nome || "Sua Empresa",
                    remetente_email: empresa?.email || "empresa@email.com",
                    empresa_nome: empresa?.nome || "Nome da Empresa",
                    empresa_telefone: empresa?.telefone || "(00) 00000-0000",

                    destinatario: pedido.fornecedor.email,
                    fornecedor_nome: pedido.fornecedor.nome,

                    pedido_id: pedido.id,
                    pedido_numero: pedido.numero,
                    assunto: `Pedido ${pedido.numero} - ${pedido.fornecedor.nome}`,
                    total: pedido.total,
                    data: dataFormatada,
                    observacoes: observacoesPersonalizadas || pedido.observacoes || 'Nenhuma',

                    itens: pedido.itens.map(item => ({
                        produto: item.produto.nome,
                        quantidade: item.quantidadeSolicitada,
                        preco_unitario: item.precoUnitario,
                        total_item: (item.quantidadeSolicitada * item.precoUnitario),
                        observacao: item.observacao || ''
                    }))
                };

                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Erro no serviço de email: ${response.status} - ${errorText}`);
                }

                try {
                    await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/${pedido.id}/registrar-email`, {
                        method: 'POST',
                        headers: {
                            'user-id': localStorage.getItem("client_key")?.replace(/"/g, "") || ''
                        }
                    });
                } catch (error) {
                    console.warn("Erro ao registrar email no log:", error);
                }

                Swal.fire({
                    icon: 'success',
                    title: t("emailEnviadoSucesso"),
                    html: t("emailEnviadoPara", { email: pedido.fornecedor.email }),
                    timer: 3000
                });

            } catch (error) {
                console.error("Erro ao enviar email:", error);
                Swal.fire({
                    icon: 'error',
                    title: t("erroEnviarEmail"),
                    text: error instanceof Error ? error.message : 'Erro ao enviar email'
                });
            } finally {
                setEnviandoEmail(prev => ({ ...prev, [pedido.id]: false }));
            }
        });
    };

    const handleAbrirModalEmail = (pedido: Pedido) => {
        handleAcaoProtegida(() => {
            setPedidoSelecionado(pedido);
            setObservacoesEmail(pedido.observacoes || "");
            setModalTipo('enviarEmail');
            setModalAberto(true);
        });
    };

    const handleEnviarEmailComObservacoes = async () => {
        if (!pedidoSelecionado) return;
        await handleEnviarEmail(pedidoSelecionado, observacoesEmail);
        setModalAberto(false);
    };

    const handleAbrirModalDetalhes = (pedido: Pedido) => {
        setPedidoSelecionado(pedido);
        setQuantidadesAtendidas({});
        pedido.itens.forEach(item => {
            setQuantidadesAtendidas(prev => ({
                ...prev,
                [item.id]: item.quantidadeAtendida
            }));
        });
        setModalTipo('detalhes');
        setModalAberto(true);
    };

    const handleAbrirModalCriacao = () => {
        handleAcaoProtegida(() => {
            setModalTipo('criar');
            setModalAberto(true);
            carregarFornecedores();
            carregarProdutos();
            setFornecedorSelecionado("");
            setItensCriacao([]);
            setObservacoesCriacao("");
            setBuscaProduto("");
        });
    };

    const adicionarItem = (produto: Produto) => {
        const itemExistente = itensCriacao.find(item => item.produtoId === produto.id);

        if (itemExistente) {
            setItensCriacao(itensCriacao.map(item =>
                item.produtoId === produto.id
                    ? { ...item, quantidade: item.quantidade + 1 }
                    : item
            ));
        } else {
            setItensCriacao([
                ...itensCriacao,
                {
                    produtoId: produto.id,
                    produto: produto,
                    quantidade: 1,
                    precoUnitario: produto.preco,
                    observacao: ""
                }
            ]);
        }
    };

    const removerItem = (produtoId: number) => {
        setItensCriacao(itensCriacao.filter(item => item.produtoId !== produtoId));
    };

    const atualizarQuantidade = (produtoId: number, quantidade: number) => {
        if (quantidade < 1) return;

        setItensCriacao(itensCriacao.map(item =>
            item.produtoId === produtoId
                ? { ...item, quantidade }
                : item
        ));
    };

    const atualizarObservacao = (produtoId: number, observacao: string) => {
        setItensCriacao(itensCriacao.map(item =>
            item.produtoId === produtoId
                ? { ...item, observacao }
                : item
        ));
    };

    const calcularTotal = () => {
        return itensCriacao.reduce((total, item) => total + (item.precoUnitario * item.quantidade), 0);
    };

    const handleCriarPedido = async () => {
        handleAcaoProtegida(async () => {
            if (!fornecedorSelecionado) {
                Swal.fire({
                    icon: 'error',
                    title: t("erroFornecedorNaoSelecionado")
                });
                return;
            }

            if (itensCriacao.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: t("erroNenhumItem")
                });
                return;
            }

            setCarregandoCriacao(true);

            try {
                const usuarioSalvo = localStorage.getItem("client_key");
                if (!usuarioSalvo) return;

                const usuarioValor = usuarioSalvo.replace(/"/g, "");

                const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': usuarioValor
                    },
                    body: JSON.stringify({
                        fornecedorId: fornecedorSelecionado,
                        itens: itensCriacao.map(item => ({
                            produtoId: item.produtoId,
                            quantidade: item.quantidade,
                            precoUnitario: item.precoUnitario,
                            observacao: item.observacao
                        })),
                        observacoes: observacoesCriacao,
                        empresaId: empresaId
                    })
                });

                if (response.ok) {
                    const pedidoCriado = await response.json();

                    const fornecedor = fornecedores.find(f => f.id === fornecedorSelecionado);
                    if (fornecedor) {
                        await handleEnviarEmail({
                            ...pedidoCriado.pedido,
                            fornecedor: {
                                id: fornecedor.id,
                                nome: fornecedor.nome,
                                email: fornecedor.email
                            },
                            itens: itensCriacao.map(item => ({
                                id: `temp-${item.produtoId}`,
                                produtoId: item.produtoId,
                                produto: {
                                    nome: item.produto.nome,
                                    foto: item.produto.foto
                                },
                                quantidadeSolicitada: item.quantidade,
                                quantidadeAtendida: 0,
                                precoUnitario: item.precoUnitario,
                                observacao: item.observacao
                            })),
                            usuario: {
                                nome: "Usuário atual"
                            },
                            dataSolicitacao: new Date().toISOString(),
                            observacoes: observacoesCriacao
                        } as Pedido, observacoesCriacao);
                    }

                    Swal.fire({
                        icon: 'success',
                        title: t("pedidoCriadoSucesso"),
                        timer: 1500
                    });

                    setModalAberto(false);
                    carregarPedidos(empresaId!);
                } else {
                    throw new Error('Erro ao criar pedido');
                }
            } catch (error) {
                console.error("Erro ao criar pedido:", error);
                Swal.fire({
                    icon: 'error',
                    title: t("erroCriarPedido")
                });
            } finally {
                setCarregandoCriacao(false);
            }
        });
    };

    const handleAtualizarQuantidades = async () => {
        if (!pedidoSelecionado) return;

        handleAcaoProtegida(async () => {
            try {
                const itensParaAtualizar = Object.entries(quantidadesAtendidas).map(([itemId, quantidade]) => ({
                    itemId,
                    quantidadeAtendida: quantidade
                }));

                const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/pedidos/${pedidoSelecionado.id}/itens`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-id': localStorage.getItem("client_key")?.replace(/"/g, "") || ''
                    },
                    body: JSON.stringify({ itens: itensParaAtualizar })
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: t("quantidadesAtualizadasSucesso"),
                        timer: 1500
                    });
                    setQuantidadesAtendidas({});
                    carregarPedidos(empresaId!);
                }
            } catch (error) {
                console.error("Erro ao atualizar quantidades:", error);
                Swal.fire({
                    icon: 'error',
                    title: t("erroAtualizarQuantidades")
                });
            }
        });
    };

    const handlePreencherQuantidadesSolicitadas = () => {
        if (!pedidoSelecionado) return;

        const novasQuantidades: Record<string, number> = {};
        pedidoSelecionado.itens.forEach(item => {
            novasQuantidades[item.id] = item.quantidadeSolicitada;
        });

        setQuantidadesAtendidas(novasQuantidades);

        Swal.fire({
            icon: 'success',
            title: t("quantidadesPreenchidas"),
            text: t("quantidadesPreenchidasTexto"),
            timer: 1500
        });
    };

    if (!podeVisualizarPedidos && empresaId && !empresaAtivada) {
        return (
            <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo }}>
                <div className="w-full max-w-6xl">
                    <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: temaAtual.texto }}>
                        {t("titulo")}
                    </h1>
                    <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{
                        backgroundColor: temaAtual.primario + "20",
                        color: temaAtual.texto,
                        border: `1px solid ${temaAtual.borda}`
                    }}>
                        <FaLock className="text-xl" />
                        <div>
                            <p className="font-bold">{t("empresaNaoAtivada.titulo") || "Empresa Não Ativada"}</p>
                            <p>{t("empresaNaoAtivada.mensagem") || "Sua empresa precisa ser ativada para acessar esta funcionalidade."}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!podeVisualizarPedidos) {
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

    if (carregando) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: temaAtual.fundo }}>
                <div className="text-lg" style={{ color: temaAtual.texto }}>{t("carregando")}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: temaAtual.fundo }}>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-left" style={{ color: temaAtual.texto }}>
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
                            <p className="font-bold">{t("empresaNaoAtivada.titulo") || "Empresa Não Ativada"}</p>
                            <p>{t("empresaNaoAtivada.mensagem") || "Sua empresa precisa ser ativada para acessar esta funcionalidade."}</p>
                        </div>
                    </div>
                )}

                <div
                    className="flex flex-col md:flex-row gap-2 md:gap-1 mb-4 p-3 rounded-lg relative w-full md:w-auto"
                    style={{
                        backgroundColor: temaAtual.card,
                        border: `1px solid ${temaAtual.borda}`,
                        maxWidth: 700
                    }}
                >
                    <div className="flex-1 flex items-center border rounded-full px-3 py-1 h-10 mr-2" style={{ borderColor: temaAtual.borda, maxWidth: 320 }}>
                        <input
                            type="text"
                            placeholder={t("buscarPedidos")}
                            className="outline-none bg-transparent placeholder-gray-400 flex-1 text-sm"
                            style={{ color: temaAtual.texto }}
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                        <FaSearch className="ml-2" style={{ color: temaAtual.primario }} />
                    </div>
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="p-1.5 cursor-pointer rounded border text-sm mr-2 min-w-[140px]"
                        style={{
                            backgroundColor: temaAtual.card,
                            borderColor: temaAtual.borda,
                            color: temaAtual.texto,
                        }}
                    >
                        <option value="TODOS">{t("todosStatus")}</option>
                        <option value="PENDENTE">{t("status.pendente")}</option>
                        <option value="PROCESSANDO">{t("status.processando")}</option>
                        <option value="CONCLUIDO">{t("status.concluido")}</option>
                        <option value="CANCELADO">{t("status.cancelado")}</option>
                    </select>
                    {podeCriarPedido && (
                        <button
                            onClick={handleAbrirModalCriacao}
                            className="px-2 py-1 cursor-pointer rounded-lg flex items-center gap-2 text-sm whitespace-nowrap transition-transform duration-150 hover:scale-105 hover:brightness-110"
                            style={{
                                backgroundColor: temaAtual.primario,
                                color: "#FFFFFF"
                            }}
                        >
                            <FaPlus /> {t("novoPedido")}
                        </button>
                    )}
                    {totalPaginas > 1 && (
                        <div className="flex items-center ml-0 md:ml-2">
                            <div className="flex items-center gap-2 bg-gray-800/60 backdrop-blur-md rounded-lg p-1 border border-gray-700/30">
                                <button
                                    onClick={() => mudarPagina(paginaAtual - 1)}
                                    disabled={paginaAtual === 1}
                                    className={`p-1 rounded-full cursor-pointer ${paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                                    style={{ color: temaAtual.texto }}
                                >
                                    <FaChevronLeft />
                                </button>

                                <span className="text-sm font-mono" style={{ color: temaAtual.texto }}>
                                    {paginaAtual}/{totalPaginas}
                                </span>

                                <button
                                    onClick={() => mudarPagina(paginaAtual + 1)}
                                    disabled={paginaAtual === totalPaginas}
                                    className={`p-1 rounded-full cursor-pointer ${paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                                    style={{ color: temaAtual.texto }}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {itensAtuais.length === 0 ? (
                        <div className="text-center py-8" style={{ color: temaAtual.texto }}>
                            {t("nenhumPedidoEncontrado")}
                        </div>
                    ) : (
                        itensAtuais.map((pedido) => {
                            const statusInfo = getStatusInfo(pedido.status);
                            return (
                                <div
                                    key={pedido.id}
                                    className="p-4 rounded-lg shadow-md"
                                    style={{
                                        backgroundColor: temaAtual.card,
                                        border: `1px solid ${temaAtual.borda}`,
                                        borderLeft: `4px solid ${statusInfo.cor.replace('text-', '').split('-')[0]}-500`
                                    }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-lg font-semibold ${statusInfo.cor}`}>
                                                    {statusInfo.icone} {pedido.numero}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs ${statusInfo.cor}`}>
                                                    {statusInfo.texto}
                                                </span>
                                                <span
                                                    className="px-2 py-1 rounded text-xs"
                                                    style={{
                                                        backgroundColor: temaAtual.primario + '20',
                                                        color: temaAtual.texto,
                                                        border: `1px solid ${temaAtual.primario}`
                                                    }}
                                                >
                                                    {pedido.itens.reduce((total, item) => total + item.quantidadeSolicitada, 0)} {t("unidades")}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                <div style={{ color: modoDark ? "#FFFFFF" : "#000000" }}>
                                                    <strong>{t("fornecedor")}:</strong> {pedido.fornecedor.nome}
                                                </div>
                                                <div style={{ color: modoDark ? "#FFFFFF" : "#000000" }}>
                                                    <strong>{t("dataSolicitacao")}:</strong> {formatarData(pedido.dataSolicitacao)}
                                                </div>
                                                <div style={{ color: modoDark ? "#FFFFFF" : "#000000" }}>
                                                    <strong>{t("total")}:</strong> R$ {pedido.total.toFixed(2)}
                                                </div>
                                                <div style={{ color: modoDark ? "#FFFFFF" : "#000000" }}>
                                                    <strong>{t("itens")}:</strong> {pedido.itens.length} {t("produtos")}
                                                </div>
                                                <div style={{ color: modoDark ? "#FFFFFF" : "#000000" }}>
                                                    <strong>{t("solicitante")}:</strong> {pedido.usuario.nome}
                                                </div>
                                                <div style={{ color: modoDark ? "#FFFFFF" : "#000000" }}>
                                                    <strong>{t("valorMedio")}:</strong> R$ {(pedido.total / pedido.itens.reduce((sum, item) => sum + item.quantidadeSolicitada, 0)).toFixed(2)}
                                                </div>
                                            </div>

                                            {pedido.observacoes && (
                                                <div className="mt-2 text-sm" style={{ color: modoDark ? "#FFFFFF" : "#000000" }}>
                                                    <strong>{t("observacoes")}:</strong> {pedido.observacoes}
                                                </div>
                                            )}

                                            <div className="mt-3">
                                                <div className="text-sm font-medium mb-1" style={{ color: modoDark ? "#FFFFFF" : "#000000" }}>
                                                    {t("produtos")}:
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {pedido.itens.slice(0, 3).map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 rounded text-xs"
                                                            style={{
                                                                backgroundColor: temaAtual.primario + '20',
                                                                color: temaAtual.texto,
                                                                border: `1px solid ${temaAtual.primario}`
                                                            }}
                                                        >
                                                            {item.produto.nome} ({item.quantidadeSolicitada})
                                                        </span>
                                                    ))}
                                                    {pedido.itens.length > 3 && (
                                                        <span
                                                            className="px-2 py-1 rounded text-xs"
                                                            style={{
                                                                backgroundColor: temaAtual.secundario + '20',
                                                                color: temaAtual.texto,
                                                                border: `1px solid ${temaAtual.secundario}`
                                                            }}
                                                        >
                                                            +{pedido.itens.length - 3} {t("maisItens")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleAbrirModalDetalhes(pedido)}
                                                className="px-3 py-1 cursor-pointer rounded flex items-center gap-1 text-sm"
                                                style={{
                                                    backgroundColor: temaAtual.primario,
                                                    color: "#FFFFFF"
                                                }}
                                            >
                                                <FaEye /> {t("detalhes")}
                                            </button>

                                            <button
                                                onClick={() => handleAbrirModalEmail(pedido)}
                                                disabled={pedido.status === 'CONCLUIDO' || pedido.status === 'CANCELADO' || enviandoEmail[pedido.id] || !podeEnviarEmail}
                                                className={`px-3 py-1 rounded flex items-center gap-1 text-sm ${
                                                    (pedido.status === 'CONCLUIDO' || pedido.status === 'CANCELADO' || enviandoEmail[pedido.id] || !podeEnviarEmail)
                                                        ? ''
                                                        : 'cursor-pointer'
                                                }`}
                                                style={{
                                                    backgroundColor: temaAtual.secundario,
                                                    color: "#FFFFFF",
                                                    opacity: (pedido.status === 'CONCLUIDO' || pedido.status === 'CANCELADO' || enviandoEmail[pedido.id] || !podeEnviarEmail) ? 0.6 : 1,
                                                    cursor: !podeEnviarEmail || pedido.status === 'CONCLUIDO' || pedido.status === 'CANCELADO' || enviandoEmail[pedido.id] ? "not-allowed" : "pointer"
                                                }}
                                                title={
                                                    !podeEnviarEmail
                                                        ? t("semPermissaoEnviarEmail") || "Você não tem permissão para Enviar Email"
                                                        : (pedido.status === 'CONCLUIDO' || pedido.status === 'CANCELADO')
                                                            ? t("naoPodeEnviarEmailStatus") || "Não é possível enviar email para pedidos concluídos ou cancelados"
                                                            : undefined
                                                }
                                            >
                                                {enviandoEmail[pedido.id] ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                ) : (
                                                    <FaEnvelope />
                                                )}
                                                {enviandoEmail[pedido.id] ? t("enviandoEmail") : t("enviarEmail")}
                                            </button>

                                            {podeGerenciarStatus && pedido.status !== 'CONCLUIDO' && pedido.status !== 'CANCELADO' && (
                                                <div className="flex gap-1 flex-wrap">
                                                    {['PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'CANCELADO'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleAtualizarStatus(pedido.id, status)}
                                                            className={`px-2 cursor-pointer py-1 rounded text-xs ${pedido.status === status
                                                                ? status === 'CANCELADO'
                                                                    ? 'bg-red-500 text-white'
                                                                    : 'bg-gray-500 text-white'
                                                                : status === 'CANCELADO'
                                                                    ? 'bg-red-200 text-red-700 hover:bg-red-300 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                                }`}
                                                        >
                                                            {t(`status.${status.toLowerCase()}`)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {pedido.status === 'CANCELADO' && (
                                                <div className="px-4 py-2 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                                    <FaTimes className="inline mr-2" />
                                                    {t("pedidoCancelado")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {modalAberto && modalTipo === 'enviarEmail' && pedidoSelecionado && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0, 0, 0, 0.75)" }}>
                    <div
                        className="p-6 rounded-lg shadow-xl w-full max-w-2xl"
                        style={{
                            backgroundColor: temaAtual.card,
                            color: temaAtual.texto,
                            border: `1px solid ${temaAtual.borda}`
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">{t("enviarEmail")} - {pedidoSelecionado.numero}</h2>
                            <button onClick={() => setModalAberto(false)} className="text-gray-500 cursor-pointer hover:text-gray-700">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">{t("observacoesEmail")}</label>
                            <textarea
                                value={observacoesEmail}
                                onChange={(e) => setObservacoesEmail(e.target.value)}
                                rows={4}
                                className="w-full p-2 rounded border"
                                style={{
                                    backgroundColor: temaAtual.card,
                                    borderColor: temaAtual.borda,
                                    color: temaAtual.texto
                                }}
                                placeholder={t("observacoesEmailPlaceholder")}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setModalAberto(false)}
                                className="px-4 cursor-pointer py-2 rounded border"
                                style={{
                                    borderColor: temaAtual.borda,
                                    color: temaAtual.texto
                                }}
                            >
                                {t("cancelar")}
                            </button>

                            <button
                                onClick={handleEnviarEmailComObservacoes}
                                disabled={enviandoEmail[pedidoSelecionado.id]}
                                className="px-4 cursor-pointer py-2 rounded text-white flex items-center gap-2"
                                style={{
                                    backgroundColor: temaAtual.primario,
                                    opacity: enviandoEmail[pedidoSelecionado.id] ? 0.6 : 1
                                }}
                            >
                                {enviandoEmail[pedidoSelecionado.id] ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {t("enviandoEmail")}
                                    </>
                                ) : (
                                    <>
                                        <FaEnvelope />
                                        {t("enviarEmail")}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalAberto && modalTipo === 'criar' && (
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
                    onClose={() => setModalAberto(false)}
                />
            )}

            {modalAberto && modalTipo === 'detalhes' && pedidoSelecionado && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0, 0, 0, 0.75)" }}>
                    <div
                        className="p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        style={{
                            backgroundColor: temaAtual.card,
                            color: temaAtual.texto,
                            border: `1px solid ${temaAtual.borda}`
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">{t("detalhesPedido")} - {pedidoSelecionado.numero}</h2>
                            <button onClick={() => setModalAberto(false)} className="text-gray-500 hover:text-gray-700">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <h3 className="font-medium mb-2">{t("informacoesPedido")}</h3>
                                <div className="space-y-1 text-sm">
                                    <p><strong>{t("fornecedor")}:</strong> {pedidoSelecionado.fornecedor.nome}</p>
                                    <p><strong>{t("emailFornecedor")}:</strong> {pedidoSelecionado.fornecedor.email}</p>
                                    <p><strong>{t("status.titulo") || "Status"}:</strong> {t(`status.${pedidoSelecionado.status.toLowerCase()}`)}</p>
                                    <p><strong>{t("dataSolicitacao")}:</strong> {formatarData(pedidoSelecionado.dataSolicitacao)}</p>
                                    <p><strong>{t("ultimaAtualizacao")}:</strong> {formatarData(pedidoSelecionado.dataAtualizacao)}</p>
                                    <p><strong>{t("solicitante")}:</strong> {pedidoSelecionado.usuario.nome}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">{t("resumo")}</h3>
                                <div className="space-y-1 text-sm">
                                    <p><strong>{t("totalItens")}:</strong> {pedidoSelecionado.itens.length}</p>
                                    <p><strong>{t("totalSolicitado")}:</strong> {pedidoSelecionado.itens.reduce((sum, item) => sum + item.quantidadeSolicitada, 0)}</p>
                                    <p><strong>{t("totalAtendido")}:</strong> {pedidoSelecionado.itens.reduce((sum, item) => sum + item.quantidadeAtendida, 0)}</p>
                                    <p><strong>{t("valorTotal")}:</strong> R$ {pedidoSelecionado.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {pedidoSelecionado.observacoes && (
                            <div className="mb-6">
                                <h3 className="font-medium mb-2">{t("observacoes")}</h3>
                                <p className="p-3 rounded border" style={{ borderColor: temaAtual.borda }}>
                                    {pedidoSelecionado.observacoes}
                                </p>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="font-medium mb-3">{t("itensPedido")}</h3>
                            <div className="space-y-3">
                                {pedidoSelecionado.itens.map(item => (
                                    <div key={item.id} className="p-3 border rounded" style={{ borderColor: temaAtual.borda }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.produto.nome}</h4>
                                                <p className="text-sm">R$ {item.precoUnitario.toFixed(2)} {t("unidade")}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">R$ {(item.quantidadeSolicitada * item.precoUnitario).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                                            <div>
                                                <strong>{t("solicitado")}:</strong> {item.quantidadeSolicitada}
                                            </div>
                                            <div>
                                                <strong>{t("atendido")}:</strong> {item.quantidadeAtendida}
                                            </div>
                                            <div>
                                                <strong>{t("pendente")}:</strong> {item.quantidadeSolicitada - item.quantidadeAtendida}
                                            </div>
                                        </div>

                                        {item.observacao && (
                                            <div className="mt-2 text-sm mb-3">
                                                <strong>{t("observacao")}:</strong> {item.observacao}
                                            </div>
                                        )}

                                        {podeEditarPedido && pedidoSelecionado.status !== 'CONCLUIDO' && pedidoSelecionado.status !== 'CANCELADO' && (
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={item.quantidadeSolicitada}
                                                    placeholder={t("quantidadeRecebida")}
                                                    value={quantidadesAtendidas[item.id] || ''}
                                                    onChange={(e) => setQuantidadesAtendidas({
                                                        ...quantidadesAtendidas,
                                                        [item.id]: parseInt(e.target.value) || 0
                                                    })}
                                                    className="p-1 border rounded w-60"
                                                    style={{
                                                        backgroundColor: temaAtual.card,
                                                        borderColor: temaAtual.borda,
                                                        color: temaAtual.texto
                                                    }}
                                                />
                                                <span className="text-sm text-gray-500">/{item.quantidadeSolicitada}</span>

                                                <button
                                                    onClick={() => setQuantidadesAtendidas({
                                                        ...quantidadesAtendidas,
                                                        [item.id]: item.quantidadeSolicitada
                                                    })}
                                                    className="text-sm cursor-pointer text-blue-500 hover:text-blue-700"
                                                >
                                                    {t("preencherSolicitado")}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    setModalAberto(false);
                                }}
                                className="px-4 py-2 cursor-pointer rounded border"
                                style={{
                                    borderColor: temaAtual.borda,
                                    color: temaAtual.texto
                                }}
                            >
                                {t("fechar")}
                            </button>

                            {podeEditarPedido && pedidoSelecionado.status !== 'CONCLUIDO' && pedidoSelecionado.status !== 'CANCELADO' && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleAtualizarStatus(pedidoSelecionado.id, 'CANCELADO')}
                                        className="px-4 py-2 cursor-pointer rounded text-white bg-red-500 hover:bg-red-600"
                                    >
                                        <FaTimes className="inline mr-2" />
                                        {t("cancelarPedido")}
                                    </button>

                                    <button
                                        onClick={handlePreencherQuantidadesSolicitadas}
                                        className="px-4 cursor-pointer py-2 rounded text-white"
                                        style={{
                                            backgroundColor: temaAtual.secundario
                                        }}
                                    >
                                        {t("preencherTodasQuantidades")}
                                    </button>

                                    <button
                                        onClick={handleAtualizarQuantidades}
                                        className="px-4 py-2 cursor-pointer rounded text-white"
                                        style={{
                                            backgroundColor: temaAtual.primario
                                        }}
                                    >
                                        {t("salvarQuantidades")}
                                    </button>

                                    <button
                                        onClick={() => handleConcluirPedidoComEstoque(pedidoSelecionado.id)}
                                        className="px-4 py-2 rounded cursor-pointer text-white bg-green-600 hover:bg-green-700"
                                    >
                                        <FaCheck className="inline mr-2" />
                                        {t("concluirComEstoque")}
                                    </button>
                                </div>
                            )}

                            {pedidoSelecionado.status === 'CANCELADO' && (
                                <div className="px-4 py-2 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                    <FaTimes className="inline mr-2" />
                                    {t("pedidoCancelado")}
                                </div>
                            )}

                            {pedidoSelecionado.status === 'CONCLUIDO' && (
                                <div className="px-4 py-2 rounded bg-green-100 text-green-800">
                                    <FaCheck className="inline mr-2" />
                                    {t("pedidoConcluido")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}