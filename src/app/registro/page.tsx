"use client";

import { useState, Suspense } from "react";
import RegistroForm from "./registroform";
import VerificacaoEmail from "@/components/VerificacaoEmail";
import { useTranslation } from "react-i18next";

type RegistroStep = "form" | "verificacao";

function RegistroContent() {
  const [currentStep, setCurrentStep] = useState<RegistroStep>("form");
  const [userEmail, setUserEmail] = useState("");

  const handleRegistroSuccess = (email: string) => {
    setUserEmail(email);
    setCurrentStep("verificacao");
  };

  const handleVerificacaoComplete = () => {
    window.location.href = "/login?message=email-verificado&email=" + encodeURIComponent(userEmail);
  };

  const handleVoltar = () => {
    setCurrentStep("form");
  };

  return (
    <>
      {currentStep === "form" && (
        <RegistroForm onRegistroSuccess={handleRegistroSuccess} />
      )}
      {currentStep === "verificacao" && (
        <VerificacaoEmail
          email={userEmail}
          tipo="registro"
          onVerificado={handleVerificacaoComplete}
          onVoltar={handleVoltar}
        />
      )}
    </>
  );
}

export default function RegistroPage() {
  const { t } = useTranslation("registro");

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-900 to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">{t("carregando")}</p>
        </div>
      </div>
    }>
      <RegistroContent />
    </Suspense>
  );
}