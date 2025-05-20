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
  const router = useRouter()
    const { t } = useTranslation("Ativacao");
  

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

        if (!userRes.ok) throw new Error('Erro ao buscar dados do usuário')

        setTipoUsuario(userData.tipo)

        const empresaRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${userId}`)
        const empresaData = await empresaRes.json()

        if (!empresaRes.ok) throw new Error('Erro ao buscar dados da empresa')

        setEmpresaId(empresaData.id)

        if (empresaData.ChaveAtivacao) {
          toast.success('Esta empresa já está ativada')
          router.push('/dashboard')
        }
      } catch (error: any) {
        toast.error(error.message)
        router.push('/dashboard')
      }
    }

    checkUsuario()
  }, [router])

  const handleAtivar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!codigo.trim()) {
        throw new Error('Por favor, insira o código de ativação')
      }

      if (codigo.length < 10 || !codigo.includes('-')) {
        throw new Error('Formato de código inválido')
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/chave/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erro ao ativar empresa')
      }

      toast.success('Empresa ativada com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao ativar empresa')
    } finally {
      setLoading(false)
    }
  }

  if (tipoUsuario && tipoUsuario !== "PROPRIETARIO") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <FaLock className="text-red-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Apenas proprietários da empresa podem acessar esta funcionalidade.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-5xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-white">
          Ativação da Empresa
        </h2>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Insira o código de ativação fornecido após o pagamento para liberar todas as funcionalidades do sistema.
        </p>

        <form onSubmit={handleAtivar} className="space-y-6">
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código de Ativação
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="XXXX-XXXX-XXXX"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              O código será fornecido após a confirmação do pagamento
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Ativando...' : 'Ativar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}