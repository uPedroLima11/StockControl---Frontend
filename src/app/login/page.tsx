"use client";

import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import VerificacaoEmail from "@/components/VerificacaoEmail";
import { useUsuarioStore } from "@/context/usuario";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";

type LoginStep = "form" | "verificacao" | "emailNaoVerificado";

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<LoginStep>("form");
  const [userEmail, setUserEmail] = useState("");
  const [userSenha, setUserSenha] = useState("");
  const { logar } = useUsuarioStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    const email = searchParams.get('email');
    
    if (message === 'email-verificado' && email) {
    }
  }, [searchParams]);

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
          Cookies.set("token", responseData.token, { expires: 1 });
          logar(responseData);
          localStorage.setItem("client_key", JSON.stringify(responseData.id));
          window.location.href = "/dashboard";
        }
      } else {
        setCurrentStep("form");
      }
    } catch (error) {
      console.error("❌ Erro de conexão ao fazer login após verificação:", error);
      setCurrentStep("form");
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
        Cookies.set("token", dados.token, { expires: 1 });
        logar(dados);
        localStorage.setItem("client_key", JSON.stringify(dados.id));
        
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        console.error("❌ Erro ao finalizar login:", errorData);
        alert("Erro ao finalizar login: " + errorData.message);
      }
    } catch (error) {
      console.error("❌ Erro de conexão ao finalizar login:", error);
      alert("Erro de conexão ao finalizar login");
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