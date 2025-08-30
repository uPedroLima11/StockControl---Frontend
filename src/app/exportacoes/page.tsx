"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaFileExcel, FaDownload, FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface ExportHistory {
    id: string;
    descricao: string;
    createdAt: string;
    tipo: string;
    usuario?: {
        nome: string;
    };
}

export default function Exportacoes() {
    const [empresaId, setEmpresaId] = useState<string | null>(null);
    const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
    const [modoDark, setModoDark] = useState(false);
    const [activeTab, setActiveTab] = useState<'exportar' | 'historico'>('exportar');
    const [loading, setLoading] = useState(false);
    const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const router = useRouter();
    const { t, i18n } = useTranslation("exportacoes");

    const itensPorPagina = 6;

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

    useEffect(() => {
        const initialize = async () => {
            const temaSalvo = localStorage.getItem("modoDark");
            const ativado = temaSalvo === "true";
            setModoDark(ativado);

            const usuarioSalvo = localStorage.getItem("client_key");
            if (!usuarioSalvo) return;

            const usuarioValor = usuarioSalvo.replace(/"/g, "");
            const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);

            if (responseUsuario.ok) {
                const usuario = await responseUsuario.json();
                setEmpresaId(usuario.empresaId);

                if (usuario.empresaId) {
                    const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
                    setEmpresaAtivada(ativada);
                }
            }
        };

        initialize();
    }, []);

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
            title: t("alerta.titulo"),
            text: t("alerta.mensagem"),
            icon: "warning",
            confirmButtonText: t("alerta.botao"),
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

    const handleExport = async (entityType: string) => {
        handleAcaoProtegida(async () => {
            if (!empresaId) return;

            setLoading(true);
            try {
                const usuarioSalvo = localStorage.getItem("client_key");
                const usuarioValor = usuarioSalvo ? usuarioSalvo.replace(/"/g, "") : "";

                const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/export/${entityType}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "user-id": usuarioValor
                    },
                    body: JSON.stringify({
                        startDate: dateRange.start || undefined,
                        endDate: dateRange.end || undefined,
                        empresaId
                    })
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${entityType}_${new Date().toISOString().split('T')[0]}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: t("exportacaoSucesso"),
                        showConfirmButton: false,
                        timer: 1500,
                    });

                    if (activeTab === 'historico') {
                        fetchExportHistory();
                    }
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.mensagem || t("erroExportacao"));
                }
            } catch (error) {
                console.error("Erro ao exportar:", error);
                Swal.fire(t("erroTitulo"), error instanceof Error ? error.message : t("erroGenerico"), "error");
            } finally {
                setLoading(false);
            }
        });
    };

    const fetchExportHistory = async () => {
        if (!empresaId) return;

        setCarregandoHistorico(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/export/history/${empresaId}`);
            if (response.ok) {
                const history = await response.json();
                setExportHistory(history);
                setPaginaAtual(1);
            }
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
        } finally {
            setCarregandoHistorico(false);
        }
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const parseExportDescription = (descricao: string) => {
        if (!descricao || typeof descricao !== 'string') {
            return {
                entity: t("desconhecido"),
                user: t("desconhecido"),
                period: t("periodoNaoEspecificado")
            };
        }

        const parts = descricao.split(' | ');

        if (parts.length >= 3) {
            const entityMatch = parts[0].match(/Exportação de (\w+)/);
            const userMatch = parts[1].match(/Usuário: (.+)/);
            const periodMatch = parts[2].match(/Período: (.+)/);

            return {
                entity: entityMatch ? entityMatch[1] : t("desconhecido"),
                user: userMatch ? userMatch[1] : t("desconhecido"),
                period: periodMatch ? periodMatch[1] : t("periodoNaoEspecificado")
            };
        }

        const entityMatch = descricao.match(/Exportação de (\w+)/);
        return {
            entity: entityMatch ? entityMatch[1] : t("desconhecido"),
            user: t("desconhecido"),
            period: t("periodoNaoEspecificado")
        };
    };

    const indexUltimoItem = paginaAtual * itensPorPagina;
    const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
    const itensAtuais = exportHistory.slice(indexPrimeiroItem, indexUltimoItem);
    const totalPaginas = Math.ceil(exportHistory.length / itensPorPagina);

    const mudarPagina = (novaPagina: number) => {
        setPaginaAtual(novaPagina);
        setExpandedItems(new Set());
    };

    useEffect(() => {
        if (activeTab === 'historico' && empresaId) {
            fetchExportHistory();
        }
    }, [activeTab, empresaId]);

    const entityNames = {
        produtos: t("entidades.produtos"),
        vendas: t("entidades.vendas"),
        clientes: t("entidades.clientes"),
        fornecedores: t("entidades.fornecedores"),
        usuarios: t("entidades.usuarios")
    };

    return (
        <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo }}>
            <div className="w-full max-w-4xl">
                <h1 className="text-center text-xl md:text-2xl font-mono mb-6" style={{ color: temaAtual.texto }}>
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
                            <p className="font-bold">{t("empresaNaoAtivada.titulo")}</p>
                            <p>{t("empresaNaoAtivada.mensagem")}</p>
                        </div>
                    </div>
                )}

                <div className="flex border-b mb-6" style={{ borderColor: temaAtual.borda }}>
                    <button
                        onClick={() => setActiveTab('exportar')}
                        className={`px-4 py-2 cursor-pointer font-medium ${activeTab === 'exportar'
                            ? 'border-b-2'
                            : 'hover:opacity-80'
                            }`}
                        style={{
                            color: activeTab === 'exportar' ? temaAtual.texto : temaAtual.placeholder,
                            borderColor: activeTab === 'exportar' ? temaAtual.primario : 'transparent'
                        }}
                    >
                        {t("abas.exportar")}
                    </button>
                    <button
                        onClick={() => setActiveTab('historico')}
                        className={`px-4 py-2 cursor-pointer font-medium ${activeTab === 'historico'
                            ? 'border-b-2'
                            : 'hover:opacity-80'
                            }`}
                        style={{
                            color: activeTab === 'historico' ? temaAtual.texto : temaAtual.placeholder,
                            borderColor: activeTab === 'historico' ? temaAtual.primario : 'transparent'
                        }}
                    >
                        {t("abas.historico")}
                    </button>
                </div>

                {activeTab === 'exportar' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-lg" style={{
                            backgroundColor: temaAtual.card,
                            border: `1px solid ${temaAtual.borda}`
                        }}>
                            <h2 className="text-lg font-semibold mb-4" style={{ color: temaAtual.texto }}>
                                {t("filtros.titulo")}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm mb-2" style={{ color: temaAtual.texto }}>
                                        {t("filtros.dataInicial")}
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full p-2 cursor-pointer border rounded"
                                        style={{
                                            backgroundColor: temaAtual.card,
                                            color: temaAtual.texto,
                                            border: `1px solid ${temaAtual.borda}`
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2" style={{ color: temaAtual.texto }}>
                                        {t("filtros.dataFinal")}
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full p-2 border cursor-pointer rounded"
                                        style={{
                                            backgroundColor: temaAtual.card,
                                            color: temaAtual.texto,
                                            border: `1px solid ${temaAtual.borda}`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(entityNames).map(([key, name]) => (
                                <div key={key} className="p-6 rounded-lg transition-all duration-200" style={{
                                    backgroundColor: temaAtual.card,
                                    border: `1px solid ${temaAtual.borda}`,
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
                                }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: temaAtual.texto }}>{name}</h3>
                                    <button
                                        onClick={() => handleExport(key)}
                                        disabled={loading || !empresaAtivada}
                                        className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded disabled:opacity-50 transition-colors"
                                        style={{
                                            backgroundColor: temaAtual.primario,
                                            color: "#FFFFFF",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading && empresaAtivada) {
                                                e.currentTarget.style.opacity = "0.9";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loading && empresaAtivada) {
                                                e.currentTarget.style.opacity = "1";
                                            }
                                        }}
                                    >
                                        <FaFileExcel />
                                        <FaDownload />
                                        {t("botaoExportar")}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'historico' && (
                    <div className="p-6 rounded-lg" style={{
                        backgroundColor: temaAtual.card,
                        border: `1px solid ${temaAtual.borda}`
                    }}>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: temaAtual.texto }}>
                            {t("historico.titulo")}
                        </h2>

                        {carregandoHistorico ? (
                            <p className="text-center py-8" style={{ color: temaAtual.placeholder }}>
                                {t("historico.carregando")}
                            </p>
                        ) : exportHistory.length === 0 ? (
                            <p className="text-center py-8" style={{ color: temaAtual.placeholder }}>
                                {t("historico.nenhumaExportacao")}
                            </p>
                        ) : (
                            <>
                                {totalPaginas > 1 && (
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm" style={{ color: temaAtual.placeholder }}>
                                            {t("historico.mostrando", {
                                                inicio: indexPrimeiroItem + 1,
                                                fim: Math.min(indexUltimoItem, exportHistory.length),
                                                total: exportHistory.length
                                            })}
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
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {itensAtuais.map((item) => {
                                        const { entity, user, period } = parseExportDescription(item.descricao);
                                        const isExpanded = expandedItems.has(item.id);

                                        return (
                                            <div key={item.id} className="border rounded-lg p-4 transition-all" style={{
                                                borderColor: temaAtual.borda,
                                                backgroundColor: isExpanded ? temaAtual.hover : temaAtual.card,
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isExpanded) {
                                                    e.currentTarget.style.backgroundColor = temaAtual.hover;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isExpanded) {
                                                    e.currentTarget.style.backgroundColor = temaAtual.card;
                                                }
                                            }}>
                                                <div className="flex justify-between items-start cursor-pointer" onClick={() => toggleExpand(item.id)}>
                                                    <div className="flex-1">
                                                        <p className="font-medium" style={{ color: temaAtual.texto }}>
                                                            {t("historico.exportacaoDe", { entidade: entityNames[entity as keyof typeof entityNames] || entity })}
                                                            <span className="ml-2 text-sm font-normal" style={{ color: temaAtual.placeholder }}>
                                                                ({user})
                                                            </span>
                                                        </p>
                                                        <p className="text-sm mt-1" style={{ color: temaAtual.placeholder }}>
                                                            {new Date(item.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'pt-BR')}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpand(item.id);
                                                            }}
                                                            className="p-1"
                                                            style={{ color: temaAtual.texto }}
                                                        >
                                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="mt-3 pt-3 border-t" style={{ borderColor: temaAtual.borda }}>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="font-semibold" style={{ color: temaAtual.texto }}>
                                                                    {t("historico.detalhes.tipoDados")}:
                                                                </p>
                                                                <p style={{ color: temaAtual.placeholder }}>
                                                                    {entityNames[entity as keyof typeof entityNames] || entity}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold" style={{ color: temaAtual.texto }}>
                                                                    {t("historico.detalhes.exportadoPor")}:
                                                                </p>
                                                                <p style={{ color: temaAtual.placeholder }}>{user}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold" style={{ color: temaAtual.texto }}>
                                                                    {t("historico.detalhes.periodo")}:
                                                                </p>
                                                                <p style={{ color: temaAtual.placeholder }}>{period}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold" style={{ color: temaAtual.texto }}>
                                                                    {t("historico.detalhes.dataExportacao")}:
                                                                </p>
                                                                <p style={{ color: temaAtual.placeholder }}>
                                                                    {new Date(item.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'pt-BR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {totalPaginas > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => mudarPagina(paginaAtual - 1)}
                                                disabled={paginaAtual === 1}
                                                className={`px-3 py-1 rounded ${paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                                                style={{ 
                                                    color: temaAtual.texto,
                                                    backgroundColor: temaAtual.card,
                                                    border: `1px solid ${temaAtual.borda}`
                                                }}
                                            >
                                                <FaAngleLeft />
                                            </button>

                                            <div className="flex gap-1">
                                                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => mudarPagina(page)}
                                                        className={`w-8 h-8 rounded ${paginaAtual === page
                                                            ? "text-white"
                                                            : "hover:opacity-80"
                                                            }`}
                                                        style={{
                                                            color: paginaAtual === page ? "white" : temaAtual.texto,
                                                            backgroundColor: paginaAtual === page ? temaAtual.primario : temaAtual.card,
                                                            border: `1px solid ${temaAtual.borda}`
                                                        }}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => mudarPagina(paginaAtual + 1)}
                                                disabled={paginaAtual === totalPaginas}
                                                className={`px-3 py-1 rounded ${paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                                                style={{ 
                                                    color: temaAtual.texto,
                                                    backgroundColor: temaAtual.card,
                                                    border: `1px solid ${temaAtual.borda}`
                                                }}
                                            >
                                                <FaAngleRight />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}