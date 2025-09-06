"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch, FaHistory } from "react-icons/fa";
import HistoricoEstoque from "@/components/HistoricoEstoque";

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  quantidadeMin: number;
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [modoDark, setModoDark] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "BAIXO">("TODOS");
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [carregando, setCarregando] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const { t } = useTranslation("estoque");

  const usuarioTemPermissao = async (permissaoChave: string): Promise<boolean> => {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return false;

      const usuarioId = usuarioSalvo.replace(/"/g, "");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/tem-permissao/${permissaoChave}`,
        {
          headers: {
            'user-id': usuarioId
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.temPermissao;
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }
  };

  const podeVisualizar = (tipoUsuario === "PROPRIETARIO") ||
    permissoesUsuario.inventario_visualizar;

  useEffect(() => {
    const carregarPermissoes = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;

      const usuarioId = usuarioSalvo.replace(/"/g, "");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/permissoes`,
          {
            headers: {
              'user-id': usuarioId
            }
          }
        );

        if (response.ok) {
          const dados: { permissoes: { chave: string; concedida: boolean }[]; permissoesPersonalizadas: boolean } = await response.json();

          const permissoesUsuarioObj: Record<string, boolean> = {};
          dados.permissoes.forEach(permissao => {
            permissoesUsuarioObj[permissao.chave] = permissao.concedida;
          });

          setPermissoesUsuario(permissoesUsuarioObj);
        } else {
          const permissoesParaVerificar = [
            "inventario_visualizar",
          ];

          const permissoes: Record<string, boolean> = {};

          for (const permissao of permissoesParaVerificar) {
            const temPermissao = await usuarioTemPermissao(permissao);
            permissoes[permissao] = temPermissao;
          }

          setPermissoesUsuario(permissoes);
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      }
    };

    carregarPermissoes();
  }, []);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    setModoDark(temaSalvo === "true");

    const carregarProdutos = async () => {
      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) return;

        const usuarioValor = usuarioSalvo.replace(/"/g, "");
        const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
        const usuario = await responseUsuario.json();
        setTipoUsuario(usuario.tipo);
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
        const todosProdutos: any[] = await response.json();

        const produtosDaEmpresa = todosProdutos
          .filter((p) => p.empresaId === usuario.empresaId)
          .map((p) => ({
            id: p.id,
            nome: p.nome,
            quantidade: p.quantidade,
            quantidadeMin: p.quantidadeMin,
          }));

        setProdutos(produtosDaEmpresa);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setCarregando(false); 
      }
    };

    carregarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase()) &&
      (filtroTipo === "TODOS" || produto.quantidade < produto.quantidadeMin + 5)
  );

  if (carregando) {
  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center" style={{
      backgroundColor: modoDark ? "#0A1929" : "#F8FAFC",
      color: modoDark ? "#FFFFFF" : "#0F172A",
    }}>
      <p>{t("carregando", { ns: "vendas" })}</p>
    </div>
  );
}

  if (!podeVisualizar) {
    return (
      <div
        className="min-h-screen p-4 md:p-8 flex flex-col items-center"
        style={{
          backgroundColor: modoDark ? "#0A1929" : "#F8FAFC",
          color: modoDark ? "#FFFFFF" : "#0F172A",
        }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        {t("tituloRelatorioEstoque")}
          </h1>
        </div>
        <div
          className="p-6 rounded-lg shadow-md mt-4"
          style={{
        backgroundColor: modoDark ? "#132F4C" : "#FFFFFF",
        border: `1px solid ${modoDark ? "#1E4976" : "#E2E8F0"}`,
        width: "100%",
        maxWidth: 480,
          }}
        >
          <p className="text-lg text-center">
        {t("semPermissaoVisualizar", { ns: "vendas" })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundColor: modoDark ? "#0A1929" : "#F8FAFC",
        color: modoDark ? "#FFFFFF" : "#0F172A",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          {t("tituloRelatorioEstoque")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div
              className="p-4 rounded-lg shadow-md"
              style={{
                backgroundColor: modoDark ? "#132F4C" : "#FFFFFF",
                border: `1px solid ${modoDark ? "#1E4976" : "#E2E8F0"}`,
              }}
            >
              <div className="flex flex-col gap-3">
                <div
                  className="flex items-center border rounded-full px-3 py-2"
                  style={{
                    backgroundColor: modoDark ? "#0A1929" : "#F8FAFC",
                    borderColor: modoDark ? "#1E4976" : "#E2E8F0",
                  }}
                >
                  <input
                    type="text"
                    placeholder={t("buscarProduto")}
                    className="outline-none bg-transparent placeholder-gray-400 flex-1"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    style={{ color: modoDark ? "#FFFFFF" : "#0F172A" }}
                  />
                  <FaSearch className="ml-2" style={{ color: modoDark ? "#1976D2" : "#0284C7" }} />
                </div>

                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as any)}
                  className="p-2 rounded border"
                  style={{
                    backgroundColor: modoDark ? "#0A1929" : "#F8FAFC",
                    borderColor: modoDark ? "#1E4976" : "#E2E8F0",
                    color: modoDark ? "#FFFFFF" : "#0F172A",
                  }}
                >
                  <option value="TODOS">{t("todosProdutos")}</option>
                  <option value="BAIXO">{t("estoqueBaixo")}</option>
                </select>
              </div>

              <div className="space-y-2 max-h-[70vh] overflow-y-auto mt-4">
                {produtosFiltrados.map((produto) => (
                  <div
                    key={produto.id}
                    onClick={() => setProdutoSelecionado(produto.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${produtoSelecionado === produto.id
                      ? modoDark
                        ? "bg-blue-900"
                        : "bg-blue-100"
                      : modoDark
                        ? "hover:bg-blue-800"
                        : "hover:bg-blue-50"
                      }`}
                    style={{
                      border: `1px solid ${modoDark ? "#1E4976" : "#E2E8F0"}`,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{produto.nome}</span>
                      <span
                        className={`text-sm ${produto.quantidade < produto.quantidadeMin
                          ? "text-red-500"
                          : produto.quantidade < produto.quantidadeMin + 5
                            ? "text-yellow-500"
                            : "text-green-500"
                          }`}
                      >
                        {produto.quantidade} uni
                      </span>
                    </div>
                    {produto.quantidadeMin > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Mín: {produto.quantidadeMin} uni
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div
              className="p-4 rounded-lg shadow-md h-full flex flex-col"
              style={{
                backgroundColor: modoDark ? "#132F4C" : "#FFFFFF",
                border: `1px solid ${modoDark ? "#1E4976" : "#E2E8F0"}`,
              }}
            >
              {produtoSelecionado ? (
                <>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaHistory />
                    {t("historicoMovimentacoes")}
                  </h2>
                  <div className="flex-1">
                    <HistoricoEstoque produtoId={produtoSelecionado} modoDark={modoDark} />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaHistory size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t("selecioneProduto")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
