import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface MovimentacaoEstoque {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  motivo: string;
  observacao?: string;
  createdAt: string;
  usuario: { nome: string };
  venda?: { cliente?: { nome: string } };
}

interface LogPedido {
  id: string;
  tipo: string;
  descricao: string;
  createdAt: string;
  usuario: { nome: string };
}

interface HistoricoEstoqueProps {
  produtoId: number;
  modoDark: boolean;
}

interface EventoUnificado {
  id: string;
  tipo: "MOVIMENTACAO" | "LOG";
  data: string;
  usuario: string;
  descricao: string;
  quantidade?: number;
  motivo?: string;
  observacao?: string;
}

export default function HistoricoEstoque({ produtoId, modoDark }: HistoricoEstoqueProps) {
  const { t: tEstoque } = useTranslation("estoque");
  const { t: tLogs } = useTranslation("logs");
  const [eventos, setEventos] = useState<EventoUnificado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const traduzirStatusPedido = (status: string): string => {
    const mapeamentoStatus: Record<string, string> = {
      'PENDENTE': 'status_pedido.PENDENTE',
      'PROCESSANDO': 'status_pedido.PROCESSANDO',
      'CONCLUIDO': 'status_pedido.CONCLUIDO',
      'CANCELADO': 'status_pedido.CANCELADO'
    };

    const chaveTraducao = mapeamentoStatus[status];
    return chaveTraducao ? tLogs(chaveTraducao) : status;
  };

  const traduzirObservacao = (observacao: string) => {
    const padroesTraducao: Record<string, { pt: string; en: string }> = {
      'Entrada por pedido': {
        pt: 'Entrada por pedido',
        en: 'Order entry'
      },
      'Cancelamento do pedido': {
        pt: 'Cancelamento do pedido',
        en: 'Order cancellation'
      }
    };

    let observacaoTraduzida = observacao;
    Object.entries(padroesTraducao).forEach(([pt, traducoes]) => {
      if (observacao.includes(pt)) {
        observacaoTraduzida = observacao.replace(
          pt,
          traducoes['pt'] || pt
        );
      }
    });

    return observacaoTraduzida;
  };

  useEffect(() => {
    const carregarHistoricoCompleto = async () => {
      try {
        const responseMovimentacoes = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/movimentacoes-estoque/produto/${produtoId}`
        );

        const responseLogs = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/logs/produto/${produtoId}`
        );

        const eventosUnificados: EventoUnificado[] = [];

        if (responseMovimentacoes.ok) {
          const movimentacoes: MovimentacaoEstoque[] = await responseMovimentacoes.json();

          movimentacoes.forEach(mov => {
            eventosUnificados.push({
              id: mov.id,
              tipo: "MOVIMENTACAO",
              data: mov.createdAt,
              usuario: mov.usuario.nome,
              descricao: `${mov.tipo === "ENTRADA" ? "+" : "-"}${mov.quantidade} ${tEstoque("unidades")}`,
              quantidade: mov.quantidade,
              motivo: mov.motivo,
              observacao: mov.observacao
            });
          });
        }

        if (responseLogs.ok) {
          const logs: LogPedido[] = await responseLogs.json();

          const logsFiltrados = logs.filter(log => {
            try {
              const descricaoParsed = JSON.parse(log.descricao);
              return descricaoParsed.entityType === "pedidos";
            } catch {
              return log.descricao.includes("pedido") || log.descricao.includes("Pedido");
            }
          });

          logsFiltrados.forEach(log => {
            eventosUnificados.push({
              id: log.id,
              tipo: "LOG",
              data: log.createdAt,
              usuario: log.usuario.nome,
              descricao: log.descricao
            });
          });
        }

        const ordenado = eventosUnificados.sort((a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );

        setEventos(ordenado);
        setPaginaAtual(1);
      } catch (error) {
        console.error("Erro ao carregar histórico completo:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarHistoricoCompleto();
  }, [produtoId, tEstoque]);

  if (carregando) return <div className="p-4 text-center">{tEstoque("carregando")}</div>;

  const totalPaginas = Math.max(1, Math.ceil(eventos.length / itensPorPagina));
  const indexInicial = (paginaAtual - 1) * itensPorPagina;
  const paginaItens = eventos.slice(indexInicial, indexInicial + itensPorPagina);

  const formatarDescricaoLog = (descricao: string) => {
    try {
      const parsed = JSON.parse(descricao);

      if (parsed.entityType === "pedidos") {
        switch (parsed.action) {
          case "pedido_criado":
            return tLogs("descricoes.pedido_criado", {
              pedidoNumero: parsed.pedidoNumero,
              fornecedorNome: parsed.fornecedorNome,
              quantidadeItens: parsed.quantidadeItens
            });
          case "status_atualizado":
            return tLogs("descricoes.status_atualizado", {
              pedidoNumero: parsed.pedidoNumero,
              statusAnterior: traduzirStatusPedido(parsed.statusAnterior),
              statusNovo: traduzirStatusPedido(parsed.statusNovo),
              fornecedorNome: parsed.fornecedorNome
            });
          case "itens_atualizados":
            return tLogs("descricoes.itens_atualizados", {
              pedidoNumero: parsed.pedidoNumero,
              quantidadeItensAtualizados: parsed.quantidadeItensAtualizados,
              fornecedorNome: parsed.fornecedorNome
            });
          case "pedido_concluido_estoque":
            return tLogs("descricoes.pedido_concluido_estoque", {
              pedidoNumero: parsed.pedidoNumero,
              fornecedorNome: parsed.fornecedorNome,
              statusFinal: traduzirStatusPedido(parsed.statusFinal)
            });
          case "email_enviado_fornecedor":
            return tLogs("descricoes.email_enviado_fornecedor", {
              pedidoNumero: parsed.pedidoNumero,
              fornecedorNome: parsed.fornecedorNome,
              fornecedorEmail: parsed.fornecedorEmail
            });
          default:
            return descricao;
        }
      }
    } catch {
      return descricao;
    }
    return descricao;
  };

  const gerarPaginas = () => {
    const paginas: (number | string)[] = [];
    if (totalPaginas <= 6) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      if (paginaAtual <= 3) {
        paginas.push(1, 2, 3, "...", totalPaginas);
      } else if (paginaAtual >= totalPaginas - 2) {
        paginas.push(1, "...", totalPaginas - 2, totalPaginas - 1, totalPaginas);
      } else {
        paginas.push(1, "...", paginaAtual - 1, paginaAtual, paginaAtual + 1, "...", totalPaginas);
      }
    }
    return paginas;
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-3 text-lg">{tEstoque("historicoTitulo")}</h3>

      <div className="flex flex-col gap-3 overflow-visible min-h-[8rem]">
        {paginaItens.map((evento) => (
          <div
            key={evento.id}
            className="p-3 border rounded-lg text-sm"
            style={{
              backgroundColor: modoDark ? "#1E4976" : "#F1F5F9",
              borderColor: modoDark ? "#2D4B75" : "#E2E8F0",
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`font-medium ${evento.tipo === "MOVIMENTACAO"
                    ? (evento.descricao.includes("+") ? "text-green-600" : "text-red-600")
                    : "text-blue-400"
                  }`}
              >
                {evento.tipo === "MOVIMENTACAO"
                  ? evento.descricao
                  : formatarDescricaoLog(evento.descricao)
                }
              </span>
              <span className={`text-xs ${modoDark ? "text-white" : "text-gray-500"}`}>
                {new Date(evento.data).toLocaleDateString()}
              </span>
            </div>

            {evento.tipo === "MOVIMENTACAO" && (
              <>
                <div className={`text-xs mb-1 ${modoDark ? "text-white" : "text-gray-600"}`}>
                  <strong>{tEstoque("motivo")}:</strong>{" "}
                  {tEstoque(`motivos.${evento.motivo?.toLowerCase()}`, { defaultValue: evento.motivo })}
                </div>

                <div className={`text-xs ${modoDark ? "text-white" : "text-gray-600"}`}>
                  <strong>{tEstoque("por")}:</strong> {evento.usuario}
                </div>

                {evento.observacao && (
                  <div className={`text-xs italic mt-2 ${modoDark ? "text-white" : "text-gray-600"}`}>
                    {traduzirObservacao(evento.observacao)}
                  </div>
                )}
              </>
            )}

            {evento.tipo === "LOG" && (
              <div className={`text-xs ${modoDark ? "text-white" : "text-gray-600"}`}>
                <strong>{tEstoque("por")}:</strong> {evento.usuario}
              </div>
            )}
          </div>
        ))}

        {eventos.length === 0 && (
          <div className="text-center text-gray-500 py-4">{tEstoque("nenhumaMovimentacao")}</div>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            className="px-2 py-1 border rounded cursor-pointer disabled:opacity-50"
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
          >
            {"<"}
          </button>

          {gerarPaginas().map((p, idx) =>
            p === "..." ? (
              <span key={idx} className="px-2 py-1">
                ...
              </span>
            ) : (
              <button
                key={idx}
                onClick={() => setPaginaAtual(p as number)}
                className={`px-2 py-1 border cursor-pointer rounded ${paginaAtual === p ? "bg-blue-500 text-white" : ""}`}
              >
                {p}
              </button>
            )
          )}

          <button
            className="px-2 py-1 cursor-pointer border rounded disabled:opacity-50"
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
          >
            {">"}
          </button>

          <button
            className="px-2 py-1 border cursor-pointer rounded"
            onClick={() => setPaginaAtual(totalPaginas)}
            disabled={paginaAtual === totalPaginas}
            title="ir ao final"
          >
            {"»"}
          </button>
        </div>
      )}
    </div>
  );
}