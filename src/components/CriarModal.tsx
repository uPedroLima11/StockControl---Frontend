"use client";

import { useState } from "react";
import { FaSearch, FaPlus, FaMinus, FaTimes } from "react-icons/fa";

interface CriarModalProps {
  temaAtual: any;
  t: any;
  fornecedores: any[];
  produtos: any[];
  fornecedorSelecionado: string;
  itensCriacao: any[];
  observacoesCriacao: string;
  buscaProduto: string;
  carregandoCriacao: boolean;
  setFornecedorSelecionado: (fornecedor: string) => void;
  setBuscaProduto: (busca: string) => void;
  setItensCriacao: (itens: any[]) => void;
  setObservacoesCriacao: (observacoes: string) => void;
  adicionarItem: (produto: any) => void;
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
  setItensCriacao,
  setObservacoesCriacao,
  adicionarItem,
  removerItem,
  atualizarQuantidade,
  atualizarObservacao,
  calcularTotal,
  handleCriarPedido,
  onClose
}: CriarModalProps) {
  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(buscaProduto.toLowerCase()) &&
    (!fornecedorSelecionado || produto.fornecedorId === fornecedorSelecionado)
  );

  const formatarNomeFornecedor = (nome: string, email: string) => {
    const maxLength = 25;
    let nomeFormatado = nome;
    
    if (nome.length > maxLength) {
      nomeFormatado = nome.substring(0, maxLength - 3) + '...';
    }
    
    return `${nomeFormatado} - ${email}`;
  };

  return (
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
          <h2 className="text-xl font-bold">{t("novoPedido")}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-medium">{t("adicionarProdutos")}</label>
            <div className="flex items-center border rounded-full px-3 py-1" style={{ borderColor: temaAtual.borda }}>
              <input
                type="text"
                placeholder={t("buscarProdutos")}
                className="outline-none bg-transparent placeholder-gray-400 flex-1 text-sm"
                style={{ color: temaAtual.texto }}
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
              />
              <FaSearch className="ml-2" style={{ color: temaAtual.primario }} />
            </div>

            <div className="max-h-48 overflow-y-auto mt-2 border rounded" style={{ borderColor: temaAtual.borda }}>
              {produtosFiltrados.map(produto => (
                <div
                  key={produto.id}
                  className="p-3 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  style={{ borderColor: temaAtual.borda }}
                  onClick={() => adicionarItem(produto)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{produto.nome}</span>
                    <span className="text-sm">R$ {produto.preco.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t("estoque")}: {produto.quantidade} | {t("codigo")}: {produto.id}
                  </div>
                </div>
              ))}
              {produtosFiltrados.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-sm">
                  {t("nenhumProdutoEncontrado")}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">{t("selecionarFornecedor")}</label>
            <select
              value={fornecedorSelecionado}
              onChange={(e) => setFornecedorSelecionado(e.target.value)}
              className="w-full p-2 rounded border text-sm"
              style={{
                backgroundColor: temaAtual.card,
                borderColor: temaAtual.borda,
                color: temaAtual.texto
              }}
            >
              <option value="">{t("selecionarFornecedor")}</option>
              {fornecedores.map(fornecedor => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {formatarNomeFornecedor(fornecedor.nome, fornecedor.email)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">{t("itensPedido")}</h3>
          {itensCriacao.length === 0 ? (
            <p className="text-gray-500 text-sm p-4 text-center border rounded" style={{ borderColor: temaAtual.borda }}>
              {t("nenhumItemAdicionado")}
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
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

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{t("totalPedido")}:</span>
            <span className="text-lg font-bold">R$ {calcularTotal().toFixed(2)}</span>
          </div>

          <div>
            <label className="block mb-2 font-medium">{t("observacoesGerais")}</label>
            <textarea
              value={observacoesCriacao}
              onChange={(e) => setObservacoesCriacao(e.target.value)}
              rows={3}
              className="w-full p-2 rounded border text-sm"
              style={{
                backgroundColor: temaAtual.card,
                borderColor: temaAtual.borda,
                color: temaAtual.texto
              }}
              placeholder={t("observacoesPlaceholder")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-sm"
            style={{
              borderColor: temaAtual.borda,
              color: temaAtual.texto
            }}
          >
            {t("cancelar")}
          </button>

          <button
            onClick={handleCriarPedido}
            disabled={carregandoCriacao || itensCriacao.length === 0 || !fornecedorSelecionado}
            className="px-4 py-2 rounded text-white text-sm"
            style={{
              backgroundColor: temaAtual.primario,
              opacity: (carregandoCriacao || itensCriacao.length === 0 || !fornecedorSelecionado) ? 0.6 : 1
            }}
          >
            {carregandoCriacao ? t("criandoPedido") : t("criarPedido")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemPedidoCriacao({ item, temaAtual, t, onRemove, onUpdateQuantity, onUpdateObservation }: any) {
  const [observacao, setObservacao] = useState(item.observacao || "");

  const handleObservacaoChange = (value: string) => {
    setObservacao(value);
    onUpdateObservation(value);
  };

  return (
    <div className="p-3 border rounded" style={{ borderColor: temaAtual.borda }}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="font-medium text-sm">{item.produto.nome}</div>
          <div className="text-xs">R$ {item.precoUnitario.toFixed(2)} {t("unidade")}</div>
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <FaTimes size={14} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateQuantity(item.quantidade - 1)}
            className="p-1 rounded border"
            style={{ borderColor: temaAtual.borda }}
          >
            <FaMinus size={10} />
          </button>
          <span className="w-8 text-center text-sm">{item.quantidade}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantidade + 1)}
            className="p-1 rounded border"
            style={{ borderColor: temaAtual.borda }}
          >
            <FaPlus size={10} />
          </button>
        </div>

        <div className="flex-1">
          <input
            type="text"
            placeholder={t("observacaoItem")}
            value={observacao}
            onChange={(e) => handleObservacaoChange(e.target.value)}
            className="w-full p-1 text-xs border rounded"
            style={{
              backgroundColor: temaAtual.card,
              borderColor: temaAtual.borda,
              color: temaAtual.texto
            }}
          />
        </div>

        <div className="font-medium text-sm">
          R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
        </div>
      </div>
    </div>
  );
}