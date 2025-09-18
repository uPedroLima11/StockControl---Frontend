"use client";
import { LogsI } from "@/utils/types/logs";
import { useEffect, useState } from "react";
import { FaSearch, FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { usuarioTemPermissao } from "@/utils/permissoes";

type TipoLog = "CRIACAO" | "ATUALIZACAO" | "EXCLUSAO" | "BAIXA";

export default function Logs() {
  const { t } = useTranslation("logs");
  const [modoDark, setModoDark] = useState(false);
  const [logs, setLogs] = useState<LogsI[]>([]);
  const [busca, setBusca] = useState("");
  const [nomesUsuarios, setNomesUsuarios] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [logExpandido, setLogExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [temPermissao, setTemPermissao] = useState<boolean | null>(null);
  const [, setUserId] = useState<string | null>(null);

  const logsPorPagina = 14;

  const temaAtual = {
    fundo: modoDark ? "#0A1929" : "#F8FAFC",
    texto: modoDark ? "#FFFFFF" : "#0F172A",
    card: modoDark ? "#132F4C" : "#FFFFFF",
    borda: modoDark ? "#1E4976" : "#E2E8F0",
    primario: modoDark ? "#1976D2" : "#1976D2",
    secundario: modoDark ? "#00B4D8" : "#0284C7",
    placeholder: modoDark ? "#9CA3AF" : "#6B7280",
    hover: modoDark ? "#1E4976" : "#EFF6FF"
  };

  useEffect(() => {
    const initialize = async () => {
      setCarregando(true);
      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

      document.body.style.backgroundColor = ativado ? "#0A1929" : "#F8FAFC";

      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) {
          setTemPermissao(false);
          setCarregando(false);
          return;
        }

        const usuarioValor = usuarioSalvo.replace(/"/g, "");
        setUserId(usuarioValor);

        const permissao = await usuarioTemPermissao(usuarioValor, "logs_visualizar");
        setTemPermissao(permissao);

        if (!permissao) {
          setCarregando(false);
          return;
        }

        const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
        const usuarioData = await responseUsuario.json();

        if (!usuarioData || !usuarioData.empresaId) {
          setLogs([]);
          setCarregando(false);
          return;
        }

        const responseLogs = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/logs`);
        let logsData = await responseLogs.json();

        logsData = logsData.filter((log: LogsI) => log.empresaId === usuarioData.empresaId);
        logsData.sort((a: LogsI, b: LogsI) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setLogs(logsData);

        const usuariosUnicos = new Set<string>(
          logsData
            .filter((log: LogsI) => log.usuarioId)
            .map((log: LogsI) => log.usuarioId as string)
        );

        const usuariosMap: Record<string, string> = {};

        await Promise.all(
          Array.from(usuariosUnicos).map(async (usuarioId: string) => {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
              const usuario = await response.json();
              if (usuario && usuario.nome) {
                usuariosMap[usuarioId] = usuario.nome;
              }
            } catch (error) {
              console.error(`Erro ao buscar usuário ${usuarioId}:`, error);
              usuariosMap[usuarioId] = t("logs.nenhum_log_encontrado");
            }
          })
        );
        setNomesUsuarios(usuariosMap);
      } catch (error) {
        console.error("Erro ao carregar logs:", error);
        setLogs([]);
        setTemPermissao(false);
      } finally {
        setCarregando(false);
      }
    };

    initialize();
  }, [t]);

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

  const indexUltimoLog = paginaAtual * logsPorPagina;
  const indexPrimeiroLog = indexUltimoLog - logsPorPagina;
  const logsAtuais = logs
    .filter((log) => log.descricao.toLowerCase().includes(busca.toLowerCase()))
    .slice(indexPrimeiroLog, indexUltimoLog);
  const totalPaginas = Math.ceil(
    logs.filter((log) => log.descricao.toLowerCase().includes(busca.toLowerCase())).length / logsPorPagina
  );

  function formatarData(dataString: string | Date) {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const traduzirTipoLog = (tipo: string): string => {
    const tiposValidos: TipoLog[] = ["CRIACAO", "ATUALIZACAO", "EXCLUSAO", "BAIXA"];
    if (tiposValidos.includes(tipo as TipoLog)) {
      return t(`logs.tipos_logs.${tipo as TipoLog}`);
    }
    return tipo;
  };

  const extrairInfoVenda = (descricao: string) => {
    const produtoMatch = descricao.split('\n')[0].split('|')[0].trim();
    const quantidadeMatch = descricao.match(/\|\s*Quantidade:\s*(\d+)/i) ||
      descricao.match(/\|\s*Qty:\s*(\d+)/i);
    const clienteMatch = descricao.match(/\|\s*Cliente:\s*(.+?)(\n|\||$)/i) ||
      descricao.match(/\|\s*Client:\s*(.+?)(\n|\||$)/i);

    return {
      nomeProduto: produtoMatch || "",
      quantidade: quantidadeMatch?.[1] || "",
      nomeCliente: clienteMatch?.[1]?.trim() || "",
      clienteNaoInformado: clienteMatch?.[1]?.trim() === "Não Informado" ||
        clienteMatch?.[1]?.trim() === "Not Informed"
    };
  };

  const formatarDescricaoDesktop = (descricao: string) => {
    try {
      const parsed = JSON.parse(descricao);

      if (parsed.entityType === "vendas" && parsed.action === "produto_vendido") {
        return t("logs.descricoes.produto_vendido", {
          nome: parsed.produtoNome,
          quantidade: parsed.quantidade
        }) + (parsed.clienteNome ? ` | ${t("logs.cliente")}: ${parsed.clienteNome}` : ` | ${t("logs.cliente")}: ${t("logs.cliente_nao_informado")}`);
      }

      if (parsed.entityType) {
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {t("logs.exportacao_de")}: {t(`logs.entidades.${parsed.entityType}`) || parsed.entityType}
            </span>
            <span>{t("logs.periodo")}: {parsed.periodo === "Todos os dados" ? t("logs.periodo_todos") : parsed.periodo}</span>
          </div>
        );
      }
    } catch {
      if (descricao.includes('Produto Vendido:') || descricao.includes('Product Sold:')) {
        const produtoMatch = descricao.match(/Produto Vendido: (.+?) \|/) || descricao.match(/Product Sold: (.+?) \|/);
        const quantidadeMatch = descricao.match(/\|\s*Quantidade: (\d+)/) || descricao.match(/\|\s*Quantity: (\d+)/);
        const clienteMatch = descricao.match(/\|\s*Cliente: (.+?)$/) || descricao.match(/\|\s*Client: (.+?)$/);

        return t("logs.descricoes.produto_vendido", {
          nome: produtoMatch?.[1] || '',
          quantidade: quantidadeMatch?.[1] || '0'
        }) + (clienteMatch?.[1] ? ` | ${t("logs.cliente")}: ${clienteMatch[1]}` : ` | ${t("logs.cliente")}: ${t("logs.cliente_nao_informado")}`);
      }

      if (descricao.includes('Exportação de')) {
        const parts = descricao.split(' | ');
        const entityMatch = parts[0].match(/Exportação de (\w+)/);
        const periodMatch = parts[1]?.match(/Período: (.+)/);

        const entityType = entityMatch ? entityMatch[1] : '';
        let periodo = periodMatch ? periodMatch[1] : t("logs.periodo_todos");

        if (periodo === "Todos os dados") {
          periodo = t("logs.periodo_todos");
        }

        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {t("logs.exportacao_de")}: {t(`logs.entidades.${entityType}`) || entityType}
            </span>
            <span>{t("logs.periodo")}: {periodo}</span>
          </div>
        );
      }

      if (descricao.includes("Vendas excluídas automaticamente") || descricao.includes("Sales automatically deleted")) {
        const match = descricao.match(/para o produto: (.+?) \((\d+) vendas\)/) ||
          descricao.match(/for product: (.+?) \((\d+) sales\)/);
        return t("logs.descricoes.vendas_excluidas_automaticamente", {
          nome: match?.[1] || '',
          quantidade: match?.[2] || '0'
        });
      }

      if (descricao.includes("Movimentações de estoque excluídas automaticamente") || descricao.includes("Stock movements automatically deleted")) {
        const match = descricao.match(/para o produto: (.+?) \((\d+) movimentações\)/) ||
          descricao.match(/for product: (.+?) \((\d+) movements\)/);
        return t("logs.descricoes.movimentacoes_excluidas_automaticamente", {
          nome: match?.[1] || '',
          quantidade: match?.[2] || '0'
        });
      }

      if (descricao.includes("Produto Excluído") || descricao.includes("Product Deleted")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return t("logs.descricoes.produto_excluido", { nome: nomeProduto });
      }

      if (descricao.includes("Produto Atualizado") || descricao.includes("Product Updated")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return t("logs.descricoes.produto_atualizado", { nome: nomeProduto });
      }

      if (descricao.includes("Produto criado") || descricao.includes("Product Created")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return t("logs.descricoes.produto_criado", { nome: nomeProduto });
      }

      if (descricao.includes("Produto Exportado") || descricao.includes("Product Exported")) {
        const match = descricao.match(/Produto Exportado: (.+?) \(Período: (.+?)\)/) ||
          descricao.match(/Product Exported: (.+?) \(Period: (.+?)\)/);
        return t("logs.descricoes.produto_exportado", {
          nome: match?.[1] || '',
          periodo: match?.[2] || ''
        });
      }
    }

    return descricao;
  };

  const formatarDescricaoMobile = (descricao: string) => {
    try {
      const parsed = JSON.parse(descricao);

      if (parsed.entityType === "vendas" && parsed.action === "produto_vendido") {
        return (
          <div className="space-y-1">
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
              <span className="truncate">{parsed.produtoNome}</span>
            </div>
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.quantidade")}:</span>
              <span>{parsed.quantidade}</span>
            </div>
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.cliente")}:</span>
              <span>{parsed.clienteNome || t("logs.cliente_nao_informado")}</span>
            </div>
          </div>
        );
      }

      if (parsed.entityType) {
        return (
          <div className="space-y-1">
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.exportacao_de")}:</span>
              <span>{t(`logs.entidades.${parsed.entityType}`) || parsed.entityType}</span>
            </div>
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.periodo")}:</span>
              <span>{parsed.periodo === "Todos os dados" ? t("logs.periodo_todos") : parsed.periodo}</span>
            </div>
          </div>
        );
      }
    } catch {
      const { nomeProduto, quantidade, nomeCliente, clienteNaoInformado } = extrairInfoVenda(descricao);

      if (quantidade) {
        return (
          <div className="space-y-1">
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
              <span className="truncate">{nomeProduto}</span>
            </div>
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.quantidade")}:</span>
              <span>{quantidade}</span>
            </div>
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.cliente")}:</span>
              <span>{clienteNaoInformado ? t("logs.cliente_nao_informado") : nomeCliente}</span>
            </div>
          </div>
        );
      }

      if (descricao.includes("Produto Excluído") || descricao.includes("Product Deleted")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return (
          <div className="flex">
            <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
            <span>{nomeProduto}</span>
          </div>
        );
      }

      if (descricao.includes("Produto Atualizado") || descricao.includes("Product Updated")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return (
          <div className="flex">
            <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
            <span>{nomeProduto}</span>
          </div>
        );
      }

      if (descricao.includes("Produto criado") || descricao.includes("Product Created")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return (
          <div className="flex">
            <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
            <span>{nomeProduto}</span>
          </div>
        );
      }

      if (descricao.includes("Vendas excluídas automaticamente") || descricao.includes("Sales automatically deleted")) {
        const match = descricao.match(/para o produto: (.+?) \((\d+) vendas\)/) ||
          descricao.match(/for product: (.+?) \((\d+) sales\)/);
        return (
          <div className="flex">
            <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
            <span>{match?.[1] || ''} ({match?.[2] || '0'} {t("logs.vendas").toLowerCase()})</span>
          </div>
        );
      }

      if (descricao.includes("Movimentações de estoque excluídas automaticamente") || descricao.includes("Stock movements automatically deleted")) {
        const match = descricao.match(/para o produto: (.+?) \((\d+) movimentações\)/) ||
          descricao.match(/for product: (.+?) \((\d+) movements\)/);
        return (
          <div className="flex">
            <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
            <span>{match?.[1] || ''} ({match?.[2] || '0'} {t("logs.movimentacoes").toLowerCase()})</span>
          </div>
        );
      }

      if (descricao.includes("Exportação de") || descricao.includes("Export of")) {
        const parts = descricao.split(' | ');
        const entityMatch = parts[0].match(/Exportação de (\w+)/) || parts[0].match(/Export of (\w+)/);
        const periodMatch = parts[1]?.match(/Período: (.+)/) || parts[1]?.match(/Period: (.+)/);

        const entityType = entityMatch ? entityMatch[1] : '';
        let periodo = periodMatch ? periodMatch[1] : t("logs.periodo_todos");

        if (periodo === "Todos os dados" || periodo === "All data") {
          periodo = t("logs.periodo_todos");
        }

        return (
          <div className="space-y-1">
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.exportacao_de")}:</span>
              <span>{t(`logs.entidades.${entityType}`) || entityType}</span>
            </div>
            <div className="flex">
              <span className="font-semibold min-w-[70px]">{t("logs.periodo")}:</span>
              <span>{periodo}</span>
            </div>
          </div>
        );
      }
    }

    return descricao;
  };

  const toggleExpandirLog = (id: string) => {
    setLogExpandido(logExpandido === id ? null : id);
  };

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setLogExpandido(null);
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: temaAtual.fundo }}>
        <p style={{ color: temaAtual.texto }}>{t("logs.carregando")}</p>
      </div>
    );
  }

  if (temPermissao === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4" style={{ backgroundColor: temaAtual.fundo }}>
        <div className="text-center p-6 rounded-lg" style={{ backgroundColor: temaAtual.card, border: `1px solid ${temaAtual.borda}` }}>
          <div className="flex justify-center mb-4">
            <FaLock className="text-4xl" style={{ color: "#EF4444" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: temaAtual.texto }}>
            {t("logs.acesso_negado.titulo")}
          </h2>
          <p className="mb-4" style={{ color: temaAtual.texto }}>
            {t("logs.acesso_negado.mensagem")}
          </p>
          <p className="text-sm" style={{ color: temaAtual.placeholder }}>
            {t("logs.acesso_negado.permissao_necessaria")}: <strong>logs_visualizar</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: temaAtual.texto }}>
          {t("logs.titulo")}
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 mb-3 md:mb-6">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center border rounded-full px-3 md:px-4 py-1 md:py-2 shadow-sm flex-1"
              style={{
                backgroundColor: temaAtual.card,
                borderColor: temaAtual.borda,
              }}
            >
              <input
                type="text"
                placeholder={t("logs.placeholder_busca")}
                className="outline-none font-mono text-sm bg-transparent placeholder-gray-400"
                style={{
                  color: temaAtual.texto,
                }}
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPaginaAtual(1);
                }}
              />
              <FaSearch className="ml-2" style={{ color: temaAtual.primario }} />
            </div>
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
        </div>

        <div
          className="border rounded-xl shadow"
          style={{
            backgroundColor: temaAtual.card,
            borderColor: temaAtual.borda,
          }}
        >
          {logs.length === 0 ? (
            <div className="p-4 text-center" style={{ color: temaAtual.texto }}>
              {t("logs.nenhum_log_encontrado")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b" style={{ borderColor: temaAtual.borda }}>
                    <tr style={{ color: temaAtual.texto }}>
                      <th className="py-3 px-4 text-center">{t("logs.usuario")}</th>
                      <th className="py-3 px-4 text-center">{t("logs.tipo")}</th>
                      <th className="py-3 px-4 text-center min-w-[300px]">{t("logs.descricao")}</th>
                      <th className="py-3 px-4 text-center">{t("logs.datacriacao")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsAtuais.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b transition-all duration-200 cursor-pointer"
                        style={{
                          color: temaAtual.texto,
                          borderColor: temaAtual.borda,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = modoDark
                            ? "#1E4976"
                            : "#EFF6FF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td className="py-3 px-4 text-center">
                          {log.usuarioId
                            ? (nomesUsuarios[log.usuarioId] || t("logs.carregando"))
                            : t("logs.usuario_nao_informado")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${log.tipo === "BAIXA" ? "bg-green-100 text-green-800" :
                            log.tipo === "CRIACAO" ? "bg-blue-100 text-blue-800" :
                              log.tipo === "ATUALIZACAO" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                            }`}>
                            {traduzirTipoLog(log.tipo)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-left max-w-xs">
                          {formatarDescricaoDesktop(log.descricao)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {formatarData(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2 p-2">
                {logsAtuais.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-3 transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      borderColor: temaAtual.borda,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = modoDark
                        ? "#1E4976"
                        : "#EFF6FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.card;
                    }}
                    onClick={() => toggleExpandirLog(log.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.tipo === "BAIXA" ? "bg-green-100 text-green-800" :
                            log.tipo === "CRIACAO" ? "bg-blue-100 text-blue-800" :
                              log.tipo === "ATUALIZACAO" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                            }`}>
                            {traduzirTipoLog(log.tipo)}
                          </span>
                          <span className="text-xs" style={{ color: temaAtual.placeholder }}>
                            {formatarData(log.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm mb-1" style={{ color: temaAtual.texto }}>
                          <span className="font-semibold">{t("logs.usuario")}:</span> {log.usuarioId
                            ? (nomesUsuarios[log.usuarioId] || t("logs.carregando"))
                            : t("logs.usuario_nao_informado")}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandirLog(log.id);
                        }}
                        className="p-1"
                        style={{ color: temaAtual.primario }}
                      >
                        {logExpandido === log.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${logExpandido === log.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: temaAtual.texto }}
                    >
                      <div className="pt-2 border-t" style={{ borderColor: temaAtual.borda }}>
                        {formatarDescricaoMobile(log.descricao)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}