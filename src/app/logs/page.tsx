"use client";
import { LogsI } from "@/utils/types/logs";
import { useEffect, useState } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTranslation } from "react-i18next";

type TipoLog = "CRIACAO" | "ATUALIZACAO" | "EXCLUSAO" | "BAIXA";

export default function Logs() {
  const { t } = useTranslation("logs");
  const [modoDark, setModoDark] = useState(false);
  const [logs, setLogs] = useState<LogsI[]>([]);
  const [busca, setBusca] = useState("");
  const [nomesUsuarios, setNomesUsuarios] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [logExpandido, setLogExpandido] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setCarregando(true);
      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

      const root = document.documentElement;
      if (ativado) {
        root.style.setProperty("--cor-fundo", "#20252B");
        root.style.setProperty("--cor-fonte", "#FFFFFF");
        root.style.setProperty("--cor-subtitulo", "#A3A3A3");
        root.style.setProperty("--cor-fundo-bloco", "#1a25359f");
      } else {
        root.style.setProperty("--cor-fundo", "#FFFFFF");
        root.style.setProperty("--cor-fonte", "#000000");
        root.style.setProperty("--cor-subtitulo", "#4B5563");
        root.style.setProperty("--cor-fundo-bloco", "#ececec");
      }

      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) {
          setLogs([]);
          setCarregando(false);
          return;
        }

        const usuarioValor = usuarioSalvo.replace(/"/g, "");
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
      } finally {
        setCarregando(false);
      }
    };

    initialize();
  }, [t]);

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
    const { nomeProduto, quantidade, nomeCliente, clienteNaoInformado } = extrairInfoVenda(descricao);

    if (quantidade) {
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{t("logs.produto")}: {nomeProduto}</span>
          <span>{t("logs.quantidade")}: {quantidade}</span>
          <span>{t("logs.cliente")}: {clienteNaoInformado ? t("logs.cliente_nao_informado") : nomeCliente}</span>
        </div>
      );
    }
    if (descricao.includes("Produto Excluido")) {
      const nomeProduto = descricao.split(":")[1]?.trim() || "";
      return `${t("logs.descricoes.produto_excluido", { nome: nomeProduto })}`;
    }
    if (descricao.includes("Produto Atualizado")) {
      const nomeProduto = descricao.split(":")[1]?.trim() || "";
      return `${t("logs.descricoes.produto_atualizado", { nome: nomeProduto })}`;
    }
    if (descricao.includes("Produto criado")) {
      const nomeProduto = descricao.split(":")[1]?.trim() || "";
      return `${t("logs.descricoes.produto_criado", { nome: nomeProduto })}`;
    }
    return descricao;
  };

  const formatarDescricaoMobile = (descricao: string) => {
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
    if (descricao.includes("Produto Excluido")) {
      const nomeProduto = descricao.split(":")[1]?.trim() || "";
      return (
        <div className="flex">
          <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
          <span>{nomeProduto}</span>
        </div>
      );
    }
    if (descricao.includes("Produto Atualizado")) {
      const nomeProduto = descricao.split(":")[1]?.trim() || "";
      return (
        <div className="flex">
          <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
          <span>{nomeProduto}</span>
        </div>
      );
    }
    if (descricao.includes("Produto criado")) {
      const nomeProduto = descricao.split(":")[1]?.trim() || "";
      return (
        <div className="flex">
          <span className="font-semibold min-w-[70px]">{t("logs.produto")}:</span>
          <span>{nomeProduto}</span>
        </div>
      );
    }
    return descricao;
  };

  const toggleExpandirLog = (id: string) => {
    setLogExpandido(logExpandido === id ? null : id);
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <p style={{ color: "var(--cor-fonte)" }}>{t("logs.carregando")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: "var(--cor-fonte)" }}>
          {t("logs.titulo")}
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 mb-3 md:mb-6">
          <div
            className="flex items-center border rounded-full px-3 md:px-4 py-1 md:py-2 shadow-sm"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#FFFFFF" : "#000000",
            }}
          >
            <input
              type="text"
              placeholder={t("logs.placeholder_busca")}
              className="outline-none font-mono text-sm bg-transparent"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ color: "var(--cor-fonte)" }}
            />
            <FaSearch className="ml-2" style={{ color: modoDark ? "#FBBF24" : "#00332C" }} />
          </div>
        </div>

        <div
          className="border rounded-xl shadow"
          style={{
            backgroundColor: "var(--cor-fundo-bloco)",
            borderColor: modoDark ? "#FFFFFF" : "#000000",
          }}
        >
          {logs.length === 0 ? (
            <div className="p-4 text-center" style={{ color: "var(--cor-fonte)" }}>
              {t("logs.nenhum_log_encontrado")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b">
                    <tr style={{ color: "var(--cor-fonte)" }}>
                      <th className="py-3 px-4 text-center">{t("logs.usuario")}</th>
                      <th className="py-3 px-4 text-center">{t("logs.tipo")}</th>
                      <th className="py-3 px-4 text-center min-w-[300px]">{t("logs.descricao")}</th>
                      <th className="py-3 px-4 text-center">{t("logs.datacriacao")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs
                      .filter((log) => log.descricao.toLowerCase().includes(busca.toLowerCase()))
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 15)
                      .map((log) => (
                        <tr key={log.id} className="border-b hover:bg-opacity-50 transition">
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
                {logs
                  .filter((log) => log.descricao.toLowerCase().includes(busca.toLowerCase()))
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 15)
                  .map((log) => (
                    <div
                      key={log.id}
                      className={`border rounded-lg p-3 transition-all ${modoDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                        }`}
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
                            <span className="text-xs" style={{ color: "var(--cor-subtitulo)" }}>
                              {formatarData(log.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm mb-1" style={{ color: "var(--cor-fonte)" }}>
                            <span className="font-semibold">{t("logs.usuario")}:</span> {log.usuarioId
                              ? (nomesUsuarios[log.usuarioId] || t("logs.carregando"))
                              : t("logs.usuario_nao_informado")}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleExpandirLog(log.id)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          style={{ color: modoDark ? "#a0aec0" : "#4a5568" }}
                        >
                          {logExpandido === log.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>

                      <div
                        className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${logExpandido === log.id ? "max-h-96" : "max-h-0"
                          }`}
                        style={{ color: "var(--cor-fonte)" }}
                      >
                        <div className="pt-2 border-t" style={{ borderColor: modoDark ? "#374151" : "#e5e7eb" }}>
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