"use client";

import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaMinus, FaHistory, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import HistoricoEstoque from "./HistoricoEstoque";
import { useTranslation } from "react-i18next";

interface MovimentacaoEstoqueModalProps {
    produto: {
        id: string;
        nome: string;
        quantidade: number;
    };
    modoDark: boolean;
    empresaId: string;
    onMovimentacaoConcluida: () => void;
}

export default function MovimentacaoEstoqueModal({
    produto,
    modoDark,
    empresaId,
    onMovimentacaoConcluida
}: MovimentacaoEstoqueModalProps) {
    const { t } = useTranslation("estoque");
    const [modalAberto, setModalAberto] = useState(false);
    const [tipoMovimentacao, setTipoMovimentacao] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
    const [quantidade, setQuantidade] = useState("1");
    const [motivo, setMotivo] = useState('COMPRA');
    const [observacao, setObservacao] = useState('');
    const [mostrarHistorico, setMostrarHistorico] = useState(false);
    const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
    const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
    const [carregandoPermissao, setCarregandoPermissao] = useState(true);

    const temas = {
        dark: {
            fundo: "#0A1929",
            texto: "#FFFFFF",
            card: "#132F4C",
            borda: "#1E4976",
            primario: "#1976D2",
        },
        light: {
            fundo: "#F8FAFC",
            texto: "#0F172A",
            card: "#FFFFFF",
            borda: "#E2E8F0",
            primario: "#1976D2",
        }
    };

    const temaAtual = modoDark ? temas.dark : temas.light;

    const usuarioTemPermissao = useCallback(async (permissaoChave: string): Promise<boolean> => {
        try {
            const usuarioSalvo = localStorage.getItem("client_key");
            if (!usuarioSalvo) return false;

            const usuarioId = usuarioSalvo.replace(/"/g, "");

            if (tipoUsuario === "PROPRIETARIO") {
                return true;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/permissoes`,
                { headers: { 'user-id': usuarioId } }
            );

            if (response.ok) {
                const dados: { permissoes: { chave: string; concedida: boolean }[]; permissoesPersonalizadas: boolean } = await response.json();

                if (!dados.permissoesPersonalizadas) {
                    const permissoesPadrao = tipoUsuario === "ADMIN"
                        ? ["estoque_gerenciar", "inventario_visualizar"]
                        : tipoUsuario === "FUNCIONARIO"
                            ? []
                            : [];
                    return permissoesPadrao.includes(permissaoChave);
                }

                const permissao = dados.permissoes.find(p => p.chave === permissaoChave);
                return permissao?.concedida || false;
            }
            return false;
        } catch {
            console.error("Erro ao verificar permissão")
            return false;
        }
    }, [tipoUsuario]);

    useEffect(() => {
        const carregarDadosUsuario = async () => {
            try {
                const usuarioSalvo = localStorage.getItem("client_key");
                if (!usuarioSalvo) {
                    setCarregandoPermissao(false);
                    return;
                }

                const usuarioId = usuarioSalvo.replace(/"/g, "");

                const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
                    headers: { 'user-id': usuarioId }
                });

                if (responseUsuario.ok) {
                    const usuario = await responseUsuario.json();
                    setTipoUsuario(usuario.tipo);

                    if (usuario.tipo === "PROPRIETARIO") {
                        setCarregandoPermissao(false);
                        return;
                    }
                }

                const responsePermissoes = await fetch(
                    `${process.env.NEXT_PPUBLIC_URL_API}/usuarios/${usuarioId}/permissoes`,
                    {
                        headers: { 'user-id': usuarioId }
                    }
                );

                if (responsePermissoes.ok) {
                    const dados: { permissoes: { chave: string; concedida: boolean }[]; permissoesPersonalizadas: boolean } = await responsePermissoes.json();
                    const permissoesUsuarioObj: Record<string, boolean> = {};
                    dados.permissoes.forEach(permissao => {
                        permissoesUsuarioObj[permissao.chave] = permissao.concedida;
                    });
                    setPermissoesUsuario(permissoesUsuarioObj);
                } else {
                    const permissoesParaVerificar = ["estoque_gerenciar"];
                    const permissoes: Record<string, boolean> = {};
                    for (const permissao of permissoesParaVerificar) {
                        const temPermissao = await usuarioTemPermissao(permissao);
                        permissoes[permissao] = temPermissao;
                    }
                    setPermissoesUsuario(permissoes);
                }
            } catch {
                console.error("Erro ao carregar permissões")
            } finally {
                setCarregandoPermissao(false);
            }
        };

        carregarDadosUsuario();
    }, [usuarioTemPermissao]);

    const podeGerenciarEstoque = (tipoUsuario === "PROPRIETARIO") || permissoesUsuario.estoque_gerenciar;

    const realizarMovimentacao = async () => {
        if (!podeGerenciarEstoque) {
            Swal.fire({ icon: "error", title: t("semPermissaoTitulo"), text: t("semPermissaoEstoque") });
            return;
        }

        try {
            const quantidadeNum = parseInt(quantidade) || 0;
            if (quantidadeNum <= 0) {
                Swal.fire({ icon: "error", title: t("mensagens.erroTitulo"), text: t("mensagens.quantidadeInvalida") });
                return;
            }

            const usuarioSalvo = localStorage.getItem("client_key");
            if (!usuarioSalvo) return;
            const usuarioValor = usuarioSalvo.replace(/"/g, "");

            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/movimentacoes-estoque`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'user-id': usuarioValor },
                body: JSON.stringify({ produtoId: Number(produto.id), tipo: tipoMovimentacao, quantidade: quantidadeNum, motivo, observacao, empresaId })
            });

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: t("mensagens.sucessoTitulo"),
                    text: t("mensagens.sucessoTexto", { tipo: tipoMovimentacao === "ENTRADA" ? t("entrada") : t("saida"), quantidade: quantidadeNum })
                });
                setModalAberto(false);
                onMovimentacaoConcluida();
            } else {
                const erro = await response.json();
                Swal.fire({ icon: "error", title: t("mensagens.erroTitulo"), text: erro.mensagem || t("mensagens.erroGenerico") });
            }
        } catch {
            Swal.fire({ icon: "error", title: t("mensagens.erroTitulo"), text: t("mensagens.erroConexao") });
        }
    };

    const handleQuantidadeChange = (value: string) => {
        if (value === "") setQuantidade("0");
        else if (/^\d+$/.test(value)) setQuantidade(parseInt(value, 10).toString());
    };

    const handleQuantidadeBlur = () => {
        if (quantidade === "" || !/^\d+$/.test(quantidade)) setQuantidade("1");
        else if (parseInt(quantidade, 10) < 1) setQuantidade("1");
    };

    const handleAbrirModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!podeGerenciarEstoque && !carregandoPermissao) {
            Swal.fire({ icon: "warning", title: t("semPermissaoTitulo"), text: t("semPermissaoEstoque") });
            return;
        }
        setModalAberto(true);
    };

    return (
        <>
            <button 
                onClick={handleAbrirModal} 
                className="w-full px-4 py-2 rounded cursor-pointer flex items-center justify-center gap-2 text-sm font-medium h-[42px]"
                style={{ 
                    backgroundColor: temaAtual.primario, 
                    color: "#FFFFFF", 
                    opacity: carregandoPermissao ? 0.7 : 1,
                    border: `1px solid ${temaAtual.primario}`
                }}
                disabled={carregandoPermissao}
            >
                {carregandoPermissao ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : !podeGerenciarEstoque ? (
                    <FaLock size={14} />
                ) : (
                    <FaHistory size={14} />
                )}
                {t("estoque")}
            </button>

            {modalAberto && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 min-h-screen overflow-auto"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setModalAberto(false);
                        }
                    }}
                >
                    <div
                        className="p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 flex flex-col"
                        style={{
                            backgroundColor: temaAtual.card,
                            color: temaAtual.texto,
                            border: `1px solid ${temaAtual.borda}`,
                            boxShadow: modoDark
                                ? "0 4px 12px rgba(0,0,0,0.9)"
                                : "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FaHistory />
                            {t("gerenciarEstoque")} - {produto.nome}
                        </h2>

                        {!podeGerenciarEstoque ? (
                            <div className="text-center py-8">
                                <FaLock size={48} className="mx-auto mb-4 text-red-500" />
                                <p className="text-lg font-semibold mb-2">{t("semPermissaoTitulo")}</p>
                                <p className="text-gray-500">{t("semPermissaoEstoque")}</p>
                            </div>
                        ) : !mostrarHistorico ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <button
                                        onClick={() => setTipoMovimentacao('ENTRADA')}
                                        className={`p-3 cursor-pointer rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${tipoMovimentacao === 'ENTRADA'
                                            ? 'border-green-700 bg-green-700'
                                            : modoDark
                                                ? 'border-white bg-transparent'
                                                : 'border-gray-300 bg-gray-100'
                                            }`}
                                    >
                                        <FaPlus className={tipoMovimentacao === 'ENTRADA' ? "text-white" : modoDark ? "text-white" : "text-green-700"} />
                                        <span style={{ color: tipoMovimentacao === 'ENTRADA' ? '#fff' : modoDark ? '#fff' : '#166534' }}>
                                            {t("entrada")}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setTipoMovimentacao('SAIDA')}
                                        className={`p-3 cursor-pointer rounded-lg border-2 transition-all ${tipoMovimentacao === 'SAIDA'
                                            ? 'border-red-500 bg-red-500 bg-opacity-10'
                                            : 'border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <FaMinus
                                                className={
                                                    tipoMovimentacao === 'SAIDA'
                                                        ? 'text-white'
                                                        : 'text-red-500'
                                                }
                                            />
                                            <span
                                                style={{
                                                    color:
                                                        tipoMovimentacao === 'SAIDA'
                                                            ? '#fff'
                                                            : '#ef4444'
                                                }}
                                            >
                                                {t("saida")}
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-medium">{t("quantidade")}</label>
                                    <input
                                        type="text"
                                        value={quantidade}
                                        onChange={(e) => handleQuantidadeChange(e.target.value)}
                                        onBlur={handleQuantidadeBlur}
                                        className="w-full p-2 rounded border"
                                        style={{
                                            backgroundColor: temaAtual.card,
                                            borderColor: temaAtual.borda,
                                            color: temaAtual.texto
                                        }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-medium">{t("motivo")}</label>
                                    <select
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        className="w-full p-2 rounded border"
                                        style={{
                                            backgroundColor: temaAtual.card,
                                            borderColor: temaAtual.borda,
                                            color: temaAtual.texto
                                        }}
                                    >
                                        <option value="COMPRA">{t("motivos.compra")}</option>
                                        <option value="VENDA">{t("motivos.venda")}</option>
                                        <option value="AJUSTE">{t("motivos.ajuste")}</option>
                                        <option value="DEVOLUCAO">{t("motivos.devolucao")}</option>
                                        <option value="PERDA">{t("motivos.perda")}</option>
                                        <option value="INVENTARIO">{t("motivos.inventario")}</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-medium">{t("observacao")}</label>
                                    <textarea
                                        value={observacao}
                                        onChange={(e) => setObservacao(e.target.value)}
                                        rows={3}
                                        className="w-full p-2 rounded border"
                                        style={{
                                            backgroundColor: temaAtual.card,
                                            borderColor: temaAtual.borda,
                                            color: temaAtual.texto
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between gap-3">
                                    <button
                                        onClick={() => setMostrarHistorico(true)}
                                        className="px-4 cursor-pointer py-2 rounded border"
                                        style={{
                                            borderColor: temaAtual.primario,
                                            color: temaAtual.primario
                                        }}
                                    >
                                        {t("verHistorico")}
                                    </button>

                                    <div className="flex gap-2">
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
                                            onClick={realizarMovimentacao}
                                            className="px-4 cursor-pointer py-2 rounded text-white"
                                            style={{
                                                backgroundColor: tipoMovimentacao === 'ENTRADA' ? '#10B981' : '#EF4444'
                                            }}
                                        >
                                            {tipoMovimentacao === 'ENTRADA' ? t("adicionar") : t("remover")}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <HistoricoEstoque
                                    produtoId={Number(produto.id)}
                                    modoDark={modoDark}
                                />

                                <button
                                    onClick={() => setMostrarHistorico(false)}
                                    className="mt-4 px-4 py-2 cursor-pointer rounded border"
                                    style={{
                                        borderColor: temaAtual.primario,
                                        color: temaAtual.primario
                                    }}
                                >
                                    {t("voltar")}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}