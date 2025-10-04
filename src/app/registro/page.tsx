"use client";

import { useState } from "react";
import RegistroForm from "./registroform";
import VerificacaoEmail from "@/components/VerificacaoEmail";

type RegistroStep = "form" | "verificacao";

export default function RegistroPage() {
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