"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { cores } from "@/utils/cores";
import { HiEnvelope, HiLockClosed, HiArrowLeft } from "react-icons/hi2";
import CustomNotification from "./NotificacaoCustom";
import { useTranslation } from "react-i18next";

interface VerificacaoEmailProps {
  email: string;
  tipo: "registro" | "login";
  onVerificado: () => void;
  onVoltar?: () => void;
}

type Inputs = {
  codigo: string;
};

type NotificationType = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

export default function VerificacaoEmail({ email, tipo, onVerificado, onVoltar }: VerificacaoEmailProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Inputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [, setCodigoEnviado] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const { t: tVerificacao } = useTranslation("verificacao");
  const { t: tNotificacoes } = useTranslation("notificacoes");

  const temaAtual = cores.dark;

  const addNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  useEffect(() => {
    if (tempoRestante > 0) {
      const timer = setTimeout(() => setTempoRestante(tempoRestante - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tempoRestante]);

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const enviarCodigoVerificacao = async (isInitial: boolean = false) => {
    if (isSending || (tempoRestante > 0 && !isInitial)) return;

    setIsSending(true);
    try {
      let endpoint;
      let bodyData;

      if (tipo === "registro") {
        endpoint = "/usuarios/reenviar-codigo";
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

        if (isInitial) {
          addNotification(responseData.mensagem || tNotificacoes("verificacao.codigo_enviado"), "success");
        } else {
          addNotification(responseData.mensagem || tNotificacoes("verificacao.codigo_reenviado"), "success");
        }

        if (!isInitial) {
          setTempoRestante(60);
        }
      } else {
        console.error("❌ Erro ao enviar código:", responseData);
        addNotification(responseData.mensagem || responseData.message || tNotificacoes("verificacao.erro_codigo"), "error");
      }
    } catch (error) {
      console.error("❌ Erro de conexão:", error);
      addNotification(tNotificacoes("verificacao.erro_conexao"), "error");
    } finally {
      setIsSending(false);
    }
  };

  const verificarCodigo = async (data: Inputs) => {
    setIsLoading(true);
    try {
      let endpoint;
      let bodyData;

      if (tipo === "registro") {

        endpoint = "/usuarios/finalizar-registro";
        bodyData = { email, codigo: data.codigo };
      } else {
        endpoint = "/verificacao/verificar-2fa";
        bodyData = { email, codigo: data.codigo };
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
        let successMessage = "";

        if (tipo === "registro") {
          successMessage = responseData.mensagem || tNotificacoes("verificacao.email_verificado");
        } else {
          successMessage = tNotificacoes("verificacao.verificacao_concluida");
        }

        addNotification(successMessage, "success");

        setTimeout(() => {
          onVerificado();
        }, 1000);
      } else {
        console.error("❌ Erro na verificação:", responseData);
        addNotification(responseData.mensagem || responseData.message || tNotificacoes("verificacao.codigo_invalido"), "error");
      }
    } catch (error) {
      console.error("❌ Erro de conexão:", error);
      addNotification(tNotificacoes("verificacao.erro_conexao"), "error");
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
      return tVerificacao("verifique_seu_email");
    } else {
      return tVerificacao("verificacao_duas_etapas");
    }
  };

  const getDescricao = () => {
    if (tipo === "registro") {
      return tVerificacao("enviamos_codigo_registro");
    } else {
      return tVerificacao("enviamos_codigo_seguranca");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: temaAtual.gradiente }}>
      {notifications.map((notification) => (
        <CustomNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

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

          {isSending && (
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <div className="text-blue-300 text-sm flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                {tVerificacao("enviando")}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(verificarCodigo)} className="space-y-6">
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-300">
              {tVerificacao("codigo_verificacao")}
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
              {tVerificacao("digite_codigo")}
            </p>
          </div>

          {tempoRestante > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-400">
                {tVerificacao("reenviar_em")} <span className="font-mono text-orange-400">{formatarTempo(tempoRestante)}</span>
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
                {tVerificacao("verificando")}
              </div>
            ) : (
              tVerificacao("verificar_codigo")
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => enviarCodigoVerificacao(false)}
              disabled={isSending || tempoRestante > 0}
              className="text-blue-400 hover:text-blue-300 text-sm disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  {tVerificacao("enviando")}
                </div>
              ) : tempoRestante > 0 ? (
                `${tVerificacao("reenviar_em")} ${formatarTempo(tempoRestante)}`
              ) : (
                tVerificacao("reenviar_codigo")
              )}
            </button>
          </div>

          {tipo === "registro" && (
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                {tVerificacao("apos_verificar")}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}