"use client";
import { LogsI } from "@/utils/types/logs";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";

type TipoLog = "CRIACAO" | "ATUALIZACAO" | "EXCLUSAO" | "BAIXA";

export default function Logs() {
  const { t } = useTranslation("logs");
  const [modoDark, setModoDark] = useState(false);
  const [logs, setLogs] = useState<LogsI[]>([]);
  const [busca, setBusca] = useState("");
  const [nomesUsuarios, setNomesUsuarios] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);

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

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <p style={{ color: "var(--cor-fonte)" }}>{t("logs.carregando")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-2xl font-mono mb-6" style={{ color: "var(--cor-fonte)" }}>
          {t("logs.titulo")}
        </h1>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div
            className="flex items-center border rounded-full px-4 py-2 shadow-sm"
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
          className="border rounded-xl overflow-x-auto shadow"
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
            <table className="w-full text-sm font-mono">
              <thead className="border-b">
                <tr style={{ color: "var(--cor-fonte)" }}>
                  <th className="py-3 px-4 text-center">{t("logs.usuario")}</th>
                  <th className="py-3 px-4 text-center">{t("logs.tipo")}</th>
                  <th className="py-3 px-4 text-center">{t("logs.descricao")}</th>
                  <th className="py-3 px-4 text-center">{t("logs.datacriacao")}</th>
                </tr>
              </thead>
              <tbody>
                {logs
                  .filter((log) => log.descricao.toLowerCase().includes(busca.toLowerCase()))
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="py-3 px-4 text-center">
                        {log.usuarioId 
                          ? (nomesUsuarios[log.usuarioId] || t("logs.carregando")) 
                          : t("logs.usuario_nao_informado")}
                      </td>
                      <td className="py-3 px-4 text-center">{traduzirTipoLog(log.tipo)}</td>
                      <td className="py-3 px-4 text-center">{log.descricao}</td>
                      <td className="py-3 px-4 text-center">{formatarData(log.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}