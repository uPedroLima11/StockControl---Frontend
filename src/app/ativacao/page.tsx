"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FaCheckCircle, FaLock } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

type TipoUsuario = "FUNCIONARIO" | "ADMIN" | "PROPRIETARIO"

export default function AtivacaoPage() {
  const [codigo, setCodigo] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null)
  const [loading, setLoading] = useState(false)
  const [modoDark, setModoDark] = useState(false)
  const router = useRouter()
  const { t } = useTranslation("ativacao")

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark")
    const ativo = temaSalvo === "true"
    setModoDark(ativo)
    aplicarTema(ativo)
  }, [])

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement
    if (ativado) {
      root.classList.add("dark")
      root.style.setProperty("--cor-fundo", "#20252B")
      root.style.setProperty("--cor-texto", "#FFFFFF")
      root.style.setProperty("--cor-fundo-bloco", "#1a25359f")
      root.style.setProperty("--cor-borda", "#374151")
      root.style.setProperty("--cor-cinza", "#A3A3A3")
      root.style.setProperty("--cor-destaque", "#00332C")
      document.body.style.backgroundColor = "#20252B"
      document.body.style.color = "#FFFFFF"
    } else {
      root.classList.remove("dark")
      root.style.setProperty("--cor-fundo", "#FFFFFF")
      root.style.setProperty("--cor-texto", "#000000")
      root.style.setProperty("--cor-fundo-bloco", "#ececec")
      root.style.setProperty("--cor-borda", "#E5E7EB")
      root.style.setProperty("--cor-cinza", "#4B5563")
      root.style.setProperty("--cor-destaque", "#00332C")
      document.body.style.backgroundColor = "#FFFFFF"
      document.body.style.color = "#000000"
    }
  }

  useEffect(() => {
    const checkUsuario = async () => {
      try {
        const userId = localStorage.getItem("client_key")?.replace(/"/g, "")
        if (!userId) {
          router.push('/login')
          return
        }

        const userRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${userId}`)
        const userData = await userRes.json()

        if (!userRes.ok) throw new Error(t('erroBuscarUsuario'))

        setTipoUsuario(userData.tipo)
        

        const empresaRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${userId}`)
        const empresaData = await empresaRes.json()

        if (!empresaRes.ok) throw new Error(t('erroBuscarEmpresa'))

        setEmpresaId(empresaData.id)

        if (empresaData.ChaveAtivacao) {
          toast.success(t('empresaAtivada'))
          router.push('/dashboard')
        }
      } catch (error: any) {
        toast.error(error.message)
        router.push('/dashboard')
      }
    }

    checkUsuario()
  }, [router, t])

  const handleAtivar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!codigo.trim()) {
        throw new Error(t('erroCodigoVazio'))
      }

      if (codigo.length < 10 || !codigo.includes('-')) {
        throw new Error(t('erroCodigoInvalido'))
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/chave/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || t('erroAtivacao'))
      }

      toast.success(t('empresaAtivada'))
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (tipoUsuario && tipoUsuario !== "PROPRIETARIO") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <div className="p-8 rounded-lg shadow-lg max-w-md w-full text-center" style={{ backgroundColor: "var(--cor-fundo-bloco)" }}>
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {t('voltarDashboard')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div 
        className="p-8 rounded-lg shadow-lg max-w-md w-full"
        style={{ 
          backgroundColor: "var(--cor-fundo-bloco)",
          border: `1px solid var(--cor-borda)`
        }}
      >
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-5xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--cor-texto)" }}>
          {t('titulo')}
        </h2>
        
        <p className="text-center mb-6" style={{ color: "var(--cor-cinza)" }}>
          {t('subtitulo')}
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
              className="w-full px-4 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              style={{
                backgroundColor: "var(--cor-fundo-bloco)",
                border: `1px solid var(--cor-borda)`,
                color: "var(--cor-texto)"
              }}
              placeholder={t('codigoPlaceholder')}
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--cor-cinza)" }}>
              {t('codigoHelp')}
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading ? 'opacity-70 cursor-not-allowed bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {loading ? t('botaoAtivando') : t('botaoAtivar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}