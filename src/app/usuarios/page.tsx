"use client";
import { useEffect, useState } from "react";
import { FaCog, FaSearch, FaChevronDown, FaChevronUp, FaEnvelope, FaUserPlus, FaAngleLeft, FaAngleRight, FaLock } from "react-icons/fa";
import { useUsuarioStore } from "@/context/usuario";
import { UsuarioI } from "@/utils/types/usuario";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { getTranslatedPermission, getTranslatedCategory } from '@/utils/permissoeTranslations';
interface PermissaoI {
  id: string;
  nome: string;
  descricao: string;
  chave: string;
  categoria: string;
}

interface PermissaoAgrupada {
  [categoria: string]: (PermissaoI & { concedida: boolean })[];
}

interface PermissoesUsuarioResponse {
  permissoes: (PermissaoI & { concedida: boolean })[];
  permissoesPersonalizadas: boolean;
}

const ordenarUsuariosPorFuncao = (usuarios: UsuarioI[]) => {
  const ordemFuncoes = {
    "PROPRIETARIO": 1,
    "ADMIN": 2,
    "FUNCIONARIO": 3
  };

  return [...usuarios].sort((a, b) => {
    return ordemFuncoes[a.tipo as keyof typeof ordemFuncoes] - ordemFuncoes[b.tipo as keyof typeof ordemFuncoes];
  });
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isEnviando, setIsEnviando] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [modalEditarUsuario, setModalEditarUsuario] = useState<null | UsuarioI>(null);
  const [novoTipo, setNovoTipo] = useState("FUNCIONARIO");
  const { logar } = useUsuarioStore();
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioI | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [showModalConvite, setShowModalConvite] = useState(false);
  const [showModalMensagem, setShowModalMensagem] = useState(false);
  const [modoDark, setModoDark] = useState(false);
  const [busca, setBusca] = useState("");
  const [usuarioExpandido, setUsuarioExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const usuariosPorPagina = 10;
  const { t } = useTranslation("usuarios");
  const [, setPermissoes] = useState<PermissaoI[]>([]);
  const [permissoesUsuario, setPermissoesUsuario] = useState<(PermissaoI & { concedida: boolean })[]>([]);
  const [modalPermissoes, setModalPermissoes] = useState<UsuarioI | null>(null);
  const [permissoesPersonalizadas, setPermissoesPersonalizadas] = useState(false);
  const [usuariosGerenciáveis, setUsuariosGerenciáveis] = useState<Record<string, boolean>>({});
  const [temPermissaoVisualizar, setTemPermissaoVisualizar] = useState<boolean | null>(null);
  const [temPermissaoExcluir, setTemPermissaoExcluir] = useState<boolean | null>(null);
  const [usuariosExcluiveis, setUsuariosExcluiveis] = useState<Record<string, boolean>>({});
  const [permissoesAgrupadas, setPermissoesAgrupadas] = useState<PermissaoAgrupada>({});
  const [todasMarcadas, setTodasMarcadas] = useState(false);
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const cores = {
    dark: {
      fundo: "#0A1929",
      texto: "#FFFFFF",
      card: "#132F4C",
      borda: "#1E4976",
      primario: "#1976D2",
      secundario: "#00B4D8",
      placeholder: "#9CA3AF",
      hover: "#1E4976"
    },
    light: {
      fundo: "#F8FAFC",
      texto: "#0F172A",
      card: "#FFFFFF",
      borda: "#E2E8F0",
      primario: "#1976D2",
      secundario: "#0284C7",
      placeholder: "#6B7280",
      hover: "#EFF6FF"
    }
  };

  const temaAtual = modoDark ? cores.dark : cores.light;

  const translateRole = (role: string) => {
    return t(`roles.${role}`, { defaultValue: role });
  };

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
  }, []);

  const toggleTodasPermissoes = () => {
    const novoEstado = !todasMarcadas;
    setTodasMarcadas(novoEstado);

    setPermissoesUsuario(prev =>
      prev.map(p => ({ ...p, concedida: novoEstado }))
    );

    setPermissoesAgrupadas(prev => {
      const novoAgrupado = { ...prev };
      Object.keys(novoAgrupado).forEach(categoria => {
        novoAgrupado[categoria] = novoAgrupado[categoria].map(p =>
          ({ ...p, concedida: novoEstado })
        );
      });
      return novoAgrupado;
    });
  };

  useEffect(() => {
    if (permissoesUsuario.length > 0) {
      const todasConcedidas = permissoesUsuario.every(p => p.concedida);
      const nenhumaConcedida = permissoesUsuario.every(p => !p.concedida);

      if (todasConcedidas) {
        setTodasMarcadas(true);
      } else if (nenhumaConcedida) {
        setTodasMarcadas(false);
      }
    }
  }, [permissoesUsuario]);
  const usuarioTemPermissao = async (userId: string, permissaoChave: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${userId}/tem-permissao/${permissaoChave}`
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

  const verificarPermissaoExcluir = async () => {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) {
        setTemPermissaoExcluir(false);
        return;
      }

      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      const temPermissao = await usuarioTemPermissao(usuarioValor, "usuarios_excluir");
      setTemPermissaoExcluir(temPermissao);
    } catch (error) {
      console.error("Erro ao verificar permissão de exclusão:", error);
      setTemPermissaoExcluir(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

      document.body.style.backgroundColor = ativado ? "#0A1929" : "#F8FAFC";

      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) {
          setTemPermissaoVisualizar(false);
          setLoading(false);
          return;
        }

        const usuarioValor = usuarioSalvo.replace(/"/g, "");
        setUsuarioLogado(null);

        const permissao = await usuarioTemPermissao(usuarioValor, "usuarios_visualizar");
        setTemPermissaoVisualizar(permissao);

        await verificarPermissaoExcluir();

        if (!permissao) {
          setLoading(false);
          return;
        }

        const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
        const usuarioData = await responseUsuario.json();
        logar(usuarioData);
        setUsuarioLogado(usuarioData);

        if (!usuarioData || !usuarioData.empresaId) {
          setUsuarios([]);
          setLoading(false);
          return;
        }

        const empresaIdRecebido = usuarioData.empresaId;

        const resUsuarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario`);
        if (!resUsuarios.ok) throw new Error(t("erroBuscarUsuarios"));

        const todosUsuarios: UsuarioI[] = await resUsuarios.json();
        const usuariosDaEmpresa = todosUsuarios
          .filter((usuario) => usuario.empresaId === empresaIdRecebido);

        const usuariosOrdenados = ordenarUsuariosPorFuncao(usuariosDaEmpresa);

        setUsuarios(usuariosOrdenados);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        setUsuarios([]);
        setTemPermissaoVisualizar(false);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [t, logar]);

  useEffect(() => {
    async function carregarPermissoes() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/permissoes`);
        if (response.ok) {
          const dados: Record<string, PermissaoI[]> = await response.json();
          const todasPermissoes: PermissaoI[] = [];
          Object.values(dados).forEach((categoria: PermissaoI[]) => {
            todasPermissoes.push(...categoria);
          });
          setPermissoes(todasPermissoes);
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      }
    }

    carregarPermissoes();
  }, []);

  const carregarPermissoesUsuario = async (usuarioId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/permissoes`
      );
      if (response.ok) {
        const dados: PermissoesUsuarioResponse = await response.json();
        setPermissoesUsuario(dados.permissoes);
        setPermissoesPersonalizadas(dados.permissoesPersonalizadas);

        const agrupadas = dados.permissoes.reduce((acc, permissao) => {
          if (!acc[permissao.categoria]) {
            acc[permissao.categoria] = [];
          }
          acc[permissao.categoria].push(permissao);
          return acc;
        }, {} as PermissaoAgrupada);

        setPermissoesAgrupadas(agrupadas);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões do usuário:", error);
    }
  };

  const traduzirCategoria = (categoria: string): string => {
    return getTranslatedCategory(categoria, currentLanguage);
  };

  const renderizarPermissoesPorCategoria = () => {
    if (Object.keys(permissoesAgrupadas).length === 0) {
      return <p className="text-center py-4" style={{ color: temaAtual.placeholder }}>Nenhuma permissão encontrada</p>;
    }

    return Object.entries(permissoesAgrupadas).map(([categoria, permissoesDaCategoria]) => (
      <div key={categoria} className="mb-6">
        <h3 className="text-lg font-semibold mb-3 border-b pb-2" style={{
          color: temaAtual.texto,
          borderColor: temaAtual.borda
        }}>
          {traduzirCategoria(categoria)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissoesDaCategoria.map(permissao => (
            <div key={permissao.id} className="flex items-start gap-3 p-3 border rounded-lg" style={{
              backgroundColor: temaAtual.card,
              borderColor: temaAtual.borda,
            }}>
              <input
                type="checkbox"
                checked={permissao.concedida}
                onChange={(e) => atualizarPermissao(permissao.id, e.target.checked)}
                className="mt-1 rounded cursor-pointer"
                style={{
                  accentColor: temaAtual.primario
                }}
              />
              <div className="flex-1">
                <div className="font-medium" style={{ color: temaAtual.texto }}>
                  {getTranslatedPermission(permissao.chave, 'nome', currentLanguage)}
                </div>
                <div className="text-xs mt-1" style={{ color: temaAtual.placeholder }}>
                  {getTranslatedPermission(permissao.chave, 'descricao', currentLanguage)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const atualizarPermissao = (permissaoId: string, concedida: boolean) => {
    setPermissoesUsuario(prev =>
      prev.map(p => p.id === permissaoId ? { ...p, concedida } : p)
    );

    setPermissoesAgrupadas(prev => {
      const novoAgrupado = { ...prev };
      Object.keys(novoAgrupado).forEach(categoria => {
        novoAgrupado[categoria] = novoAgrupado[categoria].map(p =>
          p.id === permissaoId ? { ...p, concedida } : p
        );
      });
      return novoAgrupado;
    });
  };

  const podeGerenciarPermissoesUsuario = async (targetUser: UsuarioI): Promise<boolean> => {
    if (!usuarioLogado) return false;

    if (usuarioLogado.tipo === "PROPRIETARIO") return true;

    if (usuarioLogado.tipo === "ADMIN") {
      if (targetUser.tipo === "PROPRIETARIO") return false;

      const temPermissao = await usuarioTemPermissao(usuarioLogado.id, "usuarios_gerenciar_permissoes");
      return temPermissao && targetUser.tipo === "FUNCIONARIO";
    }

    return false;
  };

  const salvarPermissoes = async () => {
    if (!modalPermissoes) return;

    try {
      const permissoesParaSalvar = permissoesUsuario.map(p => ({
        permissaoId: p.id,
        concedida: p.concedida
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${modalPermissoes.id}/permissoes`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            permissoes: permissoesParaSalvar,
            ativarPersonalizacao: true
          })
        }
      );

      if (response.ok) {
        Swal.fire({
          title: t("modal.permissoesSalvas"),
          icon: "success",
          confirmButtonColor: "#013C3C",
        });
        setModalPermissoes(null);
      }
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      Swal.fire({
        title: t("modal.erroSalvarPermissoes"),
        icon: "error",
        confirmButtonColor: "#013C3C",
      });
    }
  };


  const redefinirPermissoesPadrao = async () => {
    if (!modalPermissoes) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/usuarios/${modalPermissoes.id}/permissoes`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            permissoes: [],
            ativarPersonalizacao: false
          })
        }
      );

      if (response.ok) {
        Swal.fire({
          title: t("modal.permissoesRedefinidas"),
          icon: "success",
          confirmButtonColor: "#013C3C",
        });
        setModalPermissoes(null);
        carregarPermissoesUsuario(modalPermissoes.id);
      }
    } catch (error) {
      console.error("Erro ao redefinir permissões:", error);
      Swal.fire({
        title: t("modal.erroRedefinirPermissoes"),
        icon: "error",
        confirmButtonColor: "#013C3C",
      });
    }
  };

  useEffect(() => {
    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
        setUsuarioLogado(dados);
      }
    }

    const fetchDados = async (idUsuario: string) => {
      try {
        const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${idUsuario}`);
        if (!resEmpresa.ok) {
          setLoading(false);
          return;
        }

        const empresaData = await resEmpresa.json();
        if (!empresaData || !empresaData.id) {
          setLoading(false);
          return;
        }

        const empresaIdRecebido = empresaData.id;

        const resUsuarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario`);
        if (!resUsuarios.ok) throw new Error(t("erroBuscarUsuarios"));

        const todosUsuarios: UsuarioI[] = await resUsuarios.json();
        const usuariosDaEmpresa = todosUsuarios
          .filter((usuario) => usuario.empresaId === empresaIdRecebido);

        const usuariosOrdenados = ordenarUsuariosPorFuncao(usuariosDaEmpresa);

        setUsuarios(usuariosOrdenados);
      } catch (err: unknown) {
        console.error("Erro ao carregar dados:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t("erroDesconhecido"));
        }
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      fetchDados(usuarioValor);
    }
  }, [t, logar]);

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busca.toLowerCase())
  );

  const indexUltimoUsuario = paginaAtual * usuariosPorPagina;
  const indexPrimeiroUsuario = indexUltimoUsuario - usuariosPorPagina;
  const usuariosAtuais = usuariosFiltrados.slice(indexPrimeiroUsuario, indexUltimoUsuario);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setUsuarioExpandido(null);
  };


  async function enviarNotificacao() {
    setIsEnviando(true);
    try {
      let mensagemErro = "";

      if (!usuarioSelecionado) {
        mensagemErro += "• Selecione um usuário destinatário\n";
      }

      if (!titulo.trim()) {
        mensagemErro += "• Título da mensagem é obrigatório\n";
      }

      if (!descricao.trim()) {
        mensagemErro += "• Descrição da mensagem é obrigatória\n";
      }

      if (mensagemErro) {
        Swal.fire({
          title: "Preencha os campos obrigatórios",
          html: `Por favor, preencha os seguintes campos:<br><br>${mensagemErro.replace(/\n/g, '<br>')}`,
          icon: "warning",
          confirmButtonColor: "#013C3C",
        });
        setIsEnviando(false);
        return;
      }

      if (usuarioSelecionado && usuarioSelecionado.id === usuarioLogado?.id) {
        Swal.fire({
          title: "Não é possível enviar para si mesmo",
          text: "Você não pode enviar mensagens para você mesmo.",
          icon: "warning",
          confirmButtonColor: "#013C3C",
        });
        setIsEnviando(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          usuarioId: usuarioSelecionado ? usuarioSelecionado.id : undefined,
          nomeRemetente: usuarioLogado?.nome,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Swal.fire({
          title: "Mensagem enviada",
          text: `Mensagem enviada para ${usuarioSelecionado ? usuarioSelecionado.nome : ""}`,
          icon: "success",
          confirmButtonColor: "#013C3C",
        });
        setTitulo("");
        setDescricao("");
        setUsuarioSelecionado(null);
        setShowModalMensagem(false);
      } else {
        Swal.fire({
          title: "Erro ao enviar",
          text: data.message || "Ocorreu um erro ao enviar a mensagem.",
          icon: "error",
          confirmButtonColor: "#013C3C",
        });
      }
    } catch (err) {
      console.error("Erro ao enviar notificação:", err);
      Swal.fire({
        title: "Erro",
        text: "Ocorreu um erro interno ao tentar enviar a mensagem.",
        icon: "error",
        confirmButtonColor: "#013C3C",
      });
    } finally {
      setIsEnviando(false);
    }
  }

  async function enviarConvite() {
    setIsEnviando(true);
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return false;

      const usuarioId = usuarioSalvo.replace(/"/g, "");

      const temPermissaoCriar = await usuarioTemPermissao(usuarioId, "usuarios_criar");

      if (!temPermissaoCriar) {
        Swal.fire({
          title: t("modal.permissaoNegada.titulo") || "Permissão Negada",
          text: t("modal.permissaoNegada.textoConvite") || "Você não tem permissão para convidar usuários.",
          icon: "warning",
          confirmButtonColor: "#013C3C",
          confirmButtonText: t("modal.botaoOk") || "OK"
        });
        return;
      }

      const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${usuarioId}`, {
        headers: {
          'user-id': usuarioId
        }
      });
      const empresa = await resEmpresa.json();

      const resTodosUsuarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario`, {
        headers: {
          'user-id': usuarioId
        }
      });
      const todosUsuarios: UsuarioI[] = await resTodosUsuarios.json();

      const usuarioConvidado = todosUsuarios.find((u) => u.email === email);

      if (usuarioConvidado && usuarioConvidado.empresaId) {
        Swal.fire({
          title: t("modal.usuarioVinculado.titulo"),
          text: t("modal.usuarioVinculado.texto"),
          icon: "warning",
          confirmButtonText: t("modal.botaoOk"),
          confirmButtonColor: "#013C3C",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/convites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": usuarioId || "",
        },
        body: JSON.stringify({ email, empresaId: empresa.id }),
      });

      if (response.ok) {
        Swal.fire({
          title: t("modal.conviteEnviado.titulo"),
          text: t("modal.conviteEnviado.texto", { nome: usuarioLogado?.nome, email }),
          icon: "success",
          confirmButtonText: t("modal.botaoOk"),
          confirmButtonColor: "#013C3C",
        });
        setEmail("");
        setShowModalConvite(false);
      } else {
        Swal.fire({
          title: t("modal.erro.titulo") || "Erro",
          text: t("modal.erro.enviarConvite") || "Erro ao enviar convite.",
          icon: "error",
          confirmButtonColor: "#013C3C",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: t("modal.erro.titulo") || "Erro",
        text: t("modal.erro.enviarConvite") || "Erro ao enviar convite.",
        icon: "error",
        confirmButtonColor: "#013C3C",
      });
    } finally {
      setIsEnviando(false);
    }
  }

  async function confirmarRemocaoUsuario(usuario: UsuarioI) {
    const podeExcluirUsuario = await podeExcluir(usuario);
    if (!podeExcluirUsuario) {
      Swal.fire({
        title: t("modal.permissaoNegada.titulo") || "Permissão Negada",
        text: t("modal.permissaoNegada.textoExcluir") || "Você não tem permissão para excluir este usuário.",
        icon: "warning",
        confirmButtonColor: "#013C3C",
      });
      return;
    }

    Swal.fire({
      title: t("modal.confirmacaoRemocao.titulo"),
      text: t("modal.confirmacaoRemocao.texto", { nome: usuario.nome }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("modal.confirmacaoRemocao.confirmar"),
      cancelButtonText: t("modal.confirmacaoRemocao.cancelar"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const usuarioSalvo = localStorage.getItem("client_key");
          if (!usuarioSalvo) {
            Swal.fire(t("modal.erro.titulo"), t("modal.erro.usuarioNaoEncontrado"), "error");
            return;
          }

          const usuarioId = usuarioSalvo.replace(/"/g, "");

          const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuario.id}/remover-empresa`, {
            method: "PUT",
            headers: {
              "user-id": usuarioId || ""
            },
          });

          if (res.ok) {
            Swal.fire(
              t("modal.removido"),
              t("modal.confirmacaoRemocao.sucesso", { nome: usuario.nome }),
              "success"
            );
            setModalEditarUsuario(null);
            setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
          } else {
            try {
              const errorData = await res.json();
              Swal.fire(
                t("modal.erro.titulo"),
                errorData.mensagem || t("modal.confirmacaoRemocao.erro"),
                "error"
              );
            } catch {
              Swal.fire(
                t("modal.erro.titulo"),
                t("modal.confirmacaoRemocao.erro"),
                "error"
              );
            }
          }
        } catch (err) {
          console.error("Erro ao remover usuário:", err);
          Swal.fire(
            t("modal.erro.titulo"),
            t("modal.erro.removerUsuario"),
            "error"
          );
        }
      }
    });
  }

  const podeEditar = async (targetUser: UsuarioI): Promise<boolean> => {
    if (!usuarioLogado || usuarioLogado.id === targetUser.id) return false;

    if (usuarioLogado.tipo === "PROPRIETARIO") return true;

    if (usuarioLogado.tipo === "ADMIN") {
      if (targetUser.tipo !== "FUNCIONARIO") return false;

      const temPermissao = await usuarioTemPermissao(usuarioLogado.id, "usuarios_editar");
      return temPermissao;
    }

    return false;
  };

  const podeExcluir = async (targetUser: UsuarioI): Promise<boolean> => {
    if (!usuarioLogado || usuarioLogado.id === targetUser.id) return false;
    if (temPermissaoExcluir === false) return false;

    if (usuarioLogado.tipo === "PROPRIETARIO") return true;

    if (usuarioLogado.tipo === "ADMIN") {
      if (targetUser.tipo !== "FUNCIONARIO") return false;
      return temPermissaoExcluir === true;
    }

    return false;
  };

  const podeAlterarCargo = async (targetUser: UsuarioI, novoTipo: string): Promise<boolean> => {
    if (!usuarioLogado) return false;

    if (usuarioLogado.tipo === "PROPRIETARIO") return true;

    if (usuarioLogado.tipo === "ADMIN") {
      if (targetUser.tipo === "PROPRIETARIO") return false;

      if (novoTipo === "ADMIN" || novoTipo === "PROPRIETARIO") return false;

      if (targetUser.tipo !== "FUNCIONARIO") return false;

      const temPermissao = await usuarioTemPermissao(usuarioLogado.id, "usuarios_editar");
      return temPermissao;
    }

    return false;
  };

  const [usuariosEditaveis, setUsuariosEditaveis] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const carregarTodasPermissoes = async () => {
      const editaveis: Record<string, boolean> = {};
      const gerenciáveis: Record<string, boolean> = {};
      const excluiveis: Record<string, boolean> = {};

      for (const usuario of usuarios) {
        editaveis[usuario.id] = await podeEditar(usuario);
        gerenciáveis[usuario.id] = await podeGerenciarPermissoesUsuario(usuario);
        excluiveis[usuario.id] = await podeExcluir(usuario);
      }

      setUsuariosEditaveis(editaveis);
      setUsuariosGerenciáveis(gerenciáveis);
      setUsuariosExcluiveis(excluiveis);
    };

    if (usuarios.length > 0 && usuarioLogado) {
      carregarTodasPermissoes();
    }
  }, [usuarios, usuarioLogado]);

  const toggleExpandirUsuario = (id: string) => {
    setUsuarioExpandido(usuarioExpandido === id ? null : id);
  };


  const formatarData = (dataString: string | Date) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: temaAtual.fundo }}>
        <p style={{ color: temaAtual.texto }}>{t("carregando")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: temaAtual.fundo }}>
        <p style={{ color: "#EF4444" }}>{t("erro")}: {error}</p>
      </div>
    );
  }

  if (temPermissaoExcluir === null || Object.keys(usuariosExcluiveis).length === 0) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: temaAtual.fundo }}>
        <p style={{ color: temaAtual.texto }}>Carregando permissões...</p>
      </div>
    );
  }

  if (temPermissaoVisualizar === false) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen px-4 pt-16 gap-4" style={{ backgroundColor: temaAtual.fundo }}>
        <div className="text-center mt-8">
          <h1 className="text-xl font-bold mb-2" style={{ color: temaAtual.texto }}>
            {t("acessoNegado") || "Acesso Negado"}
          </h1>
          <p className="mb-4" style={{ color: temaAtual.texto }}>
            {t("semPermissaoVisualizarUsuarios") || "Você não tem permissão para visualizar a tela de usuários."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: temaAtual.texto }}>
          {t("titulo")}
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
                placeholder={t("buscarUsuario")}
                className="outline-none font-mono placeholder-gray-400 text-sm bg-transparent"
                style={{
                  color: temaAtual.texto
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

          {usuarioLogado?.empresaId && (
            <div className="flex gap-2 w-full sm:w-auto sm:flex-row items-center sm:items-stretch justify-center sm:justify-start">
              <button
                className="px-4 py-2 cursor-pointer rounded-lg transition font-mono text-sm flex items-center gap-2"
                style={{
                  backgroundColor: temaAtual.primario,
                  color: "#FFFFFF",
                }}
                onClick={() => setShowModalConvite(true)}
              >
                <FaUserPlus /> {t("convidarUsuario")}
              </button>
              <button
                className="px-4 py-2 cursor-pointer rounded-lg transition font-mono text-sm flex items-center gap-2"
                style={{
                  backgroundColor: temaAtual.primario,
                  color: "#FFFFFF",
                }}
                onClick={() => setShowModalMensagem(true)}
              >
                <FaEnvelope /> {t("enviarMensagem")}
              </button>
            </div>
          )}
        </div>

        <div
          className="border rounded-xl shadow"
          style={{
            backgroundColor: temaAtual.card,
            borderColor: temaAtual.borda,
          }}
        >
          {usuarios.length === 0 ? (
            <div className="p-4 text-center" style={{ color: temaAtual.texto }}>
              {usuarioLogado?.empresaId ? t("nenhumUsuario") : t("nenhumaEmpresa")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b" style={{ borderColor: temaAtual.borda }}>
                    <tr style={{ color: temaAtual.texto }}>
                      <th className="py-3 px-4 text-left">{t("nomeUsuario")}</th>
                      <th className="py-3 px-4 text-left">{t("funcao")}</th>
                      <th className="py-3 px-4 text-left">{t("criadoEm")}</th>
                      <th className="py-3 px-4 text-left">{t("ultimaAtualizacao")}</th>
                      <th className="py-3 px-4 text-left">{t("acao")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosAtuais.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="border-b transition-all duration-200 cursor-pointer"
                        style={{
                          color: temaAtual.texto,
                          borderColor: temaAtual.borda,
                          backgroundColor: temaAtual.card,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.hover;
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = modoDark
                            ? "0 4px 12px rgba(30, 73, 118, 0.3)"
                            : "0 4px 12px rgba(2, 132, 199, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.card;
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td className="py-3 px-4">{usuario.nome}</td>
                        <td className="py-3 px-4">{translateRole(usuario.tipo)}</td>
                        <td className="py-3 px-4">{formatarData(usuario.createdAt)}</td>
                        <td className="py-3 px-4">{formatarData(usuario.updatedAt)}</td>
                        <td className="py-3 px-4">
                          {usuariosEditaveis[usuario.id] && (

                            <FaCog
                              className="cursor-pointer transition hover:rotate-90"
                              onClick={() => {
                                setModalEditarUsuario(usuario);
                                setNovoTipo(usuario.tipo);
                              }}
                              style={{ color: temaAtual.primario }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2 p-2">
                {usuariosAtuais.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="border rounded-lg p-3 transition-all cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      borderColor: temaAtual.borda,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.hover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = modoDark
                        ? "0 4px 12px rgba(30, 73, 118, 0.3)"
                        : "0 4px 12px rgba(2, 132, 199, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.card;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => toggleExpandirUsuario(usuario.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: temaAtual.hover }}>
                              <span className="text-lg" style={{ color: temaAtual.texto }}>
                                {usuario.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: temaAtual.texto }}>
                              {usuario.nome}
                            </p>
                            <p className="text-xs" style={{ color: temaAtual.placeholder }}>
                              {translateRole(usuario.tipo)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {usuariosEditaveis[usuario.id] && (
                          <>
                            <FaCog
                              className="cursor-pointer transition hover:rotate-90 mx-1"
                              onClick={() => {
                                setModalEditarUsuario(usuario);
                                setNovoTipo(usuario.tipo);
                              }}
                              style={{ color: temaAtual.primario }}
                              title={t("editarUsuario")}
                            />
                            <FaLock
                              className={`cursor-pointer transition mx-1 ${usuariosGerenciáveis[usuario.id] ? "hover:text-green-500" : "opacity-50 cursor-not-allowed"
                                }`}
                              onClick={async (e) => {
                                e.stopPropagation();

                                if (!usuariosGerenciáveis[usuario.id]) return;

                                setModalPermissoes(usuario);
                                await carregarPermissoesUsuario(usuario.id);
                              }}
                              style={{ color: temaAtual.secundario }}
                              title={usuariosGerenciáveis[usuario.id] ? t("gerenciarPermissoes") : t("semPermissaoGerenciar")}
                            />
                          </>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandirUsuario(usuario.id);
                          }}
                          className="p-1 transition"
                          style={{ color: temaAtual.primario }}
                        >
                          {usuarioExpandido === usuario.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${usuarioExpandido === usuario.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: temaAtual.texto }}
                    >
                      <div className="pt-2 border-t space-y-2" style={{ borderColor: temaAtual.borda }}>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("email")}:</span>
                          <span className="truncate">{usuario.email}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("criadoEm")}:</span>
                          <span>{formatarData(usuario.createdAt)}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("ultimaAtualizacao")}:</span>
                          <span>{formatarData(usuario.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showModalConvite && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-bold mb-4">{t("modal.convidarUsuario")}</h2>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.emailUsuario")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded cursor-pointer transition"
                style={{
                  backgroundColor: temaAtual.hover,
                  color: temaAtual.texto,
                }}
                onClick={() => setShowModalConvite(false)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className={`px-4 py-2 rounded cursor-pointer transition ${isEnviando ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                }}
                onClick={enviarConvite}
                disabled={isEnviando}
              >
                {isEnviando ? t("modal.enviando") : t("modal.enviarConvite")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalMensagem && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-bold mb-4">{t("modal.enviarMensagem")}</h2>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.de")}</label>
              <input
                type="text"
                value={usuarioLogado?.nome || ""}
                readOnly
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.para")}</label>
              <select
                className="w-full cursor-pointer rounded p-2 border"
                onChange={(e) => setUsuarioSelecionado(usuarios.find(u => u.id === e.target.value) || null)}
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              >
                <option value="">Selecione um usuário</option>
                {usuarios
                  .filter(usuario => usuario.id !== usuarioLogado?.id)
                  .map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.tituloMensagem")}</label>
              <input
                type="text"
                placeholder={t("modal.tituloMensagem")}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.descricaoMensagem")}</label>
              <textarea
                placeholder={t("modal.descricaoMensagem")}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 cursor-pointer rounded transition"
                style={{
                  backgroundColor: temaAtual.hover,
                  color: temaAtual.texto,
                }}
                onClick={() => setShowModalMensagem(false)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className={`px-4 py-2 rounded transition cursor-pointer ${isEnviando ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                }}
                onClick={enviarNotificacao}
                disabled={isEnviando}
              >
                {isEnviando ? t("modal.enviando") : t("modal.enviarMensagem")}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditarUsuario && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-bold mb-4">{t("modal.editarUsuario")}</h2>
            <p className="mb-3">{t("modal.usuario")}: <strong>{modalEditarUsuario.nome}</strong></p>

            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.alterarCargo")}</label>
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                className="w-full rounded cursor-pointer p-2 border text-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda,
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
              >
                <option
                  value="FUNCIONARIO"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                  }}
                >
                  {t("modal.funcionario")}
                </option>
                {usuarioLogado?.tipo === "PROPRIETARIO" && (
                  <option
                    value="ADMIN"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                    }}
                  >
                    {t("modal.admin")}
                  </option>
                )}
                {usuarioLogado?.tipo === "PROPRIETARIO" && (
                  <option
                    value="PROPRIETARIO"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                    }}
                  >
                    {t("modal.proprietario")}
                  </option>
                )}
              </select>
            </div>

            <div className="flex flex-wrap justify-between gap-2">
              <button
                className="px-3 py-1.5 text-sm cursor-pointer rounded transition"
                style={{
                  backgroundColor: temaAtual.hover,
                  color: temaAtual.texto,
                }}
                onClick={() => setModalEditarUsuario(null)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className="px-3 py-1.5 text-sm cursor-pointer rounded transition"
                style={{
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                }}
                onClick={async () => {
                  if (!usuarioLogado || !modalEditarUsuario) return;

                  const podeAlterar = await podeAlterarCargo(modalEditarUsuario, novoTipo);
                  if (!podeAlterar) {
                    Swal.fire(
                      t("modal.erroPermissao.titulo"),
                      t("modal.erroPermissao.texto"),
                      "warning"
                    );
                    return;
                  }
                  const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${modalEditarUsuario.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tipo: novoTipo }),
                  });
                  if (res.ok) {
                    Swal.fire(
                      t("modal.cargoAtualizado"),
                      t("modal.cargoAtualizadoSucesso"),
                      "success"
                    );
                    setModalEditarUsuario(null);
                    window.location.reload();
                  } else {
                    Swal.fire(
                      t("modal.erro.titulo"),
                      t("modal.erro.alterarCargo"),
                      "error"
                    );
                  }
                }}
              >
                {t("modal.salvarCargo")}
              </button>
              <button
                className="px-3 py-1.5 text-sm cursor-pointer rounded transition"
                style={{
                  backgroundColor: temaAtual.secundario,
                  color: "#FFFFFF",
                }}
                onClick={async () => {
                  if (!modalEditarUsuario) return;
                  const podeGerenciar = await podeGerenciarPermissoesUsuario(modalEditarUsuario);
                  if (!podeGerenciar) {
                    Swal.fire(
                      t("modal.erroPermissao.titulo"),
                      t("modal.erroPermissao.texto"),
                      "warning"
                    );
                    return;
                  }
                  setModalPermissoes(modalEditarUsuario);
                  await carregarPermissoesUsuario(modalEditarUsuario.id);
                }}
              >
                {t("gerenciarPermissoes")}
              </button>
              {usuariosExcluiveis[modalEditarUsuario.id] && (
                <button
                  className="px-3 py-1.5 text-sm cursor-pointer rounded transition"
                  style={{
                    backgroundColor: "#EF4444",
                    color: "#FFFFFF",
                  }}
                  onClick={() => confirmarRemocaoUsuario(modalEditarUsuario)}
                >
                  {t("modal.remover")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {modalPermissoes && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div
            className="relative p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <button
              onClick={() => setModalPermissoes(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition text-lg"
              style={{ color: temaAtual.texto }}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {t("modal.permissoesUsuario")} - {modalPermissoes.nome}
            </h2>

            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permissoesPersonalizadas}
                  onChange={(e) => setPermissoesPersonalizadas(e.target.checked)}
                  className="rounded cursor-pointer"
                  style={{
                    accentColor: temaAtual.primario
                  }}
                />
                <span>{t("modal.permissoesPersonalizadas")}</span>
              </label>

              {permissoesPersonalizadas && (
                <button
                  onClick={toggleTodasPermissoes}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded cursor-pointer transition"
                  style={{
                  backgroundColor: todasMarcadas ? temaAtual.primario : temaAtual.hover,
                  color: todasMarcadas ? "#FFFFFF" : temaAtual.texto,
                  }}
                >
                  <input
                  type="checkbox"
                  checked={todasMarcadas}
                  onChange={toggleTodasPermissoes}
                  className="rounded cursor-pointer"
                  style={{
                    accentColor: temaAtual.primario
                  }}
                  />
                  {todasMarcadas ? t("modal.desmarcarTodas") : t("modal.marcarTodas")}
                </button>
              )}
            </div>

            <p className="text-sm mb-4" style={{ color: temaAtual.placeholder }}>
              {t("modal.permissoesPersonalizadasDescricao")}
            </p>

            {permissoesPersonalizadas ? (
              <>
                <div className="mb-6 max-h-96 overflow-y-auto pr-2">
                  {renderizarPermissoesPorCategoria()}
                </div>

                <div className="flex justify-between gap-2">
                  <button
                    className="px-4 py-2 text-sm rounded cursor-pointer transition"
                    style={{
                      backgroundColor: temaAtual.hover,
                      color: temaAtual.texto,
                    }}
                    onClick={redefinirPermissoesPadrao}
                  >
                    {t("modal.redefinirPadrao")}
                  </button>

                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 text-sm rounded cursor-pointer transition"
                      style={{
                        backgroundColor: temaAtual.hover,
                        color: temaAtual.texto,
                      }}
                      onClick={() => setModalPermissoes(null)}
                    >
                      {t("modal.cancelar")}
                    </button>
                    <button
                      className="px-4 py-2 text-sm rounded cursor-pointer transition"
                      style={{
                        backgroundColor: temaAtual.primario,
                        color: "#FFFFFF",
                      }}
                      onClick={salvarPermissoes}
                    >
                      {t("modal.salvarPermissoes")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 text-sm rounded cursor-pointer transition"
                  style={{
                    backgroundColor: temaAtual.hover,
                    color: temaAtual.texto,
                  }}
                  onClick={() => setModalPermissoes(null)}
                >
                  {t("modal.cancelar")}
                </button>
                <button
                  className="px-4 py-2 text-sm rounded cursor-pointer transition"
                  style={{
                    backgroundColor: temaAtual.primario,
                    color: "#FFFFFF",
                  }}
                  onClick={async () => {
                    await redefinirPermissoesPadrao();
                    setModalPermissoes(null);
                  }}
                >
                  {t("modal.confirmar")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

