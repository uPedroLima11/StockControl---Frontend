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

  const cores = {
    dark: {
      fundo: "#0A1929",
      texto: "#FFFFFF",
      card: "#132F4C",
      borda: "#1E4976",
      primario: "#1976D2",
      secundario: "#00B4D8",
      placeholder: "#9CA3AF",
      hover: "#1E4976",
      sucesso: "#10B981",
      erro: "#EF4444"
    },
    light: {
      fundo: "#F8FAFC",
      texto: "#0F172A",
      card: "#FFFFFF",
      borda: "#E2E8F0",
      primario: "#1976D2",
      secundario: "#0284C7",
      placeholder: "#6B7280",
      hover: "#EFF6FF",
      sucesso: "#10B981",
      erro: "#EF4444"
    }
  };

  const temaAtual = modoDark ? cores.dark : cores.light;

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
  }, []);

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
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
        <div className="w-full max-w-md p-6 rounded-lg text-center" style={{
          backgroundColor: temaAtual.card,
          border: `1px solid ${temaAtual.borda}`,
        }}>
          <div className="flex justify-center mb-4">
            <FaLock className="text-4xl" style={{ color: temaAtual.erro }} />
          </div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: temaAtual.texto }}>
            {t('acessoRestrito')}
          </h2>
          <p className="mb-6 text-sm" style={{ color: temaAtual.placeholder }}>
            {t('apenasProprietarios')}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 rounded-lg transition font-medium"
            style={{
              backgroundColor: temaAtual.primario,
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {t('voltarDashboard')}
          </button>
        </div>
      </div>
    );
  }

  if (empresaAtivada && tipoUsuario === "PROPRIETARIO") {
    return (
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
        <div className="w-full max-w-md p-6 rounded-lg text-center" style={{
          backgroundColor: temaAtual.card,
          border: `1px solid ${temaAtual.borda}`,
        }}>
          <div className="flex justify-center mb-4">
            <FaCheckCircle className="text-4xl" style={{ color: temaAtual.sucesso }} />
          </div>

          <h2 className="text-xl font-semibold mb-4" style={{ color: temaAtual.texto }}>
            {t('empresaJaAtivada')}
          </h2>

          <p className="mb-6 text-sm" style={{ color: temaAtual.placeholder }}>
            {t('empresaJaAtivadaMensagem')}
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 cursor-pointer rounded-lg transition font-medium"
            style={{
              backgroundColor: temaAtual.primario,
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {t('voltarDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
      <div className="w-full max-w-md p-6 rounded-lg" style={{
        backgroundColor: temaAtual.card,
        border: `1px solid ${temaAtual.borda}`,
      }}>
        <div className="flex justify-center mb-4">
          <FaLock className="text-4xl" style={{ color: temaAtual.primario }} />
        </div>

        <h2 className="text-xl font-semibold text-center mb-4" style={{ color: temaAtual.texto }}>
          {t('ativacaoTitulo')}
        </h2>

        <p className="text-center mb-6 text-sm" style={{ color: temaAtual.placeholder }}>
          {t('ativacaoDescricao')}
        </p>

        <form onSubmit={handleAtivar} className="space-y-4">
          <div>
            <label htmlFor="codigo" className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
              {t('codigoAtivacao')}
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: temaAtual.card,
                color: temaAtual.texto,
                border: `1px solid ${temaAtual.borda}`
              }}
              placeholder={t('codigoAtivacaoPlaceholder')}
              required
              disabled={loading}
              onFocus={(e) => {
                e.target.style.borderColor = temaAtual.primario;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = temaAtual.borda;
              }}
            />
            <p className="mt-1 text-xs text-center" style={{ color: temaAtual.placeholder }}>
              {t('codigoAtivacaoAjuda')}
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg cursor-pointer transition font-medium flex items-center justify-center"
              style={{
                backgroundColor: loading ? temaAtual.placeholder : temaAtual.primario,
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('ativando')}
                </div>
              ) : (
                t('ativarEmpresa')
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm mb-2" style={{ color: temaAtual.placeholder }}>
            {t('naoEfetuouPagamento')}
          </p>
          <Link 
            href="https://wa.me/+5553981185633" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center text-sm transition"
            style={{
              color: temaAtual.primario,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
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