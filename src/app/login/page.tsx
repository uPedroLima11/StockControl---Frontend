"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiEnvelope, HiLockClosed } from "react-icons/hi2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";

type Inputs = {
  email: string;
  senha: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<Inputs>();
  const { logar } = useUsuarioStore();
  const [visivel, setVisivel] = useState(false);
  const router = useRouter();

  const cores = {
    dark: {
      fundo: "#0A1929",
      texto: "#FFFFFF",
      card: "#132F4C",
      borda: "#1E4976",
      primario: "#1976D2",
      secundario: "#00B4D8",
      placeholder: "#9CA3AF",
      hover: "#1E4976"
    }
  };

  const temaAtual = cores.dark;

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html::-webkit-scrollbar {
        width: 10px;
      }
      
      html::-webkit-scrollbar-track {
        background: ${temaAtual.card};
      }
      
      html::-webkit-scrollbar-thumb {
        background: ${temaAtual.borda}; 
        border-radius: 5px;
        border: 2px solid ${temaAtual.card};
      }
      
      html::-webkit-scrollbar-thumb:hover {
        background: ${temaAtual.primario}; 
      }
      
      html {
        scrollbar-width: thin;
        scrollbar-color: ${temaAtual.borda} ${temaAtual.card};
      }
      
      @media (max-width: 768px) {
        html::-webkit-scrollbar {
          width: 6px;
        }
        
        html::-webkit-scrollbar-thumb {
          border: 1px solid ${temaAtual.card};
          border-radius: 3px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [temaAtual]);

  async function handleLogin(data: Inputs) {
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
    }
  }

  return (
    <div 
      className="flex justify-center items-center flex-col gap-5 min-h-screen w-full px-2 py-4"
      style={{ backgroundColor: temaAtual.fundo }}
    >
      <div className="mt-2 w-full flex justify-center">
        <Link
          href="/"
          className="p-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: temaAtual.card }}
        >
          <img src="/icone.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 mb-2 brightness-0 invert" />
          <span 
            className="text-xl md:text-2xl font-semibold whitespace-nowrap"
            style={{ color: temaAtual.texto }}
          >
            StockControl
          </span>
        </Link>
      </div>

      <form 
        className="w-full max-w-md rounded-xl shadow-lg p-4 md:p-8 mx-auto"
        onSubmit={handleSubmit(handleLogin)}
        style={{ backgroundColor: temaAtual.card }}
      >
        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          Seu Email:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope style={{ color: temaAtual.placeholder }} />
          </div>
          <input 
            type="email" 
            {...register("email")} 
            required 
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
            placeholder="seu@email.com"
          />
        </div>

        <label className="block mb-2 text-sm md:text-base font-medium" style={{ color: temaAtual.texto }}>
          Sua Senha:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed style={{ color: temaAtual.placeholder }} />
          </div>
          <input 
            type={visivel ? "text" : "password"} 
            {...register("senha")} 
            required 
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
            placeholder="Digite sua senha"
          />
          <div 
            className="absolute cursor-pointer inset-y-0 end-0 flex items-center pe-3.5" 
            onClick={() => setVisivel(!visivel)}
          >
            {visivel ? 
              <FaEyeSlash style={{ color: temaAtual.placeholder }} /> : 
              <FaEye style={{ color: temaAtual.placeholder }} />
            }
          </div>
        </div>

        <button 
          type="submit" 
          className="text-white cursor-pointer font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg w-full px-5 py-2.5 text-center text-base md:text-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: temaAtual.primario }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Login
        </button>

        <div className="flex justify-between pt-5">
          <Link 
            href="/registro" 
            className="font-italic hover:opacity-80 text-sm md:text-base cursor-pointer transition-all"
            style={{ color: temaAtual.texto }}
          >
            Não possuo conta
          </Link>
          <Link 
            href="/esqueci" 
            className="text-sm font-semibold hover:opacity-80 cursor-pointer transition-all"
            style={{ color: temaAtual.texto }}
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </form>
    </div>
  );
}