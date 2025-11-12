"use client";

import { useState, useEffect, Suspense } from "react";
import LoginForm from "./LoginForm";
import VerificacaoEmail from "@/components/VerificacaoEmail";
import { useUsuarioStore } from "@/context/usuario";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

type LoginStep = "form" | "verificacao" | "emailNaoVerificado";

function LoginContent() {
  const [currentStep, setCurrentStep] = useState<LoginStep>("form");
  const [userEmail, setUserEmail] = useState("");
  const [userSenha, setUserSenha] = useState("");
  const { logar } = useUsuarioStore();
  const searchParams = useSearchParams();
  
  const { t: tNotificacoes } = useTranslation("notificacoes");

  useEffect(() => {
    const message = searchParams.get('message');
    const email = searchParams.get('email');

    if (message === 'email-verificado' && email) {
      localStorage.setItem('login_success_message', tNotificacoes("login.email_verificado_sucesso"));
      localStorage.setItem('login_success_type', 'success');
    }
  }, [searchParams, tNotificacoes]);

  const handle2FANeeded = (email: string) => {
    setUserEmail(email);
    setCurrentStep("verificacao");
  };

  const handleEmailNaoVerificadoComSenha = (email: string, senha: string) => {
    setUserEmail(email);
    setUserSenha(senha);
    setCurrentStep("emailNaoVerificado");
  };

  const handleVerificacaoComplete = async () => {
    await finalizarLogin();
  };

  const handleEmailVerificado = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          senha: userSenha
        }),
      });

      const responseData = await response.json();

      if (response.status === 200) {
        if (responseData.precisa2FA) {
          setCurrentStep("verificacao");
        } else {
          localStorage.setItem('login_success_message', tNotificacoes("login.email_verificado"));
          localStorage.setItem('login_success_type', 'success');

          Cookies.set("token", responseData.token, { expires: 7 });
          logar(responseData);
          localStorage.setItem("client_key", JSON.stringify(responseData.id));
          window.location.href = "/dashboard";
        }
      } else {
        setCurrentStep("form");
        localStorage.setItem('login_success_message', responseData.message || tNotificacoes("login.erro_login_apos_verificacao"));
        localStorage.setItem('login_success_type', 'error');
      }
    } catch (error) {
      console.error("❌ Erro de conexão ao fazer login após verificação:", error);
      setCurrentStep("form");
      localStorage.setItem('login_success_message', tNotificacoes("login.erro_conexao_login_apos_verificacao"));
      localStorage.setItem('login_success_type', 'error');
    }
  };

  const handleVoltar = () => {
    setCurrentStep("form");
    setUserSenha("");
  };

  const finalizarLogin = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/login-finalizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        const dados = await response.json();
        localStorage.setItem('login_success_message', tNotificacoes("login.sucesso"));
        localStorage.setItem('login_success_type', 'success');

        Cookies.set("token", dados.token, { expires: 1 });
        logar(dados);
        localStorage.setItem("client_key", JSON.stringify(dados.id));

        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        console.error("❌ Erro ao finalizar login:", errorData);
        localStorage.setItem('login_success_message', errorData.message || tNotificacoes("login.erro_finalizar_login"));
        localStorage.setItem('login_success_type', 'error');
      }
    } catch (error) {
      console.error("❌ Erro de conexão ao finalizar login:", error);
      localStorage.setItem('login_success_message', tNotificacoes("login.erro_conexao_finalizar_login"));
      localStorage.setItem('login_success_type', 'error');
    }
  };

  return (
    <>
      {currentStep === "form" && (
        <LoginForm
          on2FANeeded={handle2FANeeded}
          onEmailNaoVerificado={handleEmailNaoVerificadoComSenha}
        />
      )}

      {currentStep === "verificacao" && (
        <VerificacaoEmail
          email={userEmail}
          tipo="login"
          onVerificado={handleVerificacaoComplete}
          onVoltar={handleVoltar}
          enviarCodigoAutomaticamente={true}
        />
      )}

      {currentStep === "emailNaoVerificado" && (
        <VerificacaoEmail
          email={userEmail}
          tipo="registro"
          onVerificado={handleEmailVerificado}
          onVoltar={handleVoltar}
        />
      )}
    </>
  );
}

export default function LoginPage() {
  const { t: tLogin } = useTranslation("login");

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-cyan-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">{tLogin("carregando")}</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}