"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiEnvelope, HiLockClosed } from "react-icons/hi2";
import { FaEye, FaEyeSlash, FaArrowRight, FaUserShield, FaChartLine, FaClipboard } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useUsuarioStore } from "@/context/usuario";
import { cores } from "@/utils/cores";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type Inputs = {
  email: string;
  senha: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<Inputs>();
  const { logar } = useUsuarioStore();
  const [visivel, setVisivel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animacaoAtiva, setAnimacaoAtiva] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const temaAtual = cores.dark;


  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
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
    
    html {
      scrollbar-width: thin;
      scrollbar-color: #132F4C #0A1830;
    }
    
    @media (max-width: 768px) {
      html::-webkit-scrollbar {
        width: 6px;
      }
      
      html::-webkit-scrollbar-thumb {
        border: 1px solid #132F4C;
        border-radius: 3px;
      }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  useEffect(() => {
    setAnimacaoAtiva(true);
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.3); }
        50% { box-shadow: 0 0 40px rgba(25, 118, 210, 0.6); }
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
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  async function handleLogin(data: Inputs) {
    setIsLoading(true);
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

      if (response.status === 200) {
        Swal.fire({
          text: "Login Realizado Com Sucesso!",
          icon: "success",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        const dados = await response.json();
        Cookies.set("token", dados.token, { expires: 1 });
        logar(dados);
        localStorage.setItem("client_key", JSON.stringify(dados.id));
        router.push("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Algo deu errado, Verifique as credenciais",
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: "Não foi possível conectar ao servidor",
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });
    } finally {
      setIsLoading(false);
    }
  }

  const beneficios = [
    { icone: <FaClipboard className="text-xl" />, texto: "Exportação dos Dados do sistema" },
    { icone: <FaChartLine className="text-xl" />, texto: "Dashboard em tempo real" },
    { icone: <FaUserShield className="text-xl" />, texto: "Segurança enterprise" }
  ];

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
              Bem-vindo de
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> volta</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-md">
              Continue sua jornada rumo ao controle total do seu estoque e vendas.
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
                  <span className="text-lg">{beneficio.texto}</span>
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
                Acesse sua conta
              </h2>
              <p className="text-gray-400">
                Entre no sistema e continue gerenciando
              </p>
            </div>

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiEnvelope className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    {...register("email")} 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400/50"
                    placeholder="seu@email.com"
                    style={{
                      backgroundColor: temaAtual.fundo + '80',
                      borderColor: temaAtual.borda
                    }}
                  />
                </div>
              </div>
              <div className="group">
                <label className="block mb-3 text-sm font-medium text-gray-300">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiLockClosed className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <input 
                    type={visivel ? "text" : "password"} 
                    {...register("senha")} 
                    required 
                    className="w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-400/50"
                    placeholder="Sua senha"
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
                  Esqueceu a senha?
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
                      Entrando...
                    </>
                  ) : (
                    <>
                      Acessar Sistema
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-center text-gray-400">
                Não tem uma conta?{" "}
                <Link 
                  href="/registro" 
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>

          <div className="lg:hidden mt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 StockControl. Sistema de gestão completo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}