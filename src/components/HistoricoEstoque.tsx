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

interface HistoricoEstoqueProps {
  produtoId: number;
  modoDark: boolean;
}

export default function HistoricoEstoque({ produtoId, modoDark }: HistoricoEstoqueProps) {
  const { t } = useTranslation("estoque");
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/movimentacoes-estoque/produto/${produtoId}`
        );

        if (response.ok) {
          const data = await response.json();
          const ordenado = data.sort(
            (a: MovimentacaoEstoque, b: MovimentacaoEstoque) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setMovimentacoes(ordenado);
          setPaginaAtual(1); 
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarHistorico();
  }, [produtoId]);

  if (carregando) return <div className="p-4 text-center">{t("carregando")}</div>;

  const totalPaginas = Math.max(1, Math.ceil(movimentacoes.length / itensPorPagina));
  const indexInicial = (paginaAtual - 1) * itensPorPagina;
  const paginaItens = movimentacoes.slice(indexInicial, indexInicial + itensPorPagina);

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
      <h3 className="font-semibold mb-3 text-lg">{t("historicoTitulo")}</h3>

      <div className="flex flex-col gap-3 overflow-visible min-h-[8rem]">
        {paginaItens.map((mov) => (
          <div
            key={mov.id}
            className="p-3 border rounded-lg text-sm"
            style={{
              backgroundColor: modoDark ? "#1E4976" : "#F1F5F9",
              borderColor: modoDark ? "#2D4B75" : "#E2E8F0",
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`font-medium ${mov.tipo === "ENTRADA" ? "text-green-600" : "text-red-600"}`}
              >
                {mov.tipo === "ENTRADA" ? "+" : "-"}
                {mov.quantidade} {t("unidades")}
              </span>
              <span className={`text-xs ${modoDark ? "text-white" : "text-gray-500"}`}>
                {new Date(mov.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className={`text-xs mb-1 ${modoDark ? "text-white" : "text-gray-600"}`}>
              <strong>{t("motivo")}:</strong>{" "}
              {t(`motivos.${mov.motivo.toLowerCase()}`, { defaultValue: mov.motivo })}
            </div>

            <div className={`text-xs ${modoDark ? "text-white" : "text-gray-600"}`}>
              <strong>{t("por")}:</strong> {mov.usuario.nome}
              {mov.venda?.cliente && ` • ${t("cliente")}: ${mov.venda.cliente.nome}`}
            </div>

            {mov.observacao && (
              <div className={`text-xs italic mt-2 ${modoDark ? "text-white" : "text-gray-600"}`}>
                {mov.observacao}
              </div>
            )}
          </div>
        ))}

        {movimentacoes.length === 0 && (
          <div className="text-center text-gray-500 py-4">{t("nenhumaMovimentacao")}</div>
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

