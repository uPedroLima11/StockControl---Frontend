"use client";

import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaMinus, FaHistory, FaLock, FaBox, FaTimes } from "react-icons/fa";
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
    onFecharModal: () => void; 
}

export default function MovimentacaoEstoqueModal({
    produto,
    modoDark,
    empresaId,
    onMovimentacaoConcluida,
    onFecharModal
}: MovimentacaoEstoqueModalProps) {
    const { t } = useTranslation("estoque");
    const [tipoMovimentacao, setTipoMovimentacao] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
    const [quantidade, setQuantidade] = useState("1");
    const [motivo, setMotivo] = useState('COMPRA');
    const [observacao, setObservacao] = useState('');
    const [mostrarHistorico, setMostrarHistorico] = useState(false);
    const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
    const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
    const [, setCarregandoPermissao] = useState(true);

    const temas = {
        dark: {
            fundo: "#0f172a",
            texto: "#f8fafc",
            card: "#1e293b",
            borda: "#334155",
            primario: "#3b82f6",
            secundario: "#0ea5e9",
            gradiente: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
        },
        light: {
            fundo: "#f1f5f9",
            texto: "#0f172a",
            card: "#ffffff",
            borda: "#e2e8f0",
            primario: "#3b82f6",
            secundario: "#0ea5e9",
            gradiente: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)"
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
                    `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/permissoes`,
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
            Swal.fire({ 
                icon: "error", 
                title: t("semPermissaoTitulo"), 
                text: t("semPermissaoEstoque"),
                background: temaAtual.card,
                color: temaAtual.texto
            });
            return;
        }

        try {
            const quantidadeNum = parseInt(quantidade) || 0;
            if (quantidadeNum <= 0) {
                Swal.fire({ 
                    icon: "error", 
                    title: t("mensagens.erroTitulo"), 
                    text: t("mensagens.quantidadeInvalida"),
                    background: temaAtual.card,
                    color: temaAtual.texto
                });
                return;
            }

            const usuarioSalvo = localStorage.getItem("client_key");
            if (!usuarioSalvo) return;
            const usuarioValor = usuarioSalvo.replace(/"/g, "");

            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/movimentacoes-estoque`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'user-id': usuarioValor },
                body: JSON.stringify({ 
                    produtoId: Number(produto.id), 
                    tipo: tipoMovimentacao, 
                    quantidade: quantidadeNum, 
                    motivo, 
                    observacao, 
                    empresaId 
                })
            });

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: t("mensagens.sucessoTitulo"),
                    text: t("mensagens.sucessoTexto", { 
                        tipo: tipoMovimentacao === "ENTRADA" ? t("entrada") : t("saida"), 
                        quantidade: quantidadeNum 
                    }),
                    background: temaAtual.card,
                    color: temaAtual.texto,
                    timer: 2000,
                    showConfirmButton: false
                });
                setQuantidade("1");
                setObservacao("");
                onMovimentacaoConcluida();
            } else {
                const erro = await response.json();
                Swal.fire({ 
                    icon: "error", 
                    title: t("mensagens.erroTitulo"), 
                    text: erro.mensagem || t("mensagens.erroGenerico"),
                    background: temaAtual.card,
                    color: temaAtual.texto
                });
            }
        } catch {
            Swal.fire({ 
                icon: "error", 
                title: t("mensagens.erroTitulo"), 
                text: t("mensagens.erroConexao"),
                background: temaAtual.card,
                color: temaAtual.texto
            });
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

    const handleCancelar = () => {
        setTipoMovimentacao('ENTRADA');
        setQuantidade("1");
        setMotivo('COMPRA');
        setObservacao('');
        setMostrarHistorico(false);
        
        onFecharModal();
    };
    const handleFechar = () => {
        onFecharModal();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <FaBox className="text-blue-400" />
                    {t("gerenciarEstoque")} 
                    <span className="text-blue-400">- {produto.nome}</span>
                </h2>
                <button
                    onClick={handleFechar} 
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <FaTimes className="text-lg" />
                </button>
            </div>
            {!podeGerenciarEstoque ? (
                <div className="text-center py-8">
                    <FaLock size={48} className="mx-auto mb-4 text-red-400" />
                    <p className="text-lg font-semibold mb-2">{t("semPermissaoTitulo")}</p>
                    <p className="opacity-70">{t("semPermissaoEstoque")}</p>
                </div>
            ) : !mostrarHistorico ? (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            onClick={() => setTipoMovimentacao('ENTRADA')}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-3 font-semibold hover:scale-105 cursor-pointer ${
                                tipoMovimentacao === 'ENTRADA'
                                    ? 'border-green-500 bg-green-500 text-white shadow-lg'
                                    : 'border-gray-500 bg-transparent opacity-70 hover:opacity-100'
                            }`}
                        >
                            <FaPlus />
                            {t("entrada")}
                        </button>

                        <button
                            onClick={() => setTipoMovimentacao('SAIDA')}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-3 font-semibold hover:scale-105 cursor-pointer ${
                                tipoMovimentacao === 'SAIDA'
                                    ? 'border-red-500 bg-red-500 text-white shadow-lg'
                                    : 'border-gray-500 bg-transparent opacity-70 hover:opacity-100'
                            }`}
                        >
                            <FaMinus />
                            {t("saida")}
                        </button>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-3 font-semibold text-lg">{t("quantidade")}</label>
                        <input
                            type="text"
                            value={quantidade}
                            onChange={(e) => handleQuantidadeChange(e.target.value)}
                            onBlur={handleQuantidadeBlur}
                            className="w-full p-4 rounded-xl border-2 text-center text-lg font-bold transition-all focus:ring-2 focus:ring-blue-500"
                            style={{
                                backgroundColor: temaAtual.card,
                                borderColor: temaAtual.borda,
                                color: temaAtual.texto
                            }}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-3 font-semibold">{t("motivo")}</label>
                        <select
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            className="w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                    <div className="mb-6">
                        <label className="block mb-3 font-semibold">{t("observacao")}</label>
                        <textarea
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                            rows={3}
                            placeholder={t("observacaoPlaceholder")}
                            className="w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 resize-none"
                            style={{
                                backgroundColor: temaAtual.card,
                                borderColor: temaAtual.borda,
                                color: temaAtual.texto
                            }}
                        />
                    </div>
                    <div className="flex justify-between gap-4">
                        <button
                            onClick={() => setMostrarHistorico(true)}
                            className="px-6 py-3 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer flex items-center gap-2"
                            style={{
                                borderColor: temaAtual.primario,
                                color: temaAtual.primario
                            }}
                        >
                            <FaHistory />
                            {t("verHistorico")}
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelar}
                                className="px-6 py-3 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer"
                                style={{
                                    borderColor: temaAtual.borda,
                                    color: temaAtual.texto
                                }}
                            >
                                {t("cancelar")}
                            </button>

                            <button
                                onClick={realizarMovimentacao}
                                className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 cursor-pointer shadow-lg"
                                style={{
                                    background: tipoMovimentacao === 'ENTRADA' 
                                        ? "linear-gradient(135deg, #10B981, #059669)"
                                        : "linear-gradient(135deg, #EF4444, #DC2626)"
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
                        className="mt-6 px-6 py-3 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                        style={{
                            borderColor: temaAtual.primario,
                            color: temaAtual.primario
                        }}
                    >
                        <FaHistory />
                        {t("voltarGerenciamento")}
                    </button>
                </>
            )}
        </div>
    );
}