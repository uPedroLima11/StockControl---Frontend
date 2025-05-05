"use client";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUsuarioStore } from "../context/usuario";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  empresaId: string | null;
};

interface Empresa {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  foto?: string;
}

type TipoUsuario = "CLIENTE" | "ADMIN" | "PROPRIETARIO";

export default function Empresa() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresaEditada, setEmpresaEditada] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [novaFoto, setNovaFoto] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null);
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const { usuario, logar } = useUsuarioStore();

  useEffect(() => {
    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
        setTipoUsuario(dados.tipo as TipoUsuario);
      }
    }

    const buscarDados = async (idUsuario: string) => {
      const responseUser = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (responseUser.status === 200) {
        const dados = await responseUser.json();
        setUsuarioLogado(dados);
      }
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      buscarDados(usuarioValor);
    }

    const fetchEmpresa = async () => {
      try {
        const userId = localStorage.getItem("client_key");
        if (!userId) {
          console.warn("Usuário não logado");
          return;
        }

        const usuarioSalvo = localStorage.getItem("client_key") as string;
        const usuarioValor = usuarioSalvo.replace(/"/g, "");

        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${usuarioValor}`);

        if (res.status === 404) {
          router.push("/criarempresa");
          return;
        }

        if (!res.ok) {
          throw new Error(`Erro inesperado ao buscar empresa: ${res.status}`);
        }

        const data = await res.json();

        if (!data.id) {
          router.push("/criarempresa");
          return;
        }

        setEmpresa(data);
        setNovaFoto(data.foto || "");
      } catch (error: any) {
        if (error.message && !error.message.includes("404")) {
          console.error("Erro ao buscar dados da empresa:", error);
        }
        router.push("/criarempresa");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, []);

  const atualizarFoto = async () => {
    if (!empresa) return;

    try {
      const userId = localStorage.getItem("client_key");
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!usuarioValor) return;

      const empresaAtualizada = {
        nome: empresa.nome,
        email: empresa.email,
        foto: novaFoto,
        telefone: empresa.telefone || null,
        endereco: empresa.endereco || null,
        pais: empresa.pais || null,
        estado: empresa.estado || null,
        cidade: empresa.cidade || null,
        cep: empresa.cep || null,
        idUsuario: userId,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${empresa.id}/${usuarioValor}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresaAtualizada),
      });

      console.log("Resposta da atualização:", res);

      if (!res.ok) throw new Error("Erro ao atualizar foto");

      const data = await res.json();
      setEmpresa(data);
      setModalAberto(false);
      window.location.reload();
    } catch (err) {
      console.error("Erro ao atualizar a logo da empresa:", err);
    }
  };

  const editarDadosEmpresa = async () => {
    if (!empresaEditada) return;

    try {
      const userId = localStorage.getItem("client_key");
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!usuarioValor) return;

      const empresaAtualizada = {
        ...empresaEditada,
        idUsuario: usuarioValor,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${empresaEditada.id}/${usuarioValor}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresaAtualizada),
      });

      console.log("Resposta da atualização:", res);

      if (!res.ok) throw new Error("Erro ao atualizar empresa");

      const data = await res.json();
      setEmpresa(data);
      setModalEdicaoAberto(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao editar empresa:", error);
    }
  };

  const excluirOuSairDaEmpresa = async () => {
    const userId = localStorage.getItem("client_key");
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!usuarioValor) return;

    const confirmacao = window.confirm(tipoUsuario === "PROPRIETARIO" ? "Tem certeza que deseja deletar a empresa? Esta ação é irreversível." : "Tem certeza que deseja sair da empresa?");
    if (!confirmacao) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir/sair da empresa");

      router.push("/criarempresa");
    } catch (error) {
      console.error("Erro ao processar exclusão/saída da empresa:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600 font-mono">Carregando dados da empresa...</p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-600 font-mono">Empresa não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start pt-10">
      <div className="bg-white w-full max-w-md rounded p-6 shadow-md">
        <h1 className="text-2xl font-mono text-center mb-6">Minha Empresa</h1>

        <div className="border-b border-black mb-4 pb-2">
          <h2 className="text-lg font-semibold underline">Dados da Empresa</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              Nome da Empresa: <strong>{empresa.nome}</strong>
            </p>
            <p>Endereço: {empresa.endereco || "Não informado"}</p>
            <p>País: {empresa.pais || "Não informado"}</p>
            <p>Estado: {empresa.estado || "Não informado"}</p>
            <p>Cidade: {empresa.cidade || "Não informado"}</p>
            <p>CEP: {empresa.cep || "Não informado"}</p>
            <p>Telefone: {empresa.telefone || "Não informado"}</p>
            <p>Email Corporativo: {empresa.email}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Logo da Empresa</h2>
            {empresa.foto && <img src={empresa.foto} alt="Logo da empresa" className="w-32 h-32 object-cover rounded mb-4" />}
            {tipoUsuario !== "CLIENTE" && (
              <button onClick={() => setModalAberto(true)} className="flex items-center gap-2 px-6 py-2 border-2 border-[#00332C] rounded-lg text-[#00332C] hover:bg-[#00332C] hover:text-white transition font-mono text-sm">
                <FaCloudUploadAlt />
                Alterar Logo
              </button>
            )}
          </div>

          {(tipoUsuario === "PROPRIETARIO" || tipoUsuario === "ADMIN") && (
            <button
              onClick={() => {
                setEmpresaEditada(empresa);
                setModalEdicaoAberto(true);
              }}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-mono text-sm"
            >
              Editar Dados
            </button>
          )}

          {tipoUsuario && (
            <button onClick={excluirOuSairDaEmpresa} className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-mono text-sm">
              {tipoUsuario === "PROPRIETARIO" ? "Deletar Empresa" : "Sair da Empresa"}
            </button>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Alterar Logo</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL da nova imagem</label>
              <input type="text" className="w-full border border-gray-300 rounded p-2" value={novaFoto} onChange={(e) => setNovaFoto(e.target.value)} />
            </div>
            {novaFoto && <img src={novaFoto} alt="Preview" className="w-32 h-32 object-cover rounded mb-4" />}
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={atualizarFoto} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEdicaoAberto && empresaEditada && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Editar Empresa</h2>

            {[
              { label: "Nome", key: "nome" },
              { label: "Email", key: "email" },
              { label: "Telefone", key: "telefone" },
              { label: "Endereço", key: "endereco" },
              { label: "País", key: "pais" },
              { label: "Estado", key: "estado" },
              { label: "Cidade", key: "cidade" },
              { label: "CEP", key: "cep" },
            ].map(({ label, key }) => (
              <div key={key} className="mb-3">
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="text" className="w-full border border-gray-300 rounded p-2" value={(empresaEditada as any)[key] || ""} onChange={(e) => setEmpresaEditada({ ...empresaEditada, [key]: e.target.value })} />
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalEdicaoAberto(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={editarDadosEmpresa} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
