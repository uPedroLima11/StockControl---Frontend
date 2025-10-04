"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { cores } from "@/utils/cores";
import { HiEnvelope, HiLockClosed, HiArrowLeft } from "react-icons/hi2";

interface VerificacaoEmailProps {
  email: string;
  tipo: "registro" | "login";
  onVerificado: () => void;
  onVoltar?: () => void;
}

type Inputs = {
  codigo: string;
};

export default function VerificacaoEmail({ email, tipo, onVerificado, onVoltar }: VerificacaoEmailProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Inputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(600); 
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  
  const codigoInicialEnviado = useRef(false);

  const temaAtual = cores.dark;

  useEffect(() => {
    if (!codigoInicialEnviado.current) {
      enviarCodigoVerificacao();
      codigoInicialEnviado.current = true;
    }
  }, []); 

  useEffect(() => {
    if (tempoRestante > 0 && codigoEnviado) {
      const timer = setTimeout(() => setTempoRestante(tempoRestante - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tempoRestante, codigoEnviado]);

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const enviarCodigoVerificacao = async () => {
    if (isSending) return;
    
    setIsSending(true);
    try {      
      let endpoint;
      let bodyData;
      
      if (tipo === "registro") {
        endpoint = "/verificacao/enviar-codigo-registro";
        bodyData = { email };
      } else {
        endpoint = "/verificacao/enviar-codigo-2fa";
        bodyData = { email };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const responseData = await response.json();
      if (response.ok) {
        setCodigoEnviado(true);
        setTempoRestante(600); 
        
        if (codigoInicialEnviado.current) {
          Swal.fire({
            icon: "success",
            title: "Código reenviado!",
            text: "Verifique seu email e digite o novo código recebido.",
            confirmButtonColor: temaAtual.primario,
            background: temaAtual.card,
            color: temaAtual.texto,
          });
        }
      } else {
        console.error("❌ Erro ao enviar código:", responseData);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: responseData.message || "Erro ao enviar código de verificação",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
        });
      }
    } catch (error) {
      console.error("❌ Erro de conexão:", error);
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: "Não foi possível enviar o código de verificação",
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto,
      });
    } finally {
      setIsSending(false);
    }
  };

  const verificarCodigo = async (data: Inputs) => {
    setIsLoading(true);
    try {      
      let endpoint;
      if (tipo === "registro") {
        endpoint = "/verificacao/confirmar-email";
      } else {
        endpoint = "/verificacao/verificar-2fa";
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          codigo: data.codigo,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        let successMessage = "";
        
        if (tipo === "registro") {
          successMessage = "Seu email foi verificado com sucesso!";
        } else {
          successMessage = "Verificação em duas etapas concluída com sucesso!";
        }

        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: successMessage,
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
        }).then(() => {
          onVerificado();
        });
      } else {
        console.error("❌ Erro na verificação:", responseData);
        Swal.fire({
          icon: "error",
          title: "Código inválido",
          text: responseData.message || "Verifique o código e tente novamente",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
        });
      }
    } catch (error) {
      console.error("❌ Erro de conexão:", error);
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: "Não foi possível verificar o código",
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const codigo = watch("codigo");
    if (codigo && codigo.length === 6) {
      handleSubmit(verificarCodigo)();
    }
  }, [watch("codigo")]);

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('codigo', value, { shouldValidate: true });
  };

  const getTitulo = () => {
    if (tipo === "registro") {
      return "Verifique seu Email";
    } else {
      return "Verificação em Duas Etapas";
    }
  };

  const getDescricao = () => {
    if (tipo === "registro") {
      return "Enviamos um código de 6 dígitos para verificar seu email";
    } else {
      return "Enviamos um código de 6 dígitos para sua verificação de segurança";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: temaAtual.gradiente }}>
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          {onVoltar && (
            <button
              onClick={onVoltar}
              className="absolute left-6 top-6 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <HiArrowLeft className="text-xl" />
            </button>
          )}
          
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <HiEnvelope className="text-2xl text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {getTitulo()}
          </h2>
          <p className="text-gray-400 mb-2">
            {getDescricao()}
          </p>
          <p className="text-blue-400 font-medium break-all">{email}</p>
          
          {!codigoEnviado && (
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <p className="text-blue-300 text-sm">
                📧 Enviando código de verificação...
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(verificarCodigo)} className="space-y-6">
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-300">
              Código de Verificação
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiLockClosed className="text-gray-400" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                {...register("codigo", {
                  required: "Código é obrigatório",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "O código deve ter exatamente 6 dígitos"
                  }
                })}
                onChange={handleCodigoChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest font-mono"
                placeholder="000000"
                style={{
                  backgroundColor: temaAtual.fundo + '80',
                  borderColor: temaAtual.borda
                }}
                disabled={isLoading}
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
            {errors.codigo && (
              <p className="text-red-400 text-sm mt-2 text-center">{errors.codigo.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">
              Digite o código de 6 dígitos recebido por email
            </p>
          </div>

          {codigoEnviado && (
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Código expira em: <span className="font-mono text-orange-400">{formatarTempo(tempoRestante)}</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verificando...
              </div>
            ) : (
              "Verificar Código"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={enviarCodigoVerificacao}
              disabled={isSending || tempoRestante > 540} 
              className="text-blue-400 hover:text-blue-300 text-sm disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </span>
              ) : (
                "Não recebeu o código? Reenviar"
              )}
            </button>
          </div>

          {tipo === "registro" && (
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Após verificar, você será redirecionado para o login
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}