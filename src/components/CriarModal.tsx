"use client";

import { useState, useEffect, useRef } from "react";
import { FaSearch, FaPlus, FaMinus, FaTimes, FaShoppingCart, FaChevronDown } from "react-icons/fa";
import { Tema, Fornecedor, Produto, ItemPedidoCriacao as ItemPedidoCriacaoType } from "../utils/types/index";
import Image from "next/image";

interface CriarModalProps {
  temaAtual: Tema;
  t: (key: string) => string;
  fornecedores: Fornecedor[];
  produtos: Produto[];
  fornecedorSelecionado: string;
  itensCriacao: ItemPedidoCriacaoType[];
  observacoesCriacao: string;
  buscaProduto: string;
  carregandoCriacao: boolean;
  setFornecedorSelecionado: (fornecedor: string) => void;
  setBuscaProduto: (busca: string) => void;
  setObservacoesCriacao: (observacoes: string) => void;
  adicionarItem: (produto: Produto) => void;
  removerItem: (produtoId: number) => void;
  atualizarQuantidade: (produtoId: number, quantidade: number) => void;
  atualizarObservacao: (produtoId: number, observacao: string) => void;
  calcularTotal: () => number;
  handleCriarPedido: () => void;
  onClose: () => void;
}

export function CriarModal({
  temaAtual,
  t,
  fornecedores,
  produtos,
  fornecedorSelecionado,
  itensCriacao,
  observacoesCriacao,
  buscaProduto,
  carregandoCriacao,
  setFornecedorSelecionado,
  setBuscaProduto,
  setObservacoesCriacao,
  adicionarItem,
  removerItem,
  atualizarQuantidade,
  atualizarObservacao,
  calcularTotal,
  handleCriarPedido,
  onClose
}: CriarModalProps) {
  const [inicializado, setInicializado] = useState(false);
  const buscaInputRef = useRef<HTMLInputElement>(null);

  const modoDark = temaAtual.fundo === "#0A1929";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-gray-200/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(buscaProduto.toLowerCase()) &&
    (!fornecedorSelecionado || produto.fornecedorId === fornecedorSelecionado)
  );

  useEffect(() => {
    if (inicializado) return;

    if (buscaInputRef.current) {
      setTimeout(() => {
        buscaInputRef.current?.focus();
      }, 100);
    }

    setInicializado(true);
  }, [inicializado]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div
        className={`${modoDark ? "bg-slate-800 border-blue-500/30 shadow-blue-500/20" : "bg-gray-200/85 border-blue-200 "} border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{t("novoPedido")}</h2>
              <p className={`text-sm ${textMuted}`}>{t("subtituloCriar") || "Crie um novo pedido para seu fornecedor"}</p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 cursor-pointer ${bgHover} rounded-lg transition-colors ${textMuted} hover:${textPrimary}`}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className={`block ${textPrimary} mb-3 font-medium`}>{t("adicionarProdutos")}</label>
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                  <div className={`relative flex items-center ${bgCard} rounded-xl px-4 py-3 border ${borderColor} backdrop-blur-sm`}>
                    <FaSearch className={`${modoDark ? "text-blue-400" : "text-blue-500"} mr-3 text-sm`} />
                    <input
                      ref={buscaInputRef}
                      type="text"
                      placeholder={t("buscarProdutos")}
                      value={buscaProduto}
                      onChange={(e) => setBuscaProduto(e.target.value)}
                      className={`bg-transparent border-none outline-none ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} w-full text-sm`}
                    />
                  </div>
                </div>
                <div className={`mt-3 max-h-48 overflow-y-auto rounded-xl border ${borderColor} ${bgCard} backdrop-blur-sm`}>
                  {produtosFiltrados.map(produto => (
                    <div
                      key={produto.id}
                      className={`p-3 border-b cursor-pointer transition-all duration-300 ${bgHover} group`}
                      style={{ borderColor: temaAtual.borda }}
                      onClick={() => adicionarItem(produto)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Image
                            src={produto.foto || "/out.jpg"}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded-lg"
                            alt={produto.nome}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/out.jpg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${textPrimary} text-sm group-hover:text-blue-400 transition-colors line-clamp-1`}>
                            {produto.nome}
                          </div>
                          <div className={`text-xs ${textMuted} mt-1`}>
                            {t("estoque")}: {produto.quantidade} • {formatarMoeda(produto.preco)}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`p-1 rounded-lg ${modoDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                            <FaPlus className={`text-xs ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {produtosFiltrados.length === 0 && (
                    <div className="p-4 text-center">
                      <div className={`w-12 h-12 mx-auto mb-2 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
                        <FaShoppingCart className={`text-xl ${textMuted}`} />
                      </div>
                      <p className={`text-sm ${textMuted}`}>{t("nenhumProdutoEncontrado")}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={`block ${textPrimary} mb-3 font-medium`}>{t("selecionarFornecedor")}</label>
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                  <div className={`relative ${bgCard} rounded-xl border ${borderColor} backdrop-blur-sm overflow-hidden`}>
                    <select
                      value={fornecedorSelecionado}
                      onChange={(e) => setFornecedorSelecionado(e.target.value)}
                      className={`w-full cursor-pointer p-3 bg-transparent border-none outline-none ${textPrimary} text-sm appearance-none`}
                      style={{
                        backgroundColor: modoDark ? '#1e293b' : '#ffffff'
                      }}
                    >
                      <option value="" className={modoDark ? "bg-slate-800 text-white" : "bg-white text-slate-900"}>
                        {t("selecionarFornecedor")}
                      </option>
                      {fornecedores.map(fornecedor => (
                        <option
                          key={fornecedor.id}
                          value={fornecedor.id}
                          className={modoDark ? "bg-slate-800 text-white" : "bg-white text-slate-900"}
                        >
                          {fornecedor.nome} - {fornecedor.email}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FaChevronDown className={`${modoDark ? "text-blue-400" : "text-blue-500"} text-sm`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className={`font-medium ${textPrimary} mb-3`}>{t("itensPedido")}</h3>
              {itensCriacao.length === 0 ? (
                <div className={`text-center py-8 rounded-xl border ${borderColor} ${bgCard} backdrop-blur-sm`}>
                  <div className={`w-16 h-16 mx-auto mb-3 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
                    <FaShoppingCart className={`text-2xl ${textMuted}`} />
                  </div>
                  <p className={`text-sm ${textMuted}`}>{t("nenhumItemAdicionado")}</p>
                  <p className={`text-xs ${textMuted} mt-1`}>{t("adicioneProdutos") || "Adicione produtos ao pedido"}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {itensCriacao.map(item => (
                    <ItemPedidoCriacao
                      key={item.produtoId}
                      item={item}
                      temaAtual={temaAtual}
                      t={t}
                      onRemove={() => removerItem(item.produtoId)}
                      onUpdateQuantity={(quantidade: number) => atualizarQuantidade(item.produtoId, quantidade)}
                      onUpdateObservation={(observacao: string) => atualizarObservacao(item.produtoId, observacao)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block ${textPrimary} mb-3 font-medium`}>{t("observacoesGerais")}</label>
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                <textarea
                  value={observacoesCriacao}
                  onChange={(e) => setObservacoesCriacao(e.target.value)}
                  rows={4}
                  placeholder={t("observacoesPlaceholder")}
                  className={`relative w-full ${bgCard} border ${borderColor} rounded-xl px-4 py-3 ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm resize-none backdrop-blur-sm`}
                />
              </div>
            </div>
            <div>
              <div className={`p-4 rounded-xl border ${borderColor} ${bgCard} backdrop-blur-sm`}>
                <h3 className={`font-medium ${textPrimary} mb-3`}>{t("resumoPedido") || "Resumo do Pedido"}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textSecondary}`}>{t("totalItens")}:</span>
                    <span className={`text-sm ${textPrimary} font-medium`}>{itensCriacao.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textSecondary}`}>{t("quantidadeTotal") || "Quantidade Total"}:</span>
                    <span className={`text-sm ${textPrimary} font-medium`}>
                      {itensCriacao.reduce((total, item) => total + item.quantidade, 0)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-blue-500/20 pt-3">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${textPrimary}`}>{t("totalPedido")}:</span>
                    <span className={`text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent`}>
                      {formatarMoeda(calcularTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-blue-500/20">
            <button
              onClick={onClose}
              className={`px-6 py-3 cursor-pointer ${bgCard} ${bgHover} border ${borderColor} ${textPrimary} rounded-xl transition-all duration-300 hover:scale-105 text-sm font-medium`}
            >
              {t("cancelar")}
            </button>
            <button
              onClick={handleCriarPedido}
              disabled={carregandoCriacao || itensCriacao.length === 0 || !fornecedorSelecionado}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 hover:scale-105 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
            >
              {carregandoCriacao ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("criandoPedido")}
                </>
              ) : (
                <>
                  <FaPlus className="text-sm" />
                  {t("criarPedido")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
interface ItemPedidoCriacaoProps {
  item: ItemPedidoCriacaoType;
  temaAtual: Tema;
  t: (key: string) => string;
  onRemove: () => void;
  onUpdateQuantity: (quantidade: number) => void;
  onUpdateObservation: (observacao: string) => void;
}

function ItemPedidoCriacao({
  item,
  temaAtual,
  t,
  onRemove,
  onUpdateQuantity,
  onUpdateObservation
}: ItemPedidoCriacaoProps) {
  const [observacao, setObservacao] = useState(item.observacao || "");
  const modoDark = temaAtual.fundo === "#0A1929";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  const handleObservacaoChange = (value: string) => {
    setObservacao(value);
    onUpdateObservation(value);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className={`p-4 rounded-xl border ${borderColor} ${bgCard} backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Image
            src={item.produto.foto || "/out.jpg"}
            width={50}
            height={50}
            className="w-12 h-12 object-cover rounded-lg"
            alt={item.produto.nome}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/out.jpg";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className={`font-medium ${textPrimary} text-sm line-clamp-1`}>{item.produto.nome}</h4>
              <div className={`text-xs ${textMuted} mt-1`}>
                {formatarMoeda(item.precoUnitario)} {t("unidade")}
              </div>
            </div>
            <button
              onClick={onRemove}
              className={`p-1 cursor-pointer rounded-lg transition-all duration-300 ${bgHover} ${textMuted} hover:text-red-400 ml-2`}
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-700/20 rounded-lg p-1">
                <button
                  onClick={() => onUpdateQuantity(item.quantidade - 1)}
                  disabled={item.quantidade <= 1}
                  className={`p-1 rounded-lg transition-all duration-300 ${item.quantidade <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-600/30'} ${textPrimary}`}
                >
                  <FaMinus className="text-xs" />
                </button>
                <span className={`w-8 text-center text-sm font-medium ${textPrimary}`}>
                  {item.quantidade}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.quantidade + 1)}
                  className={`p-1 cursor-pointer rounded-lg transition-all duration-300 hover:bg-slate-600/30 ${textPrimary}`}
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
              <div className="flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder={t("observacaoItem")}
                  value={observacao}
                  onChange={(e) => handleObservacaoChange(e.target.value)}
                  className={`w-full p-2 text-xs border rounded-lg ${bgCard} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                  style={{ borderColor: temaAtual.borda }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold text-cyan-500 text-sm`}>
                {formatarMoeda(item.quantidade * item.precoUnitario)}
              </div>
              <div className={`text-xs ${textMuted}`}>
                {item.quantidade} × {formatarMoeda(item.precoUnitario)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}