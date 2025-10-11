"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiEnvelope, HiLockClosed } from "react-icons/hi2";
import { FaEye, FaEyeSlash, FaArrowRight, FaUserShield, FaChartLine, FaClipboard } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useUsuarioStore } from "@/context/usuario";
import { cores } from "@/utils/cores";
import Cookies from "js-cookie";
import { Poppins } from "next/font/google";
import { useTranslation } from "react-i18next";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type Inputs = {
  email: string;
  senha: string;
};

interface LoginFormProps {
  on2FANeeded: (email: string) => void;
  onEmailNaoVerificado: (email: string, senha: string) => void;
}

const beneficios = [
  {
    icone: <FaUserShield className="text-blue-400 text-xl" />,
    chave: "seguranca"
  },
  {
    icone: <FaChartLine className="text-cyan-400 text-xl" />,
    chave: "relatorios"
  },
  {
    icone: <FaClipboard className="text-purple-400 text-xl" />,
    chave: "estoque"
  },
];

export default function LoginForm({ on2FANeeded, onEmailNaoVerificado }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const { logar } = useUsuarioStore();
  const [visivel, setVisivel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animacaoAtiva, setAnimacaoAtiva] = useState(false);
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { t: tLogin } = useTranslation("login");
  const { t: tNotificacoes } = useTranslation("notificacoes");
  const { t: tErros } = useTranslation("erros");

  const temaAtual = cores.dark;

  useEffect(() => {
    setAnimacaoAtiva(true);
  }, []);

  useEffect(() => {
    if (erroLogin) {
      setErroLogin(null);
    }
  }, [register]);

  async function handleLogin(data: Inputs) {
    setIsLoading(true);
    setErroLogin(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          senha: data.senha,
        }),
      });

      const responseData = await response.json();
      
      if (response.status === 200) {
        if (responseData.precisa2FA) {
          on2FANeeded(data.email);
        } else {
          localStorage.setItem('login_success_message', tNotificacoes("login.sucesso"));
          localStorage.setItem('login_success_type', 'success');
          localStorage.setItem("modoDark", "true");

          Cookies.set("token", responseData.token, { expires: 7 });
          logar(responseData);
          localStorage.setItem("client_key", JSON.stringify(responseData.id));
          router.push("/dashboard");
        }
      } else if (response.status === 403 && responseData.precisaVerificacao) {
        onEmailNaoVerificado(data.email, data.senha);
      } else {
        const codigoErro = responseData.codigo;
        
        switch (codigoErro) {
          case "EMAIL_NAO_ENCONTRADO":
            setErroLogin(tErros("email_nao_encontrado"));
            break;
          case "SENHA_INCORRETA":
            setErroLogin(tErros("senha_incorreta"));
            break;
          case "EMAIL_NAO_VERIFICADO":
            setErroLogin(tErros("email_nao_verificado"));
            break;
          default:
            setErroLogin(responseData.message || tNotificacoes("login.erro_credenciais"));
        }
        
        console.error("❌ Erro no login:", responseData);
      }
    } catch (err) {
      console.error("❌ Erro de conexão:", err);
      setErroLogin(tNotificacoes("login.erro_conexao"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen flex ${poppins.className}`}
      style={{ background: temaAtual.gradiente }}
    >
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start px-28 w-full">
          <Link
            href="/"
            className="flex items-center gap-3 mb-12 group"
          >
            <div className={`p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-1000 transform ${animacaoAtiva ? 'translate-x-20 opacity-100' : '-translate-x-0 opacity-0'}`}>
              <img src="/icone.png" alt="Logo" className="w-8 h-8 brightness-0 invert" />
            </div>
            <span className={`text-2xl font-bold text-white transition-all duration-1000 transform ${animacaoAtiva ? 'translate-x-20 opacity-100' : '-translate-x-0 opacity-0'}`}>StockControl</span>
          </Link>

          <div className={`transition-all duration-1000 transform ${animacaoAtiva ? 'translate-x-20 opacity-100' : '-translate-x-0 opacity-0'}`}>
            <h1 className="text-5xl font-bold text-white mb-6">
              {tLogin("bem_vindo_de_volta")}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {tLogin("volta")}
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-12 max-w-md">
              {tLogin("continue_jornada")}
            </p>

            <div className="space-y-6">
              {beneficios.map((beneficio, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 text-gray-300 group"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
                    {beneficio.icone}
                  </div>
                  <span className="text-lg">{tLogin(`beneficios.${beneficio.chave}`)}</span>
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
              <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
                <img src="/icone.png" alt="Logo" className="w-8 h-8 brightness-0 invert" />
              </div>
              <span className="text-2xl font-bold text-white">StockControl</span>
            </Link>
          </div>

          <div
            className={`bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 shadow-2xl transition-all duration-1000 ${animacaoAtiva ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {tLogin("acesse_sua_conta")}
              </h2>
              <p className="text-gray-400">
                {tLogin("entre_sistema")}
              </p>
            </div>

            {erroLogin && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  {erroLogin}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {tLogin("email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiEnvelope className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    {...register("email", { 
                      required: true,
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email inválido"
                      }
                    })}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400/50"
                    placeholder={tLogin("email_placeholder")}
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                </div>
              </div>
              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  {tLogin("senha")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiLockClosed className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type={visivel ? "text" : "password"}
                    {...register("senha", { 
                      required: true,
                      minLength: {
                        value: 6,
                        message: "A senha deve ter pelo menos 6 caracteres"
                      }
                    })}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400/50"
                    placeholder={tLogin("senha_placeholder")}
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVisivel(!visivel)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {visivel ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <Link
                  href="/esqueci"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {tLogin("esqueceu_senha")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer group relative bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {tLogin("entrando")}
                    </>
                  ) : (
                    <>
                      {tLogin("acessar_sistema")}
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-center text-gray-400">
                {tLogin("nao_tem_conta")}{" "}
                <Link
                  href="/registro"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {tLogin("criar_conta")}
                </Link>
              </p>
            </div>
          </div>

          <div className="lg:hidden mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {tLogin("copyright")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}