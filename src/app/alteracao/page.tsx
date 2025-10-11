"use client";

import { HiEnvelope, HiLockClosed, HiMiniIdentification, HiCheckCircle, HiExclamationCircle, HiArrowLeft } from "react-icons/hi2";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { cores } from "@/utils/cores";
import Swal from "sweetalert2";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { FaShield } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type Inputs = {
  email: string;
  codigoVerificacao: string;
  senha: string;
  confirmaSenha: string;
};

export default function Alteracao() {
  const { register, handleSubmit, control } = useForm<Inputs>();
  const router = useRouter();
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [animacaoAtiva, setAnimacaoAtiva] = useState(false);
  const senha = useWatch({ control, name: "senha" });
  const confirmaSenha = useWatch({ control, name: "confirmaSenha" });
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("alteracao");

  const temaAtual = cores.dark;

  useEffect(() => {
    setAnimacaoAtiva(true);
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
        50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
      }
      
      .animate-float {
        animation: float 8s ease-in-out infinite;
      }
      
      .animate-glow {
        animation: glow 4s ease-in-out infinite;
      }
      
      .animate-float-delayed {
        animation: float 10s ease-in-out infinite;
        animation-delay: 2s;
      }
      
      html::-webkit-scrollbar {
        width: 10px;
      }
      
      html::-webkit-scrollbar-track {
        background: #132F4C;
      }
      
      html::-webkit-scrollbar-thumb {
        background: #132F4C; 
        border-radius: 5px;
        border: 2px solid #132F4C;
      }
      
      html::-webkit-scrollbar-thumb:hover {
        background: #132F4C; 
      }
    `;
    document.head.appendChild(style);

    setPasswordValid(validarSenha(senha));
    setPasswordsMatch(senha === confirmaSenha && senha !== '');

    return () => {
      document.head.removeChild(style);
    };
  }, [senha, confirmaSenha]);

  function validarSenha(senha: string) {
    if (!senha) return false;
    if (senha.length < 8) return false;
    let minusculas = 0, maiusculas = 0, numeros = 0, simbolos = 0;
    for (const char of senha) {
      if (/[a-z]/.test(char)) minusculas++;
      else if (/[A-Z]/.test(char)) maiusculas++;
      else if (/[0-9]/.test(char)) numeros++;
      else simbolos++;
    }
    return minusculas > 0 && maiusculas > 0 && numeros > 0 && simbolos > 0;
  }

  async function verificaAlteracao(data: Inputs) {
    try {
      if (!passwordValid) {
        Swal.fire({
          icon: "error",
          title: t("erros.senha_invalida"),
          text: t("erros.senha_requisitos"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        return;
      }
      if (data.senha !== data.confirmaSenha) {
        Swal.fire({
          icon: "error",
          title: t("erros.titulo_erro"),
          text: t("erros.senhas_nao_coincidem"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/recuperacao/alterar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          senha: data.senha,
          recuperacao: data.codigoVerificacao,
        }),
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: t("sucesso.titulo"),
          text: t("sucesso.mensagem"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        }).then(() => {
          router.push("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: t("erros.titulo_erro"),
          text: t("erros.erro_alteracao"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      Swal.fire({
        icon: "error",
        title: t("erros.titulo_erro"),
        text: t("erros.erro_alteracao"),
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });
    }
  }

  const requisitosSenha = [
    { condicao: senha?.length >= 8, chave: "minimo_caracteres" },
    { condicao: senha && /[a-z]/.test(senha), chave: "letra_minuscula" },
    { condicao: senha && /[A-Z]/.test(senha), chave: "letra_maiuscula" },
    { condicao: senha && /[0-9]/.test(senha), chave: "um_numero" },
    { condicao: senha && /[^a-zA-Z0-9]/.test(senha), chave: "um_simbolo" }
  ];

  const beneficios = [
    { icone: <FaKey className="text-xl" />, chave: "senha_segura" },
    { icone: <FaShield className="text-xl" />, chave: "protecao" },
    { icone: <HiCheckCircle className="text-xl" />, chave: "acesso_imediato" }
  ];

  return (
    <div 
      className={`min-h-screen flex ${poppins.className}`}
      style={{ background: temaAtual.gradiente }}
    >
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start px-16 w-full">
          <Link 
            href="/"
            className="flex items-center gap-3 mb-12 group"
          >
            <div className="p-3 rounded-2xl bg-green-500/20 border border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
              <img src="/icone.png" alt="Logo" className="w-8 h-8 brightness-0 invert" />
            </div>
            <span className="text-2xl font-bold text-white">StockControl</span>
          </Link>

          <div className={`transition-all duration-1000 transform ${animacaoAtiva ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <h1 className="text-5xl font-bold text-white mb-6">
              {t("nova")}{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {t("senha")}
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-md">
              {t("criar_senha_segura")}
            </p>

            <div className="space-y-6">
              {beneficios.map((beneficio, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 text-gray-300 group"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                    {beneficio.icone}
                  </div>
                  <span className="text-lg">{t(`beneficios.${beneficio.chave}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div 
          ref={containerRef}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <Link 
              href="/"
              className="flex items-center gap-3 group"
            >
              <div className="p-3 rounded-2xl bg-green-500/20 border border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                <img src="/icone.png" alt="Logo" className="w-8 h-8 brightness-0 invert" />
              </div>
              <span className="text-2xl font-bold text-white">StockControl</span>
            </Link>
          </div>

          <div 
            className={`bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20 shadow-2xl transition-all duration-1000 ${animacaoAtiva ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <Link 
              href="/esqueci"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
            >
              <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              {t("voltar_recuperacao")}
            </Link>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaKey className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {t("nova_senha")}
              </h2>
              <p className="text-gray-400">
                {t("digite_codigo_senha")}
              </p>
            </div>

            <form onSubmit={handleSubmit(verificaAlteracao)} className="space-y-6">
              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {t("email_cadastrado")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiEnvelope className="text-gray-400 group-hover:text-green-400 transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    {...register("email")} 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-400/50"
                    placeholder={t("email_placeholder")}
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {t("codigo_verificacao")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiLockClosed className="text-gray-400 group-hover:text-green-400 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    {...register("codigoVerificacao")} 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-400/50"
                    placeholder={t("codigo_placeholder")}
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {t("nova_senha_field")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiMiniIdentification className="text-gray-400 group-hover:text-green-400 transition-colors" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    {...register("senha")} 
                    required 
                    className="w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-400/50"
                    placeholder={t("nova_senha_placeholder")}
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {senha && (
                    <div className="absolute inset-y-0 right-10 pr-4 flex items-center">
                      {passwordValid ? 
                        <HiCheckCircle className="text-green-400" /> : 
                        <HiExclamationCircle className="text-red-400" />
                      }
                    </div>
                  )}
                </div>
              </div>

              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {t("confirmar_senha")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiMiniIdentification className="text-gray-400 group-hover:text-green-400 transition-colors" />
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    {...register("confirmaSenha")} 
                    required 
                    className="w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-400/50"
                    placeholder={t("confirmar_senha_placeholder")}
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {confirmaSenha && (
                    <div className="absolute inset-y-0 right-10 pr-4 flex items-center">
                      {passwordsMatch ? 
                        <HiCheckCircle className="text-green-400" /> : 
                        <HiExclamationCircle className="text-red-400" />
                      }
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900/30 rounded-2xl p-4 border border-gray-600">
                <p className="text-sm font-medium text-gray-300 mb-3">
                  {t("requisitos_senha")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requisitosSenha.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {req.condicao ? (
                        <HiCheckCircle className="text-green-400 text-sm flex-shrink-0" />
                      ) : (
                        <HiExclamationCircle className="text-red-400 text-sm flex-shrink-0" />
                      )}
                      <span className={`text-xs ${req.condicao ? 'text-green-400' : 'text-red-400'}`}>
                        {t(req.chave)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={!passwordValid || !passwordsMatch}
                className="w-full cursor-pointer group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {t("alterar_senha")}
                  <FaShield className="group-hover:scale-110 transition-transform" />
                </span>
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-center text-gray-400">
                {t("lembrou_senha")}{" "}
                <Link 
                  href="/login" 
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  {t("fazer_login")}
                </Link>
              </p>
            </div>
          </div>

          <div className="lg:hidden mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {t("copyright")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}