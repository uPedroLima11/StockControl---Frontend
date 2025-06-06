"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaCheckCircle, FaLock, FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

type TipoUsuario = "FUNCIONARIO" | "ADMIN" | "PROPRIETARIO";

export default function AtivacaoPage() {
  const [codigo, setCodigo] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [modoDark, setModoDark] = useState(false);
  const [empresaAtivada, setEmpresaAtivada] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("ativacao");

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
    aplicarTema(ativo);
  }, []);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.classList.add("dark");
      root.style.setProperty("--cor-fundo", "#20252B");
      root.style.setProperty("--cor-texto", "#FFFFFF");
      root.style.setProperty("--cor-fundo-bloco", "#1F2937");
      root.style.setProperty("--cor-borda", "#374151");
      root.style.setProperty("--cor-cinza", "#A3A3A3");
      root.style.setProperty("--cor-destaque", "#3B82F6");
      root.style.setProperty("--cor-botao", "#3B82F6");
      root.style.setProperty("--cor-botao-hover", "#2563EB");
      document.body.style.backgroundColor = "#20252B";
      document.body.style.color = "#FFFFFF";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#FFFFFF");
      root.style.setProperty("--cor-texto", "#000000");
      root.style.setProperty("--cor-fundo-bloco", "#ececec");
      root.style.setProperty("--cor-borda", "#E5E7EB");
      root.style.setProperty("--cor-cinza", "#4B5563");
      root.style.setProperty("--cor-destaque", "#3B82F6");
      root.style.setProperty("--cor-botao", "#3B82F6");
      root.style.setProperty("--cor-botao-hover", "#2563EB");
      document.body.style.backgroundColor = "#FFFFFF";
      document.body.style.color = "#000000";
    }
  };

  useEffect(() => {
    const checkUsuario = async () => {
      try {
        const userId = localStorage.getItem("client_key")?.replace(/"/g, "");
        if (!userId) {
          router.push('/login');
          return;
        }

        const userRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${userId}`);
        const userData = await userRes.json();

        if (!userRes.ok) throw new Error(t('erroBuscarUsuario'));

        setTipoUsuario(userData.tipo);

        const empresaRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${userId}`);
        const empresaData = await empresaRes.json();

        if (!empresaRes.ok) throw new Error(t('erroBuscarEmpresa'));

        setEmpresaId(empresaData.id);
        
        const empresaCompletaRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaData.id}`);
        const empresaCompletaData = await empresaCompletaRes.json();
        
        const estaAtivada = !!empresaCompletaData.ChaveAtivacao;
        setEmpresaAtivada(estaAtivada);

        if (estaAtivada && tipoUsuario === "PROPRIETARIO") {
          toast.success(t('empresaAtivada'));
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(t('erroGenerico'));
        }
        router.push('/dashboard');
      }
    };

    checkUsuario();
  }, [router, t, tipoUsuario]);

  const handleAtivar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!codigo.trim()) {
        throw new Error(t('erroCodigoVazio'));
      }

      if (codigo.length < 10 || !codigo.includes('-')) {
        throw new Error(t('erroCodigoInvalido'));
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/chave/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t('erroAtivacao'));
      }

      toast.success(t('empresaAtivada'));
      setEmpresaAtivada(true);
      
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('erroGenerico'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (tipoUsuario && tipoUsuario !== "PROPRIETARIO") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <div className="p-8 rounded-lg shadow-lg max-w-md w-full text-center" style={{
          backgroundColor: "var(--cor-fundo-bloco)",
          border: "1px solid var(--cor-borda)",
        }}>
          <div className="flex justify-center mb-4">
            <FaLock className="text-red-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--cor-texto)" }}>
            {t('acessoRestrito')}
          </h2>
          <p className="mb-6" style={{ color: "var(--cor-cinza)" }}>
            {t('apenasProprietarios')}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[var(--cor-botao)] hover:bg-[var(--cor-botao-hover)] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            {t('voltarDashboard')}
          </button>
        </div>
      </div>
    );
  }

  if (empresaAtivada && tipoUsuario === "PROPRIETARIO") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <div
          className="p-8 rounded-lg shadow-lg max-w-md w-full relative"
          style={{
            backgroundColor: "var(--cor-fundo-bloco)",
            border: "1px solid var(--cor-borda)",
          }}
        >
          <div className="flex justify-center mb-6">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--cor-texto)" }}>
            {t('empresaJaAtivada')}
          </h2>

          <p className="text-center mb-6" style={{ color: "var(--cor-cinza)" }}>
            {t('empresaJaAtivadaMensagem')}
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[var(--cor-botao)] hover:bg-[var(--cor-botao-hover)] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            {t('voltarDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div
      className="p-8 rounded-lg shadow-lg max-w-md w-full relative"
      style={{
        backgroundColor: "var(--cor-fundo-bloco)",
        border: "1px solid var(--cor-borda)",
      }}
      >
      <div className="flex justify-center mb-6">
        <FaLock className="text-blue-500 text-5xl" />
      </div>

      <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--cor-texto)" }}>
        {t('ativacaoTitulo')}
      </h2>

      <p className="text-center mb-6" style={{ color: "var(--cor-cinza)" }}>
        {t('ativacaoDescricao')}
      </p>

      <form onSubmit={handleAtivar} className="space-y-6">
        <div>
        <label htmlFor="codigo" className="block text-sm font-medium mb-1" style={{ color: "var(--cor-texto)" }}>
          {t('codigoAtivacao')}
        </label>
        <input
          id="codigo"
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="w-full px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-[var(--cor-botao)] focus:border-[var(--cor-botao)] transition-colors"
          style={{
          backgroundColor: modoDark ? "#1F2937" : "#FFFFFF",
          border: "1px solid var(--cor-borda)",
          color: "var(--cor-texto)",
          }}
          placeholder={t('codigoAtivacaoPlaceholder')}
          required
          disabled={loading}
        />
        <p className="mt-1 text-xs text-center" style={{ color: "var(--cor-cinza)" }}>
          {t('codigoAtivacaoAjuda')}
        </p>
        </div>

        <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--cor-botao)] transition-colors ${
          loading ? 'opacity-70 cursor-not-allowed' : 'bg-[var(--cor-botao)] hover:bg-[var(--cor-botao-hover)]'
          }`}
        >
          {loading ? t('ativando') : t('ativarEmpresa')}
        </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: "var(--cor-cinza)" }}>
        {t('naoEfetuouPagamento')}
        </p>
        <Link 
          href="https://wa.me/+5553981185633" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`inline-flex items-center mt-2 transition-colors ${
          modoDark 
          ? 'text-green-500 hover:text-green-800' 
          : 'text-green-800 hover:text-green-500'
          }`}
        >
          <FaShoppingCart className="mr-2" />
          <span className="font-medium">{t('cliqueAqui')}</span>
          <span className="ml-1">{t('paraComprarAtivacao')}</span>
        </Link>
      </div>
      </div>
    </div>
  );
}