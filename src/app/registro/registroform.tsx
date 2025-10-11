"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { HiEnvelope, HiLockClosed, HiMiniUserCircle, HiCheckCircle, HiExclamationCircle } from "react-icons/hi2";
import { FaEye, FaEyeSlash, FaCheck, FaTimes, FaArrowRight, FaShieldAlt, FaRocket, FaChartBar } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { cores } from "@/utils/cores";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { Poppins } from "next/font/google";
import { useTranslation } from "react-i18next";
import i18n from "../../../lib/i18n";
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type Inputs = {
  nome: string;
  email: string;
  senha: string;
  verificarSenha: string;
};

type EmailStatus = {
  existe: boolean;
  carregando: boolean;
  mensagem: string;
};

interface RegistroFormProps {
  onRegistroSuccess: (email: string) => void;
}

export default function RegistroForm({ onRegistroSuccess }: RegistroFormProps) {
  const { register, handleSubmit, control } = useForm<Inputs>();
  const [visivel, setVisivel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [animacaoAtiva, setAnimacaoAtiva] = useState(false);
  const senha = useWatch({ control, name: "senha" });
  const verificarSenha = useWatch({ control, name: "verificarSenha" });
  const email = useWatch({ control, name: "email" });
  const containerRef = useRef<HTMLDivElement>(null);

  const { t: tRegistro } = useTranslation("registro");
  const { t: tNotificacoes } = useTranslation("notificacoes");

  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    existe: false,
    carregando: false,
    mensagem: "",
  });

  const temaAtual = cores.dark;

  useEffect(() => {
    setAnimacaoAtiva(true);
  }, []);

  function validarSenha(senha: string) {
    if (!senha) return false;
    if (senha.length < 8) return false;
    let minusculas = 0,
      maiusculas = 0,
      numeros = 0,
      simbolos = 0;
    for (const char of senha) {
      if (/[a-z]/.test(char)) minusculas++;
      else if (/[A-Z]/.test(char)) maiusculas++;
      else if (/[0-9]/.test(char)) numeros++;
      else simbolos++;
    }
    return minusculas > 0 && maiusculas > 0 && numeros > 0 && simbolos > 0;
  }

  useEffect(() => {
    const verificarEmailDisponibilidade = async () => {
      if (!email) {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: "",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: "",
        });
        return;
      }

      setEmailStatus((prev) => ({ ...prev, carregando: true }));

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/empresa/verificar-email/${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
              "Accept-Language": i18n.language
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setEmailStatus({
            existe: data.existe,
            carregando: false,
            mensagem: data.mensagem,
          });
        } else {
          setEmailStatus({
            existe: false,
            carregando: false,
            mensagem: "Erro ao verificar email",
          });
        }
      } catch {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: "Erro ao verificar email",
        });
      }
    };

    const timeoutId = setTimeout(verificarEmailDisponibilidade, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  useEffect(() => {
    setPasswordValid(validarSenha(senha));
    setPasswordsMatch(senha === verificarSenha && senha !== "");
  }, [senha, verificarSenha]);

  async function verificaCadastro(data: Inputs) {
    setIsLoading(true);
    try {
      if (emailStatus.existe) {
        Swal.fire({
          icon: "error",
          title: tNotificacoes("registro.email_ja_cadastrado"),
          text: emailStatus.mensagem,
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
        });
        return;
      }

      if (!passwordValid) {
        Swal.fire({
          icon: "error",
          title: tNotificacoes("registro.senha_invalida"),
          text: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
        });
        return;
      }

      if (data.senha !== data.verificarSenha) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: tNotificacoes("registro.senhas_nao_coincidem"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/iniciar-registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          tipo: "FUNCIONARIO",
        }),
      });

      const responseData = await response.json();

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: tNotificacoes("registro.codigo_enviado"),
          text: tNotificacoes("registro.sucesso_email_enviado"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
        }).then(() => {
          onRegistroSuccess(data.email);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Algo deu errado.",
          text: responseData.mensagem || "Erro ao iniciar registro.",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: tNotificacoes("registro.erro_conexao"),
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const beneficios = [
    { icone: <FaRocket className="text-xl" />, chave: "setup" },
    { icone: <FaChartBar className="text-xl" />, chave: "dashboard" },
    { icone: <FaShieldAlt className="text-xl" />, chave: "dados" }
  ];

  const requisitosSenha = [
    { condicao: senha?.length >= 8, chave: "minimo_caracteres" },
    { condicao: senha && /[a-z]/.test(senha), chave: "letra_minuscula" },
    { condicao: senha && /[A-Z]/.test(senha), chave: "letra_maiuscula" },
    { condicao: senha && /[0-9]/.test(senha), chave: "um_numero" },
    { condicao: senha && /[^a-zA-Z0-9]/.test(senha), chave: "um_simbolo" }
  ];

  return (
    <div
      className={`min-h-screen flex ${poppins.className}`}
      style={{ background: temaAtual.gradiente }}
    >
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start px-16 w-full">
          <Link
            href="/"
            className="flex items-center gap-3 mb-12 group"
          >
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30 transition-all duration-300">
              <img src="/icone.png" alt="Logo" className="w-8 h-8 brightness-0 invert" />
            </div>
            <span className="text-2xl font-bold text-white">StockControl</span>
          </Link>

          <div className={`transition-all duration-1000 transform ${animacaoAtiva ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <h1 className="text-5xl font-bold text-white mb-6">
              {tRegistro("comece_sua")}{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {tRegistro("jornada")}
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-12 max-w-md">
              {tRegistro("junte_se")}
            </p>

            <div className="space-y-6">
              {beneficios.map((beneficio, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 text-gray-300 group"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30 transition-all duration-300">
                    {beneficio.icone}
                  </div>
                  <span className="text-lg">{tRegistro(`beneficios.${beneficio.chave}`)}</span>
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
              <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30 transition-all duration-300">
                <img src="/icone.png" alt="Logo" className="w-8 h-8 brightness-0 invert" />
              </div>
              <span className="text-2xl font-bold text-white">StockControl</span>
            </Link>
          </div>

          <div
            className={`bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-3xl p-8 border border-cyan-500/20 shadow-2xl transition-all duration-1000 ${animacaoAtiva ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {tRegistro("criar_conta")}
              </h2>
              <p className="text-gray-400">
                {tRegistro("primeiro_passo")}
              </p>
            </div>

            <form onSubmit={handleSubmit(verificaCadastro)} className="space-y-6">
              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {tRegistro("nome_completo")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiMiniUserCircle className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    {...register("nome")}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:border-cyan-400/50"
                    placeholder={tRegistro("nome_placeholder")}
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                </div>
              </div>
              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {tRegistro("email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiEnvelope className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    required
                    className={`w-full pl-12 pr-12 py-4 bg-gray-900/50 border rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:border-cyan-400/50 ${emailStatus.existe ? "border-red-500" :
                      email && !emailStatus.existe && !emailStatus.carregando ? "border-green-500" :
                        "border-gray-600"
                      }`}
                    placeholder={tRegistro("email_placeholder")}
                    style={{
                      backgroundColor: temaAtual.fundo + '80'
                    }}
                  />
                  {email && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {emailStatus.carregando ? (
                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : emailStatus.existe ? (
                        <FaTimes className="text-red-400" />
                      ) : (
                        <FaCheck className="text-green-400" />
                      )}
                    </div>
                  )}
                </div>
                {emailStatus.mensagem && (
                  <div className={`mt-2 text-sm p-2 rounded-lg border ${emailStatus.existe ?
                    "bg-red-900/20 text-red-400 border-red-800" :
                    "bg-green-900/20 text-green-400 border-green-800"
                    }`}>
                    {emailStatus.mensagem}
                  </div>
                )}
              </div>
              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {tRegistro("senha")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiLockClosed className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    placeholder={tRegistro("senha_placeholder")}
                    type={visivel ? "text" : "password"}
                    {...register("senha")}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:border-cyan-400/50"
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVisivel(!visivel)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {visivel ? <FaEyeSlash /> : <FaEye />}
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
                  {tRegistro("confirmar_senha")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiLockClosed className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    placeholder={tRegistro("confirmar_senha_placeholder")}
                    type={visivel ? "text" : "password"}
                    {...register("verificarSenha")}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:border-cyan-400/50"
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVisivel(!visivel)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {visivel ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {verificarSenha && (
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
                  {tRegistro("requisitos_senha")}
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
                        {tRegistro(req.chave)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={emailStatus.existe || emailStatus.carregando || !passwordValid || !passwordsMatch || isLoading}
                className="w-full cursor-pointer group relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {tRegistro("criando_conta")}
                    </>
                  ) : (
                    <>
                      {tRegistro("criar_minha_conta")}
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-center text-gray-400">
                {tRegistro("ja_tem_conta")}{" "}
                <Link
                  href="/login"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  {tRegistro("fazer_login")}
                </Link>
              </p>
            </div>
          </div>
          <div className="lg:hidden mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {tRegistro("copyright")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}