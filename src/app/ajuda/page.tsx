"use client";

import { FaSearch, FaBook, FaLightbulb, FaExclamationTriangle, FaHome, FaPlus, FaBox, FaBell, FaBuilding, FaUsers, FaDollarSign, FaCheck, FaInfo, FaHistory, FaShoppingCart, FaKey, FaLink, FaUserShield, FaStore, FaLock, FaUserTag, FaTruck } from "react-icons/fa";
import { useState, useEffect, useRef, useMemo } from "react";
import { cores } from "@/utils/cores";
import Image from 'next/image';
import Fuse from 'fuse.js';
import React from 'react';

interface SearchableItem {
    id: string;
    title: string;
    parentTitle: string;
    parentTopicId: string;
    content: string;
    render: () => React.ReactNode;
}

interface FuseResult {
    item: SearchableItem;
    refIndex: number;
    score?: number;
}

export default function Ajuda() {
    const [modoDark, setModoDark] = useState(false);
    const [busca, setBusca] = useState("");
    const [topicoAtivo, setTopicoAtivo] = useState<string>("empresa");
    const [searchResults, setSearchResults] = useState<FuseResult[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const topicRefs = useRef<(HTMLDivElement | null)[]>([]);

    const temaAtual = modoDark ? cores.dark : cores.light;

    useEffect(() => {
        const temaSalvo = localStorage.getItem("modoDark");
        setModoDark(temaSalvo === "true");
    }, []);

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
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [searchRef]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTopicoAtivo(entry.target.id);
                    }
                });
            },
            { rootMargin: '-40% 0px -60% 0px' }
        );

        const currentRefs = topicRefs.current;
        currentRefs.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            currentRefs.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);

    const searchIndex: SearchableItem[] = useMemo(
        () => [
            {
                id: 'empresa',
                title: 'Gestão da Empresa',
                parentTitle: 'Gestão da Empresa',
                parentTopicId: 'empresa',
                content:
                    'Este módulo é o centro de comando do seu negócio. Define a identidade da empresa, gerencia acesso da equipe e funcionalidades.',
                render: () => (
                    <>Este módulo é o centro de comando do seu negócio. Define a identidade da empresa, gerencia acesso da equipe e funcionalidades.</>
                ),
            },
            {
                id: 'empresa-criacao',
                title: 'Criando sua Empresa',
                parentTitle: 'Gestão da Empresa',
                parentTopicId: 'empresa',
                content:
                    'O primeiro passo é registrar sua empresa. O criador se torna Proprietário com acesso total. O campo Domínio define o link do seu catálogo público.',
                render: () => (
                    <>
                        O primeiro passo é registrar sua empresa. O criador se torna <strong>Proprietário</strong> com acesso total. O campo Domínio define o link do seu catálogo público.
                    </>
                ),
            },
            {
                id: 'empresa-ativacao',
                title: 'Ativação do Sistema',
                parentTitle: 'Gestão da Empresa',
                parentTopicId: 'empresa',
                content:
                    'Para desbloquear funcionalidades, a empresa precisa ser ativada com uma chave de acesso na tela de Ativação.',
                render: () => (
                    <>
                        Para desbloquear funcionalidades, a empresa precisa ser ativada com uma chave de acesso na tela de <strong>Ativação</strong>.
                    </>
                ),
            },
            {
                id: 'empresa-catalogo',
                title: 'Catálogo Público e Dados da Empresa',
                parentTitle: 'Gestão da Empresa',
                parentTopicId: 'empresa',
                content:
                    'Na tela Empresa, você edita informações e gerencia seu catálogo público, sua vitrine online. O link é gerado a partir do domínio.',
                render: () => (
                    <>
                        Na tela <strong>&quot;Empresa&quot;</strong>, você edita informações e gerencia seu catálogo público, sua vitrine online. O link é gerado a partir do domínio.
                    </>
                ),
            },
            {
                id: 'empresa-usuarios',
                title: 'Gerenciamento de Usuários e Permissões',
                parentTitle: 'Gestão da Empresa',
                parentTopicId: 'empresa',
                content:
                    'Na tela Usuários, convide membros para sua equipe. Cargos: Proprietário, Admin, Funcionário. Defina permissões personalizadas para cada um.',
                render: () => (
                    <>
                        Na tela <strong>&quot;Usuários&quot;</strong>, convide membros para sua equipe. Cargos: <strong>Proprietário</strong>, <strong>Admin</strong>, <strong>Funcionário</strong>. Defina <strong>permissões personalizadas</strong> para cada um.
                    </>
                ),
            },
            {
                id: 'produtos',
                title: 'Gestão de Produtos',
                parentTitle: 'Gestão de Produtos',
                parentTopicId: 'produtos',
                content:
                    'O módulo de Gestão de Produtos é o coração do sistema de estoque. Aqui você cadastra e gerencia todos os produtos do seu negócio.',
                render: () => (
                    <>
                        O módulo de <strong>Gestão de Produtos</strong> é o coração do sistema de estoque. Aqui você cadastra e gerencia todos os produtos do seu negócio.
                    </>
                ),
            },
            {
                id: 'produtos-cadastro',
                title: 'Como Cadastrar um Novo Produto',
                parentTitle: 'Gestão de Produtos',
                parentTopicId: 'produtos',
                content:
                    'Acesse a tela de produtos, clique em Novo Produto e preencha o formulário com dados obrigatórios e opcionais.',
                render: () => (
                    <>
                        Acesse a tela de produtos, clique em Novo Produto e preencha o formulário com dados obrigatórios e opcionais.
                    </>
                ),
            },
            {
                id: 'produtos-quantidade-minima',
                title: 'Entendendo a Quantidade Mínima',
                parentTitle: 'Gestão de Produtos',
                parentTopicId: 'produtos',
                content:
                    'Defina uma quantidade mínima para receber alertas automáticos quando o estoque estiver em nível de atenção ou crítico.',
                render: () => (
                    <>
                        Defina uma quantidade mínima para receber alertas automáticos quando o estoque estiver em nível de atenção ou crítico.
                    </>
                ),
            },
            {
                id: 'produtos-movimentacoes',
                title: 'Realizando Movimentações de Estoque',
                parentTitle: 'Gestão de Produtos',
                parentTopicId: 'produtos',
                content:
                    'Após criar um produto, acesse-o e clique em Estoque para registrar entradas ou saídas, informando quantidade e motivo.',
                render: () => (
                    <>
                        Após criar um produto, acesse-o e clique em Estoque para registrar entradas ou saídas, informando quantidade e motivo.
                    </>
                ),
            },
            {
                id: 'produtos-historico',
                title: 'Visualizando o Histórico de Movimentações',
                parentTitle: 'Gestão de Produtos',
                parentTopicId: 'produtos',
                content:
                    'Acesse o histórico pela tela de Produtos, clicando em Estoque e depois Histórico, ou diretamente pela tela de Inventário.',
                render: () => (
                    <>
                        Acesse o histórico pela tela de Produtos, clicando em Estoque e depois Histórico, ou diretamente pela tela de Inventário.
                    </>
                ),
            },
            {
                id: 'vendas',
                title: 'Sistema de Vendas',
                parentTitle: 'Sistema de Vendas',
                parentTopicId: 'vendas',
                content:
                    'Ponto central para registrar saídas de produtos e interagir com sua base de clientes.',
                render: () => (
                    <>
                        Ponto central para registrar saídas de produtos e interagir com sua base de clientes.
                    </>
                ),
            },
            {
                id: 'vendas-realizando',
                title: 'Realizando uma Venda',
                parentTitle: 'Sistema de Vendas',
                parentTopicId: 'vendas',
                content:
                    'Adicione produtos com estoque ao carrinho, selecione um cliente (opcional) e finalize. A saída de estoque é automática e registrada como Venda.',
                render: () => (
                    <>
                        Adicione produtos com estoque ao carrinho, selecione um cliente (opcional) e finalize. A saída de estoque é automática e registrada como <strong>Venda</strong>.
                    </>
                ),
            },
            {
                id: 'clientes',
                title: 'Gerenciando seus Clientes',
                parentTitle: 'Sistema de Vendas',
                parentTopicId: 'vendas',
                content:
                    'Cadastre seus clientes na tela de Clientes para associá-los a vendas. Preencha informações como nome, email e telefone.',
                render: () => (
                    <>
                        Cadastre seus clientes na tela de <strong>Clientes</strong> para associá-los a vendas. Preencha informações como nome, email e telefone.
                    </>
                ),
            },
            {
                id: 'pedidos',
                title: 'Pedido de Estoque',
                parentTitle: 'Pedido de Estoque',
                parentTopicId: 'pedidos',
                content:
                    'Ferramenta para formalizar a reposição de produtos com seus Fornecedores, centralizando a comunicação.',
                render: () => (
                    <>
                        Ferramenta para formalizar a reposição de produtos com seus <strong>Fornecedores</strong>, centralizando a comunicação.
                    </>
                ),
            },
            {
                id: 'pedidos-criacao',
                title: 'Como Criar um Novo Pedido',
                parentTitle: 'Pedido de Estoque',
                parentTopicId: 'pedidos',
                content:
                    'Selecione um fornecedor, adicione os produtos desejados e envie o pedido por e-mail automaticamente.',
                render: () => (
                    <>
                        Selecione um fornecedor, adicione os produtos desejados e envie o pedido por e-mail automaticamente.
                    </>
                ),
            },
            {
                id: 'pedidos-status',
                title: 'Gerenciando o Status do Pedido',
                parentTitle: 'Pedido de Estoque',
                parentTopicId: 'pedidos',
                content:
                    'Acompanhe o ciclo de vida do pedido: Pendente, Processando, Concluído ou Cancelado. Ao concluir, o sistema dá entrada automática no estoque.',
                render: () => (
                    <>
                        Acompanhe o ciclo de vida do pedido: Pendente, Processando, Concluído ou Cancelado. Ao concluir, o sistema dá <strong>entrada automática no estoque</strong>.
                    </>
                ),
            },
        ],
        []
    );

    const fuse = useMemo(() => new Fuse(searchIndex, {
        keys: ['title', 'content'],
        includeScore: true,
        minMatchCharLength: 2,
        threshold: 0.4,
    }), [searchIndex]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setBusca(query);
        if (query.length > 2) {
            setSearchResults(fuse.search(query).slice(0, 10));
        } else {
            setSearchResults([]);
        }
    };

    const handleSearchResultClick = (result: FuseResult) => {
        setTopicoAtivo(result.item.parentTopicId);
        const element = document.getElementById(result.item.id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
        setBusca('');
        setSearchResults([]);
        setIsSearchFocused(false);
    };

    const highlightMatches = (textNode: React.ReactNode, query: string): React.ReactNode => {
        if (!query) return textNode;
        if (typeof textNode !== 'string') {
            if (React.isValidElement(textNode)) {
                const element = textNode as React.ReactElement<{ children?: React.ReactNode }>;
                if (element.props.children) {
                    const children = React.Children.map(element.props.children, child => highlightMatches(child, query));
                    return React.cloneElement(element, { ...element.props }, children);
                }
            }
            return textNode;
        }
        const parts = textNode.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
        return <>{parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <strong key={i} className="font-bold text-emerald-400">{part}</strong> : part)}</>;
    };

    const generateSnippet = (renderFn: () => React.ReactNode, query: string): React.ReactNode => {
        const fullContent = renderFn();
        return highlightMatches(fullContent, query);
    };

    const ConteudoProdutos = () => (
        <div className="space-y-8" style={{ color: temaAtual.texto }}>
            <section>
                <p className="text-lg mb-6">
                    O módulo de <strong>Gestão de Produtos</strong> é o coração do sistema de estoque. Aqui você cadastra e gerencia todos os produtos do seu negócio.
                </p>
                <div className="p-4 rounded-lg mb-6 border-l-4" style={{ backgroundColor: modoDark ? '#1E4976' : '#EFF6FF', borderLeftColor: temaAtual.primario }}>
                    <strong className="flex items-center gap-2 mb-2"><FaInfo className="text-blue-500" />Fluxo Recomendado:</strong>
                    <ol className="space-y-2 ml-4">
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                            Cadastrar produto
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                            Definir quantidade mínima
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                            Realizar movimentações
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
                            Monitorar e vender
                        </li>
                    </ol>
                </div>
            </section>

            <section id="produtos-cadastro">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaPlus className="text-green-500" />Como Cadastrar um Novo Produto</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                            <strong className="text-green-600 flex items-center gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                                Acessar Produtos
                            </strong>
                            <p className="text-sm mt-2 ml-8">Navegue até o menu &quot;Produtos&quot;.</p>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                            <strong className="text-green-600 flex items-center gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                                Clicar em &quot;Novo Produto&quot;
                            </strong>
                            <p className="text-sm mt-2 ml-8">Localize o botão no canto superior direito.</p>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                            <strong className="text-green-600 flex items-center gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                                Preencher o Formulário
                            </strong>
                            <p className="text-sm mt-2 ml-8">Complete os campos obrigatórios.</p>
                        </div>
                    </div>
                    <div className="border-2 border-dashed rounded-lg flex items-center justify-center p-2"
                        style={{ borderColor: temaAtual.borda }}>
                        <Image src="/ajuda/novoproduto.png" alt="Botão para criar um novo produto"
                            width={400}
                            height={95}
                            quality={100}
                            className="rounded-lg shadow-lg border"
                            style={{ borderColor: temaAtual.borda, objectFit: 'contain', maxWidth: '100%', height: 'auto' }} />
                    </div>
                </div>
            </section>
            <section id="produtos-quantidade-minima">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaBell className="text-yellow-500" />Entendendo a Quantidade Mínima</h3>
                <div className="mb-6 text-center">
                    <div className="inline-flex flex-col items-center gap-3 p-4 border-2 border-dashed rounded-lg"
                        style={{ borderColor: temaAtual.borda }}>
                        <label className="font-semibold text-lg">Quantidade Mínima</label>
                        <div className="px-4 py-2 border rounded-lg text-lg font-mono"
                            style={{ borderColor: temaAtual.borda, backgroundColor: temaAtual.card }}>10 unidades</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg text-center"
                        style={{ backgroundColor: modoDark ? '#422006' : '#FEFCE8', border: `1px solid ${modoDark ? '#653F12' : '#FDE68A'}` }}>
                        <div className="flex items-center justify-center gap-2 mb-2"><FaExclamationTriangle className="text-yellow-500" />
                            <strong>Atenção</strong>
                        </div>
                        <p className="text-sm">Estoque próximo do mínimo</p>
                        <div className="text-2xl font-bold mt-2 text-yellow-600">15</div>
                    </div>
                    <div className="p-4 rounded-lg text-center"
                        style={{ backgroundColor: modoDark ? '#450A0A' : '#FEF2F2', border: `1px solid ${modoDark ? '#7F1D1D' : '#FECACA'}` }}>
                        <div className="flex items-center justify-center gap-2 mb-2"><FaExclamationTriangle className="text-red-500" />
                            <strong>Crítico</strong>
                        </div>
                        <p className="text-sm">Estoque abaixo do mínimo</p>
                        <div className="text-2xl font-bold mt-2 text-red-600">5</div>
                    </div>
                    <div className="p-4 rounded-lg text-center"
                        style={{ backgroundColor: modoDark ? '#052E16' : '#F0FDF4', border: `1px solid ${modoDark ? '#14532D' : '#BBF7D0'}` }}>
                        <div className="flex items-center justify-center gap-2 mb-2"><FaCheck className="text-green-500" />
                            <strong>Normal</strong>
                        </div>
                        <p className="text-sm">Estoque acima do seguro</p>
                        <div className="text-2xl font-bold mt-2 text-green-600">25</div>
                    </div>
                </div>
                <div className="p-4 rounded-lg"
                    style={{ backgroundColor: modoDark ? '#1E4976' : '#EFF6FF' }}>
                    <strong className="flex items-center gap-2"><FaBell className="text-blue-500" />Notificações Automáticas</strong>
                    <p className="text-sm mt-1">O sistema enviará alertas quando o estoque atingir níveis críticos.</p>
                </div>
            </section>

            <section id="produtos-movimentacoes">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaBox className="text-blue-500" />Realizando Movimentações de Estoque</h3>
                <div className="mb-6">
                    <p className="mb-4">Após criar um produto, acesse-o e clique em &quot;Estoque&quot; para fazer movimentações.</p>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg"
                            style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                            <strong className="text-blue-600 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                                Abra o Produto</strong>
                            <p className="text-sm mt-2 ml-8">Na lista, clique no produto desejado.</p>
                        </div>
                        <div className="p-4 rounded-lg"
                            style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                            <strong className="text-blue-600 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                                Clique em &quot;Estoque&quot;
                            </strong>
                            <p className="text-sm mt-2 ml-8">Acesse a tela de movimentações.</p>
                        </div>
                        <div className="p-4 rounded-lg"
                            style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                            <strong className="text-blue-600 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                                Preencha os Dados</strong>
                            <p className="text-sm mt-2 ml-8">Informe tipo (Entrada/Saída), quantidade e motivo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section id="produtos-historico">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaHistory className="text-blue-500" />Visualizando o Histórico de Movimentações</h3>
                <p className="mb-4">Existem duas formas de acessar o histórico de um produto. Ambas levam para a mesma tela de detalhes.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 rounded-lg"
                        style={{ backgroundColor: modoDark ? '#1A365D' : '#F8FAFC', border: `1px solid ${modoDark ? '#2D4B75' : '#E2E8F0'}` }}>
                        <strong className="text-blue-600 flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            Via Tela de Produtos</strong>
                        <ol className="list-decimal list-inside text-sm space-y-2 pl-2">
                            <li>Acesse a tela <strong>Produtos</strong>.</li>
                            <li>Selecione o produto desejado.</li>
                            <li>Clique em <strong>&quot;Estoque&quot;</strong>.</li>
                            <li>Na janela, clique em <strong>&quot;Histórico&quot;</strong>.</li>
                        </ol>
                    </div>
                    <div className="p-4 rounded-lg"
                        style={{ backgroundColor: modoDark ? '#1A365D' : '#F8FAFC', border: `1px solid ${modoDark ? '#2D4B75' : '#E2E8F0'}` }}>
                        <strong className="text-blue-600 flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            Via Inventário
                        </strong>
                        <ol className="list-decimal list-inside text-sm space-y-2 pl-2">
                            <li>Acesse <strong>Inventário</strong> na barra lateral.</li>
                            <li>Selecione o produto na lista.</li>
                            <li>O histórico será exibido.</li>
                        </ol>
                    </div>
                </div>
            </section>
        </div>
    );
    const ConteudoEmpresa = () => (
        <div className="space-y-8" style={{ color: temaAtual.texto }}>
            <section>
                <p className="text-lg mb-6">
                    Este módulo é o centro de comando do seu negócio. Aqui você define a identidade da empresa, gerencia o acesso da equipe e controla funcionalidades essenciais.
                </p>
                <div className="p-4 rounded-lg mb-6 border-l-4" style={{ backgroundColor: modoDark ? '#1E4976' : '#EFF6FF', borderLeftColor: temaAtual.primario }}>
                    <strong className="flex items-center gap-2 mb-2"><FaInfo className="text-blue-500" />Fluxo de Configuração Inicial:</strong>
                    <ol className="space-y-2 ml-4">
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                            Criar a empresa e definir domínio
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                            Ativar o sistema com chave
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                            Convidar usuários e definir funções
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
                            Configurar o catálogo público
                        </li>
                    </ol>
                </div>
            </section>

            <section id="empresa-criacao">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaPlus className="text-green-500" />1. Criando sua Empresa</h3>
                <p className="mb-4">
                    O primeiro passo é registrar sua empresa. Quem cria se torna <strong>Proprietário</strong>, com acesso total.
                </p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                    <strong className="flex items-center gap-2 mb-2"><FaLink className="text-green-500" />O Campo &quot;Domínio&quot;</strong>
                    <p className="text-sm mt-1">Este campo define o link único do seu catálogo público (ex: <code>.../catalogo/sua-empresa</code>).</p>
                </div>
            </section>

            <section id="empresa-ativacao">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaKey className="text-yellow-500" />2. Ativação do Sistema</h3>
                <p className="mb-4">
                    Para desbloquear todas as funcionalidades, sua empresa precisa ser ativada na tela de <strong>Ativação</strong>.
                </p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#422006' : '#FEFCE8', border: `1px solid ${modoDark ? '#653F12' : '#FDE68A'}` }}>
                    <strong className="flex items-center gap-2 mb-2"><FaExclamationTriangle className="text-yellow-500" />Necessário Chave de Ativação</strong>
                    <p className="text-sm mt-1">É preciso inserir uma chave válida para liberar o acesso completo. Sem ela, o uso é limitado.</p>
                </div>
            </section>

            <section id="empresa-catalogo">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaStore className="text-blue-500" />3. Catálogo e Dados da Empresa</h3>
                <p className="mb-4">
                    Na tela <strong>&quot;Empresa&quot;</strong>, edite informações do seu negócio e gerencie seu catálogo público.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F8FAFC', border: `1px solid ${modoDark ? '#2D4B75' : '#E2E8F0'}` }}>
                        <strong className="text-blue-600 flex items-center gap-2 mb-3">Sua Vitrine Online</strong>
                        <p className="text-sm">O catálogo é uma página pública para clientes. Você pode ativá-lo ou desativá-lo a qualquer momento.</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F8FAFC', border: `1px solid ${modoDark ? '#2D4B75' : '#E2E8F0'}` }}>
                        <strong className="text-blue-600 flex items-center gap-2 mb-3">Link de Acesso</strong>
                        <p className="text-sm">O link do catálogo usa o domínio escolhido e fica visível nesta tela para compartilhar.</p>
                    </div>
                </div>
            </section>

            <section id="empresa-usuarios">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaUserShield className="text-green-500" />4. Gerenciamento de Usuários</h3>
                <p className="mb-4">
                    Na tela <strong>&quot;Usuários&quot;</strong>, convide membros para sua equipe e gerencie o que cada um pode fazer.
                </p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1E4976' : '#EFF6FF' }}>
                    <strong className="flex items-center gap-2 mb-2"><FaUsers className="text-blue-500" />Cargos e Hierarquia</strong>
                    <ul className="list-disc list-inside text-sm space-y-2 mt-2">
                        <li><strong>Proprietário:</strong> Acesso total.</li>
                        <li><strong>Admin:</strong> Acesso administrativo.</li>
                        <li><strong>Funcionário:</strong> Acesso básico para operações.</li>
                    </ul>
                    <div className="mt-4 pt-3 border-t" style={{ borderColor: temaAtual.borda }}>
                        <strong className="flex items-center gap-2 mb-2"><FaLock className="text-blue-500" />Permissões Personalizadas</strong>
                        <p className="text-sm">Defina permissões específicas para cada usuário, como &quot;criar produtos&quot;, para um controle mais fino.</p>
                    </div>
                </div>
            </section>
        </div>
    );

    const ConteudoVendas = () => (
        <div className="space-y-8" style={{ color: temaAtual.texto }}>
            <section>
                <p className="text-lg mb-6">
                    A tela de <strong>Vendas</strong> é o ponto central para registrar as saídas de produtos e interagir com sua base de clientes.
                </p>
            </section>

            <section id="vendas-realizando">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaShoppingCart className="text-green-500" />Realizando uma Venda</h3>
                <p className="mb-4">
                    Adicione produtos ao carrinho, selecione o cliente e finalize. O sistema atualiza o estoque automaticamente.
                </p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1E4976' : '#EFF6FF' }}>
                    <strong className="flex items-center gap-2 mb-2"><FaInfo className="text-blue-500" />Pontos Importantes:</strong>
                    <ul className="list-disc list-inside text-sm space-y-2 mt-2">
                        <li>Apenas produtos com estoque são listados para venda.</li>
                        <li>A venda cria uma movimentação de <strong>saída</strong> no estoque.</li>
                        <li>O registro fica no histórico do produto com o motivo <strong>&quot;Venda&quot;</strong>.</li>
                    </ul>
                </div>
            </section>

            <section id="clientes">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaUserTag className="text-blue-500" />Gerenciando seus Clientes</h3>
                <p className="mb-4">
                    Associe vendas a clientes para um controle apurado. Cadastre-os primeiro na tela de <strong>Clientes</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F8FAFC', border: `1px solid ${modoDark ? '#2D4B75' : '#E2E8F0'}` }}>
                        <strong className="text-blue-600 flex items-center gap-2 mb-3">Cadastrando um Cliente</strong>
                        <p className="text-sm">Em &quot;Clientes&quot;, clique em &quot;Novo Cliente&quot; e preencha as informações.</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F8FAFC', border: `1px solid ${modoDark ? '#2D4B75' : '#E2E8F0'}` }}>
                        <strong className="text-blue-600 flex items-center gap-2 mb-3">Associando a uma Venda</strong>
                        <p className="text-sm">Na tela de Vendas, use o campo de seleção para escolher um cliente antes de finalizar a compra.</p>
                    </div>
                </div>
            </section>
        </div>
    );

    const ConteudoPedidos = () => (
        <div className="space-y-8" style={{ color: temaAtual.texto }}>
            <section>
                <p className="text-lg mb-6">
                    O módulo de <strong>Pedidos de Estoque</strong> formaliza a reposição de produtos com seus <strong>Fornecedores</strong>.
                </p>
            </section>

            <section id="pedidos-criacao">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaPlus className="text-green-500" />Como Criar um Novo Pedido</h3>
                <p className="mb-4">
                    Para criar um pedido, você precisa ter produtos e fornecedores já cadastrados. O pedido é sempre vinculado a um fornecedor.
                </p>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                        <strong className="text-green-600 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">1</span>Selecione o Fornecedor</strong>
                        <p className="text-sm mt-2 ml-8">Escolha o fornecedor para filtrar os produtos associados a ele.</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                        <strong className="text-green-600 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">2</span>Adicione Produtos</strong>
                        <p className="text-sm mt-2 ml-8">Adicione itens e ajuste as quantidades.</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1A365D' : '#F0FDF4', border: `1px solid ${modoDark ? '#2D4B75' : '#BBF7D0'}` }}>
                        <strong className="text-green-600 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">3</span>Envie o Pedido</strong>
                        <p className="text-sm mt-2 ml-8">Ao criar, o pedido é enviado automaticamente por e-mail.</p>
                    </div>
                </div>
            </section>

            <section id="pedidos-status">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaHistory className="text-blue-500" />
                    Gerenciando o Status do Pedido
                </h3>
                <p className="mb-4">
                    Acompanhe o pedido através dos seus status para manter o controle.
                </p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: modoDark ? '#1E4976' : '#EFF6FF' }}>
                    <strong className="flex items-center gap-2 mb-2">
                        <FaInfo className="text-blue-500" />
                        Pontos Importantes:
                    </strong>
                    <ul className="list-disc list-inside text-sm space-y-2 mt-2">
                        <li>Status possíveis: <strong>Pendente</strong>, <strong>Processando</strong>, <strong>Concluído</strong>, <strong>Cancelado</strong>.</li>
                        <li>Ao concluir um pedido, o sistema faz a entrada automática no estoque.</li>
                        <li>Você pode acompanhar o histórico de cada pedido na tela de Pedidos.</li>
                    </ul>
                </div>
            </section>
        </div>
    );

    const menuItems = [
        { id: "empresa", titulo: "Gestão da Empresa", icone: <FaBuilding className="text-xl" /> },
        { id: "produtos", titulo: "Gestão de Produtos", icone: <FaBox className="text-xl" /> },
        { id: "vendas", titulo: "Sistema de Vendas", icone: <FaDollarSign className="text-xl" /> },
        { id: "pedidos", titulo: "Pedido de Estoque", icone: <FaTruck className="text-xl" /> },
        { id: "clientes", anchor: true, targetId: "vendas", titulo: "Gestão de Clientes", icone: <FaUserTag className="text-xl" /> },
    ];

    const topicos = [
        { id: "empresa", titulo: "Gestão da Empresa", icone: <FaBuilding className="text-xl" />, componente: ConteudoEmpresa, descricao: "Criação, ativação, catálogo e gerenciamento de usuários." },
        { id: "produtos", titulo: "Gestão de Produtos", icone: <FaBox className="text-xl" />, componente: ConteudoProdutos, descricao: "Guia completo sobre como cadastrar e gerenciar seus produtos." },
        { id: "vendas", titulo: "Sistema de Vendas", icone: <FaDollarSign className="text-xl" />, componente: ConteudoVendas, descricao: "Guia sobre como registrar vendas e gerenciar clientes." },
        { id: "pedidos", titulo: "Pedido de Estoque", icone: <FaTruck className="text-xl" />, componente: ConteudoPedidos, descricao: "Aprenda a fazer pedidos de reposição para seus fornecedores." },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
            <header className="pt-8 pb-4" style={{ backgroundColor: temaAtual.fundo }}>
                <div className="w-full max-w-6xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-4 mb-4"><FaBook className="text-4xl"
                            style={{ color: temaAtual.primario }} />
                            <h1 className="text-3xl font-bold">Central de Ajuda</h1>
                            <FaLightbulb className="text-4xl"
                                style={{ color: temaAtual.primario }} />
                        </div>
                        <p className="text-lg" style={{ color: temaAtual.placeholder }}>Guia completo para usar o StockControl</p>
                    </div>
                    <div ref={searchRef} className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch style={{ color: temaAtual.placeholder }} /></div>
                        <input type="text" placeholder="Pesquisar em toda a ajuda..."
                            value={busca} onChange={handleSearchChange}
                            onFocus={() => setIsSearchFocused(true)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ backgroundColor: temaAtual.card, color: temaAtual.texto, borderColor: temaAtual.borda }} />
                        {isSearchFocused && searchResults.length > 0 && (
                            <div className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto rounded-lg shadow-lg z-10" style={{ backgroundColor: temaAtual.card, border: `1px solid ${temaAtual.borda}` }}>
                                {searchResults.map(result => (
                                    <div key={result.item.id} onClick={() => handleSearchResultClick(result)} className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b" style={{ borderColor: temaAtual.borda }}>
                                        <div className="font-semibold text-sm" style={{ color: temaAtual.texto }}>{highlightMatches(result.item.title, busca)}</div>
                                        <div className="text-xs mt-1" style={{ color: temaAtual.placeholder }}>{generateSnippet(result.item.render, busca)}</div>
                                        <div className="text-xs mt-2 font-semibold" style={{ color: temaAtual.placeholder }}>em {result.item.parentTitle}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <div className="w-full max-w-6xl mx-auto px-4 pb-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="border rounded-xl p-4 sticky top-4" style={{ backgroundColor: temaAtual.card, borderColor: temaAtual.borda }}>
                            <h3 className="font-semibold mb-3 flex items-center gap-2"><FaHome />Tópicos de Ajuda</h3>
                            <nav className="space-y-2">
                                {menuItems.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.anchor ? `#${item.id}` : `#${item.targetId || item.id}`}
                                        onClick={() => { setTopicoAtivo(item.targetId || item.id); setBusca(''); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${topicoAtivo === (item.targetId || item.id) ? "font-semibold" : "font-normal"}`}
                                        style={{ backgroundColor: topicoAtivo === (item.targetId || item.id) ? temaAtual.ativo : "transparent", color: topicoAtivo === (item.targetId || item.id) ? "#fff" : temaAtual.texto }}
                                        onMouseEnter={(e) => { if (topicoAtivo !== (item.targetId || item.id)) { e.currentTarget.style.backgroundColor = temaAtual.hover } }}
                                        onMouseLeave={(e) => { if (topicoAtivo !== (item.targetId || item.id)) { e.currentTarget.style.backgroundColor = "transparent" } }}
                                    >{item.icone}<span>{item.titulo}</span></a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                    <main className="flex-1 min-w-0">
                        <div className="space-y-8">
                            {topicos.map((topico, index) => (
                                <div key={topico.id} id={topico.id} ref={(el) => { topicRefs.current[index] = el; }} className="border rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: temaAtual.card, borderColor: temaAtual.borda }}>
                                    <div className="w-full p-6"><div className="flex items-center gap-4">{topico.icone}<div><h2 className="text-2xl font-bold">{topico.titulo}</h2><p className="text-sm opacity-80 mt-1">{topico.descricao}</p></div></div></div>
                                    <div className="p-6 border-t" style={{ borderColor: temaAtual.borda }}>
                                        <topico.componente />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <footer className="mt-12 text-center" style={{ color: temaAtual.placeholder }}>
                            <p className="text-sm">Precisa de mais ajuda? Entre em contato com nosso suporte.</p>
                            <p className="text-xs mt-2">StockControl © {new Date().getFullYear()} - Sistema de Gestão de Estoque</p>
                        </footer>
                    </main>
                </div>
            </div>
        </div>
    );
}
